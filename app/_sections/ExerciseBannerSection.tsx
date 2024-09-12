'use client';

import React, { useState } from 'react';
import { AiFillHeart, AiOutlineReload } from 'react-icons/ai';

const ExerciseBannerSection = ({ hasRoutine, exercises }) => {
    const [savedMessage, setSavedMessage] = useState(null);

    const handleSaveClick = (name) => {
        setSavedMessage(`${name} saved!`);
        setTimeout(() => {
            setSavedMessage(null);
        }, 2000);
    };

    return (
        <div className="exercise-banner-section px-6 pt-10 md:px-12 lg:px-20">
            <h2 className="text-2xl font-bold mb-6 lg:text-3xl">
                {hasRoutine ? "What's the plan for today?" : "Explore Workouts"}
            </h2>
            <div className="flex space-x-4 overflow-x-scroll lg:space-x-6 lg:grid lg:grid-cols-3 lg:gap-6">
                {exercises.map((exercise, index) => (
                    <div
                        key={index}
                        className="min-w-[280px] h-[350px] bg-black text-white rounded-lg relative overflow-hidden group lg:w-full"
                        style={{ backgroundImage: `url(${exercise.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                        <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-30 transition-opacity"></div>
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                            <p className="font-bold text-xl whitespace-normal break-words max-w-[70%] lg:text-2xl">
                                {exercise.name}
                            </p>
                            <div className="flex space-x-4">
                                <button 
                                    onClick={() => handleSaveClick(exercise.name)}
                                    className="p-2 bg-gray-700 rounded-full transition-transform transform hover:scale-110 active:scale-90"
                                >
                                    <AiFillHeart size={24} />
                                </button>
                                <button className="p-2 bg-green-500 rounded-full">
                                    <AiOutlineReload size={24} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {savedMessage && (
                <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
                        {savedMessage}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExerciseBannerSection;
