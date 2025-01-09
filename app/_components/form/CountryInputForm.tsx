import React, { useState, useEffect } from 'react';
import { IoGlobeOutline } from 'react-icons/io5';

interface CountryInputFormProps {
    selectedCountry: string;
    onChange: (country: string) => void;
    countryList: { name: string; code: string; flag: string }[];
}

const CountryInputForm: React.FC<CountryInputFormProps> = ({ selectedCountry, onChange, countryList }) => {
    const [filteredCountries, setFilteredCountries] = useState(countryList);
    const [inputValue, setInputValue] = useState(selectedCountry);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        setInputValue(selectedCountry);
    }, [selectedCountry]);

    useEffect(() => {
        const filtered = countryList.filter((country) =>
            country.name.toLowerCase().includes(inputValue.toLowerCase())
        );
        setFilteredCountries(filtered);
    }, [inputValue, countryList]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        onChange('');
    };

    const handleCountrySelect = (country: string) => {
        setInputValue(country);
        onChange(country);
        setShowDropdown(false);
    };

    const handleDropdownClick = () => {
        setFilteredCountries(countryList);
        setShowDropdown(true);
    };

    const handleInputFocus = () => setShowDropdown(true);

    const handleClearInput = () => {
        setInputValue('');
        setFilteredCountries(countryList);
        onChange('');
    };

    return (
        <div className="relative w-full">
            <div className="flex items-center rounded-md p-2 bg-gray-200 text-gray-700 py-6">
                <IoGlobeOutline
                    className="mx-2 text-gray-500 cursor-pointer"
                    onClick={handleDropdownClick}
                />
                <input
                    type="text"
                    placeholder="Select a country"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    className="w-full outline-none bg-transparent"
                />
                {inputValue && (
                    <button onClick={handleClearInput} className="text-gray-700 mr-2">
                        &#x2715;
                    </button>
                )}
            </div>

            {showDropdown && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {filteredCountries.map((country) => (
                        <li
                            key={country.code}
                            onClick={() => handleCountrySelect(country.name)}
                            className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                        >
                            <img src={country.flag} alt={country.name} className='w-6 h-4 mr-2 rounded-sm' />
                            <span className="text-gray-700">{country.name}</span>
                        </li>
                    ))}
                    {filteredCountries.length === 0 && (
                        <li className="p-2 text-gray-500 text-center">No matches found</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default CountryInputForm;
