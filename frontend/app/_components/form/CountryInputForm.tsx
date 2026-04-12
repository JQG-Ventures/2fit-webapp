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

interface CountryInputFormProps {
    selectedCountry: string;
    onChange: (country: string) => void;
    countryList: Country[];
    placeholder?: string;
    error?: string;
}

const CountryInputForm: React.FC<CountryInputFormProps> = ({
    selectedCountry,
    onChange,
    countryList,
    placeholder = 'Select a country',
    error,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const current = useMemo(
        () => countryList.find((c) => c.name === selectedCountry) ?? null,
        [selectedCountry, countryList],
    );

    const filtered = useMemo(() => {
        if (!search.trim()) return countryList;
        const q = search.toLowerCase();
        return countryList.filter((c) => c.name.toLowerCase().includes(q));
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

    const handleSelect = (name: string) => {
        onChange(name);
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen((o) => !o)}
                className={`w-full flex items-center gap-3 bg-gray-50 rounded-xl py-[18px] px-5
                    text-[17px] border cursor-pointer transition
                    ${error ? 'border-red-400' : 'border-gray-200'}
                    ${isOpen ? 'border-black bg-white' : ''}`}
            >
                {current ? (
                    <>
                        <Image
                            src={current.flag}
                            alt={current.name}
                            width={24}
                            height={16}
                            className="w-7 h-5 rounded-sm object-cover shrink-0"
                        />
                        <span className="text-gray-900 flex-1 text-left">{current.name}</span>
                    </>
                ) : (
                    <span className="text-gray-400 flex-1 text-left">{placeholder}</span>
                )}
                <IoChevronDown
                    className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                        <IoSearch className="text-gray-400 shrink-0" />
                        <input
                            ref={searchRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
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
                                    onClick={() => handleSelect(country.name)}
                                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
                                        hover:bg-gray-50
                                        ${country.name === selectedCountry ? 'bg-gray-100 font-medium' : ''}`}
                                >
                                    <Image
                                        src={country.flag}
                                        alt={country.name}
                                        width={24}
                                        height={16}
                                        className="w-6 h-4 rounded-sm object-cover shrink-0"
                                    />
                                    <span className="text-[15px] text-gray-900">
                                        {country.name}
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

export default CountryInputForm;
