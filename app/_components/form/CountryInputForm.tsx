import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaGlobe } from 'react-icons/fa';

interface Country {
    name: string;
    abbreviation: string;
    flag: string;
}

interface CountryInputFormProps {
    selectedCountry: string;
    onChange: (country: string) => void;
    countryList: Country[];
}

const CountryInputForm: React.FC<CountryInputFormProps> = ({
    selectedCountry,
    onChange,
    countryList,
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [inputValue, setInputValue] = useState(selectedCountry);
    const [filteredCountries, setFilteredCountries] = useState<Country[]>(countryList);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter countries based on input
    useEffect(() => {
        const filtered = countryList.filter((country) =>
            country.name.toLowerCase().includes(inputValue.toLowerCase())
        );
        setFilteredCountries(filtered);
    }, [inputValue, countryList]);

    const handleCountrySelect = (country: Country) => {
        onChange(country.name);
        setInputValue(country.name);
        setShowDropdown(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        setShowDropdown(true);
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
            {/* Dropdown button */}
            <div
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-between w-[15%] bg-gray-200 text-gray-700 rounded-l-lg py-6 px-4 mb-3 leading-tight cursor-pointer focus:outline-none"
            >
                {selectedCountry ? (
                    <img
                        src={countryList.find((c) => c.name === selectedCountry)?.flag || ''}
                        alt={selectedCountry}
                        className="w-6 h-4 mr-2 rounded-sm"
                    />
                ) : (
                    <FaGlobe className="w-6 h-6 text-gray-500" />
                )}
                <FaChevronDown className="ml-2 text-sm" />
            </div>

            {/* Editable Input */}
            <input
                type="text"
                name="countryName"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Select Country"
                className="appearance-none text-2xl block w-full bg-gray-200 text-gray-700 rounded-r-lg py-3 px-4 mb-3 leading-tight focus:outline-none"
            />

            {/* Filtered Dropdown */}
            {showDropdown && (
                <div className="absolute z-10 top-full w-[60%] max-h-60 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                    {filteredCountries.map((country, index) => (
                        <div
                            key={index}
                            onClick={() => handleCountrySelect(country)}
                            className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                        >
                            {country.flag ? (
                                <img src={country.flag} alt={country.name} className="w-6 h-4 mr-2 rounded-sm" />
                            ) : (
                                <FaGlobe className="w-6 h-6 text-gray-500 mr-2" />
                            )}
                            <span className="text-gray-700">{country.name}</span>
                            <span className="ml-2 text-gray-500">({country.abbreviation})</span>
                        </div>
                    ))}
                    {filteredCountries.length === 0 && (
                        <div className="px-4 py-2 text-gray-500">No results found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CountryInputForm;
