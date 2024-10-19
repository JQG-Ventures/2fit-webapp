'use client'

import CountdownTimer from "../../../../_components/animations/CountdownTimer";
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { IoChevronBack } from "react-icons/io5";
import { useTranslation } from 'react-i18next';


const CountdownPage = () => {
    const { id } = useParams();
    const totalTime = 7;
    const router = useRouter();
    const [resetTrigger, setResetTrigger] = useState(0);
    const { t } = useTranslation('global');

    const handlePrevStep = () => router.back(); 
    const handleComplete = () => router.push(`/workouts/plan/${id}/exercise`); 
    const handleReset = () => {
        setResetTrigger(prev => prev + 1);
    };

    return (
        <div className='flex flex-col h-screen bg-white p-10 items-center'>
            <div className='h-[15%] pt-20 w-full lg:max-w-3xl'>
                <button onClick={handlePrevStep} className="text-4xl lg:hidden">
                    <IoChevronBack />
                </button>
            </div>
            <div className="h-[60%] flex w-full items-center justify-center">
                <CountdownTimer title={t("workouts.plan.getReady")} duration={totalTime} resetTrigger={resetTrigger} size={240} strockWidth={28} onComplete={handleComplete} />
            </div>
            <div className="h-[25%] flex w-full items-center justify-center">
                <button
                    onClick={handleReset}
                    className="bg-gradient-to-r from-emerald-400 to-emerald-600 w-[90%] text-white px-6 py-8 rounded-full text-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                >
                    {t("workouts.plan.startOver")}
                </button>
            </div>
        </div>
    );
};

export default CountdownPage;