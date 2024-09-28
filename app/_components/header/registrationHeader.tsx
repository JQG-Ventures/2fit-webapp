'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { IoChevronBack } from "react-icons/io5";
import { useTranslation } from 'react-i18next';

export default function RegistrationHeader({stepNumber, handlePrevStep}) {
    const { t } = useTranslation('global');
    const router = useRouter();
    const handleSkip = () => {
        router.push('/skip')
    };

    return (
        <div className="flex items-center justify-between px-4 mb-10 pt-16 sm:pt-24 md:pt-32">
            <button onClick={() => handlePrevStep()} className="text-4xl z-10">
                <IoChevronBack />
            </button>
            <p className="text-2xl font-medium">{t('RegistrationHeader.stepof.0')} {stepNumber} {t('RegistrationHeader.stepof.1')} 8</p>
            <button onClick={() => handleSkip()} className="text-blue-500 text-2xl">{t('RegistrationHeader.skip')}</button>
        </div>
    );
}
