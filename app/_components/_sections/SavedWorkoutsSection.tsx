'use client';

import React, { useState, useMemo } from 'react';
import { AiFillHeart, AiOutlineClose } from 'react-icons/ai';
import ConfirmationModal from '../modals/confirmationModal';
import { useTranslation } from 'react-i18next';

interface Workout {
    _id: string;
    image_url: string;
    name: string;
}

interface SavedWorkoutsSectionProps {
    workouts: Workout[];
    deleteWorkout: (userId: string, workoutId: string) => Promise<void>;
    emptyMessage: string;
    sectionTitle: string;
}

const SavedWorkoutsSection: React.FC<SavedWorkoutsSectionProps> = ({
    workouts,
    deleteWorkout,
    emptyMessage,
    sectionTitle
}) => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
    const [savedWorkouts, setSavedWorkouts] = useState<Workout[]>(workouts);
    const userId = "user_50662633238";
    const { t } = useTranslation('global');

    const handleHeartClick = (workout: Workout) => {
        setSelectedWorkout(workout);
        setModalOpen(true);
    };

    const handleConfirm = async () => {
        if (selectedWorkout) {
            try {
                await deleteWorkout(userId, selectedWorkout._id);
                setSavedWorkouts(prevWorkouts => prevWorkouts.filter(workout => workout._id !== selectedWorkout._id));
                setModalOpen(false);
                setSelectedWorkout(null);
            } catch (error) {
                console.error('Error removing workout from saved list:', error);
            }
        } else {
            setModalOpen(false);
            setSelectedWorkout(null);
        }
    };

    const handleCancel = () => {
        setModalOpen(false);
        setSelectedWorkout(null);
    };

    const workoutItems = useMemo(() => (
        savedWorkouts.map((workout) => (
            <div
                key={workout._id}
                className="relative w-44 h-44 bg-white rounded-lg flex-shrink-0 transition-transform transform hover:scale-110 hover:shadow-lg active:scale-95 lg:w-56 lg:h-56 xl:w-64 xl:h-64"
            >
                <img
                    src={workout.image_url}
                    alt={workout.name}
                    className="object-cover w-full h-full rounded-lg transition-opacity duration-300 ease-in-out"
                />
                <div className="absolute bottom-0 left-0 p-2 bg-opacity-75 bg-gray-800 text-white w-full rounded-b-lg transition-opacity duration-300 ease-in-out">
                    <p className="text-lg truncate">{workout.name}</p>
                </div>
                <div className="absolute top-2 right-2">
                    <button
                        onClick={() => handleHeartClick(workout)}
                        className={`text-white p-1 rounded-full transition-transform transform ${
                            selectedWorkout === workout ? 'bg-red-600' : 'bg-gray-800'
                        }`}
                    >
                        {selectedWorkout === workout ? <AiOutlineClose size={24} /> : <AiFillHeart size={24} />}
                    </button>
                </div>
            </div>
        ))
    ), [savedWorkouts, selectedWorkout]);

    return (
        <div className="bg-white p-4 rounded-lg">
            <div className="flex justify-between items-center mb-8 px-2">
                <h2 className="text-4xl font-bold text-gray-800">{sectionTitle}</h2>
                <a href="#" className="text-blue-600 hover:underline text-lg lg:text-2xl">{t('home.SavedWorkoutsSection.viewall')}</a>
            </div>

            {savedWorkouts.length === 0 ? (
                <div className="border-dashed border-2 border-gray-400 p-8 rounded-lg flex justify-center items-center">
                    <p className="text-gray-500 text-xl">{emptyMessage}</p>
                </div>
            ) : (
                <div className="flex overflow-x-auto py-2 px-2 no-scrollbar space-x-6 lg:space-x-12 xl:space-x-14">
                    {workoutItems}
                </div>
            )}

            <ConfirmationModal
                isOpen={modalOpen}
                onClose={handleCancel}
                onConfirm={handleConfirm}
                question={t('home.SavedWorkoutsSection.SavedWorkoutsSectionquestion')}
                confirmText={t('home.SavedWorkoutsSection.SavedWorkoutsSectionconfirmText')}
                cancelText={t('home.SavedWorkoutsSection.SavedWorkoutsSectioncancelText')}
            />
        </div>
    );
};

export default SavedWorkoutsSection;
