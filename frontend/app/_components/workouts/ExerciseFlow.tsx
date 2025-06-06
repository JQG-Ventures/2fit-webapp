import React, { useReducer, useEffect, useCallback, useState } from 'react';
import CountdownTimer from '../animations/CountdownTimer';
import ExerciseView from './ExerciseView';
import RestView from './RestView';
import CompleteView from './CompleteView';
import { useTranslation } from 'react-i18next';
import { useSendProgressToBackend, useSendCompleteToBackend } from '../../_services/userService';
import { Action, ExerciseFlowProps, State, ExerciseProgress } from '@/app/_interfaces/ExerciseFlow';

const initialState: State = {
    currentExerciseIndex: 0,
    currentSet: 1,
    isRest: false,
    isCountdown: true,
    isCompleted: false,
    restDuration: 0,
    nextExerciseDetails: null,
    completeMessage: null,
    exercisesProgress: [],
    exerciseStartTime: null,
    workoutStartTime: null,
};

const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours === 0) {
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'END_COUNTDOWN':
            return {
                ...state,
                isCountdown: false,
                workoutStartTime: state.workoutStartTime || Date.now(),
                exerciseStartTime: Date.now(),
            };
        case 'START_REST':
            return {
                ...state,
                isRest: true,
                restDuration: action.restDuration!,
                nextExerciseDetails: action.nextExercise!,
            };
        case 'START_EXERCISE':
            return {
                ...state,
                isRest: false,
                currentSet: action.currentSet!,
                exerciseStartTime: state.exerciseStartTime ?? Date.now(),
            };
        case 'COMPLETE_EXERCISE':
            return { ...state, exerciseStartTime: null };
        case 'SET_EXERCISE_INDEX':
            return { ...state, currentExerciseIndex: action.index! };
        case 'SET_CURRENT_SET':
            return { ...state, currentSet: action.set! };
        case 'ADD_EXERCISE_PROGRESS':
            return {
                ...state,
                exercisesProgress: [...state.exercisesProgress, action.progress!],
            };
        case 'COMPLETE_WORKOUT':
            return { ...state, isCompleted: true };
        case 'SET_COMPLETE_MESSAGE':
            return { ...state, completeMessage: action.message! };
        default:
            return state;
    }
};

