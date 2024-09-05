'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoChevronBack } from "react-icons/io5";
import { useRegister } from '../../_components/register/RegisterProvider';

export default function RegisterStep7() {
    const [selectedLevel, setSelectedLevel] = useState(null);
    const router = useRouter();
    const { updateData } = useRegister();

    const levels = [
        { id: 1, title: 'Beginner', description: 'I want to start training' },
        { id: 2, title: 'Irregular training', description: 'I train 1-2 times a week' },
        { id: 3, title: 'Medium', description: 'I train 3-5 times a week' },
        { id: 4, title: 'Advanced', description: 'I train more than 5 times a week' },
    ];

    const handleTrainingLevel = (level) => {
        setSelectedLevel(level.id); // Update the selected level ID for UI feedback
        updateData({ fitness_level: level.id }); // Save the level ID in the context
        setTimeout(() => {
            router.push('/register/step9');
        }, 300);
    };

    const handlePrevStep = () => {
        router.push('/register/step7');
    };

    return (
        <div className="flex flex-col min-h-screen bg-white p-4">
            <div className="flex items-center justify-between px-4 mb-10 pt-16 sm:pt-24 md:pt-32">
                <button onClick={handlePrevStep} className="text-4xl">
                    <IoChevronBack />
                </button>
                <p className="text-2xl font-medium">Step 7 of 8</p>
                <button onClick={() => router.push('/next-step')} className="text-blue-500 text-2xl">Skip</button>
            </div>

            <div id="content" className="flex-grow flex flex-col items-center justify-center mt-[-100px]">
                <h2 className="text-4xl font-bold text-center mb-20">Choose training <br/>level</h2>
                <div className="space-y-4 w-full px-8">
                    {levels.map(level => (
                        <button
                            key={level.id}
                            onClick={() => handleTrainingLevel(level)}
                            className={`flex flex-col items-start justify-between w-full p-4 border rounded-lg ${selectedLevel === level.id ? 'border-black' : 'border-gray-200'} bg-white`}
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
