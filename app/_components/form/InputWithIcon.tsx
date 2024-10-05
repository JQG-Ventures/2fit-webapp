import { InputWithIconProps } from '../../_interfaces/props/InputWithIconProps';
import React from 'react';

const InputWithIcon: React.FC<InputWithIconProps> = ({
    name,
    type,
    value,
    placeholder,
    onChange,
    icon: Icon,
}) => {
    return (
        <div className="pl-2 py-3">
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="appearance-none py-6 text-2xl block w-full bg-gray-100 text-gray-700 rounded-lg py-4 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                />
        </div>
    );
};

export default InputWithIcon;
