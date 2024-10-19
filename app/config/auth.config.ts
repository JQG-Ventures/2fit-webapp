import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

async function refreshAccessToken(token: any) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/refresh-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token.refreshToken}`,
            },
        });

        const refreshedToken = await response.json();

        if (!response.ok) throw refreshedToken;

        return {
            ...token,
            accessToken: refreshedToken.message.access_token,
            exp: Date.now() + refreshedToken.message.expires_at,
        };
    } catch (error) {
        return { ...token, error: "Refresh token failed" };
    }
}

export const authConfig: NextAuthConfig = {
    providers: [
        CredentialsProvider({
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
                    const user = await res.json();

                    if (res.ok && user?.message?.access_token) {
                        return {
                            accessToken: user.message.access_token,
                            refreshToken: user.message.refresh_token,
                            userId: user.message.user_id,
                            userName: user.message.name,
                            expiresAt: Date.now() + user.message.expires_at,
                        };
                    } else {
                        console.error("Authentication failed, response:", user);
                        return null;
                    }
                } catch (error) {
                    console.error("Error in authorize function:", error);
                    throw new Error("Authentication failed");
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.exp = user.expiresAt;
                token.userId = user.userId;
                token.userName = user.userName;
            }

            if (Date.now() < token.exp) {
                return token;
            }
            return refreshAccessToken(token);
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user,
                    token: token.accessToken,
                    userId: token.userId,
                    userName: token.userName,
                };
            }
            session.refreshToken = token.refreshToken;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,
};
