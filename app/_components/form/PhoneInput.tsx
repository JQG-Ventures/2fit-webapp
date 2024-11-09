import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaGlobe } from 'react-icons/fa';
import { CountryCode, PhoneInputProps } from '../../_interfaces/props/PhoneInputProps';
import Image from 'next/image';

const PhoneInput: React.FC<PhoneInputProps> = ({
    countryCode,
    phoneNumber,
    onChange,
    countryCodes,
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedCountry = countryCodes.find(
        (country) => country.code === countryCode
    );

    const handleCountrySelect = (country?: CountryCode) => {
        if (country) {
            const formattedNumber = `(${country.code}) ` + phoneNumber.replace(`(${countryCode}) `, '');
            onChange({ target: { name: 'countryCode', value: country.code } } as React.ChangeEvent<HTMLInputElement>);
            onChange({ target: { name: 'number', value: formattedNumber } } as React.ChangeEvent<HTMLInputElement>);
        } else {
            onChange({ target: { name: 'countryCode', value: '' } } as React.ChangeEvent<HTMLInputElement>);
            onChange({ target: { name: 'number', value: '' } } as React.ChangeEvent<HTMLInputElement>);
        }
        setShowDropdown(false);
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(e);
        const match = newValue.match(/\(\+(\d+)\)/);
        if (match) {
            const code = `+${match[1]}`;
            const matchedCountry = countryCodes.find(country => country.code === code);

            if (matchedCountry) {
                onChange({ target: { name: 'countryCode', value: matchedCountry.code } } as React.ChangeEvent<HTMLInputElement>);
            }
        } else if (!newValue.startsWith(`(${countryCode})`)) {
            onChange({ target: { name: 'countryCode', value: '' } } as React.ChangeEvent<HTMLInputElement>);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="flex flex-row relative" ref={dropdownRef}>
            <div
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-between w-[15%] bg-gray-200 text-gray-700 rounded-l-lg py-6 px-4 mb-3 leading-tight cursor-pointer focus:outline-none focus:bg-white"
            >
                {selectedCountry && selectedCountry.flag ? (
                    <Image src={selectedCountry.flag} alt={selectedCountry.name} className="w-6 h-4 mr-2 rounded-sm" />
                ) : (
                    <FaGlobe className="w-6 h-6 text-gray-500" />
                )}
                <FaChevronDown className="ml-2 text-sm" />
            </div>

            <input
                type="tel"
                name="number"
                value={phoneNumber}
                onChange={handleNumberChange}
                placeholder="111 467 378 399"
                className="appearance-none py-6 text-2xl block w-full bg-gray-200 text-gray-700 rounded-r-lg py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
            />

            {showDropdown && (
                <div className="absolute z-10 mb-1 bottom-full w-[60%] max-h-60 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                    <div
                        onClick={() => handleCountrySelect()}
                        className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                        <FaGlobe className="w-6 h-6 text-gray-500 mr-2" />
                        <span className="text-gray-500">Select Code</span>
                    </div>
                    {countryCodes.map((country, index) => (
                        <div
                            key={index}
                            onClick={() => handleCountrySelect(country)}
                            className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                        >
                            <Image src={country.flag} alt={country.name} className="w-6 h-4 mr-2 rounded-sm" />
                            <span className="text-gray-700">{country.name}</span>
                            <span className="ml-2 text-gray-500">({country.code})</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PhoneInput;
