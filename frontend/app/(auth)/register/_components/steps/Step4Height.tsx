'use client';

import React, { useState } from 'react';
import { useRegister } from '@/app/_components/register/RegisterProvider';
import RegistrationHeader from '@/app/_components/register/RegistrationHeader';
import ScrollablePicker from '@/app/_components/register/ScrollablePicker';
import { useTranslation } from 'react-i18next';
import type { StepProps } from '@/app/(auth)/register/_components/RegisterWizard';
import WizardNavButtons from '@/app/(auth)/register/_components/WizardNavButtons';

export default function Step4Height({ onNext, onPrev }: StepProps) {
    const { t } = useTranslation('global');
    const { data, updateData } = useRegister();
    const [height, setHeight] = useState(data.height || 175);

    const handleNext = () => {
        updateData({ height });
        onNext();
    };

    return (
        <div className="flex flex-col flex-1 justify-between p-6">
            <div className="pt-4">
                <RegistrationHeader
                    title={t('RegisterPagestep5.title')}
                    description={t('RegisterPagestep5.description')}
                />
            </div>

            <div className="flex items-center justify-center py-6">
                <ScrollablePicker
                    value={height}
                    onChange={setHeight}
                    range={Array.from({ length: 60 }, (_, i) => i + 150)}
                />
            </div>

            <WizardNavButtons
                onPrev={onPrev}
                onNext={handleNext}
                isNextDisabled={height === null || height === undefined}
                prevText={t('RegisterPage.back')}
                nextText={t('RegisterPage.next')}
            />
        </div>
    );
}
