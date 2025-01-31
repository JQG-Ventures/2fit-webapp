//@ts-nocheck
import axios from 'axios';
import { getSession } from 'next-auth/react';
import { refreshAccessToken } from '../config/auth.config';

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
	async (error) => Promise.reject(error)
);

export default axiosInstance;
