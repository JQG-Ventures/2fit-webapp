'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SignInResponse } from 'next-auth/react';

import { FaGoogle } from 'react-icons/fa';
import { IoChevronBack, IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { signIn } from 'next-auth/react';
import ButtonWithSpinner from '@/app/_components/others/ButtonWithSpinner';
import { useTranslation } from 'react-i18next';
import { MdOutlineQuestionMark } from 'react-icons/md';

interface FormData {
    identifier: string;
    password: string;
}

interface LoginFeedback {
    description: string;
    title: string;
    tone: 'critical' | 'warning';
}

function buildLoginFeedback(t: (key: string) => string, response?: SignInResponse): LoginFeedback {
    if (response?.code === 'invalid_credentials' || response?.code === 'credentials') {
        return {
            title: t('LoginPage.invalidCredentialsTitle'),
            description: t('LoginPage.invalidCredentialsDescription'),
            tone: 'critical',
        };
    }

    return {
        title: t('LoginPage.supportErrorTitle'),
        description: t('LoginPage.supportErrorDescription'),
        tone: 'warning',
    };
}

export default function Login() {
    const { t } = useTranslation('global');
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({ identifier: '', password: '' });
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [feedback, setFeedback] = useState<LoginFeedback | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSocialLoading, setIsSocialLoading] = useState<Record<string, boolean>>({
        google: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const isSocialBusy = Object.values(isSocialLoading).some(Boolean);
    const isAuthBusy = isSubmitting || isSocialBusy;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isAuthBusy) {
            return;
        }

        setErrors({});
        setFeedback(null);
        setIsSubmitting(true);

        const { identifier, password } = formData;

        if (!identifier || !password) {
            setErrors({
                identifier: !identifier ? t('LoginPage.identifierRequired') : undefined,
                password: !password ? t('LoginPage.passwordRequired') : undefined,
            });
            setIsSubmitting(false);
            return;
        }

        const response = await signIn('credentials', { identifier, password, redirect: false });

        if (response?.error) {
            setFeedback(buildLoginFeedback(t, response));
            setIsSubmitting(false);
        } else if (response?.ok) {
            router.push('/home');
        } else {
            setFeedback(buildLoginFeedback(t));
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const field = name as keyof FormData;

        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
        if (feedback) {
            setFeedback(null);
        }
    };

    const handleSocialSignIn = async (provider: string) => {
        if (isAuthBusy) {
            return;
        }

        setFeedback(null);
        setIsSocialLoading((prev) => ({ ...prev, [provider]: true }));
        try {
            if (provider === 'google') await signIn('google', { callbackUrl: '/login/google' });
        } catch {
            setFeedback({
                title: t('LoginPage.supportErrorTitle'),
                description: t('LoginPage.socialSignInError'),
                tone: 'warning',
            });
        } finally {
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
                            name="identifier"
                            placeholder={t('LoginPage.emailOrPhone')}
                            value={formData.identifier}
                            onChange={handleChange}
                            autoComplete="username"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                            aria-invalid={Boolean(errors.identifier)}
                            className={`w-full bg-gray-50 text-gray-900 placeholder-gray-400 rounded-xl
                                py-[18px] px-5 text-[17px] border
                                ${errors.identifier ? 'border-red-400' : 'border-gray-200'}
                                focus:outline-none focus:border-black focus:bg-white transition`}
                        />
                        {errors.identifier && (
                            <p className="text-red-500 text-sm mt-1.5 pl-1">{errors.identifier}</p>
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
                                autoComplete="current-password"
                                aria-invalid={Boolean(errors.password)}
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

                    {feedback && (
                        <div
                            role="alert"
                            aria-live="polite"
                            className={`rounded-2xl border px-4 py-4 ${
                                feedback.tone === 'critical'
                                    ? 'border-red-200 bg-red-50 text-red-700'
                                    : 'border-orange-200 bg-orange-50 text-orange-950'
                            }`}
                        >
                            <div className="flex items-center gap-3 py-4">
                                <span
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center text-[30px] ${
                                        feedback.tone === 'critical'
                                            ? 'text-red-500'
                                            : 'text-orange-500'
                                    }`}
                                >
                                    <MdOutlineQuestionMark />
                                </span>
                                <div>
                                    <p className="text-[15px] font-semibold leading-5">
                                        {feedback.title}
                                    </p>
                                    <p className="mt-2 text-[14px] leading-5 opacity-80">
                                        {feedback.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

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
                        disabled={isSocialBusy}
                        ariaLabel={t('LoginPage.signIn')}
                        className="w-full py-[18px] rounded-full text-[17px] font-bold bg-black text-white hover:bg-gray-800 cursor-pointer transition-colors duration-200"
                        replaceContentOnLoading
                        spinnerClassName="text-[18px]"
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
                            disabled={isSubmitting}
                            onClick={() => handleSocialSignIn('google')}
                            ariaLabel={t('a11y.signInWithGoogle')}
                            className="w-[72px] h-[72px] rounded-2xl border border-gray-200 bg-white
                                flex items-center justify-center text-[28px] text-[#ea4335]
                                shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
                            replaceContentOnLoading
                            spinnerClassName="text-[24px]"
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
