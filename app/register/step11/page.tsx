'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import { registerUser } from '../../_services/registerService';
import { useTranslation } from 'react-i18next';
import { signIn } from 'next-auth/react';


export default function RegisterStep11() {
    const { t } = useTranslation('global');
    const [textIndex, setTextIndex] = useState(0);
    const [showText, setShowText] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    const { data } = useRegister();

    const texts = [
        t('RegisterPagestep11.texts.0'),
        t('RegisterPagestep11.texts.1'),
        t('RegisterPagestep11.texts.2'),
        t('RegisterPagestep11.texts.3'),
        t('RegisterPagestep11.texts.4')
    ];

    const changeText = useCallback(() => {
        setShowText(false);
        setTimeout(() => {
            setTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
            setShowText(true);
        }, 500);
    }, [texts.length]);

    useEffect(() => {
        const changeTextInterval = setInterval(changeText, 2500);

        const handleRegistration = async () => {
            try {
                const result = await registerUser(data);
                const password = data.password
                const email = data.email
                const response = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                console.log(response)

                if (!response?.ok) {
                    setErrorMessage(t('RegisterPagestep11.errormsg'));
                    setIsLoading(false);
                    setTimeout(() => {
                        router.push('/');
                    }, 1100);
                    router.push("/");
                }

                setTimeout(() => {
                    router.push('/home');
                }, 3000);
            } catch (error) {
                setErrorMessage(t('RegisterPagestep11.errormsg'));
                setIsLoading(false);
            }
        };

        handleRegistration();

        return () => {
            clearInterval(changeTextInterval);
        };
    }, [router, data, changeText]);

    const handleRetry = () => {
        router.push('/');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white p-4">
            <div className="w-full max-w-lg flex flex-col items-center justify-evenly h-[60vh] text-center">
                {isLoading ? (
                    <>
                        <h2 className="text-5xl font-bold mb-10">{t('RegisterPagestep11.creating.0')} <br /> {t('RegisterPagestep11.creating.1')}</h2>
                        <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mb-10"></div>
                        <div className={`transition-opacity duration-500 ${showText ? 'opacity-100' : 'opacity-0'}`}>
                            <p className="text-2xl">{texts[textIndex]}</p>
                        </div>
                    </>
                ) : (
                    <div>
                        <h2 className="text-3xl font-bold text-red-600 mb-6">{errorMessage}</h2>
                        <button
                            onClick={handleRetry}
                            className="mt-4 px-6 py-4 bg-red-500 text-white text-2xl rounded-lg"
                        >
                            {t('RegisterPagestep11.homebtn')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
