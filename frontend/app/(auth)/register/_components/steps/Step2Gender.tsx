'use client';

import React, { useState } from 'react';
import { CgGenderFemale, CgGenderMale } from 'react-icons/cg';
import { useRegister } from '@/app/_components/register/RegisterProvider';
import RegistrationHeader from '@/app/_components/register/RegistrationHeader';
import { useTranslation } from 'react-i18next';
import type { Gender } from '@/app/_types/register';
import type { IconType } from 'react-icons';
import type { StepProps } from '@/app/(auth)/register/_components/RegisterWizard';
import WizardNavButtons from '@/app/(auth)/register/_components/WizardNavButtons';

export default function Step2Gender({ onNext, onPrev }: StepProps) {
    const { t } = useTranslation('global');
    const { data, updateData } = useRegister();
    const initialGender = data.gender === 'm' || data.gender === 'f' ? data.gender : null;
    const [selectedGender, setSelectedGender] = useState<Gender | null>(initialGender);

    const genders: Array<{ id: number; label: string; value: Gender; Icon: IconType }> = [
        { id: 0, label: t('RegisterPagestep3.woman'), value: 'f', Icon: CgGenderFemale },
        { id: 1, label: t('RegisterPagestep3.man'), value: 'm', Icon: CgGenderMale },
    ];

    const handleSelect = (value: Gender) => {
        setSelectedGender(value);
        updateData({ gender: value });
    };

    return (
        <div className="flex flex-col flex-1 justify-between p-6">
            <div className="pt-4">
                <RegistrationHeader
                    title={t('RegisterPagestep3.title')}
                    description={t('RegisterPagestep3.description')}
                />
            </div>

            <div className="flex justify-center items-center gap-12 py-6">
                {genders.map(({ id, label, value, Icon }) => (
                    <button
                        key={id}
                        type="button"
                        className={`w-64 h-64 flex flex-col items-center justify-center border-2 rounded-full transition-all duration-200
                            ${selectedGender === value ? 'bg-black text-white border-black scale-105' : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'}`}
                        onClick={() => handleSelect(value)}
                        aria-label={t('a11y.selectGender', { label })}
                    >
                        <Icon className="text-7xl" />
                        <span className="mt-2 text-base font-semibold">{label}</span>
                    </button>
                ))}
            </div>

            <WizardNavButtons
                onPrev={onPrev}
                onNext={onNext}
                isNextDisabled={!selectedGender}
                prevText={t('RegisterPage.back')}
                nextText={t('RegisterPage.next')}
            />
        </div>
    );
}
