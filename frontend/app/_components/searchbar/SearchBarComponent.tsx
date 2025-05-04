'use client';

import { useApiGet } from '@/app/utils/apiClient';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import Image from 'next/image';
import { useDebounce } from '@/app/utils/utils';
import { useRouter } from 'next/navigation';

type SearchBarProps = {
    isDesktop?: boolean;
};

const SearchBar: React.FC<SearchBarProps> = ({ isDesktop = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredResults, setFilteredResults] = useState<
        { name: string; type: string; image: string; id: string }[]
    >([]);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(isDesktop ? 4 : 10);
    const [loadingMore, setLoadingMore] = useState(false);
    const { t } = useTranslation('global');
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const router = useRouter();

    const containerRef = useRef<HTMLDivElement>(null);
    const getExercisesUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/exercises/exercises`;
    const getPlansUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/plans`;

    const { data: exercisesData, isLoading: loadingExercises } = useApiGet<{
        status: string;
        message: any;
    }>(['exercises'], getExercisesUrl);
    const { data: plansData, isLoading: loadingPlans } = useApiGet<{
        status: string;
        message: any;
    }>(['plans'], getPlansUrl);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const isLoading = loadingExercises || loadingPlans;

    const handleItemClick = (id: string, type: string) => {
        setLoadingId(id);

        const route =
            type.toLowerCase() === 'exercise' ? `/exercises/${id}` : `/workouts/plan/${id}`;

        setTimeout(() => {
            router.push(route);
            setSearchOpen(false);
        }, 500);
    };

    const exercises = useMemo(() => {
        return (
            exercisesData?.message.map((item: any) => ({
                name: item.name,
                type: 'Exercise',
                image: item.image_url,
            })) || []
        );
    }, [exercisesData]);

    const plans = useMemo(() => {
        return (
            plansData?.message.map((item: any) => ({
                name: item.name,
                type: 'Workout Plan',
                image: item.image_url,
                id: item._id,
            })) || []
        );
    }, [plansData]);

    const allResults = useMemo(() => {
        return [...exercises, ...plans];
    }, [exercises, plans]);

    useEffect(() => {
        if (debouncedSearchTerm.trim() === '') {
            setFilteredResults([]);
            return;
        }

        const newResults = allResults.filter((result) =>
            result.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
        );
        setFilteredResults(newResults);
    }, [debouncedSearchTerm, allResults]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setVisibleCount(isDesktop ? 4 : 10);
    };

    const handleBlur = () => {
        setSearchOpen(false);
        setSearchTerm('');
    };

    const handleScroll = useCallback(() => {
        if (!containerRef.current || loadingMore) return;

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

        if (scrollTop + clientHeight >= scrollHeight - 10) {
            setLoadingMore(true);
            setTimeout(() => {
                setVisibleCount((prev) => prev + (isDesktop ? 4 : 10));
                setLoadingMore(false);
            }, 500);
        }
    }, [loadingMore, isDesktop]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [handleScroll]);

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
                        placeholder={isLoading ? t('Navbar.loading') : t('Navbar.searchText')}
                        className={`absolute right-0 top-1/2 transform -translate-y-1/2 h-10 px-4 rounded-full bg-gray-700 text-xl text-white outline-none transition-all duration-300 ease-in-out ${
                            isSearchOpen ? 'w-64 opacity-100' : 'w-0 opacity-0'
                        }`}
                        onBlur={handleBlur}
                        onFocus={() => setSearchOpen(true)}
                        disabled={isLoading}
                    />

                    {isLoading && (
                        <div className="absolute right-0 top-10 bg-white p-3 text-black rounded-lg shadow-lg">
                            <FaSpinner className="animate-spin text-xl text-emerald-500" />
                        </div>
                    )}

                    {isSearchOpen && searchTerm && !isLoading && filteredResults.length > 0 && (
                        <div
                            ref={containerRef}
                            className="absolute mt-6 bg-white border border-gray-300 rounded-lg shadow-lg z-50 
                            right-0 min-w-[20rem] p-5 max-h-72 overflow-y-auto transform translate-x-[-10%]"
                            onScroll={handleScroll}
                        >
                            {filteredResults.slice(0, visibleCount).map((result, index) => (
                                <React.Fragment key={index}>
                                    <div
                                        className="p-4 text-black text-lg hover:bg-gray-200 cursor-pointer rounded-md transition-opacity duration-300 relative"
                                        onMouseDown={(e) => e.preventDefault()} // Prevents blur event from closing the search results
                                        onClick={() => handleItemClick(result.id, result.type)} // Click event now works properly
                                    >
                                        <div className="flex flex-row space-x-4">
                                            {loadingId === result.id ? ( // Show loading animation if clicked
                                                <div className="flex justify-center items-center w-full">
                                                    <FaSpinner className="text-emerald-500 text-3xl animate-spin" />
                                                </div>
                                            ) : (
                                                <>
                                                    <Image
                                                        src={result.image}
                                                        alt={result.name}
                                                        layout="intrinsic"
                                                        width={64}
                                                        height={64}
                                                        className="w-1/4 h-full object-cover rounded-lg"
                                                    />
                                                    <div className="w-3/4 flex flex-col justify-center">
                                                        <span className="font-semibold">
                                                            {result.name}
                                                        </span>
                                                        <div className="text-sm text-gray-500">
                                                            {result.type}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {index < visibleCount - 1 && <hr className="border-gray-300" />}
                                </React.Fragment>
                            ))}
                            {loadingMore && (
                                <div className="flex justify-center py-3">
                                    <FaSpinner className="animate-spin text-emerald-500 text-2xl" />
                                </div>
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
                    className="transform -translate-y-1/2 text-gray-500 focus:outline-none"
                >
                    <FaSearch size={20} />
                </button>
            </div>

            {isFullScreen && (
                <div className="fixed inset-0 bg-white flex flex-col items-center p-6 pt-6 z-50">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        placeholder={t('Navbar.searchText')}
                        className="w-full p-4 text-2xl border-b-2 border-gray-400 outline-none h-[10%]"
                    />
                    <div
                        ref={containerRef}
                        className="mt-4 w-full h-[85%] bg-white flex items-start justify-center overflow-y-auto"
                    >
                        {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
                                <FaSpinner className="text-emerald-500 text-5xl animate-spin" />
                            </div>
                        ) : filteredResults.length === 0 ? (
                            <p className="p-4 text-gray-500">{t('Navbar.startTypingSrc')}</p>
                        ) : (
                            <div className="w-full rounded-lg p-4">
                                {filteredResults.slice(0, visibleCount).map((result, index) => (
                                    <React.Fragment key={index}>
                                        <div
                                            className="p-4 text-black hover:bg-gray-200 cursor-pointer transition-opacity duration-300"
                                            onClick={() => handleItemClick(result.id, result.type)}
                                        >
                                            <div className="flex flex-row space-x-4">
                                                {loadingId === result.id ? ( // Show loading animation if clicked
                                                    <div className="flex justify-center items-center w-full">
                                                        <FaSpinner className="text-emerald-500 text-3xl animate-spin" />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Image
                                                            src={result.image}
                                                            alt={result.name}
                                                            layout="intrinsic"
                                                            width={64}
                                                            height={64}
                                                            className="w-1/4 h-full object-cover rounded-lg"
                                                        />
                                                        <div className="w-3/4 flex flex-col justify-center">
                                                            <span className="font-semibold">
                                                                {result.name}
                                                            </span>
                                                            <div className="text-sm text-gray-500">
                                                                {result.type}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {index < visibleCount - 1 && (
                                            <hr className="border-gray-300" />
                                        )}
                                    </React.Fragment>
                                ))}
                                {loadingMore && (
                                    <div className="flex justify-center py-2">
                                        <FaSpinner className="animate-spin text-emerald-500 text-xl" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <button className="mt-4 text-red-500" onClick={() => setIsFullScreen(false)}>
                        {t('Navbar.close')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default React.memo(SearchBar);
