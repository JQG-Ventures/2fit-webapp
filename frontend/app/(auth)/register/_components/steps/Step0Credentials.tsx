'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { FaApple, FaFacebook, FaGoogle } from 'react-icons/fa';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { useSearchParams } from 'next/navigation';
import { useRegister } from '@/app/_components/register/RegisterProvider';
import ButtonWithSpinner from '@/app/_components/others/ButtonWithSpinner';
import { isEmailAvailable } from '@/app/_services/userService';
import { useTranslation } from 'react-i18next';
import { signIn } from 'next-auth/react';
import type { StepProps } from '@/app/(auth)/register/_components/RegisterWizard';
import type { AuthProvider } from '@/app/_types/register';

type RegisterEntryField = 'email' | 'password';

interface RegisterEntryFormState {
    email: string;
    password: string;
    auth_provider: AuthProvider;
}

const SOCIAL_PROVIDERS = [
    {
        Icon: FaFacebook,
        iconClassName: 'text-[#1877f2]',
        providerKey: 'a11y.signInWithFacebook',
    },
    {
        Icon: FaGoogle,
        iconClassName: 'text-[#ea4335]',
        providerKey: 'a11y.signInWithGoogle',
        isGoogle: true,
    },
    { Icon: FaApple, iconClassName: 'text-black', providerKey: 'a11y.signInWithApple' },
] as const;

function SearchParamsHandler({
    setErrors,
    t,
}: {
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    t: (key: string) => string;
}) {
    const searchParams = useSearchParams();
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (!errorParam) return;
        const newErrors: Record<string, string> = {};
        if (errorParam === 'emailExistsGoogle')
            newErrors.email = t('RegisterPage.registeredGoogle');
        else if (errorParam === 'errorGoogle') newErrors.password = t('RegisterPage.googleError');
        else if (errorParam === 'generalError') newErrors.general = t('RegisterPage.generalError');
        setErrors(newErrors);
    }, [searchParams, setErrors, t]);
    return null;
}

