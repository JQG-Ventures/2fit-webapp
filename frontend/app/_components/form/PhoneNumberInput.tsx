'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { IoChevronDown, IoSearch } from 'react-icons/io5';

interface Country {
    name: string;
    code: string;
    abbreviation?: string;
    flag: string;
}

interface PhoneNumberInputProps {
    countryCode: string;
    phoneNumber: string;
    onCountryCodeChange: (code: string) => void;
    onPhoneNumberChange: (number: string) => void;
    countryList: Country[];
    placeholder?: string;
    error?: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
    countryCode,
    phoneNumber,
    onCountryCodeChange,
    onPhoneNumberChange,
    countryList,
    placeholder = 'Phone number',
    error,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const current = useMemo(
        () =>
            countryList.find((c) => c.code === `+${countryCode}` || c.code === countryCode) ?? null,
        [countryCode, countryList],
    );

    const filtered = useMemo(() => {
        if (!search.trim()) return countryList;
        const q = search.toLowerCase();
        return countryList.filter((c) => c.name.toLowerCase().includes(q) || c.code.includes(q));
    }, [search, countryList]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && searchRef.current) searchRef.current.focus();
    }, [isOpen]);

    const handleSelect = (country: Country) => {
        const cleanCode = country.code.replace('+', '');
        onCountryCodeChange(cleanCode);
        setIsOpen(false);
        setSearch('');
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^\d]/g, '');
        onPhoneNumberChange(value);
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <div
                className={`w-full flex items-center bg-gray-50 rounded-xl border transition
                    ${error ? 'border-red-400' : 'border-gray-200'}
                    focus-within:border-black focus-within:bg-white`}
            >
                <button
                    type="button"
                    onClick={() => setIsOpen((o) => !o)}
                    className="flex items-center gap-2 pl-5 pr-3 py-[18px] cursor-pointer shrink-0 border-r border-gray-200"
                >
                    {current ? (
                        <Image
                            src={current.flag}
                            alt={current.name}
                            width={24}
                            height={16}
                            className="w-7 h-5 rounded-sm object-cover"
                        />
                    ) : (
                        <span className="text-gray-400 text-[15px]">--</span>
                    )}
                    <IoChevronDown
                        className={`text-gray-400 text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                <span className="text-[17px] text-gray-500 pl-3 shrink-0">
                    +{countryCode || '?'}
                </span>

                <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder={placeholder}
                    className="flex-1 py-[18px] px-3 text-[17px] text-gray-900 placeholder-gray-400 bg-transparent outline-none"
                />
            </div>

            {isOpen && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                        <IoSearch className="text-gray-400 shrink-0" />
                        <input
                            ref={searchRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search country or code..."
                            className="w-full text-[15px] text-gray-900 placeholder-gray-400 bg-transparent outline-none"
                        />
                    </div>
                    <ul className="max-h-60 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <li className="px-4 py-3 text-[15px] text-gray-400 text-center">
                                No results
                            </li>
                        ) : (
                            filtered.map((country) => (
                                <li
                                    key={country.abbreviation ?? country.name}
                                    onClick={() => handleSelect(country)}
                                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
                                        hover:bg-gray-50
                                        ${current?.name === country.name ? 'bg-gray-100 font-medium' : ''}`}
                                >
                                    <Image
                                        src={country.flag}
                                        alt={country.name}
                                        width={24}
                                        height={16}
                                        className="w-6 h-4 rounded-sm object-cover shrink-0"
                                    />
                                    <span className="text-[15px] text-gray-900 flex-1">
                                        {country.name}
                                    </span>
                                    <span className="text-[14px] text-gray-400">
                                        {country.code}
                                    </span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}

            {error && <p className="text-red-500 text-sm mt-1.5 pl-1">{error}</p>}
        </div>
    );
};

export default PhoneNumberInput;
