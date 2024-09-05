'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../../_components/register/RegisterProvider';
import { registerUser } from '../../_services/registerService';

export default function RegisterStep10() {
    const [textIndex, setTextIndex] = useState(0);
    const [showText, setShowText] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    const { data } = useRegister();

    const texts = [
        "We create your training plan",
        "Analyzing your demographic profile",
        "Considering your activity level",
        "Taking your interests into account",
        "Almost there! Finalizing your plan"
    ];

    const changeText = useCallback(() => {
        setShowText(false);
        setTimeout(() => {
            setTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
            setShowText(true);
        }, 500);
    }, [texts.length]);

    useEffect(() => {
        const changeTextInterval = setInterval(changeText, 2500);

        const handleRegistration = async () => {
            try {
                const result = await registerUser(data);
                console.log('User registered successfully:', result);

                setTimeout(() => {
                    router.push('/home');
                }, 3000);
            } catch (error) {
                setErrorMessage('There was an error creating your training plan. Please try again.');
                setIsLoading(false);
            }
        };

        handleRegistration();

        return () => {
            clearInterval(changeTextInterval);
        };
    }, [router, data, changeText]);

    const handleRetry = () => {
        router.push('/');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white p-4">
            <div className="w-full max-w-lg flex flex-col items-center justify-evenly h-[60vh] text-center">
                {isLoading ? (
                    <>
                        <h2 className="text-5xl font-bold mb-10">We are creating your <br /> training plan</h2>
                        <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mb-10"></div>
                        <div className={`transition-opacity duration-500 ${showText ? 'opacity-100' : 'opacity-0'}`}>
                            <p className="text-2xl">{texts[textIndex]}</p>
                        </div>
                    </>
                ) : (
                    <div>
                        <h2 className="text-3xl font-bold text-red-600 mb-6">{errorMessage}</h2>
                        <button
                            onClick={handleRetry}
                            className="mt-4 px-6 py-3 bg-red-500 text-white text-lg rounded-md"
                        >
                            Go to Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
