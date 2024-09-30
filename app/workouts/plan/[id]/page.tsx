'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getWorkoutPlanById, saveWorkout } from '../../../_services/workoutService';
import WorkoutHeader from '../../../_components/workouts/WorkoutHeader';
import WorkoutDetails from '../../../_components/workouts/WorkoutDetails';
import WorkoutFooter from '../../../_components/workouts/WorkoutFooterStart';
import ExerciseList from '../../../_components/workouts/WorkoutList';
import LoadingScreen from '../../../_components/animations/LoadingScreen';
import SavedMessage from '../../../_components/others/SavedMessage';

const WorkoutPlanPage = () => {
    const router = useRouter();
    const { id } = useParams();
    const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [savedMessage, setSavedMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const getWorkout = async () => {
            try {
                setLoading(true);
                const data = await getWorkoutPlanById(id as string);
                setWorkoutPlan(data.message);
            } finally {
                setLoading(false);
            }
        };
        getWorkout();
    }, [id]);

    const handleSaveClick = async (id: string) => {
        const result = await saveWorkout("user_50662633238", id);

        if (result.status === 400) {
            setSavedMessage('Workout already saved!');
        } else if (result.status === 200) {
            setSavedMessage("Workout saved!");
        } else {
            setSavedMessage('There was an error saving the workout, try again.');
        }
        setTimeout(() => setSavedMessage(null), 2000);
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="bg-gray-50 w-full min-h-screen">
            <div className="flex flex-col justify-center">
                <WorkoutHeader
                    onSaveClick={() => handleSaveClick(id as string)}
                    onBackClick={() => router.back()}
                    imageUrl={workoutPlan?.image_url}
                />
                <WorkoutDetails workoutPlan={workoutPlan} />
            </div>            
    
            <ExerciseList exercises={workoutPlan?.exercises || []} isMobile={true} />

            <WorkoutFooter 
                onStartClick={() => router.push(`/workouts/plan/${id}/countdown`)}
            />
            {savedMessage && <SavedMessage message={savedMessage} />}
        </div>
    );
};

export default WorkoutPlanPage;