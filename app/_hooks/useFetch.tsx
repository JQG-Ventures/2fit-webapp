import { useState, useEffect } from 'react';
import { useSessionContext } from '../_providers/SessionProvider';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import { useRouter } from 'next/router';

export const useFetch = (url: string, options = {}) => {
    const { token, loading: sessionLoading } = useSessionContext();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [statusCode, setStatusCode] = useState<number | null>(null);

    useEffect(() => {
        if (sessionLoading) {
            setLoading(true);
            return;
        }

        if (!url) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                };

                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetchWithAuth(url, {
                    ...options,
                    headers,
                });

                setStatusCode(response.status);

                if (response.ok || response.status === 404) {
                    const jsonData = await response.json();
                    setData(jsonData.message);
                } else {
                    const errorMsg = await response.json();
                    setError(errorMsg.message || 'Unknown error occurred');
                }
            } catch (err) {
                console.log(err);
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url, options, token, sessionLoading]);

    return { data, loading, error, statusCode };
};
