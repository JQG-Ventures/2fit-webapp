import React, { useState } from 'react';
import { IoGlobeOutline } from 'react-icons/io5';

interface CountryInfo {
  name: string;
  code: string; // e.g. "+55"
  abbreviation: string;
  flag: string;
}

interface PhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  countryCodes: CountryInfo[];
  error?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  countryCode,
  phoneNumber,
  onChange,
  countryCodes,
  error,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [validationError, setValidationError] = useState(false);

  const matchedCountry = countryCodes.find((c) => c.code === countryCode);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSelectCountry = (country: CountryInfo) => {
    const syntheticEventCode = {
      target: {
        name: 'countryCode',
        value: country.code.replace('+', ''),
      },
    } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;
    onChange(syntheticEventCode);

    const syntheticEventNumber = {
      target: {
        name: 'number',
        value: `${country.code} `,
      },
    } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;
    onChange(syntheticEventNumber);

    setDropdownOpen(false);
    setValidationError(false);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    setValidationError(false);
  };

  const handlePhoneBlur = () => {
    const trimmedPhone = phoneNumber.trim();
    const isEmptyNumber = trimmedPhone === '' || trimmedPhone === `+${countryCode}` || trimmedPhone === countryCode;

    if (isEmptyNumber) {
      setValidationError(true);
    }
  };

  return (
    <div
      className={`flex flex-row w-full border ${
        validationError ? 'border-red-500' : 'border-transparent'
      } rounded-lg`}
    >
      {/* Country Code Dropdown Button */}
      <div className="relative w-[30%] flex justify-center items-center">
        <button
          type="button"
          onClick={toggleDropdown}
          className={`flex items-center justify-center w-full bg-gray-200 text-gray-700 rounded-l-lg py-6 px-4 leading-tight focus:outline-none`}
        >
          {matchedCountry ? (
            <img
              src={matchedCountry.flag}
              alt={matchedCountry.name}
              className="w-6 h-4 rounded-sm"
            />
          ) : (
            <IoGlobeOutline className="text-gray-500" />
          )}
        </button>

        {dropdownOpen && (
          <ul
            className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-w-4xl max-h-60 overflow-y-auto"
          >
            {countryCodes.map((c) => (
              <li
                key={c.code}
                onClick={() => handleSelectCountry(c)}
                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              >
                <img
                  src={c.flag}
                  alt={c.name}
                  className="w-6 h-4 mr-2 rounded-sm"
                />
                <span className="text-gray-700">
                  {c.name} ({c.code})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <input
        type="tel"
        name="number"
        value={phoneNumber}
        onChange={handlePhoneChange}
        onBlur={handlePhoneBlur}
        placeholder="Enter phone number"
        className={`appearance-none text-2xl block w-full bg-gray-200 text-gray-700 rounded-r-lg py-3 leading-tight focus:outline-none focus:bg-white
          ${error ? 'border-2 border-red-500' : 'border border-transparent'}`}
      />
      {error && <p className="text-red-500 text-center">{error}</p>}
    </div>
  );
};

export default PhoneInput;
