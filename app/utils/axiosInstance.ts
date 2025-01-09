//@ts-nocheck
import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { refreshAccessToken } from '../config/auth.config';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.user?.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${session.user.token}`,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const session = await getSession();
        const newTokens = await refreshAccessToken(session?.user?.token);

        if (newTokens?.accessToken) {
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        signOut();
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
