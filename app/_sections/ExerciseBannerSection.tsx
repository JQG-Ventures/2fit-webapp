import React, { useState } from 'react';
import { AiFillHeart, AiOutlineReload } from 'react-icons/ai';
import { saveWorkout } from '../_services/workoutService';

interface Exercise {
    _id: string;
    name: string;
    image_url: string;
}

interface ExerciseBannerSectionProps {
    hasRoutine: boolean;
    exercises: Exercise[];
    savedWorkoutPlans: Exercise[];
}

const SavedMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
            {message}
        </div>
    </div>
);

const ExerciseBannerSection: React.FC<ExerciseBannerSectionProps> = ({ hasRoutine, exercises, savedWorkoutPlans }) => {
    const userId = "user_50662633238"; // TODO: REMOVE THIS
    const [savedMessage, setSavedMessage] = useState<string | null>(null);
    const [savedExerciseIds, setSavedExerciseIds] = useState<string[]>(
        savedWorkoutPlans.map(workout => workout._id) // Initialize with saved workouts
    );

    const handleSaveClick = async (id: string, name: string) => {
        const result = await saveWorkout(userId, id);

        if (result.status === 400) {
            setSavedMessage('Workout already saved!');
        } else if (result.status === 200) {
            setSavedMessage(`${name} saved!`);
            setSavedExerciseIds([...savedExerciseIds, id]); // Add new saved workout
        } else {
            setSavedMessage('There was an error saving the workout, try again.');
        }
        setTimeout(() => setSavedMessage(null), 2000);
    };

    return (
        <div className="exercise-banner-section px-6 pt-10 md:px-12 lg:px-20">
            <h2 className="text-2xl font-bold mb-6 lg:text-3xl">
                {hasRoutine ? "What's the plan for today?" : "Explore Workouts"}
            </h2>

            {/* Conditionally render the exercise list or a "no exercises" message */}
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
                        Soon you will have access to a variety of workouts to get you fit, stay tuned!
                    </p>
                </div>
            )}

            {savedMessage && <SavedMessage message={savedMessage} />}
        </div>
    );
};

const ExerciseCard: React.FC<{ exercise: Exercise, onSaveClick: (id: string, name: string) => void, isSaved: boolean }> = ({ exercise, onSaveClick, isSaved }) => (
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
                    disabled={isSaved} // Disable button if the workout is already saved
                >
                    <AiFillHeart size={24} />
                </button>
                <button className="p-2 bg-green-500 rounded-full">
                    <AiOutlineReload size={24} />
                </button>
            </div>
        </div>
    </div>
);

export default ExerciseBannerSection;
