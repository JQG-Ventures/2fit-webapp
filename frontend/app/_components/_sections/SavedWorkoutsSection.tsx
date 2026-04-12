'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AiFillHeart, AiOutlineClose } from 'react-icons/ai';
import ConfirmationModal from '@/app/_components/modals/confirmationModal';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import Link from 'next/link';

type SavedWorkoutCard = Pick<WorkoutPlan, '_id' | 'name' | 'image_url'>;

interface SavedWorkoutsSectionProps {
    workouts: SavedWorkoutCard[];
    deleteWorkout: (workoutId: string) => Promise<void>;
    emptyMessage: string;
    sectionTitle: string;
}

const SavedWorkoutsSection: React.FC<SavedWorkoutsSectionProps> = ({
    workouts,
    deleteWorkout,
    emptyMessage,
    sectionTitle,
}) => {
    const { t } = useTranslation('global');
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedWorkout, setSelectedWorkout] = useState<SavedWorkoutCard | null>(null);
    const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkoutCard[]>(workouts);

    const handleHeartClick = (workout: SavedWorkoutCard) => {
        setSelectedWorkout(workout);
        setModalOpen(true);
    };

    const handleConfirm = async () => {
        if (selectedWorkout) {
            await deleteWorkout(selectedWorkout._id);
            setSavedWorkouts((prevWorkouts) =>
                prevWorkouts.filter((workout) => workout._id !== selectedWorkout._id),
            );
            setModalOpen(false);
            setSelectedWorkout(null);
        } else {
            setModalOpen(false);
            setSelectedWorkout(null);
        }
    };

    const handleCancel = () => {
        setModalOpen(false);
        setSelectedWorkout(null);
    };

    useEffect(() => {
        setSavedWorkouts(workouts);
    }, [workouts]);

    const workoutItems = useMemo(
        () =>
            savedWorkouts.map((workout) => (
                <div
                    key={workout._id}
                    className="relative w-44 h-44 bg-white rounded-lg flex-shrink-0 transition-transform transform hover:scale-110 hover:shadow-lg active:scale-95 lg:w-56 lg:h-56 xl:w-64 xl:h-64"
                >
                    <Image
                        className="object-cover w-full h-full rounded-lg transition-opacity duration-300 ease-in-out"
                        src={workout.image_url}
                        width={600}
                        height={800}
                        alt={workout.name}
                    />
                    <div className="absolute bottom-0 left-0 p-2 bg-opacity-75 bg-gray-800 text-white w-full rounded-b-lg transition-opacity duration-300 ease-in-out">
                        <p className="text-base font-semibold truncate leading-snug">
                            {workout.name}
                        </p>
                    </div>
                    <div className="absolute top-2 right-2">
                        <button
                            type="button"
                            onClick={() => handleHeartClick(workout)}
                            className={`text-white p-1 rounded-full transition-transform transform ${
                                selectedWorkout?._id === workout._id ? 'bg-red-600' : 'bg-gray-800'
                            }`}
                            aria-label={`${t('a11y.saveWorkout')}: ${workout.name}`}
                        >
                            {selectedWorkout?._id === workout._id ? (
                                <AiOutlineClose size={24} />
                            ) : (
                                <AiFillHeart size={24} />
                            )}
                        </button>
                    </div>
                </div>
            )),
        [savedWorkouts, selectedWorkout, t],
    );

    return (
        <section className="bg-white px-6 py-6">
            <div className="flex justify-between items-baseline mb-4">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{sectionTitle}</h2>
                <Link
                    href="/workouts"
                    className="text-base font-semibold text-green-600 hover:text-green-700 hover:underline shrink-0 ml-2"
                >
                    {t('home.SavedWorkoutsSection.viewall')}
                </Link>
            </div>

            {savedWorkouts.length === 0 ? (
                <div className="border-dashed border-2 border-gray-300 p-8 rounded-xl flex justify-center items-center">
                    <p className="text-lg text-gray-500 text-center leading-relaxed">
                        {emptyMessage}
                    </p>
                </div>
            ) : (
                <div className="flex overflow-x-auto py-2 -mx-1 px-1 no-scrollbar space-x-4 lg:space-x-6">
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
        </section>
    );
};

export default SavedWorkoutsSection;
