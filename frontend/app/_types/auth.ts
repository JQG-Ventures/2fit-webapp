export interface AuthApiTokenMessage {
    access_token: string;
    refresh_token?: string;
    expires_at: number;
    user_id?: string;
    name?: string;
}

export type LoginFailureReason = 'invalid_credentials' | 'support';

export interface AuthenticatedUser {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    userId: string;
    userName: string;
    email?: string | null;
    authProvider?: string | null;
    googleIdToken?: string | null;
    isFlaskGoogle?: boolean;
}

export interface AuthTokenState {
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
