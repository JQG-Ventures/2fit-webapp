'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import React, { useEffect, useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface VerificationCodeInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBackspace: () => void;
    id: string;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
    value,
    onChange,
    onBackspace,
    id,
}) => (
    <input
        type="text"
        maxLength={1}
        value={value}
        onChange={onChange}
        onKeyDown={(e) => {
            if (e.key === 'Backspace') onBackspace();
        }}
        id={id}
        className="w-20 h-20 text-3xl text-center border-2 rounded-md focus:outline-none focus:border-purple-500"
    />
);

interface ResendCodeProps {
    timeLeft: number;
    onResend: () => void;
}

const ResendCode: React.FC<ResendCodeProps> = ({ timeLeft, onResend }) => {
    const { t } = useTranslation('global');

    return (
        <p className="text-xl text-center mt-4">
            {t('ForgotPassword.step2.verificationScreen.resendCode.prompt')}{' '}
            <span className="text-green-500 font-semibold">
                {timeLeft > 0 ? (
                    `${timeLeft} s`
                ) : (
                    <button onClick={onResend} className="text-green-500 underline">
                        {t('ForgotPassword.step2.verificationScreen.resendCode.resendButton')}
                    </button>
                )}
            </span>
        </p>
    );
};

const VerificationScreen: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const contact = searchParams.get('contact') || '+1 111 ******99';
    const { t } = useTranslation('global');

    const [code, setCode] = useState(['', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const obfuscateContact = (contact: string): string => {
        return /^\+?\d{7,}$/.test(contact) ? contact.slice(0, -4) + '****' : contact;
    };

    const displayedContact = obfuscateContact(contact);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const handleCodeChange = (index: number, value: string) => {
        if (/^\d*$/.test(value)) {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);
            if (value && index < code.length - 1) {
                document.getElementById(`code-input-${index + 1}`)?.focus();
            }
        }
    };

    const handleBackspace = (index: number) => {
        if (index > 0 && !code[index]) {
            document.getElementById(`code-input-${index - 1}`)?.focus();
        }
    };

    const handleResend = () => {
        setTimeLeft(60);
    };

    const handleVerify = () => {
        setIsSubmitting(true);
        const enteredCode = code.join('');
        if (enteredCode === '1234') {
            router.push(
                `/options/forgotpassword/step3?code=${enteredCode}&contact=${encodeURIComponent(
                    contact,
                )}`,
            );
        } else {
            alert(t('ForgotPassword.step2.verificationScreen.incorrectCodeAlert'));
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col justify-between items-center bg-white h-screen p-14">
            <div className="h-[10%] flex flex-row justify-left space-x-8 items-center w-full max-w-3xl">
                <button onClick={() => router.back()} className="text-gray-700">
                    <IoIosArrowBack className="text-3xl cursor-pointer" />
                </button>
                <h1 className="text-4xl font-semibold">
                    {t('ForgotPassword.step2.verificationScreen.headerTitle')}
                </h1>
            </div>

            <div className="h-[41%] flex flex-col items-center justify-end w-full max-w-lg pb-10">
                <p className="text-2xl text-gray-900 text-center px-4">
                    {t('ForgotPassword.step2.verificationScreen.codeSentInfo')} {displayedContact}
                </p>
            </div>

            <div className="h-[41%] flex flex-col items-center space-y-4">
                <div className="flex justify-center space-x-6">
                    {code.map((digit, index) => (
                        <VerificationCodeInput
                            key={index}
                            value={digit}
                            onChange={(e) => handleCodeChange(index, e.target.value)}
                            onBackspace={() => handleBackspace(index)}
                            id={`code-input-${index}`}
                        />
                    ))}
                </div>
                <div className="pt-4">
                    <ResendCode timeLeft={timeLeft} onResend={handleResend} />
                </div>
            </div>

            <div className="h-[7%] flex w-full max-w-3xl">
                <button
                    type="button"
                    onClick={handleVerify}
                    className="w-full bg-black text-white rounded-full text-2xl font-semibold shadow-lg flex items-center justify-center"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? t('ForgotPassword.step2.verificationScreen.verifyButton.loadingText')
                        : t('ForgotPassword.step2.verificationScreen.verifyButton.defaultText')}
                </button>
            </div>
        </div>
    );
};

export default function Step2Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerificationScreen />
        </Suspense>
    );
}
