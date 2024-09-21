import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
var jwt = require("jsonwebtoken");

async function refreshAccessToken(accessToken: any) {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/auth/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refresh_token: accessToken.refreshToken,
      }),
    });
    const responseData = await response.json();
    return {
      ...accessToken,
      accessToken: responseData.response.access_token,
      accessTokenExpires: Date.now() + responseData.response.expires_at * 1000,
      refreshToken:
        responseData.response.refresh_token ?? accessToken.refreshToken,
    };
  } catch (error) {
    return {
      ...accessToken,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authConfig = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });
          const user = await res.json();
          if (res.ok && user?.response?.access_token) {
            return user;
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
    async jwt({ token, user }: any) {
      if (user) {
        token.accessToken = user.response.access_token;
        token.refreshToken = user.response.refresh_token;
        token.exp = user.response.expires_at ?? 0 * 1000;
      }
      if (token && token.exp && Date.now() < token.exp) return token;
      return refreshAccessToken(token);
    },
    async session({ session, token }: any) {
      try {
        const userToken = token.accessToken;
        const user = jwt.decode(userToken);
        if (user) session.user = { ...user, token: userToken };
        return session;
      } catch (error) {
        throw error;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
} satisfies NextAuthConfig;
