import React from 'react';
import { IconType } from 'react-icons';
import { FaSpinner } from 'react-icons/fa';

interface SettingItemProps {
    label: string;
    icon: IconType;
    isRed?: boolean;
    onClick?: () => void;
    isLoading?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
    label,
    icon: Icon,
    isRed = false,
    onClick,
    isLoading,
}) => {
    return (
        <div
            className={`flex items-center space-x-4 cursor-pointer w-full py-8 px-4 hover:bg-gray-200 transition duration-200 ${
                isRed ? 'text-red-500' : 'text-black'
            } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={!isLoading ? onClick : undefined}
        >
            <Icon className={`w-8 h-8 ${isRed ? 'text-red-500' : 'text-gray-500'}`} />
            <span className="text-3xl font-medium w-full">{label}</span>
            {isLoading && <FaSpinner className="w-5 h-5 animate-spin text-gray-500" />}
        </div>
    );
};

export default SettingItem;
