'use client';

import axios, { AxiosHeaders, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getSession } from 'next-auth/react';
import { tokenStore } from '@/app/utils/tokenStore';

/** Single in-flight refresh so parallel 401s share one GET /api/auth/session. */
let sessionRefreshPromise: Promise<string | null> | null = null;

async function refreshSessionAndToken(): Promise<string | null> {
    if (!sessionRefreshPromise) {
        sessionRefreshPromise = (async () => {
            // Runs NextAuth jwt callback (Flask refresh if access token expired).
            const session = await getSession({ broadcast: false });
            const token = session?.user?.token ?? null;
            tokenStore.set(token);
            return token;
        })().finally(() => {
            sessionRefreshPromise = null;
        });
    }
    return sessionRefreshPromise;
}

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

function setAuthorizationHeader(config: InternalAxiosRequestConfig, token: string): void {
    const headers =
        config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
}

axiosInstance.interceptors.request.use(
    async (config) => {
        await tokenStore.waitUntilReady();
        const token = tokenStore.get();
        if (token) {
            setAuthorizationHeader(config, token);
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const newToken = await refreshSessionAndToken();

            if (!newToken) {
                const excludedRoutes = ['/login', '/re-auth', '/register', '/login/google'];

                if (typeof window !== 'undefined') {
                    const isExcluded =
                        window.location.pathname === '/' ||
                        excludedRoutes.some((route) => window.location.pathname === route) ||
                        window.location.pathname.startsWith('/register/');

                    if (!isExcluded) {
                        window.location.href = '/re-auth';
                    }
                }

                return new Promise<never>(() => undefined);
            }

            setAuthorizationHeader(originalRequest, newToken);
            return axiosInstance(originalRequest);
        }

        return Promise.reject(error);
    },
);

export default axiosInstance;
