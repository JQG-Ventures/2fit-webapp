'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ExerciseView from '../../../../_components/workouts/ExerciseView';
import RestView from '../../../../_components/workouts/RestView';
import LoadingScreen from '../../../../_components/animations/LoadingScreen';
import Modal from '../../../../_components/profile/modal';
import { useFetch } from '../../../../_hooks/useFetch';

const ExercisePage = () => {
    const router = useRouter();
    const { id } = useParams();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [isRest, setIsRest] = useState(false);
    const [remainingRestTime, setRemainingRestTime] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const options = useMemo(() => ({
		method: 'GET',
	}), []);
    const { data: workoutData, loading, error } = useFetch(id ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/plans/${id}` : '', options);

    useEffect(() => {
        if (workoutData) {
            setExercises(workoutData.exercises);
        }
    }, [workoutData]);

    const handleNextExercise = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            if (isRest) {
                const nextIndex = currentExerciseIndex + 1;
                if (nextIndex < exercises.length) {
                    setCurrentExerciseIndex(nextIndex);
                    setIsRest(false);
                } else {
                    router.push(`/workouts/plan/${id}/finish`);
                }
            } else {
                const nextIndex = currentExerciseIndex + 1;
                if (nextIndex < exercises.length) {
                    setIsRest(true);
                    setRemainingRestTime(exercises[currentExerciseIndex].rest);
                } else {
                    router.push(`/workouts/plan/${id}/finish`);
                }
            }
            setIsTransitioning(false);
        }, 300);
    };

    const handlePreviousExercise = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            if (currentExerciseIndex === 0) {
                router.push(`/workouts/plan/${id}`);
            } else {
                setCurrentExerciseIndex((prevIndex) => prevIndex - 1);
                setIsRest(false);
            }
            setIsTransitioning(false);
        }, 300);
    };

    const currentExercise = exercises[currentExerciseIndex];
    const nextExercise = exercises[currentExerciseIndex + 1] || null;

    if (loading) return <LoadingScreen />;
	if (error) {
		return (
			<Modal
				title="Error"
				message={error}
				onClose={() => router.push('/home')}
			/>
		);
	}

    return (
        <div className={`flex flex-col h-screen bg-white items-center transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {isRest ? (
                <RestView 
                    restDuration={remainingRestTime} 
                    onNext={handleNextExercise} 
                    onBack={handlePreviousExercise}
                    nextExercise={nextExercise}
                />
            ) : (
                <ExerciseView 
                    exercise={currentExercise} 
                    onNext={handleNextExercise} 
                    onBack={handlePreviousExercise}
                />
            )}
        </div>
    );
};

export default ExercisePage;
