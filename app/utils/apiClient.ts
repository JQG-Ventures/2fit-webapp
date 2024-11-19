import { useQuery, useMutation, QueryKey, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

interface UseApiGetOptions<T> extends Omit<UseQueryOptions<T, Error, T, any>, 'queryKey' | 'queryFn'> {
	axiosConfig?: Record<string, any>;
}

// Generic GET Hook
export const useApiGet = <T>(
	key: string[],
	url: string,
	options?: UseApiGetOptions<T>
) => {
	const { axiosConfig, ...queryOptions } = options || {};

	return useQuery<T, Error>({
		queryKey: key,
		queryFn: async () => {
			const { data } = await axiosInstance.get<T>(url, axiosConfig);
			return data;
		},
		...queryOptions,
	});
};

export const useApiPost = <TData extends { body?: any }, TResponse>(
	baseUrl: string,
	options?: UseMutationOptions<TResponse, Error, TData & { queryParams?: Record<string, string> }>
) => {
	return useMutation<TResponse, Error, TData & { queryParams?: Record<string, string> }>({
		mutationFn: async ({ queryParams, body, ...rest }) => {
			const url = queryParams
				? `${baseUrl}?${new URLSearchParams(queryParams).toString()}`
				: baseUrl;
			const { data: responseData } = await axiosInstance.post<TResponse>(url, body || rest); // Send `body` directly if it exists
			return responseData;
		},
		...options,
	});
};

export const useApiPut = <TData, TResponse>(
	baseUrl: string,
	options?: UseMutationOptions<TResponse, Error, TData & { queryParams?: Record<string, string> }>
) => {
	return useMutation<TResponse, Error, TData & { queryParams?: Record<string, string> }>({
		mutationFn: async ({ queryParams, ...data }) => {
			const url = queryParams
				? `${baseUrl}?${new URLSearchParams(queryParams).toString()}`
				: baseUrl;
			const { data: responseData } = await axiosInstance.put<TResponse>(url, data);
			return responseData;
		},
		...options,
	});
};

export const useApiDelete = <TData, TResponse>(
	baseUrl: string,
	options?: UseMutationOptions<TResponse, Error, TData & { queryParams?: Record<string, string> }>
) => {
	return useMutation<TResponse, Error, TData & { queryParams?: Record<string, string> }>({
		mutationFn: async ({ queryParams, ...data }) => {
			const url = queryParams
				? `${baseUrl}?${new URLSearchParams(queryParams).toString()}`
				: baseUrl;
			const { data: responseData } = await axiosInstance.delete<TResponse>(url, data);
			return responseData;
		},
		...options,
	});
};