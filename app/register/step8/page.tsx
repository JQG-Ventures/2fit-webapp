'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import RegistrationHeader from '../../_components/register/RegistrationHeader';
import RegistrationButtons from '@/app/_components/register/RegisterButtons';

interface Level {
    id: number,
    title: string,
    description: string
}

export default function RegisterStep7() {
    const { data, updateData } = useRegister();
    const [isSubmittingNext, setIsSubmittingNext] = useState(false);
    const [isSubmittingPrev, setIsSubmittingPrev] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(data.fitness_level);
    const router = useRouter();

    const levels = [
        { id: 1, title: 'Beginner', description: 'I want to start training' },
        { id: 2, title: 'Irregular training', description: 'I train 1-2 times a week' },
        { id: 3, title: 'Medium', description: 'I train 3-5 times a week' },
        { id: 4, title: 'Advanced', description: 'I train more than 5 times a week' },
    ];

    const handleTrainingLevel = (level: Level) => {
        setSelectedLevel(level.id);
        updateData({ fitness_level: level.id });
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
                    title={'What is your Training Level?'} 
                    description={'Choose based on your current activity. This will help us to personalize plans for you.'} 
                />
            </div>

            <div className="flex items-center justify-center h-[70%] w-full lg:max-w-3xl">
                <div className="flex flex-col items-center justify-center space-y-8 w-full py">
                    {levels.map(level => (
                        <button
                            key={level.id}
                            onClick={() => handleTrainingLevel(level)}
                            className={`w-full p-8 flex text-left items-center border rounded-lg text-3xl transition-all duration-300 transform font-semibold
                                ${selectedLevel === level.id ? 'bg-black text-gray-50 scale-105 shadow-lg' : 'bg-white text-black hover:scale-105 hover:shadow-md border-gray-300'}`}>   
                            <div className="text-left">
                                <span className="text-2xl font-medium">{level.title}</span>
                                <p className={`text-xl ${selectedLevel === level.id ? 'text-white' : 'text-gray-500'}`}>{level.description}</p>
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
                prevText={'Back'}
                nextText={'Continue'}
                isNextDisabled={selectedLevel === null || selectedLevel === undefined}
            />
        </div>
    );
}
