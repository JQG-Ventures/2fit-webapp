import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const {
  handlers: { GET, POST },
  auth,
  signOut,
  signIn,
} = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Received credentials:", credentials);
        try {
          const res = await fetch(process.env.AUTH_API + "/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          console.log("Response status:", res.status);
          const user = await res.json();
          console.log("API Response:", user);

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
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.accessToken = user.accessToken;
        token.expiresAt = user.expiresAt;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      session.expiresAt = token.expiresAt;
      return session;
    },
  },
});
