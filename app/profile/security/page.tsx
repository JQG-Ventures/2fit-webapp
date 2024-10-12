'use client';

import ToggleButton from '../../_components/profile/togglebutton';
import { BsMoon } from "react-icons/bs";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaRegEnvelope, FaPhoneAlt } from 'react-icons/fa';
import { MdKeyboardArrowRight } from "react-icons/md";

const Security: React.FC = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white p-6 pb-40">
            {/* Header */}
            <header className="flex items-center mb-6 md:pt-24 h-16"> {/* Ajusta la altura aquí */}
                <button onClick={() => router.back()} className="text-gray-700">
                    <FaArrowLeft className="w-8 h-8" />
                </button>
                <h1 className="text-3xl font-bold ml-2">Security</h1>
            </header>

            <div className="flex items-center justify-between w-full py-6 pl-4">
                <div className="flex items-center space-x-4">
                    <span className="text-3xl font-medium">Face ID</span>
                </div>
                <ToggleButton />
            </div>
            <div className="flex items-center justify-between w-full py-6 pl-4">
                <div className="flex items-center space-x-4">
                    <span className="text-3xl font-medium">Remember me</span>
                </div>
                <ToggleButton />
            </div>
            <div className="flex items-center justify-between w-full py-6 pl-4">
                <div className="flex items-center space-x-4">
                    <span className="text-3xl font-medium">Touch ID</span>
                </div>
                <ToggleButton />
            </div>
            <div className="flex items-center justify-between w-full py-6 pl-4">
                <div className="flex items-center space-x-4">
                    <span className="text-3xl font-medium">Google Authenticator</span>
                </div>
                <MdKeyboardArrowRight className="text-gray-500 w-12 h-12" />
            </div>

            <div className='pt-8'>

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-400 to-green-700 text-white p-4 rounded-full text-2xl font-semibold shadow-lg py-8 "
                >
                    Change Password
                </button>

            </div>


            <form className="space-y-6">

            </form>
        </div>
    );
};

export default Security;