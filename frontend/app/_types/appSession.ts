/**
 * Narrow session shape used by client pages that read `useSession()` and custom JWT fields.
 * Align with `app/config/auth.config.ts` session callbacks.
 */
export interface AppClientSessionUser {
    id?: string | null;
    userId?: string | null;
    userName?: string | null;
    name?: string | null;
    token?: string | null;
}

export interface AppClientSession {
    user?: AppClientSessionUser;
}
