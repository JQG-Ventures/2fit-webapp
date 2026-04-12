import type { InputWithIconProps } from '@/app/_interfaces/props/InputWithIconProps';
import React from 'react';

const InputWithIcon: React.FC<InputWithIconProps> = ({
    name,
    type,
    value,
    placeholder,
    onChange,
    error,
}) => {
    return (
        <div>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-gray-50 text-gray-900 placeholder-gray-400 border ${
                    error ? 'border-red-400' : 'border-gray-200'
                } rounded-xl py-[18px] px-5 text-[17px] focus:outline-none focus:border-black focus:bg-white transition`}
            />
            {error && <p className="text-red-500 text-sm mt-1.5 pl-1">{error}</p>}
        </div>
    );
};

export default InputWithIcon;
