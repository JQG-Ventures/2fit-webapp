'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterStep3() {
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const router = useRouter();

    const handleFinishRegistration = () => {
        // Lógica para guardar el nombre y sexo
        router.push('/'); // Redirige al Home o al dashboard
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
            <h2 className="text-2xl font-bold mb-4">Enter your Details</h2>
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full max-w-md p-3 border border-gray-300 rounded mb-4"
            />
            <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full max-w-md p-3 border border-gray-300 rounded mb-4"
            >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
            </select>
            <button
                onClick={handleFinishRegistration}
                className="w-full max-w-md bg-blue-500 text-white p-3 rounded"
            >
                Finish Registration
            </button>
        </div>
    );
}
