'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import RegistrationHeader from '../../_components/header/registrationHeader';


export default function RegisterStep4() {
    const { data, updateData } = useRegister();
    const [selectedGoal, setSelectedGoal] = useState(data.fitness_goal);
    const router = useRouter();

    const goals = [
        { id: 1, label: 'Lose Weight', icon: '⚖️' },
        { id: 2, label: 'Keep Fit', icon: '🍀' },
        { id: 3, label: 'Get Stronger', icon: '💪🏻' },
        { id: 4, label: 'Gain Muscle Mass', icon: '🚀' },
    ];

    const handleGoalSelection = (goal: number) => {
        setSelectedGoal(goal);
        updateData({ fitness_goal: goal });
        setTimeout(() => {
            router.push('/register/step5');
        }, 300);
    };

    const handlePrevStep = () => {
        router.push('/register/step3')
    };

    return (
        <div className="flex flex-col h-screen bg-white p-10 lg:items-center">
            <div className='h-[10%] w-full lg:max-w-3xl'>
                <RegistrationHeader stepNumber={2} handlePrevStep={handlePrevStep}/>
            </div>

            <div className="h-[85%] content-center w-full lg:max-w-3xl">
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
