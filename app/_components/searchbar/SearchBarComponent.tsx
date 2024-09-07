'use client';

import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearch = () => {
        console.log('Searching for:', searchTerm);
    };

    return (
        <div className="relative w-full px-6 mt-6 mb-6 md:px-12 lg:px-20 flex items-center bg-gray-100 rounded-xl">
            <button
                onClick={handleSearch}
                className="p-3 text-gray-500 focus:outline-none absolute left-3 top-1/2 transform -translate-y-1/2"
            >
                <FaSearch size={20} />
            </button>
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder="Search"
                className="w-full p-4 pl-12 bg-gray-100 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 lg:p-6 lg:text-lg"
                style={{ paddingLeft: '3rem' }} // Adjusting padding to fit the icon
            />
        </div>
    );
};

export default SearchBar;
