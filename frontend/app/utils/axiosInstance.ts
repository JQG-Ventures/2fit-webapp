'use client';

import axios, { AxiosHeaders, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { Session } from 'next-auth';
import { getSession } from 'next-auth/react';

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
        const session = (await getSession()) as Session | null;
        const token = session?.user?.token;

        if (token) {
            setAuthorizationHeader(config, token);
        }
        return config;
    },
    async (error: AxiosError) => Promise.reject(error),
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

            await getSession();
            const session = (await getSession()) as Session | null;
            const token = session?.user?.token;

            if (!token) {
                const excludedRoutes = ['/login', '/re-auth', '/register', '/login/google'];

                if (typeof window !== 'undefined') {
                    if (
                        window.location.pathname !== '/' &&
                        !excludedRoutes.some((route) => window.location.pathname === route) &&
                        !window.location.pathname.startsWith('/register/')
                    ) {
                        window.location.href = '/re-auth';
                    }
                }

                return new Promise<never>(() => undefined);
            }

            setAuthorizationHeader(originalRequest, token);
            return axiosInstance(originalRequest);
        }
        return Promise.reject(error);
    },
);

export default axiosInstance;
