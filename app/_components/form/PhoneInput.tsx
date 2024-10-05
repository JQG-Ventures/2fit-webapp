import React from 'react';
import { FaPhoneAlt } from 'react-icons/fa';


const PhoneInput: React.FC<PhoneInputProps> = ({
    label,
    countryCode,
    phoneNumber,
    onChange,
    countryCodes,
}) => {
    return (
        <div className="flex flex-row pl-2 py-3">
                <select
                    name="countryCode"
                    value={countryCode}
                    onChange={onChange}
                    className="py-6 text-2xl block w-[40%] bg-gray-100 text-gray-700 rounded-l-lg py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                >
                    <option value="">Select Code</option>
                    {countryCodes.map((country, index) => (
                        <option key={index} value={country.code}>
                            {country.code} ({country.abbreviation})
                        </option>
                    ))}
                </select>
                <input
                    type="tel"
                    name="number"
                    value={phoneNumber}
                    onChange={onChange}
                    placeholder="111 467 378 399"
                    className="appearance-none py-6 text-2xl block w-full bg-gray-100 text-gray-700 rounded-r-lg py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                />
            </div>
    );
};

export default PhoneInput;
