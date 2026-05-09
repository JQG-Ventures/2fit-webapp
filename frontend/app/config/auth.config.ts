import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { CredentialsSignin } from 'next-auth';
import type { User } from '@auth/core/types';
import type { JWT } from 'next-auth/jwt';
import type { AppProviders } from '@auth/core/providers';
import { LoginFailureError } from '@/app/_services/authErrors';
import { loginWithCredentials, refreshServerAccessToken } from '@/app/_services/authServerService';

interface AuthProviderUser extends User {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    userId: string;
    userName: string;
    isFlaskGoogle?: boolean;
}

class InvalidCredentialsSigninError extends CredentialsSignin {
    code = 'invalid_credentials';
}

class LoginSupportSigninError extends CredentialsSignin {
    code = 'support';
}

function mapLoginFailureToSigninError(error: unknown): CredentialsSignin {
    if (error instanceof LoginFailureError && error.reason === 'invalid_credentials') {
        return new InvalidCredentialsSigninError();
    }

    return new LoginSupportSigninError();
}

function readCredentialValue(value: unknown): string | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function buildFlaskGoogleUser(credentials: Record<string, unknown>): AuthProviderUser | null {
    const accessToken = readCredentialValue(credentials.access_token);
    const expiresAt = Number(credentials.expires_at);

    if (!accessToken || !Number.isFinite(expiresAt)) {
        return null;
    }

    return {
        accessToken,
        refreshToken: readCredentialValue(credentials.refresh_token) ?? '',
        accessTokenExpires: expiresAt * 1000,
        userId: readCredentialValue(credentials.user_id) ?? '',
        userName: readCredentialValue(credentials.user_name) ?? '',
        isFlaskGoogle: true,
    };
}

interface JwtCallbackParams {
    token: JWT;
    user?: {
        accessToken?: string | null;
        refreshToken?: string | null;
        accessTokenExpires?: number | null;
        userId?: string | null;
        userName?: string | null;
        authProvider?: string | null;
    };
    account?: {
        provider?: string;
        id_token?: string | null;
    } | null;
    profile?: {
        email?: string | null;
    };
}

interface SessionCallbackParams {
    session: {
        user?: {
            email?: string | null;
            id?: string | null;
            userId?: string | null;
            userName?: string | null;
            token?: string | null;
            authProvider?: string | null;
        };
        googleIdToken?: string | null;
        accessTokenExpires?: number | null;
    };
    token: JWT;
}

const jwtCallback = async ({ token, user, account, profile }: JwtCallbackParams): Promise<JWT> => {
    if (account?.provider === 'google') {
        token.email = typeof profile?.email === 'string' ? profile.email : null;
        token.authProvider = account.provider;
        token.googleIdToken = typeof account.id_token === 'string' ? account.id_token : null;
    } else if (user) {
        token.accessToken = user.accessToken ?? null;
        token.refreshToken = user.refreshToken ?? null;
        token.accessTokenExpires = user.accessTokenExpires ?? null;
        token.userId = user.userId ?? null;
        token.userName = user.userName ?? null;
        token.authProvider = user.authProvider ?? account?.provider ?? null;
    }

    if (token.accessToken && token.accessTokenExpires) {
        if (Date.now() < token.accessTokenExpires) {
            return token;
        }

        const refreshedToken = await refreshServerAccessToken(token);
        if (refreshedToken.error) {
            token.error = 'RefreshAccessTokenError';
            return { ...token, userId: null, accessToken: null, refreshToken: null };
        }

        return refreshedToken;
    }

    return token;
};

const sessionCallback = async ({
    session,
    token,
}: SessionCallbackParams): Promise<SessionCallbackParams['session']> => {
    const currentUser = session.user ?? {};

    session.user = {
        ...currentUser,
        id: token.userId ?? null,
        email: token.email ?? currentUser.email ?? null,
        userId: token.userId ?? null,
        userName: token.userName ?? null,
        token: token.accessToken ?? null,
        authProvider: token.authProvider ?? null,
    };

    // refreshToken stays server-only inside the NextAuth JWT cookie — never exposed to the client.
    // accessTokenExpires is kept for the client to know when the session is near expiry (UI purposes).
    session.accessTokenExpires = token.accessTokenExpires ?? null;

    return session;
};

const authProviders = [
    CredentialsProvider({
        name: 'Credentials',
        credentials: {
            identifier: { label: 'Email or phone', type: 'text' },
            password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials, _request) {
            try {
                return await loginWithCredentials(
                    readCredentialValue(credentials?.identifier),
                    readCredentialValue(credentials?.password),
                );
            } catch (error) {
                throw mapLoginFailureToSigninError(error);
            }
        },
    }) as unknown as AppProviders[number],
    CredentialsProvider({
        id: 'flaskgoogle',
        name: 'FlaskGoogle',
        credentials: {
            access_token: { label: 'access_token', type: 'text' },
            refresh_token: { label: 'refresh_token', type: 'text' },
            expires_at: { label: 'expires_at', type: 'text' },
            user_id: { label: 'user_id', type: 'text' },
            user_name: { label: 'user_name', type: 'text' },
        },
        async authorize(credentials, _request) {
            if (!credentials) {
                return null;
            }

            return buildFlaskGoogleUser(credentials);
        },
    }) as unknown as AppProviders[number],
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }) as unknown as AppProviders[number],
] satisfies AppProviders;

const authCallbacks = {
    jwt: jwtCallback,
    session: sessionCallback,
};

export const authConfig = {
    providers: authProviders,
    callbacks: authCallbacks,
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,
};
