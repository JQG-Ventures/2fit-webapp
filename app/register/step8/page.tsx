//@ts-nocheck
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import RegistrationHeader from '../../_components/register/RegistrationHeader';
import RegistrationButtons from '@/app/_components/register/RegisterButtons';
import { useTranslation } from 'react-i18next';

interface Level {
    id: number;
    title: string;
    description: string;
    value: string;
}

export default function RegisterStep8() {
    const { t } = useTranslation('global');
    const { data, updateData } = useRegister();
    const [isSubmittingNext, setIsSubmittingNext] = useState(false);
    const [isSubmittingPrev, setIsSubmittingPrev] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState<string>(data.fitness_level || '');
    const router = useRouter();

    const levels: Level[] = [
        { id: 1, title: t('RegisterPagestep8.beginner.0'), description: t('RegisterPagestep8.beginner.1'), value: 'beginner' },
        { id: 2, title: t('RegisterPagestep8.irregular.0'), description: t('RegisterPagestep8.irregular.1'), value: 'irregular' },
        { id: 3, title: t('RegisterPagestep8.medium.0'), description: t('RegisterPagestep8.medium.1'), value: 'intermediate' },
        { id: 4, title: t('RegisterPagestep8.advanced.0'), description: t('RegisterPagestep8.advanced.1'), value: 'advanced' },
    ];

    const handleTrainingLevel = (levelValue: string) => {
        setSelectedLevel(levelValue);
        updateData({ fitness_level: levelValue });
    };

    const handlePrevStep = () => {
        setIsSubmittingPrev(true);
        router.push('/register/step7');
    };

    const handleNextStep = () => {
        setIsSubmittingNext(true);
        router.push('/register/step9');
    };

    return (
        <div className="flex flex-col h-screen bg-white p-10 lg:items-center">
            <div className='h-[20%] w-full lg:max-w-3xl'>
                <RegistrationHeader 
                    title={t('RegisterPagestep8.title')}
                    description={t('RegisterPagestep8.description')}
                />
            </div>

            <div className="flex items-center justify-center h-[70%] w-full lg:max-w-3xl">
                <div className="flex flex-col items-center justify-center space-y-8 w-full">
                    {levels.map(level => (
                        <button
                            key={level.id}
                            onClick={() => handleTrainingLevel(level.value)}
                            className={`w-full p-8 flex text-left items-center border rounded-lg text-3xl transition-all duration-300 transform font-semibold
                                ${selectedLevel === level.value ? 'bg-black text-gray-50 scale-105 shadow-lg' : 'bg-white text-black hover:scale-105 hover:shadow-md border-gray-300'}`}>
                            <div className="text-left">
                                <span className="text-2xl font-medium">{level.title}</span>
                                <p className={`text-xl ${selectedLevel === level.value ? 'text-white' : 'text-gray-500'}`}>{level.description}</p>
                            </div>
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
                isNextDisabled={!selectedLevel}
            />
        </div>
    );
}
