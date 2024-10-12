import React, { useState } from 'react';
import { AiFillHeart, AiOutlineReload } from 'react-icons/ai';
import { saveWorkout } from '../_services/workoutService';
import { useTranslation } from 'react-i18next';
import SavedMessage from '../_components/others/SavedMessage';


const ExerciseBannerSection: React.FC<ExerciseBannerSectionProps> = ({ hasRoutine, exercises, savedWorkoutPlans }) => {
    const { t } = useTranslation('global');
    const userId = "user_50662633238"; // TODO: REMOVE THIS
    const [savedMessage, setSavedMessage] = useState<string | null>(null);
    const [savedExerciseIds, setSavedExerciseIds] = useState<string[]>(
        savedWorkoutPlans.map(workout => workout._id)
    );

    const handleSaveClick = async (id: string, name: string) => {
        const result = await saveWorkout(userId, id);

        if (result.status === 400) {
            setSavedMessage('Workout already saved!');
        } else if (result.status === 200) {
            setSavedMessage(`${name} saved!`);
            setSavedExerciseIds([...savedExerciseIds, id]);
        } else {
            setSavedMessage('There was an error saving the workout, try again.');
        }
        setTimeout(() => setSavedMessage(null), 2000);
    };

    return (
        <div className="exercise-banner-section px-6 pt-10 md:px-12 lg:px-20">
            <h2 className="text-2xl font-bold mb-6 lg:text-3xl">
                {hasRoutine ? t('home.excercisebannersection.planfortoday') : t('home.excercisebannersection.planfortoday2')}
            </h2>

            {exercises.length > 0 ? (
                <div className="flex space-x-4 overflow-x-scroll py-2">
                    {exercises.map((exercise, index) => (
                        <ExerciseCard
                            key={index}
                            exercise={exercise}
                            onSaveClick={handleSaveClick}
                            isSaved={savedExerciseIds.includes(exercise._id)} // Check if the exercise is already saved
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

const ExerciseCard: React.FC<{ exercise: WorkoutPlan, onSaveClick: (id: string, name: string) => void, isSaved: boolean }> = ({ exercise, onSaveClick, isSaved }) => (
    <a href={`workouts/plan/${exercise._id}`}>
        <div
            className="min-w-[280px] h-[350px] bg-black text-white rounded-lg relative overflow-hidden group"
            style={{ backgroundImage: `url(${exercise.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
            <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-30 transition-opacity"></div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-5">
                <p className="font-bold text-xl whitespace-normal break-words max-w-[70%] lg:text-2xl">
                    {exercise.name}
                </p>
                <div className="flex space-x-4">
                    <button
                        onClick={() => onSaveClick(exercise._id, exercise.name)}
                        className={`p-2 ${isSaved ? 'bg-red-500' : 'bg-gray-700'} rounded-full transition-transform transform hover:scale-110 active:scale-90`}
                        disabled={isSaved}
                    >
                        <AiFillHeart size={24} />
                    </button>
                    <button className="p-2 bg-green-500 rounded-full">
                        <AiOutlineReload size={24} />
                    </button>
                </div>
            </div>
        </div>
    </a>
);

export default ExerciseBannerSection;
