'use client';

import React, { useState } from 'react';
import { useRegister } from '@/app/_components/register/RegisterProvider';
import RegistrationHeader from '@/app/_components/register/RegistrationHeader';
import HorizontalScrollablePicker from '@/app/_components/register/HorizontalScrollablePicker';
import { useTranslation } from 'react-i18next';
import type { StepProps } from '@/app/(auth)/register/_components/RegisterWizard';
import WizardNavButtons from '@/app/(auth)/register/_components/WizardNavButtons';

export default function Step6TargetWeight({ onNext, onPrev }: StepProps) {
    const { t } = useTranslation('global');
    const { data, updateData } = useRegister();
    const [targetWeight, setTargetWeight] = useState(data.target_weight || 70);

    const handleNext = () => {
        updateData({ target_weight: targetWeight });
        onNext();
    };

    return (
        <div className="flex flex-col flex-1 justify-between p-6">
            <div className="pt-4">
                <RegistrationHeader
                    title={t('RegisterPagestep7.title')}
                    description={t('RegisterPagestep7.description')}
                />
            </div>

            <div className="flex items-center justify-center py-6">
                <HorizontalScrollablePicker
                    value={targetWeight}
                    onChange={setTargetWeight}
                    range={Array.from({ length: 200 }, (_, i) => i + 40)}
                />
            </div>

            <WizardNavButtons
                onPrev={onPrev}
                onNext={handleNext}
                isNextDisabled={targetWeight === null || targetWeight === undefined}
                prevText={t('RegisterPage.back')}
                nextText={t('RegisterPage.next')}
            />
        </div>
    );
}
