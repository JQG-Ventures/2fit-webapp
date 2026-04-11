'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface GuidedWorkout {
    name: string;
    image_url: string;
    muscles: string[];
}

const GuidedWorkoutsSection = ({ workouts }: { workouts: GuidedWorkout[] }) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { t } = useTranslation('global');

    useEffect(() => {
        const slider = sliderRef.current;
        let interval: ReturnType<typeof setInterval> | null = null;

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
                        type="button"
                        onClick={handleViewAll}
                        className="text-blue-600 hover:underline lg:text-lg"
                        aria-label={t('home.GuidedWorkoutsSection.viewall')}
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
                    className="flex scroll-smooth space-x-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory lg:grid lg:grid-cols-3 lg:gap-6"
                >
                    {workouts.map((workout, index) => (
                        <div
                            key={index}
                            className="min-w-[300px] h-[250px] rounded-lg relative snap-start lg:w-full overflow-hidden transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95"
                        >
                            <Image
                                src={workout.image_url}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 300px, 33vw"
                            />
                            <div className="absolute inset-0 bg-black opacity-50 z-[1]"></div>
                            <div className="absolute bottom-4 left-4 right-4 z-[2]">
                                <h3 className="text-xl text-gray-200 mb-4 font-semibold lg:text-3xl">
                                    {workout.name}
                                </h3>
                                <ul className="flex flex-wrap space-x-4 text-sm lg:text-base">
                                    {workout.muscles.map((muscle, idx) => (
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
