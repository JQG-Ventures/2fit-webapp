import { useQuery, useMutation, QueryKey, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import { AxiosError } from 'axios';

interface UseApiGetOptions<T> extends Omit<
  UseQueryOptions<T, AxiosError, T, QueryKey>,
  'queryKey' | 'queryFn'
> {
  axiosConfig?: Record<string, any>;
}

export function useApiGet<T>(
  key: string[],
  url: string,
  options?: UseApiGetOptions<T>
) {
  const { axiosConfig, ...queryOptions } = options || {};
  
  return useQuery<T, AxiosError>({
    queryKey: key,
    queryFn: async () => {
      const response = await axiosInstance.get<T>(url, axiosConfig);
      return response.data;
    },
    ...queryOptions,
  });
}

export const useApiPost = <
  TData extends { body?: any; queryParams?: Record<string, string | number> },
  TResponse
>(
  baseUrl: string,
  options?: UseMutationOptions<TResponse, Error, TData>,
  headers?: Record<string, string>
) => {
  return useMutation<TResponse, Error, TData>({
    mutationFn: async ({ queryParams, body, ...rest }) => {
      const url = queryParams
        ? `${baseUrl}?${new URLSearchParams(
            Object.entries(queryParams).reduce((acc, [key, value]) => {
              acc[key] = String(value);
              return acc;
            }, {} as Record<string, string>)
          ).toString()}`
        : baseUrl;

      const { data: responseData } = await axiosInstance.post<TResponse>(
        url,
        body || rest,
        {
          headers: headers || {},
        }
      );
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