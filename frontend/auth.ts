import NextAuth from 'next-auth';
import { authConfig } from '@/app/config/auth.config';

interface AuthHandlers {
    GET: (...args: unknown[]) => Promise<Response>;
    POST: (...args: unknown[]) => Promise<Response>;
}

interface NextAuthResultLike {
    handlers: AuthHandlers;
    auth: (...args: unknown[]) => unknown;
    signOut: (...args: unknown[]) => Promise<unknown>;
    signIn: (...args: unknown[]) => Promise<unknown>;
}

const createNextAuth = NextAuth as unknown as (config: typeof authConfig) => NextAuthResultLike;
const nextAuthResult = createNextAuth(authConfig);

export const GET = nextAuthResult.handlers.GET;
export const POST = nextAuthResult.handlers.POST;
export const auth = nextAuthResult.auth;
export const signOut = nextAuthResult.signOut;
export const signIn = nextAuthResult.signIn;
