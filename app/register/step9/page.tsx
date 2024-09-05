'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoChevronBack } from "react-icons/io5";
import { useRegister } from '../../_components/register/RegisterProvider';

export default function RegisterStep9() {
    const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
    const router = useRouter();
    const { updateData } = useRegister();

    const activities = [
        { id: 1, label: 'Stretch', icon: '🧘' },
        { id: 2, label: 'Cardio', icon: '🏃' },
        { id: 3, label: 'Yoga', icon: '🧘' },
        { id: 4, label: 'Power training', icon: '🏋️' },
        { id: 5, label: 'Dancing', icon: '💃' },
    ];

    const handleActivitySelection = (id: number) => {
        setSelectedActivities((prevSelected) => 
            prevSelected.includes(id) 
                ? prevSelected.filter((activityId) => activityId !== id) 
                : [...prevSelected, id]
        );
    };

    const handleNextStep = () => {
        updateData({ workout_type: selectedActivities });
        router.push('/register/step10');
    };

    const handlePrevStep = () => {
        router.push('/register/step8');
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
                <h2 className="text-4xl font-bold text-center mb-4">Choose activities</h2>
                <p className="text-2xl font-bold text-center mb-20">that you prefer</p>
                <div className="space-y-4 w-full px-8">
                    {activities.map((activity) => (
                        <button
                            key={activity.id}
                            onClick={() => handleActivitySelection(activity.id)}
                            className={`flex items-center justify-between w-full p-8 border rounded-lg ${selectedActivities.includes(activity.id) ? 'border-black bg-gray-100' : 'border-gray-200'} ${activity.bgColor || 'bg-white'}`}
                        >
                            <div className="flex items-center">
                                <span className="text-3xl mr-4">{activity.icon}</span>
                                <span className="text-2xl font-medium">{activity.label}</span>
                            </div>
                            <span className={`w-6 h-6 border-2 rounded-full ${selectedActivities.includes(activity.id) ? 'bg-black border-black' : 'border-gray-400'}`}></span>
                        </button>
                    ))}
                </div>
                <div className='w-full px-8'>
                    <button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full py-3 bg-black text-white rounded-md font-semibold mt-20 px-8"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
