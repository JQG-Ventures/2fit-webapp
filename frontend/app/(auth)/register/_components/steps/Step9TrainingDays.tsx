'use client';

import React, { useState, useEffect } from 'react';
import { useRegister } from '@/app/_components/register/RegisterProvider';
import RegistrationHeader from '@/app/_components/register/RegistrationHeader';
import { useTranslation } from 'react-i18next';
import type { Weekday } from '@/app/_types/register';
import type { StepProps } from '@/app/(auth)/register/_components/RegisterWizard';
import WizardNavButtons from '@/app/(auth)/register/_components/WizardNavButtons';

export default function Step9TrainingDays({ onNext, onPrev }: StepProps) {
    const { t } = useTranslation('global');
    const { data, updateData } = useRegister();
    const [selectedDays, setSelectedDays] = useState<Weekday[]>(
        data.training_preferences?.available_days || [],
    );

    const days: Array<{ id: number; label: string; short: string; value: Weekday }> = [
        {
            id: 1,
            label: t('RegisterPagestep10.days.0'),
            short: t('RegisterPagestep10.days.0').slice(0, 3),
            value: 'monday',
        },
        {
            id: 2,
            label: t('RegisterPagestep10.days.1'),
            short: t('RegisterPagestep10.days.1').slice(0, 3),
            value: 'tuesday',
        },
        {
            id: 3,
            label: t('RegisterPagestep10.days.2'),
            short: t('RegisterPagestep10.days.2').slice(0, 3),
            value: 'wednesday',
        },
        {
            id: 4,
            label: t('RegisterPagestep10.days.3'),
            short: t('RegisterPagestep10.days.3').slice(0, 3),
            value: 'thursday',
        },
        {
            id: 5,
            label: t('RegisterPagestep10.days.4'),
            short: t('RegisterPagestep10.days.4').slice(0, 3),
            value: 'friday',
        },
        {
            id: 6,
            label: t('RegisterPagestep10.days.5'),
            short: t('RegisterPagestep10.days.5').slice(0, 3),
            value: 'saturday',
        },
        {
            id: 7,
            label: t('RegisterPagestep10.days.6'),
            short: t('RegisterPagestep10.days.6').slice(0, 3),
            value: 'sunday',
        },
    ];

    useEffect(() => {
        if (data.training_preferences?.available_days?.length) {
            setSelectedDays(data.training_preferences.available_days);
        }
    }, [data.training_preferences]);

    const toggle = (value: Weekday) => {
        setSelectedDays((prev) => {
            const updated = prev.includes(value)
                ? prev.filter((d) => d !== value)
                : [...prev, value];
            updateData({
                training_days_per_week: updated,
                training_preferences: {
                    ...data.training_preferences,
                    available_days: updated,
                },
            });
            return updated;
        });
    };

    const handleNext = () => {
        updateData({
            training_days_per_week: selectedDays,
            training_preferences: {
                ...data.training_preferences,
                available_days: selectedDays,
            },
        });
        onNext();
    };

    return (
        <div className="flex flex-col flex-1 justify-between p-6">
            <div className="pt-4">
                <RegistrationHeader
                    title={t('RegisterPagestep10.title')}
                    description={t('RegisterPagestep10.description')}
                />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6">
                {days.map((day) => {
                    const isOddLast = days.length % 2 !== 0 && day.id === days.length;
                    return (
                        <button
                            key={day.id}
                            type="button"
                            onClick={() => toggle(day.value)}
                            className={`flex flex-col items-center justify-center gap-1 py-4 px-3 border rounded-xl transition-all duration-200 min-h-[72px]
                                ${isOddLast ? 'col-span-2 sm:col-span-1' : ''}
                                ${
                                    selectedDays.includes(day.value)
                                        ? 'bg-black text-white border-black shadow-md scale-[1.02]'
                                        : 'bg-white text-black border-gray-200 hover:bg-gray-50 hover:shadow-sm'
                                }`}
                            aria-label={day.label}
                        >
                            <span className="hidden sm:inline text-[15px] font-semibold">
                                {day.label}
                            </span>
                            <span className="sm:hidden text-[15px] font-semibold">{day.short}</span>
                        </button>
                    );
                })}
            </div>

            <WizardNavButtons
                onPrev={onPrev}
                onNext={handleNext}
                isNextDisabled={selectedDays.length === 0}
                prevText={t('RegisterPage.back')}
                nextText={t('RegisterPage.next')}
            />
        </div>
    );
}
