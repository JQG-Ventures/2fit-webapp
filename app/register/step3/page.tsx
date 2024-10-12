'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import RegistrationHeader from '../../_components/register/RegistrationHeader';
import RegistrationButtons from '@/app/_components/register/RegisterButtons';
import { CgGenderFemale, CgGenderMale } from "react-icons/cg";

export default function RegisterStep3() {
    const { data, updateData } = useRegister();
    const router = useRouter();
    const [isSubmittingNext, setIsSubmittingNext] = useState(false);
    const [isSubmittingPrev, setIsSubmittingPrev] = useState(false);
    const [selectedGender, setSelectedGender] = useState(data.gender);

    const genders = [
        { id: 0, label: 'Woman', Icon: CgGenderFemale },
        { id: 1, label: 'Man', Icon: CgGenderMale }
    ];

    const handleGenderSelection = (genderId) => {
        setSelectedGender(genderId);
        updateData({ gender: genderId });
    };

    const handleNextStep = () => {
        setIsSubmittingNext(true);
        router.push('/register/step4');
    };

    const handlePrevStep = () => {
        setIsSubmittingPrev(true);
        router.push('/register/step1');
    };

    return (
        <div className="flex flex-col h-screen bg-white p-10 lg:items-center">
            <div className='h-[20%] w-full lg:max-w-3xl'>
                <RegistrationHeader
                    title={'Tell Us About Yourself'}
                    description={'To give you a better experience and results we need to know your gender'}
                />
            </div>

            <div className="flex flex-col items-center justify-center h-[70%] w-full lg:max-w-3xl space-y-8">
                <div className="flex flex-col items-center justify-center space-y-8 w-full">
                    {genders.map(({ id, label, Icon }) => (
                        <button
                            key={id}
                            className={`w-60 h-60 lg:w-80 lg:h-80 flex flex-col items-center justify-center border rounded-full text-3xl 
                            ${selectedGender === id ? 'bg-black text-white border-black' : 'bg-gray-300 text-gray-700 border-gray-300'}`}
                            onClick={() => handleGenderSelection(id)}
                        >
                            <Icon className='text-8xl' />
                            <span className="mt-2 text-2xl">{label}</span>
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
                isNextDisabled={selectedGender === null || selectedGender === undefined}
            />
        </div>
    );
}
