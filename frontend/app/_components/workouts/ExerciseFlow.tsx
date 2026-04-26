import React, { useReducer, useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';
import ExerciseView from '@/app/_components/workouts/ExerciseView';
import RestView from '@/app/_components/workouts/RestView';
import CompleteView from '@/app/_components/workouts/CompleteView';
import { useTranslation } from 'react-i18next';
import {
    useSendCompleteToBackend,
    useSendChallengeProgress,
    useSendChallengeComplete,
} from '@/app/_services/userService';
import type {
    Action,
    AnimationOriginRect,
    ExerciseFlowProps,
    State,
    ExerciseProgress,
} from '@/app/_interfaces/ExerciseFlow';
import ConfirmationModal from '@/app/_components/modals/confirmationModal';

type CompletionApiStatus = 'idle' | 'pending' | 'success' | 'error';

function isAnimationOriginRect(value: unknown): value is AnimationOriginRect {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const obj = value as Record<string, unknown>;
    const left = obj.left;
    const top = obj.top;
    const width = obj.width;
    const height = obj.height;
    return (
        typeof left === 'number' &&
        typeof top === 'number' &&
        typeof width === 'number' &&
        typeof height === 'number'
    );
}

const COMPLETE_HERO_ANIMATION_MS = 1000;
const DEFAULT_COMPLETION_BUBBLE_SIZE = 44;

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

const ExerciseFlow = ({
    exercises,
    onClose,
    onExerciseComplete,
    workoutType,
    userId: _userId,
    workoutPlanId,
    sequenceDay,
    dayOfWeek,
    completionTarget,
}: ExerciseFlowProps) => {
    const { t } = useTranslation('global');
    const [state, dispatch] = useReducer(reducer, initialState);
    const [formattedDuration, setFormattedDuration] = useState<string>('');
    const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
    const [isHeroClosing, setIsHeroClosing] = useState(false);
    const [isCompletionAnimationDone, setIsCompletionAnimationDone] = useState(false);
    const [isCompletionFinalizing, setIsCompletionFinalizing] = useState(false);
    const [completionApiStatus, setCompletionApiStatus] = useState<CompletionApiStatus>('idle');
    const hasSubmittedCompletionRef = useRef(false);
    const hasFinalizedCompletionRef = useRef(false);

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
    const getHeroTargetAnimation = () => {
        if (typeof window === 'undefined') {
            return {
                top: 0,
                left: 0,
                width: DEFAULT_COMPLETION_BUBBLE_SIZE,
                height: DEFAULT_COMPLETION_BUBBLE_SIZE,
                borderRadius: 9999,
                backgroundColor: '#22c55e',
            };
        }

        if (!completionTarget) {
            return {
                top: window.innerHeight * 0.72,
                left: window.innerWidth * 0.78,
                width: DEFAULT_COMPLETION_BUBBLE_SIZE,
                height: DEFAULT_COMPLETION_BUBBLE_SIZE,
                borderRadius: 9999,
                backgroundColor: '#22c55e',
            };
        }

        const rawCompletionTarget = completionTarget as unknown;
        if (!isAnimationOriginRect(rawCompletionTarget)) {
            return {
                top: window.innerHeight * 0.72,
                left: window.innerWidth * 0.78,
                width: DEFAULT_COMPLETION_BUBBLE_SIZE,
                height: DEFAULT_COMPLETION_BUBBLE_SIZE,
                borderRadius: 9999,
                backgroundColor: '#22c55e',
            };
        }

        const targetCenterX = rawCompletionTarget.left + rawCompletionTarget.width / 2;
        const targetCenterY = rawCompletionTarget.top + rawCompletionTarget.height / 2;
        const targetSize = Math.min(rawCompletionTarget.width, rawCompletionTarget.height);

        return {
            top: targetCenterY - targetSize / 2,
            left: targetCenterX - targetSize / 2,
            width: targetSize,
            height: targetSize,
            borderRadius: 9999,
            backgroundColor: '#22c55e',
        };
    };

    // Hooks para workout y challenge:
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

        const currentExerciseId = currentExercise.exercise_id ?? currentExercise._id;

        if (!currentExerciseId) {
            return;
        }

        const elapsed = Math.floor((Date.now() - exerciseStartTime) / 1000);
        const repsCompleted: number[] = Array.from(
            { length: totalSets },
            () => currentExercise.reps,
        );

        const exerciseProgress: ExerciseProgress = {
            exercise_id: currentExerciseId,
            sets_completed: totalSets,
            reps_completed: repsCompleted,
            duration_seconds: elapsed,
            calories_burned: 0,
            is_completed: true,
        };

        dispatch({ type: 'ADD_EXERCISE_PROGRESS', progress: exerciseProgress });
        dispatch({ type: 'COMPLETE_EXERCISE' });

        if (workoutType === 'challenge') {
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
    }, [
        exerciseStartTime,
        totalSets,
        currentExercise,
        workoutType,
        workoutPlanId,
        sequenceDay,
        sendChallengeProgress,
        onExerciseComplete,
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
                    {
                        queryParams: { workout_plan_id: workoutPlanId },
                        body: payload,
                    },
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
                if (hasSubmittedCompletionRef.current) {
                    return;
                }

                hasSubmittedCompletionRef.current = true;
                setIsHeroClosing(true);
                setIsCompletionAnimationDone(false);
                setIsCompletionFinalizing(false);
                setCompletionApiStatus('pending');
                const animationTimer = setTimeout(() => {
                    setIsCompletionAnimationDone(true);
                }, COMPLETE_HERO_ANIMATION_MS);
                const rawDay: unknown = dayOfWeek as unknown;
                const selectedDayOfWeek =
                    rawDay !== undefined && rawDay !== null
                        ? String(rawDay)
                        : new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                const payload = {
                    workout_id: workoutPlanId,
                    duration_seconds: totalDuration,
                    calories_burned: 0,
                    exercises: exercisesProgress,
                    day_of_week: selectedDayOfWeek,
                    was_skipped: false,
                };
                completeWorkout(
                    {
                        queryParams: { workout_plan_id: workoutPlanId },
                        body: payload,
                    },
                    {
                        onSuccess: () => setCompletionApiStatus('success'),
                        onError: (error) => {
                            setCompletionApiStatus('error');
                            console.error('Error guardando sesión completada (myPlan):', error);
                        },
                    },
                );
                return () => clearTimeout(animationTimer);
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
        onExerciseComplete,
        sequenceDay,
        dayOfWeek,
    ]);

    useEffect(() => {
        if (
            workoutType !== 'myPlan' ||
            !isCompleted ||
            !isCompletionAnimationDone ||
            completionApiStatus !== 'success' ||
            isCompletionFinalizing ||
            hasFinalizedCompletionRef.current
        ) {
            return;
        }

        hasFinalizedCompletionRef.current = true;
        exercisesProgress.forEach((exerciseProgress) => {
            onExerciseComplete(exerciseProgress.exercise_id);
        });
        setIsCompletionFinalizing(true);
    }, [
        completionApiStatus,
        exercisesProgress,
        isCompleted,
        isCompletionAnimationDone,
        isCompletionFinalizing,
        onExerciseComplete,
        workoutType,
    ]);

    useEffect(() => {
        if (!isCompletionFinalizing) {
            return;
        }

        const closeTimer = setTimeout(() => {
            onClose();
        }, 80);

        return () => clearTimeout(closeTimer);
    }, [isCompletionFinalizing, onClose]);

    useEffect(() => {
        if (
            workoutType !== 'myPlan' ||
            !isCompleted ||
            !isCompletionAnimationDone ||
            completionApiStatus !== 'error'
        ) {
            return;
        }

        const timer = setTimeout(() => {
            onClose();
        }, 1200);

        return () => clearTimeout(timer);
    }, [completionApiStatus, isCompleted, isCompletionAnimationDone, onClose, workoutType]);

    if (isCompleted) {
        if (workoutType === 'myPlan') {
            return (
                <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
                    <motion.div
                        className="fixed flex items-center justify-center overflow-hidden bg-white shadow-2xl"
                        initial={{
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100dvh',
                            borderRadius: 0,
                            backgroundColor: '#ffffff',
                        }}
                        animate={
                            isHeroClosing
                                ? {
                                      ...getHeroTargetAnimation(),
                                      opacity: isCompletionFinalizing ? 0 : 1,
                                  }
                                : {
                                      top: 0,
                                      left: 0,
                                      width: '100vw',
                                      height: '100dvh',
                                      borderRadius: 0,
                                      backgroundColor: '#ffffff',
                                      opacity: 1,
                                  }
                        }
                        transition={
                            isCompletionFinalizing
                                ? { duration: 0.08, ease: 'easeOut' }
                                : isHeroClosing
                                  ? {
                                        duration: COMPLETE_HERO_ANIMATION_MS / 1000,
                                        ease: [0.22, 1, 0.36, 1],
                                    }
                                  : { type: 'spring', stiffness: 220, damping: 28 }
                        }
                    >
                        <motion.div
                            className="flex flex-col items-center justify-center"
                            animate={
                                isHeroClosing
                                    ? { opacity: 0, scale: 0.3 }
                                    : { opacity: 1, scale: 1 }
                            }
                            transition={{ duration: 0.45, ease: 'easeOut' }}
                        >
                            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-green-500 text-white shadow-2xl shadow-green-500/25">
                                <FaCheck className="h-12 w-12" />
                            </div>
                            <p className="mt-6 text-3xl font-semibold text-gray-900">
                                {currentExercise?.name}
                            </p>
                        </motion.div>
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center text-white"
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={
                                isHeroClosing
                                    ? { opacity: 1, scale: 1 }
                                    : { opacity: 0, scale: 0.6 }
                            }
                            transition={{ delay: 0.28, duration: 0.35 }}
                        >
                            <FaCheck className="h-5 w-5" />
                        </motion.div>
                        {isCompletionAnimationDone && completionApiStatus === 'pending' && (
                            <div className="absolute -bottom-9 whitespace-nowrap rounded-full bg-slate-900 px-3 py-1 text-xs text-white shadow-lg">
                                {t('common.saving', { defaultValue: 'Guardando...' })}
                            </div>
                        )}
                        {isCompletionAnimationDone && completionApiStatus === 'error' && (
                            <div className="absolute -bottom-9 whitespace-nowrap rounded-full bg-red-500 px-3 py-1 text-xs text-white shadow-lg">
                                {t('common.error', { defaultValue: 'No se pudo guardar' })}
                            </div>
                        )}
                    </motion.div>
                </div>
            );
        }

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
