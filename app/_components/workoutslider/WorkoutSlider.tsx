'use client';

import React, { useState } from 'react';
import { AiOutlineLeft, AiOutlineStar } from 'react-icons/ai'; // Import icons
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

const workouts = [
    { id: 1, title: "Squat Movement Exercise", duration: "12 minutes", level: "Intermediate", image: "/images/workoutslider/gymwomen.jpg" },
    { id: 2, title: "Full Body Stretching", duration: "6 minutes", level: "Intermediate", image: "/images/workoutslider/gymwomen.jpg" },
    { id: 3, title: "Yoga Women Exercise", duration: "8 minutes", level: "Intermediate", image: "/images/workoutslider/gymwomen.jpg" },
    { id: 4, title: "Yoga Movement Exercise", duration: "10 minutes", level: "Intermediate", image: "/images/workoutslider/gymwomen.jpg" },
    { id: 5, title: "Abdominal Exercise", duration: "10 minutes", level: "Intermediate", image: "/images/workoutslider/gymwomen.jpg" },
];

const WorkoutLevels = () => {
    const [activeLevel, setActiveLevel] = useState<string>('Intermediate');
    const router = useRouter(); // Initialize useRouter

    const handleLevelChange = (level: string) => {
        setActiveLevel(level);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <button 
                    onClick={() => router.push('/home')}
                    className="flex items-center text-gray-600 hover:text-green-600"
                >
                    <AiOutlineLeft className="h-6 w-6 mr-2" />
                </button>
                <h2 className="text-3xl font-bold">Workout Levels</h2> {/* Center title */}
                <button className="flex items-center justify-center border border-gray-300 rounded-full p-2">
                    <span className="text-lg">...</span> {/* Placeholder for additional options */}
                </button>
            </div>
            <div className="flex flex-wrap justify-center space-x-4 mb-6">
                <button 
                    className={`py-3 px-5 rounded-full transition-all duration-300 ${activeLevel === 'Beginner' ? 'bg-gradient-to-r from-green-400 to-green-700 text-white shadow-lg' : 'bg-gray-200 text-black'}`}
                    onClick={() => handleLevelChange('Beginner')}
                >
                    Beginner
                </button>
                <button 
                    className={`py-3 px-5 rounded-full transition-all duration-300 ${activeLevel === 'Intermediate' ? 'bg-gradient-to-r from-green-400 to-green-700 text-white shadow-lg' : 'bg-gray-200 text-black'}`}
                    onClick={() => handleLevelChange('Intermediate')}
                >
                    Intermediate
                </button>
                <button 
                    className={`py-3 px-5 rounded-full transition-all duration-300 ${activeLevel === 'Advanced' ? 'bg-gradient-to-r from-green-400 to-green-700 text-white shadow-lg' : 'bg-gray-200 text-black'}`}
                    onClick={() => handleLevelChange('Advanced')}
                >
                    Advanced
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {workouts.map(workout => (
                    <div key={workout.id} className="relative bg-white rounded-lg shadow-lg overflow-hidden">
                        <img src={workout.image} alt={workout.title} className="w-full h-48 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <h3 className="text-xl font-semibold">{workout.title}</h3>
                            <p className="text-base">{workout.duration} | {workout.level}</p>
                        </div>
                        <button 
                            className="absolute bottom-4 right-4 bg-gray-300 rounded-full p-3" 
                        >
                            <AiOutlineStar className="h-6 w-6" /> {/* Save icon */}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorkoutLevels;
