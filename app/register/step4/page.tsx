'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import RegistrationHeader from '../../_components/register/RegistrationHeader';
import RegistrationButtons from '@/app/_components/register/RegisterButtons';
import { useTranslation } from 'react-i18next';


export default function RegisterStep4() {
    const { t } = useTranslation('global');
    const { data, updateData } = useRegister();
    const [isSubmittingNext, setIsSubmittingNext] = useState(false);
    const [isSubmittingPrev, setIsSubmittingPrev] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(data.fitness_goal);
    const router = useRouter();

    const goals = [
        { id: 1, label: t('RegisterPagestep4.weight'), icon: '⚖️' },
        { id: 2, label: t('RegisterPagestep4.fit'), icon: '🍀' },
        { id: 3, label: t('RegisterPagestep4.stronger'), icon: '💪🏻' },
        { id: 4, label: t('RegisterPagestep4.muscle'), icon: '🚀' },
    ];

    const handleGoalSelection = (goal) => {
        setSelectedGoal(goal);
        updateData({ fitness_goal: goal });
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
            <div className='h-[20%] w-full lg:max-w-3xl'>
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
                                ${selectedGoal === goal.id ? 'bg-black text-white scale-105 shadow-lg' : 'bg-white text-black hover:scale-105 hover:shadow-md border-gray-300'}`}
                            onClick={() => handleGoalSelection(goal.id)}
                        >
                            <span role="img" aria-label={goal.label} className="mr-4">{goal.icon}</span> {goal.label}
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
                isNextDisabled={selectedGoal === null || selectedGoal === undefined}
            />
        </div>
    );
}
