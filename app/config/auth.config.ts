// @ts-nocheck
import CredentialsProvider from "next-auth/providers/credentials";
import { signOut } from "next-auth/react";
import { NextResponse } from 'next/server';
import { logout } from "../utils/sessionUtils";

async function refreshAccessToken(token) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/refresh-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token.refreshToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to refresh access token');
        }

        const refreshed = await response.json()
        const newAccess = refreshed.message.access_token
        const newExp = refreshed.message.expires_at * 1000

        return {
            ...token,
            accessToken: newAccess,
            accessTokenExpires: newExp,
        }
    } catch (error) {
        return { ...token, error: "RefreshAccessTokenError" };
    }
}

export const authConfig = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: credentials?.email,
                            password: credentials?.password,
                        }),
                    });
                    const data = await res.json()

                    if (!res.ok || !data?.message?.access_token) {
                        return null
                    }

                    return {
                        accessToken: data.message.access_token,
                        refreshToken: data.message.refresh_token,
                        userId: data.message.user_id,
                        userName: data.message.name,
                        accessTokenExpires: data.message.exp * 1000,
                    }
                } catch (error) {
                    throw new Error("LoginRequestError");
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = user.accessToken
                token.refreshToken = user.refreshToken
                token.userId = user.userId
                token.userName = user.userName
                token.accessTokenExpires = user.accessTokenExpires
            }

            if (Date.now() < (token.accessTokenExpires ?? 0)) {
                return token
            }

            const refreshedToken = await refreshAccessToken(token)
            if (refreshedToken.error) {
                return { userId: null, accessToken: null, refreshToken: null };
            }
            return refreshedToken
        },
        async session({ session, token }) {
            if (token?.error === 'RefreshAccessTokenError') {
                if (typeof window !== "undefined") {
                    await logout();
                }
            }

            session.user = {
                ...session.user,
                userId: token.userId,
                userName: token.userName,
                token: token.accessToken,
            }
            session.refreshToken = token.refreshToken
            session.accessTokenExpires = token.accessTokenExpires
            return session
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,
};