const ExerciseFlow: React.FC<ExerciseFlowProps> = ({
    exercises,
    onClose,
    onExerciseComplete,
    workoutType,
    userId,
    workoutPlanId,
}) => {
    const { t } = useTranslation('global');
    const [state, dispatch] = useReducer(reducer, initialState);
    const [formattedDuration, setFormattedDuration] = useState<string>('');

    const {
        currentExerciseIndex,
        currentSet,
        isRest,
        isCountdown,
        isCompleted,
        restDuration,
        nextExerciseDetails,
        completeMessage,
        exercisesProgress,
        exerciseStartTime,
        workoutStartTime,
    } = state;

    const totalExercises = exercises.length;
    const currentExercise = exercises[currentExerciseIndex];
    const totalSets = currentExercise?.sets || 1;
    const defaultRestSeconds = currentExercise?.rest_seconds || 60;
    const { mutate: sendProgress } = useSendProgressToBackend();
    const { mutate: completeWorkout } = useSendCompleteToBackend();

    const updateExerciseProgress = useCallback(() => {
        if (exerciseStartTime === null) return;

        const exerciseDuration = Math.floor((Date.now() - exerciseStartTime) / 1000);
        const repsCompleted = Array(totalSets).fill(currentExercise.reps);

        const exerciseProgress: ExerciseProgress = {
            exercise_id: currentExercise.exercise_id!,
            sets_completed: totalSets,
            reps_completed: repsCompleted,
            duration_seconds: exerciseDuration,
            calories_burned: 0,
            is_completed: true,
        };

        dispatch({ type: 'ADD_EXERCISE_PROGRESS', progress: exerciseProgress });
        dispatch({ type: 'COMPLETE_EXERCISE' });

        if (workoutType === 'myPlan') {
            const payload = {
                exercises: [exerciseProgress],
                day_of_week: new Date()
                    .toLocaleDateString('en-US', { weekday: 'long' })
                    .toLowerCase(),
            };
            sendProgress(
                {
                    queryParams: { workout_plan_id: workoutPlanId },
                    body: payload,
                },
                {
                    onSuccess: (response) => console.log('Progress saved:', response),
                    onError: (error) => console.error('Error saving progress:', error.message),
                },
            );
            onExerciseComplete(currentExercise.exercise_id!);
        }
    }, [
        exerciseStartTime,
        totalSets,
        currentExercise,
        workoutType,
        workoutPlanId,
        onExerciseComplete,
        sendProgress,
    ]);

    const handleNext = useCallback(() => {
        if (currentSet < totalSets) {
            if (isRest) {
                dispatch({ type: 'START_EXERCISE', currentSet: currentSet + 1 });
            } else {
                dispatch({
                    type: 'START_REST',
                    restDuration: defaultRestSeconds,
                    nextExercise: currentExercise,
                });
            }
        } else {
            if (!isRest) {
                updateExerciseProgress();

                if (currentExerciseIndex < totalExercises - 1) {
                    dispatch({
                        type: 'START_REST',
                        restDuration: 120,
                        nextExercise: exercises[currentExerciseIndex + 1],
                    });
                } else {
                    dispatch({ type: 'COMPLETE_WORKOUT' });
                }
            } else {
                if (currentExerciseIndex < totalExercises - 1) {
                    dispatch({ type: 'SET_EXERCISE_INDEX', index: currentExerciseIndex + 1 });
                    dispatch({ type: 'SET_CURRENT_SET', set: 1 });
                    dispatch({ type: 'START_EXERCISE', currentSet: 1 });
                }
            }
        }
    }, [
        currentSet,
        totalSets,
        isRest,
        updateExerciseProgress,
        currentExerciseIndex,
        totalExercises,
        exercises,
        defaultRestSeconds,
        currentExercise,
    ]);

    const handleBack = useCallback(() => {
        if (isRest) {
            if (currentSet > 1) {
                dispatch({ type: 'SET_CURRENT_SET', set: currentSet - 1 });
                dispatch({ type: 'START_EXERCISE', currentSet: currentSet - 1 });
            } else if (currentExerciseIndex > 0) {
                const previousExercise = exercises[currentExerciseIndex - 1];
                dispatch({ type: 'SET_EXERCISE_INDEX', index: currentExerciseIndex - 1 });
                dispatch({ type: 'SET_CURRENT_SET', set: previousExercise.sets });
                dispatch({ type: 'START_REST', restDuration: 120, nextExercise: currentExercise });
            } else {
                onClose();
            }
        } else {
            if (currentSet > 1) {
                dispatch({ type: 'SET_CURRENT_SET', set: currentSet - 1 });
                dispatch({
                    type: 'START_REST',
                    restDuration: defaultRestSeconds,
                    nextExercise: null,
                });
            } else if (currentExerciseIndex > 0) {
                const previousExercise = exercises[currentExerciseIndex - 1];
                dispatch({ type: 'SET_EXERCISE_INDEX', index: currentExerciseIndex - 1 });
                dispatch({ type: 'SET_CURRENT_SET', set: previousExercise.sets });
                dispatch({ type: 'START_REST', restDuration: 120, nextExercise: currentExercise });
            } else {
                onClose();
            }
        }
    }, [
        isRest,
        currentSet,
        currentExerciseIndex,
        exercises,
        defaultRestSeconds,
        currentExercise,
        onClose,
    ]);

    useEffect(() => {
        if (!isRest && !isCountdown && exerciseStartTime === null) {
            dispatch({ type: 'START_EXERCISE', currentSet });
        }
    }, [isRest, isCountdown, exerciseStartTime, currentSet]);

    useEffect(() => {
        if (isCompleted) {
            const totalWorkoutDuration = workoutStartTime
                ? Math.floor((Date.now() - workoutStartTime) / 1000)
                : 0;
            setFormattedDuration(formatDuration(totalWorkoutDuration));

            if (workoutType === 'myPlan') {
                dispatch({ type: 'SET_COMPLETE_MESSAGE', message: t('ExerciseFlow.completed') });
                const timer = setTimeout(() => {
                    dispatch({ type: 'SET_COMPLETE_MESSAGE', message: null });
                    onClose();
                }, 2500);
                return () => clearTimeout(timer);
            } else if (workoutType === 'oneDay') {
                const payload = {
                    workout_id: workoutPlanId,
                    duration_seconds: totalWorkoutDuration,
                    calories_burned: 0,
                    exercises: exercisesProgress,
                    sequence_day: '1',
                    was_skipped: false,
                };

                completeWorkout(
                    {
                        body: payload,
                    },
                    {
                        onSuccess: (response) => console.log('Workout completed:', response),
                        onError: (error) =>
                            console.error('Error completing workout:', error.message),
                    },
                );

                dispatch({ type: 'SET_COMPLETE_MESSAGE', message: t('ExerciseFlow.completed') });
            } else {
                dispatch({ type: 'SET_COMPLETE_MESSAGE', message: t('ExerciseFlow.completed') });
                const timer = setTimeout(() => {
                    dispatch({ type: 'SET_COMPLETE_MESSAGE', message: null });
                    onClose();
                }, 2500);
                return () => clearTimeout(timer);
            }
        }
    }, [
        isCompleted,
        workoutType,
        onClose,
        exercisesProgress,
        t,
        userId,
        workoutPlanId,
        workoutStartTime,
        completeWorkout,
    ]);

    if (isCompleted) {
        if (workoutType === 'oneDay') {
            return (
                <CompleteView
                    goToPlan="/workouts"
                    textGoTo={t('workouts.plan.goto')}
                    duration={formattedDuration}
                />
            );
        }
        return (
            <>
                {completeMessage && (
                    <div
                        className="fixed inset-0 flex items-center justify-center pointer-events-none"
                        style={{ zIndex: 100 }}
                    >
                        <div className="bg-green-500 text-white text-lg p-8 rounded-lg shadow-2xl pointer-events-auto">
                            {completeMessage}
                        </div>
                    </div>
                )}
            </>
        );
    }

    if (isCountdown) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
                <CountdownTimer
                    title={t('ExerciseFlow.ready')}
                    duration={5}
                    size={240}
                    strockWidth={16}
                    onComplete={() => dispatch({ type: 'END_COUNTDOWN' })}
                />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
            {isRest ? (
                <RestView
                    restDuration={restDuration}
                    onNext={handleNext}
                    onBack={handleBack}
                    nextExercise={nextExerciseDetails!}
                />
            ) : (
                <ExerciseView
                    exercise={{
                        ...currentExercise,
                        currentSet,
                        totalSets,
                    }}
                    onNext={handleNext}
                    onBack={handleBack}
                />
            )}
        </div>
    );
};

export default React.memo(ExerciseFlow);
