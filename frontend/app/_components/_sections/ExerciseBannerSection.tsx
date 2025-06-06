import React, { useState } from 'react';
import { AiFillHeart, AiOutlineReload } from 'react-icons/ai';
import SavedMessage from '../others/SavedMessage';
import { useTranslation } from 'react-i18next';
import { useSaveWorkout } from '@/app/_services/userService';
import { FaSpinner } from 'react-icons/fa';
import Image from 'next/image';

interface ExerciseBannerSectionProps {
    hasRoutine: boolean;
    exercises: WorkoutPlan[];
    savedWorkoutPlans: WorkoutPlan[];
}

const ExerciseBannerSection: React.FC<ExerciseBannerSectionProps> = ({
    hasRoutine,
    exercises,
    savedWorkoutPlans,
}) => {
    const { t } = useTranslation('global');
    const [savedMessage, setSavedMessage] = useState<string | null>(null);
    const [savedExerciseIds, setSavedExerciseIds] = useState<string[]>(
        savedWorkoutPlans.map((workout) => workout._id),
    );
    const { mutate: saveWorkout } = useSaveWorkout();

    const handleSaveWorkout = async (id: string, name: string) => {
        saveWorkout(
            { queryParams: { workout_id: id } },
            {
                onSuccess: (data) => {
                    if (data.status === 'success') {
                        setSavedExerciseIds([...savedExerciseIds, id]);
                        setSavedMessage(`${name} saved!`);
                        setTimeout(() => setSavedMessage(null), 3000);
                    }
                },
                onError: (error: any) => {
                    if (error.response?.status === 400) {
                        setSavedMessage('Workout already saved!');
                    } else {
                        setSavedMessage('There was an error saving the workout, try again.');
                    }
                    setTimeout(() => setSavedMessage(null), 3000);
                },
            },
        );
    };

    return (
        <div className="exercise-banner-section px-6 pt-10 md:px-12 lg:px-20">
            <h2 className="text-2xl font-bold mb-6 lg:text-3xl">
                {hasRoutine
                    ? t('home.excercisebannersection.planfortoday')
                    : t('home.excercisebannersection.planfortoday2')}
            </h2>

            {exercises.length > 0 ? (
                <div className="flex space-x-4 overflow-x-scroll py-2">
                    {exercises.map((exercise, index) => (
                        <ExerciseCard
                            key={index}
                            exercise={exercise}
                            onSaveClick={handleSaveWorkout}
                            isSaved={savedExerciseIds.includes(exercise._id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500 text-lg">
                        {t('home.excercisebannersection.noexercisemessage')}
                    </p>
                </div>
            )}

            {savedMessage && <SavedMessage message={savedMessage} />}
        </div>
    );
};

const ExerciseCard: React.FC<{
    exercise: WorkoutPlan;
    onSaveClick: (id: string, name: string) => void;
    isSaved: boolean;
}> = ({ exercise, onSaveClick, isSaved }) => {
    const [loading, setLoading] = useState(false);

    const handleRedirect = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        setTimeout(() => {
            // @ts-nocheck
            window.location.href = `workouts/plan/${exercise._id}`;
        }, 500);
    };

    console.log('test', exercise);
    return (
        <a href={`workouts/plan/${exercise._id}`} onClick={handleRedirect}>
            <div className="min-w-[280px] h-[350px] text-white rounded-lg relative overflow-hidden group bg-gray-200">
                {/* Optimized Image Background */}
                <Image
                    src={exercise.image_url}
                    alt={exercise.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 90vw, (max-width: 1200px) 40vw, 33vw"
                    priority={false} // set true if it's critical
                />
                <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-30 transition-opacity"></div>

                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
                        <FaSpinner className="text-emerald-500 text-5xl animate-spin" />
                    </div>
                )}

                {/* Content */}
                {!loading && (
                    <>
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-5">
                            <p className="font-bold text-xl whitespace-normal break-words max-w-[70%] lg:text-2xl">
                                {exercise.name}
                            </p>
                            <div className="flex space-x-4">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onSaveClick(exercise._id, exercise.name);
                                    }}
                                    className={`p-2 ${
                                        isSaved ? 'bg-red-500' : 'bg-gray-700'
                                    } rounded-full transition-transform transform hover:scale-110 active:scale-90`}
                                    disabled={isSaved}
                                >
                                    <AiFillHeart size={24} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    className="p-2 bg-green-500 rounded-full"
                                >
                                    <AiOutlineReload size={24} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </a>
    );
};
export default ExerciseBannerSection;
