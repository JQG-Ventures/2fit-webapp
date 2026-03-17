'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import RegistrationHeader from '../../_components/register/RegistrationHeader';
import RegistrationButtons from '@/app/_components/register/RegisterButtons';
import { useTranslation } from 'react-i18next';
import type { FitnessGoal } from '@/app/_types/register';

export default function RegisterStep4() {
    const { t } = useTranslation('global');
    const { data, updateData } = useRegister();
    const [isSubmittingNext, setIsSubmittingNext] = useState(false);
    const [isSubmittingPrev, setIsSubmittingPrev] = useState(false);
    const initialGoal =
        data.fitness_goal === 'weight' ||
        data.fitness_goal === 'keep' ||
        data.fitness_goal === 'strength' ||
        data.fitness_goal === 'muscle'
            ? data.fitness_goal
            : null;
    const [selectedGoal, setSelectedGoal] = useState<FitnessGoal | null>(initialGoal);
    const router = useRouter();

    const goals: Array<{ id: number; label: string; value: FitnessGoal; icon: string }> = [
        { id: 1, label: t('RegisterPagestep4.weight'), value: 'weight', icon: '⚖️' },
        { id: 2, label: t('RegisterPagestep4.fit'), value: 'keep', icon: '🍀' },
        { id: 3, label: t('RegisterPagestep4.stronger'), value: 'strength', icon: '💪🏻' },
        { id: 4, label: t('RegisterPagestep4.muscle'), value: 'muscle', icon: '🚀' },
    ];

    const handleGoalSelection = (goalValue: FitnessGoal) => {
        setSelectedGoal(goalValue);
        updateData({ fitness_goal: goalValue });
    };

    const handleNextStep = () => {
        setIsSubmittingNext(true);
        router.push('/register/step5');
    };

    const handlePrevStep = () => {
        setIsSubmittingPrev(true);
        router.push('/register/step3');
    };

    return (
        <div className="flex flex-col h-screen bg-white p-10 lg:items-center">
            <div className="h-[20%] w-full lg:max-w-3xl">
                <RegistrationHeader
                    title={t('RegisterPagestep4.title')}
                    description={t('RegisterPagestep4.description')}
                />
            </div>

            <div className="flex items-center justify-center h-[70%] w-full lg:max-w-3xl">
                <div className="flex flex-col items-center justify-center space-y-8 w-full">
                    {goals.map((goal) => (
                        <button
                            key={goal.id}
                            className={`w-full p-8 flex text-left items-center border rounded-lg text-3xl transition-all duration-300 transform 
                                ${selectedGoal === goal.value ? 'bg-black text-white scale-105 shadow-lg' : 'bg-white text-black hover:scale-105 hover:shadow-md border-gray-300'}`}
                            onClick={() => handleGoalSelection(goal.value)}
                        >
                            <span role="img" aria-label={goal.label} className="mr-4">
                                {goal.icon}
                            </span>{' '}
                            {goal.label}
                        </button>
                    ))}
                </div>
            </div>

            <RegistrationButtons
                handleNext={handleNextStep}
                handlePrev={handlePrevStep}
                isSubmittingNext={isSubmittingNext}
                isSubmittingPrev={isSubmittingPrev}
                prevText={t('RegisterPage.back')}
                nextText={t('RegisterPage.next')}
                isNextDisabled={!selectedGoal}
            />
        </div>
    );
}
