'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoChevronBack } from "react-icons/io5";
import { useRegister } from '../../_components/register/RegisterProvider';

export default function RegisterStep2() {
    const { data } = useRegister();
    const [code, setCode] = useState(["", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [animateOut, setAnimateOut] = useState(false);
    const router = useRouter();

    // Retrieve the phone number from the data saved in the first step
    const phoneNumber = data.phone || "Unknown";  // Fallback to "Unknown" if the phone number is not available

    const handleChange = (index: any, value: any) => {
        if (/^\d*$/.test(value)) { // Only allow digits
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);
            // Automatically focus the next input if a digit is entered
            if (value && index < 3) {
                document.getElementById(`digit-${index + 1}`).focus();
            }
        }
    };

    const handlePrevStep = () => {
        router.push('/register/step1');
    };

    const handleNextStep = async () => {
        setLoading(true);
        setError('');

        // Simulate a delay for validation (replace with real validation logic)
        await new Promise(resolve => setTimeout(resolve, 2000));

        const isValid = code.join('') === '1234'; // Example validation: replace with your logic

        setLoading(false);

        if (isValid) {
            setAnimateOut(true);
            setTimeout(() => {
                router.push('/register/step3');
            }, 500); // Adjust timing for animation
        } else {
            setError('The code entered is not valid. Please try again.');
        }
    };

    return (
        <div className={`flex flex-col items-center justify-center min-h-screen bg-white p-4 transition-opacity ${animateOut ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex-grow flex flex-col basis-3/4 justify-center items-center">
                <div className='flex items-center justify-between mb-12'>
                    <button
                        onClick={handlePrevStep}
                        className="absolute left-6 text-6xl"
                    >
                        <IoChevronBack />
                    </button>
                    <h2 className="text-4xl font-bold text-center flex-grow">Sign Up</h2>
                </div>
                <div className='px-8'>
                    <h2 className="text-2xl font-bold text-center mb-2">Phone verification</h2>
                    <p className="text-gray-600 text-center mb-6">
                        We sent a code to your number <span className="font-semibold">{phoneNumber}</span> <a href="#" className="text-blue-500">Change</a>
                    </p>
                    <div className="flex justify-between mb-6 max-w-xs mx-auto">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                id={`digit-${index}`}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                className="w-14 h-14 text-center text-2xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ))}
                    </div>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <p className="text-center text-gray-500">
                        Don't receive your code? <a href="#" className="text-blue-500">Resend</a>
                    </p>
                </div>
                <div className="flex justify-center items-center mt-8 w-full max-w-xs sm:max-w-xl">
                    <button
                        onClick={handleNextStep}
                        className="w-full max-w-xs sm:max-w-md py-3 bg-black text-white rounded-md font-semibold mt-4 flex justify-center items-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                        ) : (
                            'Next'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
