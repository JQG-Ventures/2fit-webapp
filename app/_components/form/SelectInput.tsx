import { SelectInputProps } from '../../_interfaces/props/SelectInputProps';
import React from 'react';


const SelectInput: React.FC<SelectInputProps> = ({
    label,
    name,
    value,
    onChange,
    options,
    icon: Icon,
}) => {
    return (
            <div className="pl-2 py-3">
                {Icon && <Icon className="text-black mr-4 w-6 h-6" />}
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="py-6 text-2xl block w-full bg-gray-100 text-gray-700 rounded-lg py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                >
                    <option value="">Select your {label.toLowerCase()}</option>
                    {options.map((option, index) => (
                        <option key={index} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
    );
};

export default SelectInput;
