'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '@/app/_components/register/RegisterProvider';
import { registerUser } from '@/app/_services/registerService';
import { useTranslation } from 'react-i18next';
import { signIn, useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import type { ApiResponse } from '@/app/_types/api';
import type { AuthApiTokenMessage } from '@/app/_types/auth';
import { parseJson } from '@/app/utils/http';
import { buildRegisterPayload } from '@/app/utils/register';

export default function Step10Submit() {
    const { t } = useTranslation('global');
    const router = useRouter();
    const { data } = useRegister();
    const { data: sessionData } = useSession();
    const session = sessionData as Session | null;
    const [textIndex, setTextIndex] = useState(0);
    const [showText, setShowText] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const hasRegistered = useRef(false);

    const texts = [
        t('RegisterPagestep11.texts.0'),
        t('RegisterPagestep11.texts.1'),
        t('RegisterPagestep11.texts.2'),
        t('RegisterPagestep11.texts.3'),
        t('RegisterPagestep11.texts.4'),
    ];

    const changeText = useCallback(() => {
        setShowText(false);
        setTimeout(() => {
            setTextIndex((prev) => (prev + 1) % texts.length);
            setShowText(true);
        }, 500);
    }, [texts.length]);

    useEffect(() => {
        const interval = setInterval(changeText, 2500);

        async function handleRegistration() {
            if (hasRegistered.current) return;
            hasRegistered.current = true;

            try {
                const payload = buildRegisterPayload(data);
                const result = await registerUser(payload);

                if (!result || result?.status === 'error') {
                    setErrorMessage(t('RegisterPagestep11.errormsg'));
                    setIsLoading(false);
                    return;
                }

                if (payload.auth_provider === 'default') {
                    const response = await signIn('credentials', {
                        email: payload.email,
                        password: payload.password,
                        redirect: false,
                    });
                    if (!response?.ok) {
                        setErrorMessage(t('RegisterPagestep11.errormsg'));
                        setIsLoading(false);
                        setTimeout(() => router.push('/'), 1100);
                        return;
                    }
                    setTimeout(() => router.push('/home'), 3000);
                } else if (payload.auth_provider === 'google') {
                    const googleIdToken =
                        typeof session?.googleIdToken === 'string' ? session.googleIdToken : null;
                    if (!googleIdToken) {
                        setErrorMessage('No Google ID token available. Please sign in again.');
                        setIsLoading(false);
                        return;
                    }
                    const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google-login`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id_token: googleIdToken }),
                        },
                    );
                    if (!res.ok) {
                        const errData = await parseJson<ApiResponse<string>>(res);
                        setErrorMessage(errData?.message || 'Could not complete Google login');
                        setIsLoading(false);
                        return;
                    }
                    const googleData = await parseJson<ApiResponse<AuthApiTokenMessage>>(res);
                    await signIn('flaskgoogle', {
                        access_token: googleData.message.access_token,
                        refresh_token: googleData.message.refresh_token,
                        expires_at: googleData.message.expires_at,
                        user_id: googleData.message.user_id,
                        user_name: googleData.message.name,
                        redirect: false,
                    });
                    setTimeout(() => router.push('/home'), 3000);
                }
            } catch {
                setErrorMessage(t('RegisterPagestep11.errormsg'));
                setIsLoading(false);
            }
        }

        void handleRegistration();
        return () => clearInterval(interval);
    }, [router, data, changeText, t, session]);

    return (
        <div className="flex items-center justify-center min-h-[60vh] w-full">
            <div className="w-full max-w-sm flex flex-col items-center text-center gap-8">
                {isLoading ? (
                    <>
                        <h2 className="text-3xl sm:text-4xl font-bold">
                            {t('RegisterPagestep11.creating.0')}
                            <br />
                            {t('RegisterPagestep11.creating.1')}
                        </h2>
                        <div className="w-14 h-14 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                        <div
                            className={`transition-opacity duration-500 ${showText ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <p className="text-base text-gray-600">{texts[textIndex]}</p>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col gap-6">
                        <h2 className="text-2xl font-bold text-red-600">{errorMessage}</h2>
                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="px-6 py-4 bg-red-500 text-white text-base rounded-xl"
                            aria-label={t('RegisterPagestep11.homebtn')}
                        >
                            {t('RegisterPagestep11.homebtn')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
