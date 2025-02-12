// @ts-nocheck

"use client";

import axios from 'axios';
import { getSession } from 'next-auth/react';

const axiosInstance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
})

axiosInstance.interceptors.request.use(
	async (config) => {
		const session = await getSession();
		if (session?.user?.token) {
			config.headers.Authorization = `Bearer ${session.user.token}`
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

			await getSession();
			const session = await getSession();

			if (!session?.user?.token) {
				window.location.href = '/re-auth';
				return new Promise(() => {})
			}

			originalRequest.headers.Authorization = `Bearer ${session.user.token}`;
			return axiosInstance(originalRequest);
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;
