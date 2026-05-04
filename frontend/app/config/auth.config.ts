import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import type { User } from '@auth/core/types';
import type { JWT } from 'next-auth/jwt';
import type { AppProviders } from '@auth/core/providers';
import { loginWithCredentials, refreshServerAccessToken } from '@/app/_services/authServerService';

interface AuthProviderUser extends User {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    userId: string;
    userName: string;
    isFlaskGoogle?: boolean;
}

function logAuthConfig(event: string, payload: Record<string, unknown>): void {
    console.warn(`[AUTH_DEBUG][auth.config] ${event}`, payload);
}

function readCredentialValue(value: unknown): string | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function buildFlaskGoogleUser(credentials: Record<string, unknown>): AuthProviderUser | null {
    const accessToken = readCredentialValue(credentials.access_token);
    const expiresAt = Number(credentials.expires_at);

    if (!accessToken || !Number.isFinite(expiresAt)) {
        logAuthConfig('buildFlaskGoogleUser:invalid-credentials', {
            hasAccessToken: Boolean(accessToken),
            expiresAtRaw: credentials.expires_at ?? null,
            parsedExpiresAt: expiresAt,
            credentialKeys: Object.keys(credentials),
        });
        return null;
    }

    const user = {
        accessToken,
        refreshToken: readCredentialValue(credentials.refresh_token) ?? '',
        accessTokenExpires: expiresAt * 1000,
        userId: readCredentialValue(credentials.user_id) ?? '',
        userName: readCredentialValue(credentials.user_name) ?? '',
        isFlaskGoogle: true,
    };

    logAuthConfig('buildFlaskGoogleUser:success', {
        userId: user.userId,
        userName: user.userName,
        accessTokenLength: user.accessToken.length,
        refreshTokenLength: user.refreshToken.length,
        accessTokenExpires: user.accessTokenExpires,
    });

    return user;
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
    logAuthConfig('jwt:start', {
        provider: account?.provider ?? null,
        hasUser: Boolean(user),
        hasTokenAccessToken: Boolean(token.accessToken),
        tokenAccessTokenExpires: token.accessTokenExpires ?? null,
        tokenUserId: token.userId ?? null,
        profileEmail: profile?.email ?? null,
    });

    if (account?.provider === 'google') {
        token.email = typeof profile?.email === 'string' ? profile.email : null;
        token.authProvider = account.provider;
        token.googleIdToken = typeof account.id_token === 'string' ? account.id_token : null;
        logAuthConfig('jwt:google-account', {
            email: token.email ?? null,
            hasGoogleIdToken: Boolean(token.googleIdToken),
        });
    } else if (user) {
        token.accessToken = user.accessToken ?? null;
        token.refreshToken = user.refreshToken ?? null;
        token.accessTokenExpires = user.accessTokenExpires ?? null;
        token.userId = user.userId ?? null;
        token.userName = user.userName ?? null;
        token.authProvider = user.authProvider ?? account?.provider ?? null;
        logAuthConfig('jwt:credentials-user-applied', {
            userId: token.userId ?? null,
            userName: token.userName ?? null,
            hasAccessToken: Boolean(token.accessToken),
            accessTokenExpires: token.accessTokenExpires ?? null,
        });
    }

    if (token.accessToken && token.accessTokenExpires) {
        if (Date.now() < token.accessTokenExpires) {
            logAuthConfig('jwt:token-still-valid', {
                now: Date.now(),
                accessTokenExpires: token.accessTokenExpires,
                userId: token.userId ?? null,
            });
            return token;
        }

        logAuthConfig('jwt:token-expired-refresh-attempt', {
            now: Date.now(),
            accessTokenExpires: token.accessTokenExpires,
            hasRefreshToken: Boolean(token.refreshToken),
            userId: token.userId ?? null,
        });
        const refreshedToken = await refreshServerAccessToken(token);
        if (refreshedToken.error) {
            token.error = 'RefreshAccessTokenError';
            logAuthConfig('jwt:refresh-failed', {
                userId: token.userId ?? null,
                error: token.error,
            });
            return { ...token, userId: null, accessToken: null, refreshToken: null };
        }

        logAuthConfig('jwt:refresh-success', {
            userId: refreshedToken.userId ?? null,
            hasAccessToken: Boolean(refreshedToken.accessToken),
            accessTokenExpires: refreshedToken.accessTokenExpires ?? null,
        });
        return refreshedToken;
    }

    logAuthConfig('jwt:no-access-token', {
        hasAccessToken: Boolean(token.accessToken),
        accessTokenExpires: token.accessTokenExpires ?? null,
        userId: token.userId ?? null,
    });
    return token;
};

const sessionCallback = async ({
    session,
    token,
}: SessionCallbackParams): Promise<SessionCallbackParams['session']> => {
    logAuthConfig('session:start', {
        tokenUserId: token.userId ?? null,
        hasTokenAccessToken: Boolean(token.accessToken),
        tokenAccessTokenExpires: token.accessTokenExpires ?? null,
        tokenAuthProvider: token.authProvider ?? null,
    });

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

    logAuthConfig('session:result', {
        sessionUserId: session.user.id ?? null,
        sessionUserName: session.user.userName ?? null,
        hasSessionToken: Boolean(session.user.token),
        sessionAuthProvider: session.user.authProvider ?? null,
        accessTokenExpires: session.accessTokenExpires ?? null,
    });

    return session;
};

const authProviders = [
    CredentialsProvider({
        name: 'Credentials',
        credentials: {
            email: { label: 'Email', type: 'text' },
            password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials, _request) {
            logAuthConfig('credentials-authorize:start', {
                hasCredentials: Boolean(credentials),
                email: readCredentialValue(credentials?.email) ?? null,
                passwordLength: readCredentialValue(credentials?.password)?.length ?? 0,
            });
            try {
                const result = await loginWithCredentials(
                    readCredentialValue(credentials?.email),
                    readCredentialValue(credentials?.password),
                );
                logAuthConfig('credentials-authorize:result', {
                    hasUser: Boolean(result),
                    userId: result?.userId ?? null,
                    userName: result?.userName ?? null,
                    hasAccessToken: Boolean(result?.accessToken),
                });
                return result;
            } catch {
                logAuthConfig('credentials-authorize:error', {
                    email: readCredentialValue(credentials?.email) ?? null,
                });
                throw new Error('LoginRequestError');
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
                logAuthConfig('flaskgoogle-authorize:missing-credentials', {});
                return null;
            }

            const result = buildFlaskGoogleUser(credentials);
            logAuthConfig('flaskgoogle-authorize:result', {
                hasUser: Boolean(result),
                userId: result?.userId ?? null,
                userName: result?.userName ?? null,
                hasAccessToken: Boolean(result?.accessToken),
            });
            return result;
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
