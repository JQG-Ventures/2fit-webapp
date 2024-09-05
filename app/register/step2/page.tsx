'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoChevronBack } from "react-icons/io5";



export default function RegisterStep2() {
    const [code, setCode] = useState(["", "", "", ""]);
    const router = useRouter();

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
        // Lógica para verificar el número de teléfono o guardarlo temporalmente
        router.push('/register/step1');
    }


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
            <div className="w-full max-w-xs sm:max-w-md">
                <div className='flex items-center justify-between mb-12'>
                    <button
                        onClick={handlePrevStep}
                        className="absolute left-6 text-6xl"
                    >
                        <IoChevronBack />
                    </button>
                    <h2 className="text-4xl font-bold text-center flex-grow">Sign Up</h2>
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">Phone verification</h2>
                <p className="text-gray-600 text-center mb-6">
                    We sent a code to your number <span className="font-semibold">9(173)605-76-05</span> <a href="#" className="text-blue-500">Change</a>
                </p>
                <div className="flex justify-between mb-6 max-w-xs mx-auto">
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            id={`digit-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            className="w-14 h-14 text-center text-2xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ))}
                </div>
                <p className="text-center text-gray-500">
                    Don't receive your code? <a href="#" className="text-blue-500">Resend</a>
                </p>
            </div>
        </div>
    );
}