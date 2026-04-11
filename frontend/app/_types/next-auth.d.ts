import type { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user?: DefaultSession['user'] & {
            id?: string | null;
            userId?: string | null;
            userName?: string | null;
            token?: string | null;
            authProvider?: string | null;
        };
        googleIdToken?: string | null;
        refreshToken?: string | null;
        accessTokenExpires?: number | null;
    }

    interface User extends DefaultUser {
        token?: string | null;
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number;
        userId?: string;
        userName?: string;
        authProvider?: string | null;
        googleIdToken?: string | null;
        isFlaskGoogle?: boolean;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken?: string | null;
        refreshToken?: string | null;
        accessTokenExpires?: number | null;
        userId?: string | null;
        userName?: string | null;
        email?: string | null;
        authProvider?: string | null;
        googleIdToken?: string | null;
        error?: 'RefreshAccessTokenError';
        isFlaskGoogle?: boolean;
    }
}
