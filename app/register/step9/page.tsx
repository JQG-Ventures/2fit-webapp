'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import RegistrationHeader from '../../_components/header/registrationHeader';

export default function RegisterStep9() {
    const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
    const router = useRouter();
    const { data, updateData } = useRegister();
    console.log(data);

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
        <div className="flex flex-col h-screen bg-white p-10 lg:items-center">
            <div className='h-[10%] w-full lg:max-w-3xl'>
                <RegistrationHeader stepNumber={7} handlePrevStep={handlePrevStep}/>
            </div>
            
            <div className="h-[85%] content-center w-full lg:max-w-3xl">
            <h2 className="text-5xl font-bold text-center mb-20">Choose activities <br/>that you prefer</h2>
                <div className="w-full px-8 py">
                    {activities.map((activity) => (
                        <button
                            key={activity.id}
                            onClick={() => handleActivitySelection(activity.id)}
                            className={`flex items-center justify-between w-full my-6 p-6 border rounded-lg ${selectedActivities.includes(activity.id) ? 'border-black bg-gray-100' : 'border-gray-200'} ${activity.bgColor || 'bg-white'}`}
                        >
                            <div className="flex items-center">
                                <span className="text-3xl mr-4">{activity.icon}</span>
                                <span className="text-2xl font-medium">{activity.label}</span>
                            </div>
                            <span className={`w-6 h-6 border-2 rounded-full ${selectedActivities.includes(activity.id) ? 'bg-green-600 border-green-600' : 'border-gray-400'}`}></span>
                        </button>
                    ))}
                </div>
                <div className='w-full px-8'>
                    <button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full py-3 bg-black text-white rounded-md font-semibold  my-6 p-6"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
