'use client';

import React, { useState, useEffect } from 'react';
import { SlOptionsVertical } from "react-icons/sl";
import { CiBookmarkMinus } from "react-icons/ci";
import { FaArrowLeftLong } from "react-icons/fa6";
import { ImSpinner8 } from 'react-icons/im';
import { useRouter } from 'next/navigation';
import Modal from '../../_components/profile/modal';
import ConfirmationModal from '../../_components/modals/confirmationModal';
import AnimatedList from '../../_components/animations/AnimatedList';
import { useApiGet } from '../../utils/apiClient';
import { useTranslation } from 'react-i18next';
import { useSaveWorkout, useDeleteWorkout } from '@/app/_services/userService';

const WorkoutLibrarySection = () => {
    const { t } = useTranslation('global');
    const levels = ['beginner', 'intermediate', 'advanced'];
    const translatedLevels = t('WorkoutLibrary.levels', { returnObjects: true });

    const [activeLevel, setActiveLevel] = useState<string>('beginner');
    const [message, setMessage] = useState<string | null>(null);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [savedWorkouts, setSavedWorkouts] = useState<string[]>([]);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

    const router = useRouter();

    const { mutate: saveWorkout } = useSaveWorkout();
    const { mutate: deleteWorkout } = useDeleteWorkout();

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/library/difficulty/${activeLevel}`;
    const savedWorkoutPlansUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/saved`;


    const { data: workouts, isLoading, isError } = useApiGet<{ status: string; message: any[] }>(
        ['workoutLibrary', activeLevel],
        apiUrl
    );


    const { data: savedWorkoutsData, isLoading: loadingSavedWorkouts } = useApiGet<{ status: string; message: any[] }>(
        ['savedWorkouts'],
        savedWorkoutPlansUrl
    );

    useEffect(() => {
        if (savedWorkoutsData?.message) {
            const savedIds = savedWorkoutsData.message.map(workout => workout._id);
            setSavedWorkouts(savedIds);
        }
    }, [savedWorkoutsData]);

    useEffect(() => {
        if (!isLoading && workouts && workouts.message.length === 0) {
            setMessage(t('WorkoutLibrary.MessageNoExercises'));
        }
    }, [workouts, isLoading]);

    const handleCloseModal = () => {
        setIsErrorModalOpen(false);
        router.push('/home');
    };

    const handleLevelChange = (level: string) => {
        setActiveLevel(level.toLowerCase());
        setMessage(null);
    };

    const handleBookmarkClick = (workoutId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        if (savedWorkouts.includes(workoutId)) {
            setSelectedWorkoutId(workoutId);
            setModalOpen(true);
        } else {
            saveWorkout(
                { queryParams: { workout_id: workoutId } },
                {
                    onSuccess: () => {
                        setSavedWorkouts(prev => [...prev, workoutId]);
                    },
                    onError: (error: any) => {
                        console.error('Error saving workout:', error);
                    }
                }
            );
        }
    };

    const handleConfirmDelete = () => {
        if (selectedWorkoutId) {
            deleteWorkout(
                { queryParams: { workout_id: selectedWorkoutId } },
                {
                    onSuccess: () => {
                        setSavedWorkouts(prev => prev.filter(id => id !== selectedWorkoutId));
                        setModalOpen(false);
                        setSelectedWorkoutId(null);
                    },
                    onError: (error: any) => {
                        console.error('Error deleting workout:', error);
                    }
                }
            );
        }
    };

    const handleCancelDelete = () => {
        setModalOpen(false);
        setSelectedWorkoutId(null);
    };

    const handleItemClick = (workoutId: string) => {
        router.push(`/workouts/plan/${workoutId}`);
    };

    return (
        <div className="flex flex-col h-screen bg-white p-10 lg:pt-[10vh] items-center ">
            <div className="flex items-center justify-between h-[10%] w-full lg:max-w-3xl">
                <div className='w-[90%] flex flex-row'>
                    <button
                        onClick={() => router.push('/home')}
                        className="flex items-center text-gray-600 hover:text-green-600"
                    >
                        <FaArrowLeftLong className="h-8 w-8" />
                    </button>
                    <h2 className="text-4xl font-semibold ml-8">{t("WorkoutLibrary.title")}</h2>
                </div>
                <button className="flex items-center justify-center">
                    <SlOptionsVertical className="h-6 w-6" />
                </button>
            </div>
            <div className="flex flex-wrap justify-center space-x-4 mb-6">
                {levels.map((level, index) => (
                    <button
                        key={level}
                        className={`py-3 px-5 rounded-full transition-all duration-300 
                            ${activeLevel === level ? 
                                'bg-gradient-to-r from-green-400 to-green-700 text-white shadow-lg' : 
                                'border border-green-400 text-green-700 bg-transparent shadow-lg'}`}
                        onClick={() => handleLevelChange(level)}
                    >
                        {translatedLevels[index]}
                    </button>
                ))}
            </div>

            {isLoading || loadingSavedWorkouts ? (
                <div className="flex justify-center items-center h-[80%]">
                    <ImSpinner8 className="animate-spin h-16 w-16 text-green-600" />
                </div>
            ) : message ? (
                <div className="border-dashed p-8 rounded-lg flex justify-center items-center h-[80%] w-[90%]">
                    <p className="text-gray-500 text-xl">{message}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-8 h-[80%] w-[80%] lg:max-w-3xl pt-8 pb-20">
                    <AnimatedList
                        items={workouts?.message || []}
                        animationDuration={500}
                        renderItem={(workout, index) => (
                            <div
                                key={workout._id || index}
                                onClick={() => handleItemClick(workout._id)} 
                                className="relative bg-white rounded-lg shadow-lg overflow-hidden mb-6 h-36 w-[95%] mx-auto transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl active:scale-95 first:mt-2 cursor-pointer"
                            >               
                                <img src={workout.image_url} alt={workout.name} className="w-full h-48 object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                    <h3 className="text-3xl font-semibold">{workout.name}</h3>
                                    <p className="text-base">{workout.duration} minutes | {workout.level}</p>
                                </div>
                                <button
                                    className="absolute bottom-4 right-4 p-3"
                                    onClick={(e) => handleBookmarkClick(workout._id, e)}
                                >
                                    <div className={`h-12 w-12 flex items-center justify-center rounded-full ${savedWorkouts.includes(workout._id) ? 'bg-white' : 'bg-transparent'}`}>
                                        <CiBookmarkMinus 
                                            className={`h-8 w-8 ${savedWorkouts.includes(workout._id) ? 'text-black' : 'text-white'}`}
                                        />
                                    </div>
                                </button>
                            </div>
                        )}
                    />
                </div>            
            )}

            {isError && (
                <Modal 
                    title="Error" 
                    message={errorMessage || 'An unexpected error occurred.'} 
                    onClose={handleCloseModal} 
                />
            )}

            <ConfirmationModal
                isOpen={modalOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                question={t('home.SavedWorkoutsSection.SavedWorkoutsSectionquestion')}
                confirmText={t('home.SavedWorkoutsSection.SavedWorkoutsSectionconfirmText')}
                cancelText={t('home.SavedWorkoutsSection.SavedWorkoutsSectioncancelText')}
            />
        </div>
    );
};

export default WorkoutLibrarySection;
