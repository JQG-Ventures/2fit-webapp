'use client';

import React, { useState } from 'react';
import { useRegister } from '@/app/_components/register/RegisterProvider';
import RegistrationHeader from '@/app/_components/register/RegistrationHeader';
import HorizontalScrollablePicker from '@/app/_components/register/HorizontalScrollablePicker';
import { useTranslation } from 'react-i18next';
import type { StepProps } from '@/app/(auth)/register/_components/RegisterWizard';
import WizardNavButtons from '@/app/(auth)/register/_components/WizardNavButtons';

export default function Step5Weight({ onNext, onPrev }: StepProps) {
    const { t } = useTranslation('global');
    const { data, updateData } = useRegister();
    const [weight, setWeight] = useState(data.weight || 70);

    const handleNext = () => {
        updateData({ weight });
        onNext();
    };

    return (
        <div className="flex flex-col flex-1 justify-between p-6">
            <div className="pt-4">
                <RegistrationHeader
                    title={t('RegisterPagestep6.title')}
                    description={t('RegisterPagestep6.description')}
                />
            </div>

            <div className="flex items-center justify-center py-6">
                <HorizontalScrollablePicker
                    value={weight}
                    onChange={setWeight}
                    range={Array.from({ length: 200 }, (_, i) => i + 40)}
                />
            </div>

            <WizardNavButtons
                onPrev={onPrev}
                onNext={handleNext}
                isNextDisabled={weight === null || weight === undefined}
                prevText={t('RegisterPage.back')}
                nextText={t('RegisterPage.next')}
            />
        </div>
    );
}
