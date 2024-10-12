'use client';

import ToggleButton from '../../_components/profile/togglebutton';
import { BsMoon } from "react-icons/bs";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaRegEnvelope, FaPhoneAlt } from 'react-icons/fa';

const Notification: React.FC = () => {
    const router = useRouter();
    
    return (
        <div className="min-h-screen bg-white p-6 pb-40">
        {/* Header */}
        <header className="flex items-center mb-6 md:pt-24 h-16">
            <button onClick={() => router.back()} className="text-gray-700">
            <FaArrowLeft className="w-8 h-8" />
            </button>
            <h1 className="text-3xl font-bold ml-2">Notification</h1>
        </header>

        <div className="flex items-center justify-between w-full py-6 pl-4">
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-medium">General Notification</span>
          </div>
          <ToggleButton /> 
        </div>
        <div className="flex items-center justify-between w-full py-6 pl-4">
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-medium">Sound</span>
          </div>
          <ToggleButton /> 
        </div>
        <div className="flex items-center justify-between w-full py-6 pl-4">
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-medium">Vibrate</span>
          </div>
          <ToggleButton /> 
        </div>
        <div className="flex items-center justify-between w-full py-6 pl-4">
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-medium">App Updates</span>
          </div>
          <ToggleButton /> 
        </div>
        <div className="flex items-center justify-between w-full py-6 pl-4">
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-medium">New Services Available</span>
          </div>
          <ToggleButton /> 
        </div>
        <div className="flex items-center justify-between w-full py-6 pl-4">
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-medium">New tips available</span>
          </div>
          <ToggleButton /> 
        </div>
        
        <form className="space-y-6">
        
        </form>
        </div>
    );
};

export default Notification;