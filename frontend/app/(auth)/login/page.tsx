'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaGoogle } from 'react-icons/fa';
import { IoChevronBack, IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { signIn } from 'next-auth/react';
import ButtonWithSpinner from '@/app/_components/others/ButtonWithSpinner';
import { useTranslation } from 'react-i18next';

interface FormData {
    email: string;
    password: string;
}

function logLoginClient(event: string, payload: Record<string, unknown>): void {
    console.warn(`[AUTH_DEBUG][login-client] ${event}`, payload);
}

export default function Login() {
    const { t } = useTranslation('global');
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSocialLoading, setIsSocialLoading] = useState<Record<string, boolean>>({
        google: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setError(null);
        setIsSubmitting(true);

        const { email, password } = formData;
        logLoginClient('submit:start', {
            email,
            passwordLength: password.length,
            pathname: window.location.pathname,
            href: window.location.href,
        });

        if (!email || !password) {
            setErrors({
                email: !email ? t('LoginPage.emailRequired') : undefined,
                password: !password ? t('LoginPage.PasswordRequired') : undefined,
            });
            logLoginClient('submit:validation-error', {
                hasEmail: Boolean(email),
                hasPassword: Boolean(password),
            });
            setIsSubmitting(false);
            return;
        }

        const response = await signIn('credentials', { email, password, redirect: false });
        logLoginClient('submit:signin-response', {
            response,
            ok: response?.ok ?? null,
            error: response?.error ?? null,
            status: response?.status ?? null,
            url: response?.url ?? null,
        });

        if (response?.ok) {
            try {
                const sessionResponse = await fetch('/api/auth/session', {
                    method: 'GET',
                    cache: 'no-store',
                });
                const sessionBody = await sessionResponse.text();
                logLoginClient('submit:session-probe', {
                    status: sessionResponse.status,
                    ok: sessionResponse.ok,
                    sessionBody,
                });
            } catch (probeError) {
                logLoginClient('submit:session-probe-error', {
                    error: probeError instanceof Error ? probeError.message : String(probeError),
                });
            }
            logLoginClient('submit:router-push-home', {
                fromPath: window.location.pathname,
            });
            router.push('/home');
        } else if (response?.error) {
            setError(t('LoginPage.credsError'));
            logLoginClient('submit:credentials-error', {
                error: response.error,
            });
            setIsSubmitting(false);
        } else {
            setError(t('LoginPage.unexpectedError'));
            logLoginClient('submit:unexpected-response', {
                response,
            });
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSocialSignIn = async (provider: string) => {
        setIsSocialLoading((prev) => ({ ...prev, [provider]: true }));
        logLoginClient('social:click', { provider });
        try {
            if (provider === 'google') await signIn('google', { callbackUrl: '/login/google' });
        } catch {
            logLoginClient('social:error', { provider });
            setError(t('LoginPage.socialSignInError'));
        } finally {
            logLoginClient('social:done', { provider });
            setIsSocialLoading((prev) => ({ ...prev, [provider]: false }));
        }
    };

    return (
        <div className="min-h-svh w-full bg-white flex flex-col">
            <div className="flex flex-col flex-1 justify-between p-14">
                {/* Zone 1: Back + Title */}
                <div className="pt-4">
                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        aria-label={t('a11y.goBack')}
                        className="text-2xl text-gray-700 cursor-pointer mb-6 p-0 bg-transparent border-none"
                    >
                        <IoChevronBack />
                    </button>

                    <h1 className="text-6xl leading-[1.15] font-bold text-black tracking-[-0.02em]">
                        {t('LoginPage.loginTitle.0')}
                        <br />
                        {t('LoginPage.loginTitle.1')}
                    </h1>
                </div>

                {/* Zone 2: Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-12 py-6">
                    <div>
                        <input
                            type="text"
                            name="email"
                            placeholder={t('LoginPage.emailOrPhone')}
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full bg-gray-50 text-gray-900 placeholder-gray-400 rounded-xl
                                py-[18px] px-5 text-[17px] border
                                ${errors.email ? 'border-red-400' : 'border-gray-200'}
                                focus:outline-none focus:border-black focus:bg-white transition`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1.5 pl-1">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <div
                            className={`relative rounded-xl transition-all duration-500 ${
                                passwordFocused
                                    ? 'bg-black shadow-[0_0_24px_rgba(0,0,0,0.25)]'
                                    : 'bg-transparent shadow-none'
                            }`}
                        >
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="••••••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                className={`w-full rounded-xl py-[18px] px-5 pr-14 text-[17px] border
                                    transition-all duration-300 focus:outline-none
                                    ${
                                        passwordFocused
                                            ? 'bg-black text-white placeholder-gray-500 border-gray-700'
                                            : `bg-gray-50 text-gray-900 placeholder-gray-400 ${errors.password ? 'border-red-400' : 'border-gray-200'} focus:border-black focus:bg-white`
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 text-[17px] cursor-pointer transition-colors
                                    ${passwordFocused ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                                tabIndex={-1}
                            >
                                {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1.5 pl-1">{errors.password}</p>
                        )}
                    </div>

                    {error && <p className="text-red-500 text-[15px] text-center">{error}</p>}

                    <div className="text-right">
                        <a
                            href="/options/forgotpassword/step0"
                            className="text-[15px] text-gray-500 hover:underline"
                        >
                            {t('LoginPage.forgotPassword')}
                        </a>
                    </div>

                    <ButtonWithSpinner
                        type="submit"
                        loading={isSubmitting}
                        ariaLabel={t('LoginPage.signIn')}
                        className="w-full py-[18px] rounded-full text-[17px] font-bold bg-black text-white hover:bg-gray-800 cursor-pointer transition-colors duration-200"
                    >
                        {t('LoginPage.signIn')}
                    </ButtonWithSpinner>
                </form>

                {/* Zone 3: Social + signup footer */}
                <div className="pb-2 flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-5">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[15px] text-gray-400 whitespace-nowrap">
                            {t('LoginPage.OrSignIn')}
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <div className="flex justify-center gap-6 mb-6">
                        <ButtonWithSpinner
                            type="button"
                            loading={isSocialLoading['google']}
                            onClick={() => handleSocialSignIn('google')}
                            ariaLabel={t('a11y.signInWithGoogle')}
                            className="w-[72px] h-[72px] rounded-2xl border border-gray-200 bg-white
                                flex items-center justify-center text-[28px] text-[#ea4335]
                                shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <FaGoogle />
                        </ButtonWithSpinner>
                    </div>

                    <p className="text-center text-[15px] text-gray-500">
                        {t('LoginPage.dontHaveAcc')}{' '}
                        <a href="/register" className="text-orange-500 font-bold hover:underline">
                            {t('LoginPage.signUp')}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
