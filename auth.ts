import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const options = {
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Received credentials:", credentials);

        try {
          const res = await fetch("http://localhost:5002/login", {
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
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };
