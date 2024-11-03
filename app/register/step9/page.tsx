'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import RegistrationHeader from '../../_components/register/RegistrationHeader';
import { useTranslation } from 'react-i18next';
import { FaRunning, FaDumbbell, FaMusic } from 'react-icons/fa';
import { FaRegHandPaper } from 'react-icons/fa';
import RegistrationButtons from '@/app/_components/register/RegisterButtons';
import { GrYoga } from "react-icons/gr";

export default function RegisterStep9() {
    const { t } = useTranslation('global');
    const { data, updateData } = useRegister();
    const [selectedActivities, setSelectedActivities] = useState<string[]>(data.workout_type || []);
    const [isSubmittingNext, setIsSubmittingNext] = useState(false);
    const [isSubmittingPrev, setIsSubmittingPrev] = useState(false);
    const router = useRouter();

    const activities = [
        { id: 1, label: t('RegisterPagestep9.stretch'), value: 'stretch', icon: <FaRegHandPaper size={40} /> },
        { id: 2, label: t('RegisterPagestep9.cardio'), value: 'cardio', icon: <FaRunning size={40} /> },
        { id: 3, label: t('RegisterPagestep9.yoga'), value: 'yoga', icon: <GrYoga size={40} /> },
        { id: 4, label: t('RegisterPagestep9.powertraining'), value: 'strength', icon: <FaDumbbell size={40} /> },
        { id: 5, label: t('RegisterPagestep9.dancing'), value: 'dance', icon: <FaMusic size={40} /> },
    ];

    const handleActivitySelection = (activityValue: string) => {
        setSelectedActivities((prevSelected) => {
            const updatedSelectedActivities = prevSelected.includes(activityValue)
                ? prevSelected.filter((value) => value !== activityValue)
                : [...prevSelected, activityValue];

            updateData({ training_preferences: { workout_types: updatedSelectedActivities } });

            return updatedSelectedActivities;
        });
    };

    const handleNextStep = () => {
        setIsSubmittingNext(true);
        updateData({ training_preferences: { workout_types: selectedActivities } });
        router.push('/register/step10');
    };

    const handlePrevStep = () => {
        setIsSubmittingPrev(true);
        router.push('/register/step8');
    };

    useEffect(() => {
        if (data.training_preferences?.workout_types && data.training_preferences.workout_types.length > 0) {
            setSelectedActivities(data.training_preferences.workout_types);
        }
    }, [data.training_preferences]);

    return (
        <div className="flex flex-col h-screen bg-white p-10 lg:items-center">
            <div className='h-[20%] w-full lg:max-w-3xl'>
                <RegistrationHeader
                    title={t('RegisterPagestep9.title')}
                    description={t('RegisterPagestep9.description')}
                />
            </div>

            <div className="flex justify-center h-[70%] w-full lg:max-w-3xl">
                <div className="flex flex-col items-center justify-center space-y-6 w-full">
                    {activities.map((activity) => (
                        <button
                            key={activity.id}
                            onClick={() => handleActivitySelection(activity.value)}
                            className={`
                                flex flex-col items-center justify-center w-full p-5 border rounded-lg text-center transition-all duration-300 transform font-semibold
                                ${selectedActivities.includes(activity.value)
                                    ? 'bg-black text-gray-50 scale-105 shadow-lg'
                                    : 'bg-white text-black hover:scale-105 hover:shadow-md border-gray-300'
                                }
                            `}
                            aria-pressed={selectedActivities.includes(activity.value)}
                            aria-label={activity.label}
                        >
                            <div className="mb-4">
                                {activity.icon}
                            </div>
                            <div className="text-lg font-medium">
                                {activity.label}
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
                isNextDisabled={selectedActivities.length === 0}
            />
        </div>
    );
}
