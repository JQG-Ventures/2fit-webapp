'use client';
import React, { useState, useEffect } from 'react';
import { SlOptionsVertical } from "react-icons/sl";
import { CiBookmarkMinus } from "react-icons/ci";
import { FaArrowLeftLong } from "react-icons/fa6";
import { ImSpinner8 } from 'react-icons/im';
import { useRouter } from 'next/navigation';
import { getExercisesByLevel } from '../_services/workoutService';

const levels = ['beginner', 'intermediate', 'advanced'];
const WorkoutSliderPage = () => {
    const [activeLevel, setActiveLevel] = useState<string>('beginner');
    const [workouts, setWorkouts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleLevelChange = async (level: string) => {
        const lowercaseLevel = level.toLowerCase();
        setActiveLevel(lowercaseLevel);
        
        // Fetch exercises for the selected level
        setLoading(true);
        const fetchedExercises = await getExercisesByLevel(lowercaseLevel);
        console.log('Fetched Exercises:', fetchedExercises); 

        // Check if the array is empty
        if (fetchedExercises.message && fetchedExercises.message.length === 0) {
            setMessage("We are creating more challenges for you, stay tuned! :)"); // Set the message
            setWorkouts([]); // Clear workouts to avoid displaying old data
        } else {
            setWorkouts(fetchedExercises.message || []);
            setMessage(null); // Clear the message if data is available
        }
        setLoading(false);
    };

    useEffect(() => {
        const fetchInitialExercises = async () => {
            setLoading(true);
            const fetchedExercises = await getExercisesByLevel(activeLevel);
            console.log('Fetched Initial Exercises:', fetchedExercises);

            // Check if the array is empty
            if (fetchedExercises.message && fetchedExercises.message.length === 0) {
                setMessage("We are creating more challenges for you. stay tuned! :)"); // Set the message
                setWorkouts([]); // Clear workouts to avoid displaying old data
            } else {
                setWorkouts(fetchedExercises.message || []);
                setMessage(null); // Clear the message if data is available
            }
            setLoading(false);
        };

        fetchInitialExercises();
    }, [activeLevel]);

    return (
        <div className="flex flex-col h-screen bg-white p-10 items-center">
            <div className="flex items-center justify-between h-[10%] w-full lg:max-w-3xl">
                <div className='w-[90%] flex flex-row'>
                    <button
                        onClick={() => router.push('/home')}
                        className="flex items-center text-gray-600 hover:text-green-600"
                    >
                        <FaArrowLeftLong className="h-8 w-8" />
                    </button>
                    <h2 className="text-4xl font-semibold ml-8">Workout Levels</h2>
                </div>
                <button className="flex items-center justify-center">
                    <SlOptionsVertical className="h-6 w-6" />
                </button>
            </div>
            <div className="flex flex-wrap justify-center space-x-4 mb-6">
                {levels.map((level) => (
                    <button
                        key={level}
                        className={`py-3 px-5 rounded-full transition-all duration-300 
                            ${activeLevel === level ? 
                                'bg-gradient-to-r from-green-400 to-green-700 text-white shadow-lg' : 
                                'border border-green-400 text-green-700 bg-transparent shadow-lg'}`}
                        onClick={() => handleLevelChange(level)}
                    >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-[80%]">
                    <ImSpinner8 className="animate-spin h-16 w-16 text-green-600" />
                </div>
            ) : message ? (
                <div className="border-dashed p-8 rounded-lg flex justify-center items-center h-[80%]">
                    <p className="text-gray-500 text-xl">{message}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 h-[80%] w-full lg:max-w-3xl pt-8">
                    {workouts.map(workout => (
                        <div key={workout._id} className="relative bg-white rounded-lg shadow-lg overflow-hidden">
                            <img src={workout.image_url} alt={workout.name} className="w-full h-48 object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                <h3 className="text-3xl font-semibold">{workout.name}</h3>
                                <p className="text-base">{workout.duration} minutes | {workout.level}</p>
                            </div>
                            <button
                                className="absolute bottom-4 right-4 rounded-full p-3" 
                            >
                                <CiBookmarkMinus className="h-8 w-8 text-white" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WorkoutSliderPage;
