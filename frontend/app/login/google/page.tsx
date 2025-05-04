'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function GoogleLoginCallback() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasSentRequest, setHasSentRequest] = useState(false);

    useEffect(() => {
        if (status === 'loading' || hasSentRequest) {
            return;
        }

        if (status === 'unauthenticated') {
            setError('No authenticated session found');
            setLoading(false);
            return;
        }

        async function handleGoogleLogin() {
            setHasSentRequest(true);

            try {
                // @ts-ignore
                if (!session?.googleIdToken) {
                    setError('Missing Google ID Token');
                    setLoading(false);
                    return;
                }

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google-login`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        // @ts-ignore
                        body: JSON.stringify({ id_token: session?.googleIdToken }),
                    },
                );

                if (!res.ok) {
                    const errorMessage =
                        res.status === 404
                            ? 'Invalid user'
                            : res.status === 400
                              ? 'User not registered with Google'
                              : 'There was a login error, try again later';

                    setError(errorMessage);
                    setLoading(false);
                    return;
                }

                const data = await res.json();

                await signIn('flaskgoogle', {
                    access_token: data.message.access_token,
                    refresh_token: data.message.refresh_token,
                    expires_at: data.message.expires_at,
                    user_id: data.message.user_id,
                    user_name: data.message.name,
                    redirect: false,
                });

                router.push('/home');
            } catch {
                setError('Network error');
                setLoading(false);
            }
        }

        handleGoogleLogin();
    }, [status, session, hasSentRequest, router]);

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Verifying Google login...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => router.push('/login')}
                    className="bg-black text-white px-6 py-3 rounded-md"
                >
                    Go back to Login
                </button>
            </div>
        );
    }

    return null;
}
