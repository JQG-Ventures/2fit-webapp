'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import RegistrationHeader from '../../_components/header/registrationHeader';

interface Level {
    id: number,
    title: string,
    description: string
}

export default function RegisterStep7() {
    const { data, updateData } = useRegister();
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
        setTimeout(() => {
            router.push('/register/step9');
        }, 300);
    };

    const handlePrevStep = () => {
        router.push('/register/step7');
    };

    return (
        <div className="flex flex-col h-screen bg-white p-4">
            <div className='h-[10%]'>
                <RegistrationHeader stepNumber={6} handlePrevStep={handlePrevStep}/>
            </div>

            <div className="h-[85%] content-center">
                <h2 className="text-5xl font-bold text-center mb-20">Choose training <br/>level</h2>
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
