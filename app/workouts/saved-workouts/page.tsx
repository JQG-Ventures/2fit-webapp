'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeftLong } from "react-icons/fa6";
import { CiBookmarkMinus } from "react-icons/ci";
import { ImSpinner8 } from 'react-icons/im';
import { useApiGet } from '../../utils/apiClient';

const SavedWorkouts: React.FC = () => {
    const router = useRouter();
    const [clickedStates, setClickedStates] = React.useState<{ [key: string]: boolean }>({});
    const [message, setMessage] = React.useState<string | null>(null);

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/saved`;
    
    // Configurar el hook `useApiGet` para realizar la solicitud
    const { data: savedWorkouts, isLoading, isError } = useApiGet<{ status: string; message: any[] }>(
        ['savedWorkouts'],
        apiUrl,
        {
            axiosConfig: {
                headers: {
                    Authorization: `Bearer YOUR_AUTH_TOKEN`, // Reemplaza con tu token o usa una variable de entorno
                },
            },
        }
    );

    // Establecer el estado inicial para los workouts guardados
    useEffect(() => {
        if (savedWorkouts && savedWorkouts.message) {
            const initialClickedStates = savedWorkouts.message.reduce((acc, workout) => {
                acc[workout._id] = true; // Marcar como "guardado" inicialmente
                return acc;
            }, {} as { [key: string]: boolean });
            setClickedStates(initialClickedStates);
        }
    }, [savedWorkouts]);

    const handleBookmarkClick = (workoutId: string) => {
        setClickedStates(prevStates => ({
            ...prevStates,
            [workoutId]: !prevStates[workoutId],
        }));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[80%]">
                <ImSpinner8 className="animate-spin h-16 w-16 text-green-600" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="border-dashed p-8 rounded-lg flex justify-center items-center h-[80%]">
                <p className="text-red-500 text-xl">Failed to fetch saved workouts. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-between items-center bg-white h-screen p-14 lg:pt-[10vh]">
            <div className="h-[10%] flex flex-row justify-left space-x-8 items-center w-full lg:max-w-4xl">
                <button
                    onClick={() => router.push('/home')}
                    className="flex items-center text-gray-600 hover:text-green-600"
                >
                    <FaArrowLeftLong className="h-8 w-8" />
                </button>
                <h2 className="text-4xl font-semibold ml-8">My Bookmark</h2>
            </div>

            {savedWorkouts && savedWorkouts.message.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8 h-[90%] w-full lg:max-w-4xl pt-8">
                    {savedWorkouts.message.map((workout) => (
                        <div key={workout._id} className="relative bg-white rounded-xl shadow-lg overflow-hidden h-56">
                            <img src={workout.image_url} alt={workout.name} className="w-full h-56 object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                <h3 className="text-2xl font-semibold">{workout.name}</h3>
                                <p className="text-xl">{workout.duration_weeks * 7} minutes | {workout.level}</p>
                            </div>
                            <button
                                className="absolute bottom-6 right-2 p-4"
                                onClick={() => handleBookmarkClick(workout._id)}
                            >
                                <div className={`h-10 w-10 flex items-center justify-center rounded-full ${clickedStates[workout._id] ? 'bg-white' : 'bg-transparent'}`}>
                                    <CiBookmarkMinus className={`h-8 w-8 ${clickedStates[workout._id] ? 'text-black' : 'text-white'}`} />
                                </div>
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="border-dashed p-8 rounded-lg flex justify-center items-center h-[90%]">
                    <p className="text-gray-500 text-xl">No saved workouts found.</p>
                </div>
            )}
        </div>
    );
};

export default SavedWorkouts;
