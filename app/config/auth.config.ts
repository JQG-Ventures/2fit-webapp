import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

async function refreshAccessToken(accessToken: any) {
    return { error: "Refresh token not available" };
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
                    console.log("Logged in")
                    console.log(user);

                    if (res.ok && user?.response?.access_token) {
                        return {
                            accessToken: user.response.access_token,
                            userId: user.response.user_id,
                            userName: user.response.name,
                            expiresAt: Date.now() + user.response.expires_at * 1000,
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
                token.exp = user.expiresAt;
                token.userId = user.userId;
                token.userName = user.userName;
            }

            if (token && token.exp && Date.now() < token.exp) return token;

            return { ...token, error: "Access token expired and no refresh token available" };
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
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,
};
