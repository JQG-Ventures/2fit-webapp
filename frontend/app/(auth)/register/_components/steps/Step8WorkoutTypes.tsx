'use client';

import React, { useState, useEffect } from 'react';
import { FaRunning, FaDumbbell, FaMusic } from 'react-icons/fa';
import { FaRegHandPaper } from 'react-icons/fa';
import { GrYoga } from 'react-icons/gr';
import { useRegister } from '@/app/_components/register/RegisterProvider';
import RegistrationHeader from '@/app/_components/register/RegistrationHeader';
import { useTranslation } from 'react-i18next';
import type { WorkoutType } from '@/app/_types/register';
import type { StepProps } from '@/app/(auth)/register/_components/RegisterWizard';
import WizardNavButtons from '@/app/(auth)/register/_components/WizardNavButtons';

export default function Step8WorkoutTypes({ onNext, onPrev }: StepProps) {
    const { t } = useTranslation('global');
    const { data, updateData } = useRegister();
    const [selectedActivities, setSelectedActivities] = useState<WorkoutType[]>(
        data.training_preferences?.workout_types ?? data.workout_type ?? [],
    );

    const activities: Array<{
        id: number;
        label: string;
        value: WorkoutType;
        icon: React.ReactNode;
    }> = [
        {
            id: 1,
            label: t('RegisterPagestep9.stretch'),
            value: 'stretch',
            icon: <FaRegHandPaper size={28} />,
        },
        {
            id: 2,
            label: t('RegisterPagestep9.cardio'),
            value: 'cardio',
            icon: <FaRunning size={28} />,
        },
        { id: 3, label: t('RegisterPagestep9.yoga'), value: 'yoga', icon: <GrYoga size={28} /> },
        {
            id: 4,
            label: t('RegisterPagestep9.powertraining'),
            value: 'strength',
            icon: <FaDumbbell size={28} />,
        },
        {
            id: 5,
            label: t('RegisterPagestep9.dancing'),
            value: 'dance',
            icon: <FaMusic size={28} />,
        },
    ];

    useEffect(() => {
        if (data.training_preferences?.workout_types?.length) {
            setSelectedActivities(data.training_preferences.workout_types);
        }
    }, [data.training_preferences]);

    const toggle = (value: WorkoutType) => {
        setSelectedActivities((prev) => {
            const updated = prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value];
            updateData({
                workout_type: updated,
                training_preferences: { workout_types: updated },
            });
            return updated;
        });
    };

    return (
        <div className="flex flex-col flex-1 justify-between p-6">
            <div className="pt-4">
                <RegistrationHeader
                    title={t('RegisterPagestep9.title')}
                    description={t('RegisterPagestep9.description')}
                />
            </div>

            <div className="grid grid-cols-2 gap-4 py-6">
                {activities.map((activity) => {
                    const isLast = activity.id === activities.length && activities.length % 2 !== 0;
                    return (
                        <button
                            key={activity.id}
                            type="button"
                            onClick={() => toggle(activity.value)}
                            className={`flex flex-col items-center justify-center gap-2 p-5 border rounded-xl transition-all duration-200 min-h-[100px]
                                ${isLast ? 'col-span-2 sm:col-span-1' : ''}
                                ${
                                    selectedActivities.includes(activity.value)
                                        ? 'bg-black text-white border-black shadow-md'
                                        : 'bg-white text-black border-gray-200 hover:bg-gray-50 hover:shadow-sm'
                                }`}
                            aria-label={activity.label}
                        >
                            <span
                                className={
                                    selectedActivities.includes(activity.value)
                                        ? 'text-white'
                                        : 'text-black'
                                }
                            >
                                {activity.icon}
                            </span>
                            <span className="text-[15px] font-medium text-center">
                                {activity.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            <WizardNavButtons
                onPrev={onPrev}
                onNext={onNext}
                isNextDisabled={selectedActivities.length === 0}
                prevText={t('RegisterPage.back')}
                nextText={t('RegisterPage.next')}
            />
        </div>
    );
}
