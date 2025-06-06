//@ts-nocheck
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import RegistrationHeader from '../../_components/register/RegistrationHeader';
import RegistrationButtons from '@/app/_components/register/RegisterButtons';
import HorizontalScrollablePicker from '@/app/_components/register/HorizontalScrollablePicker';
import { useTranslation } from 'react-i18next';

export default function RegisterStep6() {
    const { t } = useTranslation('global');
    const { data, updateData } = useRegister();
    const [isSubmittingNext, setIsSubmittingNext] = useState(false);
    const [isSubmittingPrev, setIsSubmittingPrev] = useState(false);
    const [weight, setWeight] = useState(data.weight || 70);
    const router = useRouter();

    const handleNextStep = () => {
        setIsSubmittingNext(true);
        updateData({ weight: weight });
        router.push('/register/step7');
    };

    const handlePrevStep = () => {
        setIsSubmittingPrev(true);
        router.push('/register/step5');
    };

    return (
        <div className="flex flex-col h-screen bg-white p-10 lg:items-center">
            <div className="h-[20%] w-full lg:max-w-3xl">
                <RegistrationHeader
                    title={t('RegisterPagestep6.title')}
                    description={t('RegisterPagestep6.description')}
                />
            </div>

            <div className="flex flex-col items-center justify-center h-[70%] w-full lg:max-w-3xl space-y-8">
                <HorizontalScrollablePicker
                    value={weight}
                    onChange={(newWeight) => setWeight(newWeight)}
                    range={Array.from({ length: 200 }, (_, i) => i + 40)}
                />
            </div>

            <RegistrationButtons
                handleNext={handleNextStep}
                handlePrev={handlePrevStep}
                isSubmittingNext={isSubmittingNext}
                isSubmittingPrev={isSubmittingPrev}
                prevText={t('RegisterPage.back')}
                nextText={t('RegisterPage.next')}
                isNextDisabled={weight === null || weight === undefined}
            />
        </div>
    );
}
