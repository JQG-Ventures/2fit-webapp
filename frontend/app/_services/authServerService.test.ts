import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function createResponse(
    body: unknown,
    status: number,
    ok = status >= 200 && status < 300,
): Response {
    return {
        ok,
        status,
        json: vi.fn().mockResolvedValue(body),
    } as unknown as Response;
}

describe('loginWithCredentials', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.stubEnv('API_BASE_URL_INTERNAL', 'http://backend:5000');
        vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:5000');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('sends email payload when identifier contains @', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            createResponse(
                {
                    status: 'success',
                    message: {
                        access_token: 'access-token',
                        refresh_token: 'refresh-token',
                        expires_at: 123,
                        user_id: 'user-1',
                        name: 'Ada Lovelace',
                    },
                },
                200,
            ),
        );
        vi.stubGlobal('fetch', fetchMock);

        const { loginWithCredentials } = await import('./authServerService');

        await loginWithCredentials('  USER@example.com  ', 'secret');

        expect(fetchMock).toHaveBeenCalledWith(
            'http://backend:5000/api/auth/login',
            expect.objectContaining({
                body: JSON.stringify({ email: 'user@example.com', password: 'secret' }),
            }),
        );
    });

    it('sends phone payload when identifier is not an email', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            createResponse(
                {
                    status: 'success',
                    message: {
                        access_token: 'access-token',
                        expires_at: 123,
                    },
                },
                200,
            ),
        );
        vi.stubGlobal('fetch', fetchMock);

        const { loginWithCredentials } = await import('./authServerService');

        await loginWithCredentials('+15551112222', 'secret');

        expect(fetchMock).toHaveBeenCalledWith(
            'http://backend:5000/api/auth/login',
            expect.objectContaining({
                body: JSON.stringify({ phone: '+15551112222', password: 'secret' }),
            }),
        );
    });

    it('classifies 401 and 404 as invalid credentials', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValue(
                createResponse({ status: 'error', message: 'Invalid credentials' }, 401, false),
            );
        vi.stubGlobal('fetch', fetchMock);

        const { loginWithCredentials } = await import('./authServerService');

        await expect(loginWithCredentials('user@example.com', 'wrong')).rejects.toEqual(
            expect.objectContaining({
                name: 'LoginFailureError',
                reason: 'invalid_credentials',
            }),
        );
    });

    it('classifies network and server failures as support issues', async () => {
        const fetchMock = vi.fn().mockRejectedValue(new Error('network down'));
        vi.stubGlobal('fetch', fetchMock);

        const { loginWithCredentials } = await import('./authServerService');

        await expect(loginWithCredentials('user@example.com', 'secret')).rejects.toEqual(
            expect.objectContaining({
                name: 'LoginFailureError',
                reason: 'support',
            }),
        );
    });
});
