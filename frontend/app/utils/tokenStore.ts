/**
 * In-memory token store — single source of truth for the Flask access token on the client.
 *
 * Updated by SessionSync (mounted inside SessionProvider) whenever the NextAuth session changes.
 * The Axios interceptor reads from here instead of calling getSession() on every request.
 *
 * `ready` tracks whether the session has been resolved at least once.
 * The interceptor waits for `ready` before sending requests, preventing the
 * race condition where requests fire before SessionProvider resolves the cookie.
 */
let currentToken: string | null = null;
let ready = false;
let resolveReady: () => void;

const readyPromise = new Promise<void>((resolve) => {
    resolveReady = resolve;
});

export const tokenStore = {
    get: (): string | null => currentToken,

    set: (token: string | null): void => {
        currentToken = token;
        if (!ready) {
            ready = true;
            resolveReady();
        }
    },

    /**
     * Resolves once the session has been read at least once.
     * Awaited by the Axios request interceptor to avoid sending tokenless requests.
     */
    waitUntilReady: (): Promise<void> => readyPromise,
};
