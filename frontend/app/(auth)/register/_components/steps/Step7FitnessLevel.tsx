'use client';

import React, { useState } from 'react';
import { useRegister } from '@/app/_components/register/RegisterProvider';
import RegistrationHeader from '@/app/_components/register/RegistrationHeader';
import { useTranslation } from 'react-i18next';
import type { FitnessLevel } from '@/app/_types/register';
import type { StepProps } from '@/app/(auth)/register/_components/RegisterWizard';
import WizardNavButtons from '@/app/(auth)/register/_components/WizardNavButtons';

interface Level {
    id: number;
    title: string;
    description: string;
    value: FitnessLevel;
}

export default function Step7FitnessLevel({ onNext, onPrev }: StepProps) {
    const { t } = useTranslation('global');
    const { data, updateData } = useRegister();
    const [selectedLevel, setSelectedLevel] = useState<FitnessLevel | ''>(data.fitness_level || '');

    const levels: Level[] = [
        {
            id: 1,
            title: t('RegisterPagestep8.beginner.0'),
            description: t('RegisterPagestep8.beginner.1'),
            value: 'beginner',
        },
        {
            id: 2,
            title: t('RegisterPagestep8.irregular.0'),
            description: t('RegisterPagestep8.irregular.1'),
            value: 'irregular',
        },
        {
            id: 3,
            title: t('RegisterPagestep8.medium.0'),
            description: t('RegisterPagestep8.medium.1'),
            value: 'intermediate',
        },
        {
            id: 4,
            title: t('RegisterPagestep8.advanced.0'),
            description: t('RegisterPagestep8.advanced.1'),
            value: 'advanced',
        },
    ];

    const handleSelect = (value: FitnessLevel) => {
        setSelectedLevel(value);
        updateData({ fitness_level: value });
    };

    return (
        <div className="flex flex-col flex-1 justify-between p-6">
            <div className="pt-4">
                <RegistrationHeader
                    title={t('RegisterPagestep8.title')}
                    description={t('RegisterPagestep8.description')}
                />
            </div>

            <div className="flex flex-col gap-4 py-6">
                {levels.map((level) => (
                    <button
                        key={level.id}
                        type="button"
                        onClick={() => handleSelect(level.value)}
                        className={`w-full p-5 flex flex-col text-left border rounded-xl transition-all duration-200
                            ${selectedLevel === level.value ? 'bg-black text-white border-black shadow-md' : 'bg-white text-black border-gray-200 hover:bg-gray-50 hover:shadow-sm'}`}
                        aria-label={level.title}
                    >
                        <span className="font-semibold text-[18px]">{level.title}</span>
                        <span
                            className={`text-[12px] mt-1 ${selectedLevel === level.value ? 'text-gray-300' : 'text-gray-500'}`}
                        >
                            {level.description}
                        </span>
                    </button>
                ))}
            </div>

            <WizardNavButtons
                onPrev={onPrev}
                onNext={onNext}
                isNextDisabled={!selectedLevel}
                prevText={t('RegisterPage.back')}
                nextText={t('RegisterPage.next')}
            />
        </div>
    );
}
