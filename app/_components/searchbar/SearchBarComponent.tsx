'use client';

import { useApiGet } from '@/app/utils/apiClient';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSearch, FaSpinner } from 'react-icons/fa';

type SearchBarProps = {
    isDesktop?: boolean;
};

const SearchBar: React.FC<SearchBarProps> = ({ isDesktop = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredResults, setFilteredResults] = useState<{ name: string; type: string }[]>([]);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(isDesktop ? 4 : 10);
    const { t } = useTranslation("global");

    // API Endpoints
    const getExercisesUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/exercises/exercises`;
    const getPlansUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/plans`;

    // Fetch exercises and workout plans
    const { data: exercisesData, isLoading: loadingExercises } = useApiGet<{ status: string; message: any }>(['exercises'], getExercisesUrl);
    const { data: plansData, isLoading: loadingPlans } = useApiGet<{ status: string; message: any }>(['plans'], getPlansUrl);

    const isLoading = loadingExercises || loadingPlans;

    // Extract names and types from API data
    const exercises = exercisesData?.message.map((item: any) => ({ name: item.name, type: 'Exercise' })) || [];
    const plans = plansData?.message.map((item: any) => ({ name: item.name, type: 'Workout Plan' })) || [];

    // Combine all results
    const allResults = [...exercises, ...plans];

    // Filter results based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredResults([]);
            return;
        }

        setFilteredResults(
            allResults.filter((result) =>
                result.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, allResults]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setVisibleCount(isDesktop ? 4 : 10); // Reset visible count on new search
    };

    const handleBlur = () => {
        setSearchOpen(false);
        setSearchTerm('');
    };

    const loadMore = () => {
        setVisibleCount((prev) => prev + (isDesktop ? 4 : 10));
    };

    if (isDesktop) {
        return (
            <div className="relative flex items-center justify-end h-full">
                <div className="relative">
                    {!isSearchOpen && (
                        <button
                            onClick={() => setSearchOpen(true)}
                            aria-label="Open search"
                            className="flex items-center justify-center text-gray-300 hover:text-white focus:outline-none"
                        >
                            <FaSearch size={20} />
                        </button>
                    )}

                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        placeholder={isLoading ? t("Navbar.loading") : t("Navbar.searchText")}
                        className={`absolute right-0 top-1/2 transform -translate-y-1/2 h-10 px-4 rounded-full bg-gray-700 text-xl text-white outline-none transition-all duration-300 ease-in-out ${isSearchOpen ? 'w-64 opacity-100' : 'w-0 opacity-0'
                            }`}
                        onBlur={handleBlur}
                        onFocus={() => setSearchOpen(true)}
                        disabled={isLoading}
                    />

                    {/* Loading Spinner */}
                    {isLoading && (
                        <div className="absolute right-0 top-10 bg-white p-3 text-black rounded-lg shadow-lg">
                            <FaSpinner className="animate-spin text-xl text-emerald-500" />
                        </div>
                    )}

                    {/* Search Results */}
                    {isSearchOpen && searchTerm && !isLoading && filteredResults.length > 0 && (
                        <div className="absolute mt-6 bg-white border border-gray-300 rounded-lg shadow-lg z-50 right-0 w-64 p-4 max-h-60 overflow-y-auto">
                            {filteredResults.slice(0, visibleCount).map((result, index) => (
                                <React.Fragment key={index}>
                                    <div
                                        className="p-2 text-black text-base hover:bg-gray-200 cursor-pointer rounded-md"
                                        onMouseDown={() => setSearchTerm(result.name)}
                                    >
                                        <span className="font-semibold">{result.name}</span>
                                        <div className="text-sm text-gray-500">{result.type}</div>
                                    </div>
                                    {index < visibleCount - 1 && <hr className="border-gray-300" />}
                                </React.Fragment>
                            ))}
                            {visibleCount < filteredResults.length && (
                                <button
                                    onClick={loadMore}
                                    className="w-full text-center text-blue-600 hover:underline mt-2"
                                >
                                    {t("Search.LoadMore")}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full">
            <div className="relative w-full flex items-center">
                <button
                    onClick={() => setIsFullScreen(true)}
                    aria-label="Search"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                >
                    <FaSearch size={20} />
                </button>
            </div>

            {isFullScreen && (
                <div className="fixed inset-0 bg-white flex flex-col items-center p-6 z-50">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        placeholder={t("Navbar.searchText")}
                        className="w-full p-4 text-lg border-b-2 border-gray-400 outline-none"
                    />
                    <div className="mt-4 w-full bg-white flex items-center justify-center">
                        {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
                                <FaSpinner className="text-emerald-500 text-5xl animate-spin" />
                            </div>
                        ) : filteredResults.length === 0 ? (
                            <p className="p-4 text-gray-500">{t("Navbar.startTypingSrc")}</p>
                        ) : (
                            <div className="w-full max-w-md bg-white rounded-lg p-4 max-h-80 overflow-y-auto">
                                {filteredResults.slice(0, visibleCount).map((result, index) => (
                                    <React.Fragment key={index}>
                                        <div className="p-2 text-black hover:bg-gray-200 cursor-pointer">
                                            <span className="font-semibold">{result.name}</span>
                                            <div className="text-sm text-gray-500">{result.type}</div>
                                        </div>
                                        {index < visibleCount - 1 && <hr className="border-gray-300" />}
                                    </React.Fragment>
                                ))}
                                {visibleCount < filteredResults.length && (
                                    <button
                                        onClick={loadMore}
                                        className="w-full text-center text-blue-600 hover:underline mt-2"
                                    >
                                        {t("Search.LoadMore")}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <button className="mt-4 text-red-500" onClick={() => setIsFullScreen(false)}>
                        {t("Navbar.close")}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
