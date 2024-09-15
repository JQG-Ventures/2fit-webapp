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
    const phoneNumber = data.number || "Unknown";

    const handleChange = (index: any, value: any) => {
        if (/^\d*$/.test(value)) {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);
            if (value && index < 3) {
                document.getElementById(`digit-${index + 1}`)?.focus();
            }
        }
    };

    const handlePrevStep = () => {
        router.push('/register/step1');
    };

    const handleNextStep = async () => {
        setLoading(true);
        setError('');

        await new Promise(resolve => setTimeout(resolve, 2000));

        const isValid = code.join('') === '1234';

        setLoading(false);

        if (isValid) {
            setAnimateOut(true);
            setTimeout(() => {
                router.push('/register/step3');
            }, 500);
        } else {
            setError('The code entered is not valid. Please try again.');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white p-10 justify-between">
            <div className='h-[15%] pt-20'>
                <button onClick={handlePrevStep} className="text-4xl">
                    <IoChevronBack />
                </button>
            </div>

            <div className='h-[25%]'>
                <h1 className='text-6xl font-semibold'>Verify your <br />Number</h1>
            </div>

            <div className='h-[40%]'>
                <p className="text-gray-600 text-center mb-6">
                    We sent a code to your number <br/><span className="font-semibold">{phoneNumber}</span> <a href="#" className="text-blue-500">Change</a>
                </p>
                <div className="flex justify-center my-28">
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            id={`digit-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            className="w-20 h-20 mx-4 text-center text-3xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ))}
                </div>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <p className="text-center text-gray-500">
                    Don't receive your code? <a href="#" className="text-blue-500">Resend</a>
                </p>
            </div>
            <div className="h-[20%] flex items-center justify-center">
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
    );
}
