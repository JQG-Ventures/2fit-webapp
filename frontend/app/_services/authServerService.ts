import type { ApiResponse } from '@/app/_types/api';
import type { AuthApiTokenMessage, AuthenticatedUser, AuthTokenState } from '@/app/_types/auth';
import type { JWT } from 'next-auth/jwt';
import { LoginFailureError } from '@/app/_services/authErrors';
import { parseJson } from '@/app/utils/http';

const apiBaseUrl = process.env.API_BASE_URL_INTERNAL || process.env.NEXT_PUBLIC_API_BASE_URL || '';

type AuthApiResponse = ApiResponse<AuthApiTokenMessage | string>;
type AuthTokenApiResponse = ApiResponse<AuthApiTokenMessage>;

function normalizeIdentifier(identifier?: string): string | null {
    const normalized = identifier?.trim();
    return normalized ? normalized : null;
}

function buildLoginPayload(
    identifier: string,
    password: string,
): { email: string; password: string } | { phone: string; password: string } {
    return identifier.includes('@')
        ? { email: identifier.toLowerCase(), password }
        : { phone: identifier, password };
}

function mapLoginFailure(status: number): LoginFailureError {
    if (status === 401 || status === 404) {
        return new LoginFailureError('invalid_credentials');
    }

    return new LoginFailureError('support');
}

function isTokenMessage(message: AuthApiResponse['message']): message is AuthApiTokenMessage {
    return (
        typeof message === 'object' &&
        message !== null &&
        typeof message.access_token === 'string' &&
        typeof message.expires_at === 'number'
    );
}

export async function loginWithCredentials(
    identifier?: string,
    password?: string,
): Promise<AuthenticatedUser> {
    const normalizedIdentifier = normalizeIdentifier(identifier);
    if (!normalizedIdentifier || !password) {
        throw new LoginFailureError('support');
    }

    try {
        const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildLoginPayload(normalizedIdentifier, password)),
        });

        const data = await parseJson<AuthApiResponse>(response);
        if (!response.ok) {
            throw mapLoginFailure(response.status);
        }

        const message = data.message;
        if (!isTokenMessage(message)) {
            throw new LoginFailureError('support');
        }

        return {
            accessToken: message.access_token,
            refreshToken: message.refresh_token ?? '',
            userId: message.user_id ?? '',
            userName: message.name ?? '',
            accessTokenExpires: message.expires_at * 1000,
        };
    } catch (error) {
        if (error instanceof LoginFailureError) {
            throw error;
        }

        throw new LoginFailureError('support');
    }
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

        const refreshed = await parseJson<AuthTokenApiResponse>(response);
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
