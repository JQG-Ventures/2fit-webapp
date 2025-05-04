import React from 'react';
import { FaUnlock } from 'react-icons/fa';

const LockScreen: React.FC<{ message: string; buttonText: string; onButtonClick: () => void }> = ({
    message,
    buttonText,
    onButtonClick,
}) => {
    return (
        <div className="absolute inset-0 flex flex-col justify-between items-center bg-gradient-to-b from-gray-800 to-black opacity-90 p-8">
            <div className="flex-1 flex justify-center items-center">
                <p className="text-white text-3xl font-semibold text-center">{message}</p>
            </div>
            <div className="w-full flex justify-center mb-8">
                <button
                    className="flex flex-row w-full justify-center items-center bg-green-500 font-semibold text-white p-6 rounded-full hover:bg-green-600"
                    onClick={onButtonClick}
                >
                    <FaUnlock className="mr-4 w-6 h-6" />
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

export default LockScreen;
