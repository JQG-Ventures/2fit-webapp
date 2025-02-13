'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaSpinner } from 'react-icons/fa';


interface PopularExercisesSectionProps {
    workouts: any[];
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
    title,
    workoutCount,
    image,
    exercises,
    startText,
    workoutId
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = () => {
        setIsLoading(true);
    };

    return (
        <div
            className="bg-white p-10 rounded-xl shadow-md mb-6 lg:mb-0 lg:w-full overflow-hidden transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl active:scale-95"
        >
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-in-out"
                style={{ backgroundImage: `url(${image})` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black opacity-50 to-transparent transition-opacity duration-300 ease-in-out"></div>

            <div className="relative flex flex-col space-y-5 w-[50%] justify-between z-20">
                <h2 className="text-3xl tracking-wide text-white font-semibold overflow-hidden text-ellipsis whitespace-nowrap hover:whitespace-normal hover:overflow-visible hover:text-clip hover:bg-gray-800 hover:p-2 transition-all duration-300">
                    {title}
                </h2>
                <h4 className="text-xl text-gray-200">
                    {workoutCount} {exercises}
                </h4>

                <Link href={`/workouts/plan/${workoutId}`} passHref>
                    <button
                        className="bg-green-600 py-3 px-6 text-xl text-white rounded-full flex items-center justify-center"
                        style={{ width: 'fit-content' }}
                        onClick={handleClick}
                    >
                        {isLoading ? (
                            <FaSpinner className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"/>
                        ) : (
                            startText
                        )}
                    </button>
                </Link>
            </div>
        </div>
    );
};

const PopularExercisesSection: React.FC<PopularExercisesSectionProps> = ({ workouts }) => {
    const displayedWorkoutsCol = workouts.slice(0, 3);
    const { t } = useTranslation('global');
    
    return (
        <div className="w-full my-16 md:px-12 lg:px-20">
            <div className='flex flex-row justify-between'>
                <h2 className="text-3xl font-bold mb-8 lg:text-3xl">{t('workouts.PopularExercisesSection.popularExerciseTitle')}</h2>
                <span>{t('workouts.PopularExercisesSection.seeDetails')}</span>
            </div>

            <div className="flex flex-col gap-6">
                {displayedWorkoutsCol.map((workout) => (
                    <WorkoutCard
                        key={workout.title}
                        title={workout.title}
                        workoutCount={workout.workoutCount}
                        image={workout.image}
                        exercises={t('workouts.PopularExercisesSection.exercises')}
                        startText={t('workouts.PopularExercisesSection.start')}
                        workoutId={workout.id}
                    />
                ))}
            </div>

            {workouts.length < 1 ? (
                <div className="flex items-center h-full text-center pt-4">
                    <p className="text-gray-500 text-1xl mb-4">
                        {t('workouts.PopularExercisesSection.PopularSectionEmpty')}
                    </p>
                </div>
            ) : null}
        </div>
    );
};

export default PopularExercisesSection;
