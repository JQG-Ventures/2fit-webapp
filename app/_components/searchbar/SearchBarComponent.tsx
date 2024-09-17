'use client';

import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearch = () => {
        console.log('Searching for:', searchTerm);
        // Add your search logic here
    };

    return (
        <div className="relative w-full px-10 mt-6 mb-6 md:px-12 lg:px-20">
    <div className="relative w-full">
        <button
            onClick={handleSearch}
            aria-label="Search"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
        >
            <FaSearch size={20} />
        </button>
        <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search"
            className="w-full p-4 pl-16 bg-gray-100 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
        />
    </div>
</div>

    );
};

export default SearchBar;