export default function Step0Credentials({ onNext }: StepProps) {
    const { data, updateData } = useRegister();
    const { t } = useTranslation('global');
    const [formData, setFormData] = useState<RegisterEntryFormState>({
        email: data.email || '',
        password: data.password || '',
        auth_provider: 'default',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const fields: Array<{ name: RegisterEntryField; placeholder: string; type?: string }> = [
        { name: 'email', placeholder: t('RegisterPage.email') },
        { name: 'password', placeholder: '••••••••••••', type: 'password' },
    ];

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());
    const validatePassword = (password: string) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])[^ ]{8,}$/.test(password);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const validationErrors: Record<string, string> = {};

        if (!formData.email || !validateEmail(formData.email))
            validationErrors.email = t('RegisterPage.emailRegisteredError');
        if (!formData.password || !validatePassword(formData.password))
            validationErrors.password = t('RegisterPage.passwordValidationError');

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            const available = await isEmailAvailable(formData.email);
            if (!available) {
                setErrors({ email: t('RegisterPage.emailRegisteredError') });
                setIsSubmitting(false);
                return;
            }
        } catch {
            setErrors({ email: t('RegisterPage.emailRegistrationError') });
            setIsSubmitting(false);
            return;
        }

        updateData(formData);
        onNext();
    };

    const handleSocialClick = (isGoogle?: boolean) => {
        if (isGoogle) void signIn('google', { callbackUrl: '/register/google' });
    };

    return (
        <Suspense fallback={null}>
            <SearchParamsHandler setErrors={setErrors} t={t} />

            <div className="flex flex-col flex-1 justify-between p-6">
                <div className="pt-4">
                    <h1 className="text-6xl leading-[1.15] font-bold text-black tracking-[-0.02em]">
                        {t('RegisterPage.create.0')}
                        <br />
                        {t('RegisterPage.create.1')}
                    </h1>
                </div>

                <div className="flex flex-col gap-12 py-6">
                    {fields.map(({ name, placeholder, type = 'text' }) => {
                        const isPassword = name === 'password';
                        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
                        const isFocused = isPassword && passwordFocused;

                        return (
                            <div key={name}>
                                <div
                                    className={`relative rounded-xl transition-all duration-500 ${
                                        isFocused
                                            ? 'bg-black shadow-[0_0_24px_rgba(0,0,0,0.25)]'
                                            : 'bg-transparent shadow-none'
                                    }`}
                                >
                                    <input
                                        type={inputType}
                                        name={name}
                                        placeholder={placeholder}
                                        value={formData[name]}
                                        onChange={handleChange}
                                        onFocus={() => isPassword && setPasswordFocused(true)}
                                        onBlur={() => isPassword && setPasswordFocused(false)}
                                        className={`w-full rounded-xl py-[18px] px-5 text-[17px] border
                                            transition-all duration-500 focus:outline-none
                                            ${
                                                isFocused
                                                    ? 'bg-black text-white placeholder-gray-500 border-gray-700'
                                                    : `bg-gray-50 text-gray-900 placeholder-gray-400 ${errors[name] ? 'border-red-400' : 'border-gray-200'} focus:border-black focus:bg-white`
                                            }
                                            ${isPassword ? 'pr-14' : ''}`}
                                    />
                                    {isPassword && (
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            className={`absolute right-4 top-1/2 -translate-y-1/2 text-[17px] cursor-pointer transition-colors
                                                ${isFocused ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
                                        </button>
                                    )}
                                </div>
                                {errors[name] && (
                                    <p className="text-red-500 text-sm mt-1.5 pl-1">
                                        {errors[name]}
                                    </p>
                                )}
                            </div>
                        );
                    })}

                    <label className="flex items-center justify-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => setIsChecked(!isChecked)}
                            className="w-[22px] h-[22px] accent-emerald-500 cursor-pointer shrink-0 rounded"
                        />
                        <span className="text-[12px] text-gray-500">
                            {t('RegisterPage.policy.0')}{' '}
                            <a href="#" className="text-black font-semibold underline">
                                {t('RegisterPage.policy.1')}
                            </a>
                        </span>
                    </label>

                    {errors.general && (
                        <p className="text-red-500 text-[15px] text-center">{errors.general}</p>
                    )}

                    <ButtonWithSpinner
                        type="button"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        ariaLabel={t('RegisterPage.nextbtn')}
                        disabled={!isChecked}
                        className={`w-full py-[18px] rounded-full text-[17px] font-bold transition-colors duration-200 ${
                            isChecked
                                ? 'bg-black text-white hover:bg-gray-800 cursor-pointer'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {t('RegisterPage.nextbtn')}
                    </ButtonWithSpinner>
                </div>

                {/* ── Zone 3: Social login footer ── */}
                <div className="pb-2 flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-5">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[15px] text-gray-400 whitespace-nowrap">
                            {t('RegisterPage.signuptxt')}
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <div className="flex justify-center gap-6 mb-6">
                        {SOCIAL_PROVIDERS.map(({ Icon, iconClassName, providerKey, ...rest }) => (
                            <button
                                key={providerKey}
                                type="button"
                                onClick={() =>
                                    handleSocialClick(
                                        'isGoogle' in rest ? rest.isGoogle : undefined,
                                    )
                                }
                                aria-label={t(providerKey)}
                                className={`w-[72px] h-[72px] rounded-2xl border border-gray-200 bg-white
                                    flex items-center justify-center text-[28px]
                                    shadow-sm hover:bg-gray-50 transition-colors cursor-pointer ${iconClassName}`}
                            >
                                <Icon />
                            </button>
                        ))}
                    </div>

                    <p className="text-center text-[15px] text-gray-500">
                        {t('RegisterPage.signupquestion')}{' '}
                        <a href="/login" className="text-orange-500 font-bold hover:underline">
                            {t('RegisterPage.signin')}
                        </a>
                    </p>
                </div>
            </div>
        </Suspense>
    );
}
