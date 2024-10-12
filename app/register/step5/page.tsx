'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import RegistrationHeader from '../../_components/register/RegistrationHeader';
import RegistrationButtons from '@/app/_components/register/RegisterButtons';
import ScrollablePicker from '@/app/_components/register/ScrollablePicker';


export default function RegisterStep5() {
    const { data, updateData } = useRegister();
    const [isSubmittingNext, setIsSubmittingNext] = useState(false);
    const [isSubmittingPrev, setIsSubmittingPrev] = useState(false);
    const [height, setHeight] = useState(data.height || 175);
    const router = useRouter();

    const handleNextStep = () => {
        setIsSubmittingNext(true);
        updateData({ height });
        router.push('/register/step6');
    };

    const handlePrevStep = () => {
        setIsSubmittingPrev(true);
        router.push('/register/step4');
    };

    return (
        <div className="flex flex-col h-screen bg-white p-10 lg:items-center">
            <div className='h-[20%] w-full lg:max-w-3xl'>
                <RegistrationHeader
                    title={'What is Your Height'}
                    description={'Current height in cm. Don\'t worry you can always change it later.'}
                />
            </div>

            <div className="flex flex-col items-center justify-center h-[70%] w-full lg:max-w-3xl space-y-8">
                <ScrollablePicker
                    value={height}
                    onChange={(newHeight) => setHeight(newHeight)}
                    range={Array.from({ length: 60 }, (_, i) => i + 150)}
                />
            </div>

            <RegistrationButtons
                handleNext={handleNextStep}
                handlePrev={handlePrevStep}
                isSubmittingNext={isSubmittingNext}
                isSubmittingPrev={isSubmittingPrev}
                prevText={'Back'}
                nextText={'Continue'}
                isNextDisabled={height === null || height === undefined}
            />
        </div>
    );
}
