'use client';

import {
    useQuery,
    useMutation,
    type QueryKey,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import axiosInstance from '../utils/axiosInstance';
import type { QueryParams } from '../_types/api';

interface UseApiGetOptions<T> extends Omit<
    UseQueryOptions<T, AxiosError, T, QueryKey>,
    'queryKey' | 'queryFn'
> {
    axiosConfig?: AxiosRequestConfig;
    suspense?: boolean;
}

function buildUrl(baseUrl: string, queryParams?: QueryParams): string {
    if (!queryParams) {
        return baseUrl;
    }

    const serializedParams = new URLSearchParams(
        Object.entries(queryParams).reduce<Record<string, string>>((accumulator, [key, value]) => {
            accumulator[key] = String(value);
            return accumulator;
        }, {}),
    );

    return `${baseUrl}?${serializedParams.toString()}`;
}

export function useApiGet<T>(key: string[], url: string, options?: UseApiGetOptions<T>) {
    const { axiosConfig, suspense = false, ...queryOptions } = options || {};

    return useQuery<T, AxiosError>({
        queryKey: key,
        queryFn: async () => {
            console.groupCollapsed('→ GET', url);
            console.trace();
            console.groupEnd();
            const response = await axiosInstance.get<T>(url, axiosConfig);
            return response.data;
        },
        ...queryOptions,
    });
}

export const useApiPost = <TData extends { body?: unknown; queryParams?: QueryParams }, TResponse>(
    baseUrl: string,
    options?: UseMutationOptions<TResponse, AxiosError, TData>,
    headers?: Record<string, string>,
) => {
    return useMutation<TResponse, AxiosError, TData>({
        mutationFn: async (payload) => {
            const { queryParams, body, ...rest } = payload;
            const url = buildUrl(baseUrl, queryParams);
            const requestBody =
                body ??
                (Object.keys(rest).length > 0 ? (rest as Record<string, unknown>) : undefined);

            const { data: responseData } = await axiosInstance.post<TResponse>(url, requestBody, {
                headers: headers || {},
            });
            return responseData;
        },
        ...options,
    });
};

export const useApiPut = <TData, TResponse>(
    baseUrl: string,
    options?: UseMutationOptions<TResponse, AxiosError, TData & { queryParams?: QueryParams }>,
) => {
    return useMutation<TResponse, AxiosError, TData & { queryParams?: QueryParams }>({
        mutationFn: async ({ queryParams, ...data }) => {
            const url = buildUrl(baseUrl, queryParams);
            const { data: responseData } = await axiosInstance.put<TResponse>(url, data);
            return responseData;
        },
        ...options,
    });
};

export const useApiDelete = <TData, TResponse>(
    baseUrl: string,
    options?: UseMutationOptions<TResponse, AxiosError, TData & { queryParams?: QueryParams }>,
) => {
    return useMutation<TResponse, AxiosError, TData & { queryParams?: QueryParams }>({
        mutationFn: async ({ queryParams, ...data }) => {
            const url = buildUrl(baseUrl, queryParams);
            const { data: responseData } = await axiosInstance.delete<TResponse>(url, {
                data: Object.keys(data).length > 0 ? data : undefined,
            });
            return responseData;
        },
        ...options,
    });
};
