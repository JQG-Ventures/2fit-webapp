import React from 'react';
import { useState, useEffect } from 'react';
import CountdownTimer from './CountdownTimer';
import { useRouter } from 'next/navigation';
import { IoChevronBack } from "react-icons/io5";


const StartAnimation = () => {
    const [timeLeft, setTimeLeft] = useState(10);
    const totalTime = 10;
    const router = useRouter();

    const handlePrevStep = () => router.back();

    return (
        <div className='flex flex-col h-screen bg-white p-10 items-center'>
            <div className='h-[15%] pt-20 w-full lg:max-w-3xl'>
                <button onClick={handlePrevStep} className="text-4xl lg:hidden">
                    <IoChevronBack />
                </button>
            </div>
            <div>
                <CountdownTimer title={"Get Ready!"}/>
            </div>
            <div>
                <button onClick={() => setTimeLeft(totalTime)}>Start Over</button>
            </div>
        </div>
    );
};

export default StartAnimation;
