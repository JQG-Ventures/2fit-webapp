'use client';

import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const GuidedWorkoutsSection = ({ workouts }: { workouts: any[] }) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { t } = useTranslation('global');

    useEffect(() => {
        const slider = sliderRef.current;
        let interval: NodeJS.Timeout;

        if (slider && workouts.length > 0) {
            interval = setInterval(() => {
                slider.scrollBy({ left: slider.offsetWidth, behavior: 'smooth' });
                if (slider.scrollLeft + slider.offsetWidth >= slider.scrollWidth) {
                    slider.scrollTo({ left: 0 });
                }
            }, 3000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [workouts]);

    const handleViewAll = () => router.push('/workouts');

    return (
        <div className="guided-workouts-section pt-6 px-4 md:px-12 lg:px-20">
            <div className="flex justify-between items-center">
                <div className="ml-2 flex-1">
                    <h2 className="text-2xl mb-2 font-bold lg:text-3xl">
                        {t('home.GuidedWorkoutsSection.guidedworkoutstitle')}
                    </h2>
                    <p className="text-lg text-gray-600 mb-6 lg:text-xl">
                        {t('home.GuidedWorkoutsSection.guidedworkoutsdescription')}
                    </p>
                </div>
                <div className="flex-none">
                    <button
                        onClick={handleViewAll}
                        className="text-blue-600 hover:underline lg:text-lg"
                    >
                        {t('home.GuidedWorkoutsSection.viewall')}
                    </button>
                </div>
            </div>

            {workouts.length === 0 ? (
                <div className="flex justify-center items-center h-48 bg-gray-100 rounded-lg">
                    <p className="text-gray-500 text-lg lg:text-xl">
                        {t('home.GuidedWorkoutsSection.noworkoutmessage')}
                    </p>
                </div>
            ) : (
                <div
                    ref={sliderRef}
                    className="flex space-x-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory lg:grid lg:grid-cols-3 lg:gap-6"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {workouts.map((workout, index) => (
                        <div
                            key={index}
                            className="min-w-[300px] h-[250px] bg-cover bg-center rounded-lg relative snap-start lg:w-full transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 active:bg-opacity-80"
                            style={{ backgroundImage: `url(${workout.image_url})` }}
                        >
                            <div className="absolute inset-0 bg-black opacity-50"></div>
                            <div className="absolute bottom-4 left-4 right-4">
                                <h3 className="text-xl text-gray-200 mb-4 font-semibold lg:text-3xl">
                                    {workout.name}
                                </h3>
                                <ul className="flex flex-wrap space-x-4 text-sm lg:text-base">
                                    {workout.muscles.map((muscle: string, idx: string) => (
                                        <li key={idx} className="bg-white px-3 py-1 rounded">
                                            {muscle}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GuidedWorkoutsSection;
