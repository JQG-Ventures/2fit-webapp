'use client';

import React, { useState } from 'react';
import { GiWeightScale, GiMuscleUp } from 'react-icons/gi';
import { IoFitness } from 'react-icons/io5';
import { FaDumbbell } from 'react-icons/fa';
import { useRegister } from '@/app/_components/register/RegisterProvider';
import RegistrationHeader from '@/app/_components/register/RegistrationHeader';
import { useTranslation } from 'react-i18next';
import type { FitnessGoal } from '@/app/_types/register';
import type { IconType } from 'react-icons';
import type { StepProps } from '@/app/(auth)/register/_components/RegisterWizard';
import WizardNavButtons from '@/app/(auth)/register/_components/WizardNavButtons';

export default function Step3FitnessGoal({ onNext, onPrev }: StepProps) {
    const { t } = useTranslation('global');
    const { data, updateData } = useRegister();
    const validGoals: FitnessGoal[] = ['weight', 'keep', 'strength', 'muscle'];
    const initialGoal = validGoals.includes(data.fitness_goal as FitnessGoal)
        ? (data.fitness_goal as FitnessGoal)
        : null;
    const [selectedGoal, setSelectedGoal] = useState<FitnessGoal | null>(initialGoal);

    const goals: Array<{ id: number; label: string; value: FitnessGoal; Icon: IconType }> = [
        { id: 1, label: t('RegisterPagestep4.weight'), value: 'weight', Icon: GiWeightScale },
        { id: 2, label: t('RegisterPagestep4.fit'), value: 'keep', Icon: IoFitness },
        { id: 3, label: t('RegisterPagestep4.stronger'), value: 'strength', Icon: GiMuscleUp },
        { id: 4, label: t('RegisterPagestep4.muscle'), value: 'muscle', Icon: FaDumbbell },
    ];

    const handleSelect = (value: FitnessGoal) => {
        setSelectedGoal(value);
        updateData({ fitness_goal: value });
    };

    return (
        <div className="flex flex-col flex-1 justify-between p-6">
            <div className="pt-4">
                <RegistrationHeader
                    title={t('RegisterPagestep4.title')}
                    description={t('RegisterPagestep4.description')}
                />
            </div>

            <div className="flex flex-col gap-4 py-6">
                {goals.map(({ id, label, value, Icon }) => (
                    <button
                        key={id}
                        type="button"
                        className={`w-full p-6 flex items-center gap-4 border rounded-xl text-left transition-all duration-200
                            ${selectedGoal === value ? 'bg-black text-white border-black shadow-md' : 'bg-white text-black border-gray-200 hover:bg-gray-50 hover:shadow-sm'}`}
                        onClick={() => handleSelect(value)}
                        aria-label={t('a11y.selectGoal', { label })}
                    >
                        <Icon className="text-2xl shrink-0" />
                        <span className="text-[18px] font-medium">{label}</span>
                    </button>
                ))}
            </div>

            <WizardNavButtons
                onPrev={onPrev}
                onNext={onNext}
                isNextDisabled={!selectedGoal}
                prevText={t('RegisterPage.back')}
                nextText={t('RegisterPage.next')}
            />
        </div>
    );
}
