'use client';

import React, { useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Modal from '../../../_components/profile/modal';
import { fetchUserDataByEmail } from '../../../_services/userService';

const Step0: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Realizamos la llamada a la función fetchUserDataByEmail con el correo en formato string
            const response = await fetchUserDataByEmail(email);

            console.log("Fetched userData:", response); // Verifica la estructura de la respuesta

            // Accede al ID de usuario desde la estructura esperada en `message._id`
            if (!response || !response.message || !response.message._id) {
                setError("User not found with this email.");
                setIsSubmitting(false);
                return;
            }

            // Redirige a Step1 con el ID del usuario obtenido
            router.push(`/options/forgotpassword/step1?userId=${response.message._id}`);
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col justify-between items-center bg-white h-screen p-14">
            {/* Header */}
            <div className="h-[12%] flex flex-row justify-left space-x-8 items-center w-full max-w-3xl">
                <button onClick={() => router.push('/login')} className="text-gray-700">
                    <IoIosArrowBack className="text-3xl cursor-pointer" />
                </button>
                <h1 className="text-4xl font-semibold">Forgot Password</h1>
            </div>

            {/* Image Section */}
            <div className="h-[51%] flex flex-col items-center w-full max-w-lg justify-end pb-12">
                <Image
                    src="/images/options/forgot-password-illustration.png"
                    alt="Forgot Password Illustration"
                    width={250}
                    height={250}
                    className="w-2/3 h-auto"
                />
                <p className="text-2xl text-gray-900 mt-4 text-center px-4">
                    Enter the email associated with your account to reset your password.
                </p>
            </div>

            {/* Email Input Section */}
            <div className="h-[30%] flex flex-col justify-start py-6 w-full max-w-3xl space-y-4 overflow-y-auto pt-6">
                <form onSubmit={handleSubmit} className="flex flex-col w-full">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-2 border-gray-300 p-6 rounded-xl text-2xl"
                    />
                    {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                </form>
            </div>

            {/* Continue Button */}
            <div className="h-[7%] flex w-full max-w-3xl">
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full bg-black text-white rounded-full text-2xl font-semibold shadow-lg flex items-center justify-center"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Continue'}
                </button>
            </div>
        </div>
    );
};

export default Step0;
