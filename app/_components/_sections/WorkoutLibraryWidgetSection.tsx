'use client';

import React from 'react';

interface WorkoutCardProps {
    title: string;
    workoutCount: number;
    description: string;
    image: string;
}

interface WorkoutLibrarySectionProps {
    workouts: WorkoutCardProps[];
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ title, workoutCount, description, image }) => (
    <div
        className="relative bg-white p-6 rounded-xl shadow-md mb-6 lg:mb-0 lg:w-full overflow-hidden transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl active:scale-95"
    >
        <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-in-out"
            style={{ backgroundImage: `url(${image})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black opacity-50 to-transparent transition-opacity duration-300 ease-in-out"></div>

        <div className="relative z-5">
            <h2 className="text-lg text-gray-200">{workoutCount}+ workouts</h2>
            <h4 className="text-2xl tracking-wide text-white font-semibold mb-4">{title}</h4>
            <p className="text-xl text-gray-200">{description}</p>
        </div>
    </div>
);

const WorkoutLibrarySection: React.FC<WorkoutLibrarySectionProps> = ({ workouts }) => {
    const displayedWorkoutsCol = workouts.slice(0, 3);
    const displayedWorkoutsGrid = workouts.slice(0, 6);

    return (
        <div className="relative bg-gray-100 p-8 rounded-xl my-16 md:px-12 lg:px-20">
            <div className="relative z-5 p-6 lg:p-12">
                <h2 className="text-2xl font-bold mb-8 lg:text-3xl">Explore Our Workout Library</h2>

                {/* For mobile view */}
                <div className="block lg:hidden mb-12">
                    <div className="flex flex-col gap-6">
                        {displayedWorkoutsCol.map((workout) => (
                            <WorkoutCard 
                                key={workout.title}
                                title={workout.title} 
                                workoutCount={workout.workoutCount} 
                                description={workout.description}
                                image={workout.image}
                            />
                        ))}
                    </div>
                </div>

                {/* For desktop view */}
                <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6 mb-12">
                    {displayedWorkoutsGrid.map((workout) => (
                        <WorkoutCard 
                            key={workout.title}
                            title={workout.title} 
                            workoutCount={workout.workoutCount} 
                            description={workout.description}
                            image={workout.image}
                        />
                    ))}
                </div>

                {/* Conditionally display this section based on the number of workouts */}
                {workouts.length > 0 ? (
                    <div className="text-center pt-10">
                        <p className="text-gray-700 text-lg mb-4">Discover more workouts tailored to your fitness goals in our extensive library.</p>
                        <button className="bg-green-500 text-white px-8 py-4 rounded-full text-xl font-semibold hover:bg-green-700 transition-colors">
                            Open Workout Library
                        </button>
                    </div>
                ) : (
                    <div className="text-center pt-4">
                        <p className="text-gray-500 text-1xl mb-4">
                            Soon you will have tons of workouts to get you fit, stay tuned!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkoutLibrarySection;
