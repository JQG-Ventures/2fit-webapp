'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import RegistrationHeader from '../../_components/register/RegistrationHeader';
import RegistrationButtons from '@/app/_components/register/RegisterButtons';


export default function RegisterStep9() {
    const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
    const [isSubmittingNext, setIsSubmittingNext] = useState(false);
    const [isSubmittingPrev, setIsSubmittingPrev] = useState(false);
    const router = useRouter();
    const { data, updateData } = useRegister();

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
        setIsSubmittingNext(true);
        updateData({ workout_type: selectedActivities });
        console.log(data);
        router.push('/register/step10');
    };

    const handlePrevStep = () => {
        setIsSubmittingPrev(true);
        router.push('/register/step8');
    };

    return (
        <div className="flex flex-col h-screen bg-white p-10 lg:items-center">
            <div className='h-[20%] w-full lg:max-w-3xl'>
                <RegistrationHeader
                    title={'Your phyisical activities'}
                    description={'Which activities do you practice. This will enhance our results for you.'}
                />
            </div>
            
            <div className="flex flex-col items-center justify-center h-[70%] w-full lg:max-w-3xl space-y-8">
    <div className="w-full px-8 py">
        {activities.map((activity) => (
            <button
                key={activity.id}
                onClick={() => handleActivitySelection(activity.id)}
                className={`
                    flex items-center justify-between w-full my-6 p-8 border border-grey-200 rounded-lg transform
                    transition duration-200 ease-in-out
                    bg-white
                    ${
                        selectedActivities.includes(activity.id)
                            ? 'shadow-lg border border-black rounded-lg scale-105'
                            : 'shadow-none hover:shadow-md'
                    }
                    ${activity.bgColor || ''}
                `}
            >
                <div className="flex items-center">
                    <span className="text-3xl mr-4">{activity.icon}</span>
                    <span className="text-2xl font-medium">{activity.label}</span>
                </div>
                <span
                    className={`
                        w-6 h-6 border-2 rounded-full transition duration-200 ease-in-out
                        ${
                            selectedActivities.includes(activity.id)
                                ? 'bg-green-600 border-green-600'
                                : 'border-gray-400'
                        }
                    `}
                ></span>
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
                isNextDisabled={selectedActivities.length === 0 || selectedActivities === undefined }
            />
        </div>
    );
}
