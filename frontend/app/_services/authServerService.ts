import type { ApiResponse } from '@/app/_types/api';
import type { AuthApiTokenMessage, AuthenticatedUser, AuthTokenState } from '@/app/_types/auth';
import type { JWT } from 'next-auth/jwt';
import { parseJson } from '@/app/utils/http';

const apiBaseUrl = process.env.API_BASE_URL_INTERNAL || process.env.NEXT_PUBLIC_API_BASE_URL || '';

type AuthApiResponse = ApiResponse<AuthApiTokenMessage>;

export async function loginWithCredentials(
    email?: string,
    password?: string,
): Promise<AuthenticatedUser | null> {
    if (!email || !password) {
        return null;
    }

    const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    const data = await parseJson<AuthApiResponse>(response);

    if (!response.ok || !data?.message?.access_token) {
        return null;
    }

    return {
        accessToken: data.message.access_token,
        refreshToken: data.message.refresh_token ?? '',
        userId: data.message.user_id ?? '',
        userName: data.message.name ?? '',
        accessTokenExpires: data.message.expires_at * 1000,
    };
}

export async function refreshServerAccessToken(token: AuthTokenState): Promise<JWT> {
    if (!token.refreshToken) {
        return { ...token, error: 'RefreshAccessTokenError' };
    }

    try {
        const response = await fetch(`${apiBaseUrl}/api/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.refreshToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to refresh access token');
        }

        const refreshed = await parseJson<AuthApiResponse>(response);
        const newAccess = refreshed.message.access_token;
        const newExp = refreshed.message.expires_at * 1000;

        return {
            ...token,
            accessToken: newAccess,
            accessTokenExpires: newExp,
        };
    } catch {
        return { ...token, error: 'RefreshAccessTokenError' };
    }
}
