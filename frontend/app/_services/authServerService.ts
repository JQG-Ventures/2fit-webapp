import type { ApiResponse } from '@/app/_types/api';
import type { AuthApiTokenMessage, AuthenticatedUser, AuthTokenState } from '@/app/_types/auth';
import type { JWT } from 'next-auth/jwt';
import { parseJson } from '@/app/utils/http';

const apiBaseUrl = process.env.API_BASE_URL_INTERNAL || process.env.NEXT_PUBLIC_API_BASE_URL || '';

type AuthApiResponse = ApiResponse<AuthApiTokenMessage>;

function logAuthServer(event: string, payload: Record<string, unknown>): void {
    console.warn(`[AUTH_DEBUG][authServerService] ${event}`, payload);
}

export async function loginWithCredentials(
    email?: string,
    password?: string,
): Promise<AuthenticatedUser | null> {
    logAuthServer('loginWithCredentials:start', {
        hasEmail: Boolean(email),
        hasPassword: Boolean(password),
        email,
        apiBaseUrl,
    });

    if (!email || !password) {
        logAuthServer('loginWithCredentials:missing-input', {
            email,
            hasPassword: Boolean(password),
        });
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
    const messageKeys = data?.message ? Object.keys(data.message) : [];

    logAuthServer('loginWithCredentials:response', {
        status: response.status,
        ok: response.ok,
        messageKeys,
        hasAccessToken: Boolean(data?.message?.access_token),
        hasRefreshToken: Boolean(data?.message?.refresh_token),
        expiresAt: data?.message?.expires_at ?? null,
        userId: data?.message?.user_id ?? null,
        name: data?.message?.name ?? null,
    });

    if (!response.ok || !data?.message?.access_token) {
        logAuthServer('loginWithCredentials:failed', {
            status: response.status,
            ok: response.ok,
            hasAccessToken: Boolean(data?.message?.access_token),
        });
        return null;
    }

    const result = {
        accessToken: data.message.access_token,
        refreshToken: data.message.refresh_token ?? '',
        userId: data.message.user_id ?? '',
        userName: data.message.name ?? '',
        accessTokenExpires: data.message.expires_at * 1000,
    };

    logAuthServer('loginWithCredentials:success', {
        userId: result.userId,
        userName: result.userName,
        accessTokenLength: result.accessToken.length,
        refreshTokenLength: result.refreshToken.length,
        accessTokenExpires: result.accessTokenExpires,
    });

    return result;
}

export async function refreshServerAccessToken(token: AuthTokenState): Promise<JWT> {
    logAuthServer('refreshServerAccessToken:start', {
        hasRefreshToken: Boolean(token.refreshToken),
        accessTokenExpires: token.accessTokenExpires ?? null,
        userId: token.userId ?? null,
    });

    if (!token.refreshToken) {
        logAuthServer('refreshServerAccessToken:missing-refresh-token', {
            userId: token.userId ?? null,
        });
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

        logAuthServer('refreshServerAccessToken:response', {
            status: response.status,
            ok: response.ok,
        });

        if (!response.ok) {
            throw new Error('Failed to refresh access token');
        }

        const refreshed = await parseJson<AuthApiResponse>(response);
        const newAccess = refreshed.message.access_token;
        const newExp = refreshed.message.expires_at * 1000;

        logAuthServer('refreshServerAccessToken:success', {
            hasNewAccessToken: Boolean(newAccess),
            newAccessTokenLength: newAccess?.length ?? 0,
            newExp,
            userId: token.userId ?? null,
        });

        return {
            ...token,
            accessToken: newAccess,
            accessTokenExpires: newExp,
        };
    } catch {
        logAuthServer('refreshServerAccessToken:error', {
            userId: token.userId ?? null,
        });
        return { ...token, error: 'RefreshAccessTokenError' };
    }
}
