import React, { useReducer, useEffect, useCallback, useState, useMemo } from 'react';
import CountdownTimer from '../animations/CountdownTimer';
import ExerciseView from './ExerciseView';
import RestView from './RestView';
import CompleteView from './CompleteView';
import { useTranslation } from 'react-i18next';
import {
    useSendProgressToBackend,
    useSendCompleteToBackend,
    useSendChallengeProgress,
    useSendChallengeComplete,
} from '@/app/_services/userService';
import { Action, ExerciseFlowProps, State, ExerciseProgress } from '@/app/_interfaces/ExerciseFlow';
import ConfirmationModal from '../modals/confirmationModal';

const initialState: State = {
    currentExerciseIndex: 0,
    currentSet: 1,
    isRest: false,
    isCompleted: false,
    restDuration: 0,
    nextExerciseDetails: null,
    completeMessage: null,
    exercisesProgress: [],
    exerciseStartTime: null,
    workoutStartTime: null,
    previousStateBeforeRest: null,
    exerciseTimerKey: Date.now(),
};

const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours === 0
        ? `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        : `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'START_REST':
            return {
                ...state,
                isRest: true,
                restDuration: action.restDuration!,
                nextExerciseDetails: action.nextExercise!,
                previousStateBeforeRest: {
                    exerciseIndex: state.currentExerciseIndex,
                    set: state.currentSet,
                },
            };
        case 'START_EXERCISE':
            return {
                ...state,
                isRest: false,
                currentSet: action.currentSet,
                workoutStartTime: state.workoutStartTime || Date.now(),
                exerciseStartTime: Date.now(),
                previousStateBeforeRest: null,
            };
        case 'COMPLETE_EXERCISE':
            return { ...state, exerciseStartTime: null };
        case 'SET_EXERCISE_INDEX':
            return { ...state, currentExerciseIndex: action.index };
        case 'SET_CURRENT_SET':
            return { ...state, currentSet: action.set };
        case 'ADD_EXERCISE_PROGRESS':
            return {
                ...state,
                exercisesProgress: [...state.exercisesProgress, action.progress],
            };
        case 'COMPLETE_WORKOUT':
            return { ...state, isCompleted: true };
        case 'SET_COMPLETE_MESSAGE':
            return { ...state, completeMessage: action.message };
        case 'CLEAR_PREVIOUS_STATE':
            return { ...state, previousStateBeforeRest: null };
        case 'RESET_EXERCISE_TIMER':
            return {
                ...state,
                exerciseTimerKey: Date.now(),
            };
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
    sequenceDay,
}) => {
    console.log('Deubging Exercise flow', exercises, workoutType, workoutPlanId);
    const { t } = useTranslation('global');
    const [state, dispatch] = useReducer(reducer, initialState);
    const [formattedDuration, setFormattedDuration] = useState<string>('');
    const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);

    const {
        currentExerciseIndex,
        currentSet,
        isRest,
        isCompleted,
        restDuration,
        nextExerciseDetails,
        completeMessage,
        exercisesProgress,
        exerciseStartTime,
        workoutStartTime,
        exerciseTimerKey,
    } = state;

    const totalExercises = exercises.length;
    const currentExercise = useMemo(
        () => exercises[currentExerciseIndex],
        [exercises, currentExerciseIndex],
    );
    const totalSets = useMemo(() => currentExercise?.sets || 1, [currentExercise]);
    const defaultRestSeconds = currentExercise?.rest_seconds || 60;

    // Hooks para workout y challenge:
    const { mutate: sendProgress } = useSendProgressToBackend();
    const { mutate: completeWorkout } = useSendCompleteToBackend();
    const { mutate: sendChallengeProgress } = useSendChallengeProgress();
    const { mutate: completeChallenge } = useSendChallengeComplete();

    const totalExpectedSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
    const totalCompletedSets = state.exercisesProgress.reduce(
        (acc, ex) => acc + ex.sets_completed,
        0,
    );

    const getWorkoutProgressPercent = () => {
        return Math.floor((totalCompletedSets / totalExpectedSets) * 100);
    };

    const updateExerciseProgress = useCallback(() => {
        if (exerciseStartTime === null) return;

        const elapsed = Math.floor((Date.now() - exerciseStartTime) / 1000);
        const repsCompleted = Array(totalSets).fill(currentExercise.reps);

        const exerciseProgress: ExerciseProgress = {
            exercise_id: currentExercise.exercise_id!,
            sets_completed: totalSets,
            reps_completed: repsCompleted,
            duration_seconds: elapsed,
            calories_burned: 0,
            is_completed: true,
        };

        dispatch({ type: 'ADD_EXERCISE_PROGRESS', progress: exerciseProgress });
        dispatch({ type: 'COMPLETE_EXERCISE' });

        if (workoutType === 'challenge') {
            console.log('currentExercise', currentExercise);
            // Parsea workoutPlanId como “challengeId” (puedes pasarlo directamente desde el componente padre)
            const challenge_id = workoutPlanId;
            const sequence_day = Number(sequenceDay);

            sendChallengeProgress(
                {
                    queryParams: { challenge_id },
                    body: {
                        sequence_day,
                        exercises: [exerciseProgress],
                    },
                },
                {
                    onSuccess: () => {
                        onExerciseComplete(exerciseProgress.exercise_id);
                    },
                    onError: (err) => console.error('Error guardando progreso challenge:', err),
                },
            );
        }

        // Si es un “myPlan” => POST a /workouts/progress
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
                    onSuccess: () => {
                        onExerciseComplete(exerciseProgress.exercise_id!);
                    },
                    onError: (error) => console.error('Error guardando progreso workout:', error),
                },
            );
        }
    }, [
        exerciseStartTime,
        totalSets,
        currentExercise,
        workoutType,
        workoutPlanId,
        sequenceDay,
        sendChallengeProgress,
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
        setShowExitConfirmModal(true);
    }, []);

    useEffect(() => {
        if (!isRest && exerciseStartTime === null) {
            dispatch({ type: 'START_EXERCISE', currentSet });
        }
    }, [isRest, exerciseStartTime, currentSet]);

    useEffect(() => {
        if (isCompleted) {
            const totalDuration = workoutStartTime
                ? Math.floor((Date.now() - workoutStartTime) / 1000)
                : 0;
            setFormattedDuration(formatDuration(totalDuration));

            if (workoutType === 'challenge') {
                const challenge_id = workoutPlanId;
                const sequence_day = Number(sequenceDay);
                const payload = {
                    challenge_id,
                    sequence_day,
                    exercises: exercisesProgress,
                };
                completeChallenge(
                    { body: payload },
                    {
                        onSuccess: () => {
                            dispatch({
                                type: 'SET_COMPLETE_MESSAGE',
                                message: t('ExerciseFlow.completed'),
                            });
                            const timer = setTimeout(() => {
                                dispatch({ type: 'SET_COMPLETE_MESSAGE', message: null });
                                onClose();
                            }, 2500);
                            return () => clearTimeout(timer);
                        },
                        onError: (error) => console.error('Error completando challenge:', error),
                    },
                );
            }

            if (workoutType === 'oneDay') {
                const payload = {
                    workout_id: workoutPlanId,
                    duration_seconds: totalDuration,
                    calories_burned: 0,
                    exercises: exercisesProgress,
                    sequence_day: '1',
                    was_skipped: false,
                };
                completeWorkout(
                    { body: payload },
                    {
                        onSuccess: () => {
                            dispatch({
                                type: 'SET_COMPLETE_MESSAGE',
                                message: t('ExerciseFlow.completed'),
                            });
                            const timer = setTimeout(() => {
                                dispatch({ type: 'SET_COMPLETE_MESSAGE', message: null });
                                onClose();
                            }, 2500);
                            return () => clearTimeout(timer);
                        },
                        onError: (error) => console.error('Error completando workout:', error),
                    },
                );
            }

            if (workoutType === 'myPlan') {
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
        exercises,
        exercisesProgress,
        t,
        workoutPlanId,
        workoutStartTime,
        completeWorkout,
        completeChallenge,
        currentExerciseIndex,
        sequenceDay,
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
                    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[100]">
                        <div className="bg-green-500 text-white text-lg p-8 rounded-lg shadow-2xl pointer-events-auto">
                            {completeMessage}
                        </div>
                    </div>
                )}
            </>
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
                    exercises={exercises}
                    currentExerciseIndex={
                        currentSet < totalSets ? currentExerciseIndex : currentExerciseIndex + 1
                    }
                    currentSet={currentSet < totalSets ? currentSet + 1 : 1}
                />
            ) : (
                <ExerciseView
                    key={exerciseTimerKey}
                    exercise={{
                        ...currentExercise,
                        currentSet,
                        totalSets,
                    }}
                    onNext={handleNext}
                    onBack={handleBack}
                    currentExerciseIndex={currentExerciseIndex}
                    exercises={exercises}
                    currentSet={currentSet}
                />
            )}

            <ConfirmationModal
                isOpen={showExitConfirmModal}
                onClose={() => {
                    setShowExitConfirmModal(false);
                    onClose();
                }}
                onConfirm={() => setShowExitConfirmModal(false)}
                question={`${getWorkoutProgressPercent()}${t('ExerciseFlow.exitConfirmation')}`}
                confirmText={t('ExerciseFlow.exitCancel')}
                cancelText={t('ExerciseFlow.exitConfirm')}
            />
        </div>
    );
};

export default React.memo(ExerciseFlow);
