'use client'

import { FaDumbbell } from 'react-icons/fa';
import { ImSpinner8 } from 'react-icons/im';

const LoadingScreen = () => {
    return (
        <div className="w-full h-screen flex flex-col justify-between items-center bg-white">
            <div className="h-[70%] flex items-center justify-center">
                <FaDumbbell className="text-emerald-500 text-9xl" />
            </div>

            <div className="h-[30%]">
                <ImSpinner8 className="text-emerald-500 text-5xl animate-spin" />
            </div>
        </div>
    );
};

export default LoadingScreen;
