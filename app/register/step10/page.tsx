//@ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import { useTranslation } from 'react-i18next';
import RegistrationHeader from '@/app/_components/register/RegistrationHeader';
import RegistrationButtons from '@/app/_components/register/RegisterButtons';
import { signIn, useSession } from "next-auth/react";


export default function RegisterStep10() {
    const { t } = useTranslation('global');
    const { data, updateData } = useRegister();
    const [isSubmittingNext, setIsSubmittingNext] = useState(false);
    const [isSubmittingPrev, setIsSubmittingPrev] = useState(false);
    const { data: session } = useSession();
    const [selectedDays, setSelectedDays] = useState<string[]>(
        data.training_preferences?.available_days || []
    );
    const router = useRouter();
    console.log(data);
    console.log(session);


    const days = [
        { id: 1, label: t('RegisterPagestep10.days.0'), value: 'monday' },
        { id: 2, label: t('RegisterPagestep10.days.1'), value: 'tuesday' },
        { id: 3, label: t('RegisterPagestep10.days.2'), value: 'wednesday' },
        { id: 4, label: t('RegisterPagestep10.days.3'), value: 'thursday' },
        { id: 5, label: t('RegisterPagestep10.days.4'), value: 'friday' },
        { id: 6, label: t('RegisterPagestep10.days.5'), value: 'saturday' },
        { id: 7, label: t('RegisterPagestep10.days.6'), value: 'sunday' },
    ];

    const handleDaySelection = (dayValue: string) => {
        setSelectedDays((prevSelected) => {
            const updatedSelectedDays = prevSelected.includes(dayValue)
                ? prevSelected.filter((value) => value !== dayValue)
                : [...prevSelected, dayValue];

            updateData({
                training_preferences: {
                    ...data.training_preferences,
                    available_days: updatedSelectedDays,
                },
            });

            return updatedSelectedDays;
        });
    };

    const handlePrevStep = () => {
        setIsSubmittingPrev(true);
        router.push('/register/step9');
    };

    const handleNextStep = () => {
        setIsSubmittingNext(true);

        updateData({
            training_preferences: {
                ...data.training_preferences,
                available_days: selectedDays,
            },
        });
        router.push('/register/step11');
    };

    useEffect(() => {
        if (
            data.training_preferences?.available_days &&
            data.training_preferences.available_days.length > 0
        ) {
            setSelectedDays(data.training_preferences.available_days);
        }
    }, [data.training_preferences]);

    return (
        <div className="flex flex-col h-screen bg-white p-10 lg:items-center">
            <div className="h-[20%] w-full lg:max-w-3xl">
                <RegistrationHeader
                    title={t('RegisterPagestep10.title')}
                    description={t('RegisterPagestep10.description')}
                />
            </div>

            <div
                className="grid grid-cols-2 lg:grid-cols-3 h-[70%] w-full lg:max-w-3xl gap-8 py-12"
                style={{ gridAutoRows: '1fr' }}
            >
                {days.map((day) => (
                    <button
                        key={day.id}
                        onClick={() => handleDaySelection(day.value)}
                        className={`flex items-center justify-center w-full my-6 p-8 border border-gray-300 rounded-lg text-3xl transition-all duration-300 transform font-semibold
                            ${selectedDays.includes(day.value)
                                ? 'bg-black text-gray-50 scale-105 shadow-lg'
                                : 'bg-white text-black hover:scale-105 hover:shadow-md'
                            }
                            ${days.length % 2 !== 0 && day.id === days.length
                                ? 'col-span-2 lg:col-span-1 lg:justify-self-center'
                                : ''
                            }
                        `}
                        aria-pressed={selectedDays.includes(day.value)}
                        aria-label={day.label}
                    >
                        <div className="text-center">
                            <span className="text-2xl font-medium">{day.label}</span>
                        </div>
                    </button>
                ))}
            </div>

            <RegistrationButtons
                handleNext={handleNextStep}
                handlePrev={handlePrevStep}
                isSubmittingNext={isSubmittingNext}
                isSubmittingPrev={isSubmittingPrev}
                prevText={t('RegisterPage.back')}
                nextText={t('RegisterPage.next')}
                isNextDisabled={selectedDays.length === 0}
            />
        </div>
    );
}
