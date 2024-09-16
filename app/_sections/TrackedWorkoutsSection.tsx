'use client';

import React, { useState } from 'react';
import { FaTimes, FaCheck } from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const TrackedWorkoutsSection = ({ workouts }: { workouts: any[] }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <section className="tracked-workouts-section bg-white p-6 rounded-xl shadow-xl my-16 relative md:px-12 lg:px-20">
            <h2 className="text-2xl font-bold mb-8 lg:text-3xl">Workouts This Week</h2>
            <div className="flex justify-between items-center lg:grid lg:grid-cols-7 lg:gap-6">
                {workouts.map((workout, index) => (
                    <div
                        key={index}
                        className="relative text-center"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <p className="mb-2 font-semibold text-gray-700 lg:text-lg">{daysOfWeek[index]}</p>
                        <div className="flex justify-center items-center w-12 h-12 relative">
                            {workout.status === 'notCompleted' && <FaTimes className="text-red-500 text-lg" />}
                            {workout.status === 'inProgress' && (
                                <CircularProgressbar
                                    value={workout.progress}
                                    text={`${workout.progress}%`}
                                    styles={buildStyles({
                                        pathColor: workout.progress >= 50 ? 'green' : 'red',
                                        textColor: '#333',
                                        trailColor: '#f0f0f0',
                                        backgroundColor: '#fff',
                                    })}
                                />
                            )}
                            {workout.status === 'completed' && (
                                <div className="w-10 h-10 flex items-center justify-center bg-green-500 rounded-full">
                                    <FaCheck className="text-white text-lg" />
                                </div>
                            )}
                        </div>
                        {hoveredIndex === index && (
                            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-sm rounded-md px-2 py-1">
                                {workout.name}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TrackedWorkoutsSection;
