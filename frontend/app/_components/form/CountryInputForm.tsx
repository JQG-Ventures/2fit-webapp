import React, { useState, useEffect } from 'react';
import { IoGlobeOutline } from 'react-icons/io5';
import Image from 'next/image';

interface CountryInputFormProps {
    selectedCountry: string;
    onChange: (country: string) => void;
    countryList: { name: string; code: string; flag: string }[];
}

const CountryDropdown: React.FC<CountryInputFormProps> = ({
    selectedCountry,
    onChange,
    countryList,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentCountry, setCurrentCountry] = useState<{
        name: string;
        code: string;
        flag: string;
    } | null>(null);

    useEffect(() => {
        const found = countryList.find((c) => c.name === selectedCountry);
        setCurrentCountry(found || null);
    }, [selectedCountry, countryList]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (countryName: string) => {
        onChange(countryName);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full">
            <div
                className="flex items-center rounded-md p-2 bg-gray-200 text-gray-700 py-6 cursor-pointer"
                onClick={handleToggle}
            >
                {currentCountry ? (
                    <Image
                        src={currentCountry.flag}
                        alt={currentCountry.name}
                        className="ml-3 mr-8 w-8 h-6 rounded-sm"
                        width={6}
                        height={4}
                    />
                ) : (
                    <IoGlobeOutline className="mx-2 text-gray-500" />
                )}
                {currentCountry ? currentCountry.name : 'Select a country'}
            </div>
            {isOpen && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {countryList.map((country) => (
                        <li
                            key={country.code}
                            onClick={() => handleSelect(country.name)}
                            className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                        >
                            <Image
                                src={country.flag}
                                alt={country.name}
                                width={6}
                                height={4}
                                className="w-6 h-4 mr-2 rounded-sm"
                            />
                            <span className="text-gray-700">{country.name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CountryDropdown;
