'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import RegistrationHeader from '../../_components/header/registrationHeader';
import { useTranslation } from 'react-i18next';

interface Level {
    id: number,
    title: string,
    description: string
}

export default function RegisterStep7() {
    const { t } = useTranslation('global');
    const { data, updateData } = useRegister();
    const [selectedLevel, setSelectedLevel] = useState(data.fitness_level);
    const router = useRouter();

    const levels = [
        { id: 1, title: t('RegisterPagestep8.beginner.0'), description: t('RegisterPagestep8.beginner.1') },
        { id: 2, title: t('RegisterPagestep8.irregular.0'), description: t('RegisterPagestep8.irregular.1') },
        { id: 3, title: t('RegisterPagestep8.medium.0'), description: t('RegisterPagestep8.medium.1') },
        { id: 4, title: t('RegisterPagestep8.advanced.0'), description: t('RegisterPagestep8.advanced.1') },
    ];

    const handleTrainingLevel = (level: Level) => {
        setSelectedLevel(level.id);
        updateData({ fitness_level: level.id });
        setTimeout(() => {
            router.push('/register/step9');
        }, 300);
    };

    const handlePrevStep = () => {
        router.push('/register/step7');
    };

    return (
        <div className="flex flex-col h-screen bg-white p-10 lg:items-center">
            <div className='h-[10%] w-full lg:max-w-3xl'>
                <RegistrationHeader stepNumber={6} handlePrevStep={handlePrevStep}/>
            </div>

            <div className="h-[85%] content-center w-full lg:max-w-3xl">
                <h2 className="text-5xl font-bold text-center mb-20">{t('RegisterPagestep8.level.0')} <br/>{t('RegisterPagestep8.level.1')}</h2>
                <div className="w-full px-8 py">
                    {levels.map(level => (
                        <button
                            key={level.id}
                            onClick={() => handleTrainingLevel(level)}
                            className={`flex flex-col items-start justify-between w-full my-6 p-6 border rounded-lg ${selectedLevel === level.id ? 'border-black' : 'border-gray-200'} bg-white`}
                        >
                            <div className="text-left">
                                <span className="text-2xl font-medium">{level.title}</span>
                                <p className="text-gray-500">{level.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
