'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoChevronBack } from "react-icons/io5";
import { useRegister } from '../../_components/register/RegisterProvider';

export default function RegisterStep4() {
    const [selectedGoal, setSelectedGoal] = useState(null);
    const router = useRouter();
    const { updateData } = useRegister();

    const goals = [
        { id: 1, label: 'Lose Weight', icon: '⚖️' },
        { id: 2, label: 'Keep Fit', icon: '🍀' },
        { id: 3, label: 'Get Stronger', icon: '💪🏻' },
        { id: 4, label: 'Gain Muscle Mass', icon: '🚀' },
    ];

    const handleGoalSelection = (goal) => {
        setSelectedGoal(goal); // Set the selected goal first for immediate UI feedback
        updateData({ fitness_goal: goal }); // Then update the context
        setTimeout(() => {
            router.push('/register/step5');
        }, 300);
    };

    const handlePrevStep = () => {
        router.push('/register/step3');
    };

    return (
        <div className="flex flex-col min-h-screen bg-white p-4">
            <div className="flex items-center justify-between px-4 mb-10 pt-16 sm:pt-24 md:pt-32">
                <button onClick={handlePrevStep} className="text-4xl">
                    <IoChevronBack />
                </button>
                <p className="text-2xl font-medium">Step 2 of 8</p>
                <button onClick={() => router.push('/next-step')} className="text-blue-500 text-2xl">Skip</button>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center">
                <h2 className="text-4xl font-bold text-center mb-20">Choose main goal</h2>
                <div className="space-y-6 w-full px-8">
                    {goals.map((goal) => (
                        <button
                            key={goal.id}
                            className={`w-full p-8 flex text-left items-center border rounded-lg text-3xl ${selectedGoal === goal.id ? 'border-black bg-gray-100' : 'border-gray-300'}`}
                            onClick={() => handleGoalSelection(goal.id)}  // Passing the goal id directly
                        >
                            <span role="img" aria-label={goal.label} className="mr-4">{goal.icon}</span> {goal.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
