'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaApple, FaFacebook, FaGoogle } from 'react-icons/fa';
import { IoChevronBack } from 'react-icons/io5';
import { FiMail, FiLock } from 'react-icons/fi';
import { useSession, signIn } from 'next-auth/react';
import ButtonWithSpinner from '../_components/others/ButtonWithSpinner';
import InputWithIcon from '../_components/form/InputWithIcon';
import { IconType } from 'react-icons';
import { useTranslation } from 'react-i18next';

interface FormData {
    email: string;
    password: string;
}

interface FormField {
    name: keyof FormData;
    label: string;
    placeholder: string;
    type: string;
    Icon?: IconType;
}

export default function Login() {
    const { t } = useTranslation('global');
    const [errors, setErrors] = useState<{ [key in keyof FormData]?: string }>({});
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isSocialLoading, setIsSocialLoading] = useState<{ [provider: string]: boolean }>({
        google: false,
        facebook: false,
        apple: false,
    });
    const formFields: FormField[] = [
        {
            name: 'email',
            label: 'Email or Number',
            placeholder: t('LoginPage.emailOrPhone'),
            type: 'text',
            Icon: FiMail,
        },
        {
            name: 'password',
            label: 'Password',
            placeholder: '******************',
            type: 'password',
            Icon: FiLock,
        },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setError(null);
        setIsSubmitting(true);

        const { email, password } = formData;

        if (!email || !password) {
            setErrors({
                email: !email ? t('LoginPage.emailRequired') : undefined,
                password: !password ? t('LoginPage.PasswordRequired') : undefined,
            });
            setIsSubmitting(false);
            return;
        }

        const response = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (response?.ok) {
            router.push('/home');
        } else if (response?.error) {
            setError(t('LoginPage.credsError'));
            setIsSubmitting(false);
        } else {
            setError(t('LoginPage.unexpectedError'));
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePrevStep = () => router.push('/');

    async function handleSocialSignIn(provider: string) {
        setIsSocialLoading((prev) => ({ ...prev, [provider]: true }));
        try {
            if (provider === 'google') {
                await signIn('google', { callbackUrl: '/login/google' });
            }
        } catch (err) {
            setError(t('LoginPage.socialSignInError'));
        } finally {
            setIsSocialLoading((prev) => ({ ...prev, [provider]: false }));
        }
    }

    return (
        <div className="flex flex-col h-screen bg-white p-10 items-center">
            <div className="h-[15%] pt-20 w-full lg:max-w-3xl">
                <button onClick={handlePrevStep} className="text-4xl lg:hidden">
                    <IoChevronBack />
                </button>
            </div>

            <div className="h-[15%] flex flex-row w-full lg:max-w-3xl">
                <button
                    onClick={handlePrevStep}
                    className="hidden text-4xl lg:flex mr-14 mt-5 text-center"
                >
                    <IoChevronBack />
                </button>
                <h1 className="text-6xl font-semibold">
                    {t('LoginPage.loginTitle.0')}
                    <br />
                    {t('LoginPage.loginTitle.1')}
                </h1>
            </div>

            <div className="h-[50%] flex w-full items-center justify-center">
                <form className="w-full lg:max-w-3xl" onSubmit={handleSubmit}>
                    {formFields.map(({ name, label, placeholder, Icon, type }, index) => (
                        <InputWithIcon
                            key={index}
                            label={label}
                            name={name}
                            type={type}
                            placeholder={placeholder}
                            value={formData[name]}
                            // @ts-ignore
                            onChange={handleChange}
                            Icon={Icon}
                            error={errors[name]}
                        />
                    ))}
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <div className="flex justify-end mb-10">
                        <p className="mt-4 text-[12px]">
                            <a
                                href="/options/forgotpassword/step0"
                                className="text-blue-900 font-medium hover:text-blue-500"
                            >
                                {t('LoginPage.forgotPassword')}
                            </a>
                        </p>
                    </div>

                    <ButtonWithSpinner
                        type="submit"
                        loading={isSubmitting}
                        className="w-full bg-black text-white py-4 rounded-full text-1xl font-semibold hover:bg-gray-800 transition duration-200"
                    >
                        {t('LoginPage.signIn')}
                    </ButtonWithSpinner>
                </form>
            </div>

            <div className="h-[15%] flex flex-col justify-start text-center">
                <p className="text-gray-500 mb-10">{t('LoginPage.OrSignIn')}</p>
                <div className="flex flex-row justify-center space-x-8">
                    <ButtonWithSpinner
                        key={'test'}
                        type="button"
                        loading={isSocialLoading['google']}
                        onClick={() => handleSocialSignIn('google')}
                        className="text-5xl"
                    >
                        <FaGoogle className="text-red-600" />
                    </ButtonWithSpinner>
                </div>
            </div>

            <div className="h-[5%] text-center content-center">
                <p className="text-gray-500">
                    {t('LoginPage.dontHaveAcc')}{' '}
                    <a href="/register" className="text-indigo-600 underline">
                        {t('LoginPage.signUp')}
                    </a>
                </p>
            </div>
        </div>
    );
}
