// @ts-nocheck
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { signOut } from 'next-auth/react';
import { NextResponse } from 'next/server';
import { logout } from '../utils/sessionUtils';
import { NextAuthOptions } from 'next-auth';
import { refreshAccessToken } from '../_services/userService';

export const authConfig: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                email: credentials?.email,
                                password: credentials?.password,
                            }),
                        },
                    );
                    const data = await res.json();
                    if (!res.ok || !data?.message?.access_token) return null;

                    return {
                        accessToken: data.message.access_token,
                        refreshToken: data.message.refresh_token,
                        userId: data.message.user_id,
                        userName: data.message.name,
                        accessTokenExpires: data.message.expires_at * 1000,
                    };
                } catch (error) {
                    throw new Error('LoginRequestError');
                }
            },
        }),
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
            async authorize(credentials) {
                if (!credentials?.access_token) return null;
                return {
                    accessToken: credentials.access_token,
                    refreshToken: credentials.refresh_token,
                    accessTokenExpires: Number(credentials.expires_at) * 1000,
                    userId: credentials.user_id,
                    userName: credentials.user_name,
                    isFlaskGoogle: true,
                };
            },
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    callbacks: {
        async jwt({ token, user, account, profile }) {
            if (account?.provider === 'google') {
                token.email = profile?.email;
                token.authProvider = account.provider;
                token.googleIdToken = account.id_token;
            } else if (user) {
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.accessTokenExpires = user.accessTokenExpires;
                token.userId = user.userId;
                token.userName = user.userName;
            }

            if (token.accessToken && token.accessTokenExpires) {
                if (Date.now() < token.accessTokenExpires) {
                    return token;
                }
                const refreshedToken = await refreshAccessToken(token);
                if (refreshedToken.error) {
                    token.error = 'RefreshAccessTokenError';
                    return { ...token, userId: null, accessToken: null, refreshToken: null };
                }
                return refreshedToken;
            }

            return token;
        },

        async session({ session, token }) {
            session.user = {
                ...session.user,
                email: token.email,
                userId: token.userId,
                userName: token.userName,
                token: token.accessToken,
                authProvider: token.authProvider,
            };

            session.googleIdToken = token.googleIdToken;
            session.refreshToken = token.refreshToken;
            session.accessTokenExpires = token.accessTokenExpires;

            return session;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,
};
