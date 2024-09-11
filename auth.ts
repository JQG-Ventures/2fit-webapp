import NextAuth from "next-auth";
import { authConfig } from "@/app/config/auth.config";

export const {
    handlers: { GET, POST },
    auth,
    signOut,
    signIn,
} = NextAuth({
    ...authConfig,
});