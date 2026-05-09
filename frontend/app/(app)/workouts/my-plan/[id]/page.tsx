'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { FaArrowLeft, FaCheckCircle, FaDumbbell, FaMoon } from 'react-icons/fa';
import LoadingScreen from '@/app/_components/animations/LoadingScreen';
import Modal from '@/app/_components/profile/modal';
import ExerciseDetailsModal from '@/app/_components/modals/ExerciseDetailsModal';
import ExerciseFlow from '@/app/_components/workouts/ExerciseFlow';
import { useApiGet } from '@/app/utils/apiClient';
import { useSession } from 'next-auth/react';
import { HiDotsHorizontal } from 'react-icons/hi';
import { useDeleteExercises, useModifyExercises } from '@/app/_services/workoutService';
import { useSendCompleteToBackend } from '@/app/_services/userService';
import ExerciseCard from '@/app/_components/workouts/my-plan/ExerciseCard';
import DaysOfWeekSelector from '@/app/_components/workouts/my-plan/DaysOfWeekSelector';
import CustomModal from '@/app/_components/modals/CustomModal';
import ExerciseReplaceSheet from '@/app/_components/workouts/my-plan/ExerciseReplaceSheet';
import ExerciseDeleteSheet from '@/app/_components/workouts/my-plan/ExerciseDeleteSheet';
import type { PlanChangeScope } from '@/app/_types/planChangeScope';
import { getSimilarExercises } from '@/app/_services/exerciseService';
import { API_ROUTES } from '@/lib/apiRoutes';
import { WEEKLY_WORKOUT_PROGRESS_QUERY_KEY } from '@/app/_constants/queryKeys';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { FiRefreshCw, FiTrash2, FiX } from 'react-icons/fi';
import type { ApiResponse } from '@/app/_types/api';
import type { AnimationOriginRect, ExerciseAnimationTargets } from '@/app/_interfaces/ExerciseFlow';

const DEFAULT_SECONDS_PER_REP = 3;
const WEEK_SWIPE_THRESHOLD_PX = 48;

const daysOfWeekFull = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
] as const;

type WeekDayName = (typeof daysOfWeekFull)[number];

interface WeeklyProgressDay {
    day_of_week: string;
    date?: string;
    is_completed?: boolean;
    exercises: Exercise[];
}

interface WeeklyProgressMessage {
    week_start_date?: string;
    week_end_date?: string;
    current_week?: number;
    week_number?: number;
    total_weeks?: number;
    progress?: number;
    days: WeeklyProgressDay[];
}

interface SessionUserState {
    id: string | null;
    token: string | null;
}

function readSessionUser(user: unknown): SessionUserState {
    if (typeof user !== 'object' || user === null) {
        return { id: null, token: null };
    }

    const candidateUser = user as Record<string, unknown>;

    return {
        id: typeof candidateUser.id === 'string' ? candidateUser.id : null,
        token: typeof candidateUser.token === 'string' ? candidateUser.token : null,
    };
}

function getTodayDateKey(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

const MyPlan: React.FC = () => {
    const { id } = useParams<{ id: string | string[] }>();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { t } = useTranslation('global');
    const { data: session, status } = useSession();
    const planId = Array.isArray(id) ? id[0] : id;
    const sessionUser = readSessionUser(session?.user);

    const sessionLoading = status === 'loading';
    const userId = sessionUser.id ?? '';
    const token = sessionUser.token;

    const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [exerciseAnimationOrigin, setExerciseAnimationOrigin] =
        useState<AnimationOriginRect | null>(null);
    const [exerciseCompletionTarget, setExerciseCompletionTarget] =
        useState<AnimationOriginRect | null>(null);
    const [showExerciseFlow, setShowExerciseFlow] = useState<boolean>(false);

    const [showOptionsModal, setShowOptionsModal] = useState<boolean>(false);
    const [isOptionalExercisesOpen, setIsOptionalExercisesOpen] = useState(false);

    const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
    const [isOptionalMode, setIsOptionalMode] = useState<boolean>(false);

    const [exercisesToDelete, setExercisesToDelete] = useState<Record<string, string[]>>({});
    const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);
    const [deleteScope, setDeleteScope] = useState<PlanChangeScope>('template');
    const [replaceScope, setReplaceScope] = useState<PlanChangeScope>('template');
    const [weeklyProgressState, setWeeklyProgressState] = useState<WeeklyProgressMessage | null>(
        null,
    );
    const [similarExercises, setSimilarExercises] = useState<Exercise[]>([]);
    const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(null);
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    const [weekSwipeStartX, setWeekSwipeStartX] = useState<number | null>(null);
    const [weekTransitionDirection, setWeekTransitionDirection] = useState(0);
    const [completingExerciseIds, setCompletingExerciseIds] = useState<string[]>([]);
    const [recentlyCompletedExerciseIds, setRecentlyCompletedExerciseIds] = useState<string[]>([]);
    const completionHighlightTimeoutsRef = useRef<Record<string, number>>({});

    const {
        data: weeklyProgressData,
        isLoading: loadingWeeklyProgress,
        error: weeklyProgressError,
        refetch: refetchWeeklyProgress,
    } = useApiGet<ApiResponse<WeeklyProgressMessage>>(
        selectedWeekNumber
            ? [...WEEKLY_WORKOUT_PROGRESS_QUERY_KEY, String(selectedWeekNumber)]
            : WEEKLY_WORKOUT_PROGRESS_QUERY_KEY,
        API_ROUTES.workouts.weeklyProgress,
        {
            axiosConfig: selectedWeekNumber
                ? { params: { week_number: selectedWeekNumber } }
                : undefined,
        },
    );
    const { mutate: deleteExercises } = useDeleteExercises(planId ?? '');
    const { mutate: modifyExercises } = useModifyExercises(planId ?? '');
    const { mutate: completeWorkout } = useSendCompleteToBackend();

    const [exerciseToReplaceId, setExerciseToReplaceId] = useState<string>('');
    const [pendingReplacementExercise, setPendingReplacementExercise] = useState<Exercise | null>(
        null,
    );

    const normalizeExercises = (exercises: Exercise[]): Exercise[] => {
        const uniqueExercises: Record<string, Exercise> = {};

        exercises.forEach((exercise) => {
            const exerciseId = exercise.exercise_id ?? exercise._id;
            if (exerciseId) {
                uniqueExercises[exerciseId] = exercise;
            }
        });

        return Object.values(uniqueExercises);
    };

    useEffect(() => {
        const currentDayIndex = new Date().getDay() - 1;
        setSelectedDayIndex(currentDayIndex < 0 ? 6 : currentDayIndex);
    }, []);

    useEffect(() => {
        if (weeklyProgressData) {
            const normalizedDays = weeklyProgressData.message.days.map((day) => ({
                ...day,
                exercises: normalizeExercises(day.exercises),
            }));
            setWeeklyProgressState({ ...weeklyProgressData.message, days: normalizedDays });
        }
    }, [weeklyProgressData]);

    const todayDate = useMemo(() => getTodayDateKey(), []);
    const weekDays = weeklyProgressState?.days ?? [];
    const selectedDay = weekDays[selectedDayIndex];
    const selectedDayName =
        (selectedDay?.day_of_week.toLowerCase() as WeekDayName | undefined) ??
        daysOfWeekFull[selectedDayIndex];
    const canCompleteSelectedDay = selectedDay?.date === todayDate;
    const selectedExercises = selectedDay?.exercises ?? [];
    const isSelectedRestDay = !!selectedDay && selectedExercises.length === 0;
    const isSelectedDayComplete =
        selectedExercises.length > 0 &&
        (selectedDay?.is_completed || selectedExercises.every((exercise) => exercise.is_completed));
    const trainingDays = weekDays.filter((day) => day.exercises.length > 0);
    const completedTrainingDays = trainingDays.filter(
        (day) => day.is_completed || day.exercises.every((exercise) => exercise.is_completed),
    ).length;
    const todayDay = weekDays.find((day) => day.date === todayDate);
    const todayRemaining =
        todayDay?.exercises.filter((exercise) => !exercise.is_completed).length ?? 0;
    const weekProgressPercent =
        trainingDays.length > 0 ? (completedTrainingDays / trainingDays.length) * 100 : 0;
    const currentWeekNumber = weeklyProgressState?.current_week ?? weeklyProgressState?.week_number;
    const viewedWeekNumber = weeklyProgressState?.week_number ?? currentWeekNumber ?? 1;
    const totalWeeks = weeklyProgressState?.total_weeks ?? viewedWeekNumber;
    const canGoPreviousWeek = viewedWeekNumber > 1;
    const canGoNextWeek = viewedWeekNumber < totalWeeks;
    const exerciseBeingReplaced =
        selectedExercises.find((exercise) => {
            const exerciseId = exercise.exercise_id ?? exercise._id;
            return exerciseId === exerciseToReplaceId;
        }) ?? null;
    const deleteSelectionTotal = useMemo(
        () => Object.values(exercisesToDelete).reduce((n, list) => n + list.length, 0),
        [exercisesToDelete],
    );
    const deleteDayLabel = t(`workouts.my-plan.weekdays.${selectedDayName}`);

    const handleDeleteMode = () => {
        setIsDeleteMode(true);
        setDeleteScope('template');
        setShowOptionsModal(false);
    };

    const handleOptionalMode = () => {
        setIsOptionalMode(true);
        setReplaceScope('template');
        setShowOptionsModal(false);
    };

    const handleDeleteSelect = (exerciseId: string) => {
        setExercisesToDelete((prev) => {
            const updated = { ...prev };
            const day: WeekDayName = daysOfWeekFull[selectedDayIndex];

            if (!updated[day]) {
                updated[day] = [];
            }

            if (updated[day].includes(exerciseId)) {
                updated[day] = updated[day].filter((id) => id !== exerciseId);
            } else {
                updated[day] = [...updated[day], exerciseId];
            }

            if (updated[day].length === 0) {
                delete updated[day];
            }

            return { ...updated };
        });
    };

    const handleOptionalSelect = (exercise_id: string) => {
        setExerciseToReplaceId(exercise_id);
        setPendingReplacementExercise(null);
        void getSimilarExercises(exercise_id, token).then((similarExerciseOptions) => {
            setSimilarExercises(similarExerciseOptions ?? []);
            setIsOptionalExercisesOpen(true);
        });
    };

    const handleConfirmDelete = () => {
        deleteExercises(
            {
                ...exercisesToDelete,
                scope: deleteScope,
                ...(deleteScope === 'instance' ? { week_number: viewedWeekNumber } : {}),
            },
            {
                onSuccess: () => {
                    setIsDeleteMode(false);
                    setIsDeleteSheetOpen(false);
                    setExercisesToDelete({});
                    setDeleteScope('template');
                    void queryClient.invalidateQueries({
                        queryKey: WEEKLY_WORKOUT_PROGRESS_QUERY_KEY,
                    });
                    void refetchWeeklyProgress();
                },
                onError: (error) => console.error('Error deleting exercises:', error.message),
            },
        );
    };

    const handleCloseDeleteSheet = () => {
        setIsDeleteSheetOpen(false);
        setIsDeleteMode(false);
        setExercisesToDelete({});
        setDeleteScope('template');
    };

    const handleExerciseCardClick = (
        exercise: Exercise,
        action: 'details' | 'start',
        targets?: ExerciseAnimationTargets,
    ) => {
        if (targets?.previewOrigin) {
            setExerciseAnimationOrigin(targets.previewOrigin);
        }
        if (targets?.completionTarget) {
            setExerciseCompletionTarget(targets.completionTarget);
        }

        if (action === 'start') {
            if (!canCompleteSelectedDay) {
                setSelectedExercise(exercise);
                return;
            }
            setSelectedExercise(exercise);
            setShowExerciseFlow(true);
        } else {
            setSelectedExercise(exercise);
        }
    };

    const handleExerciseStart = (exercise: Exercise) => {
        if (!canCompleteSelectedDay) {
            return;
        }

        setSelectedExercise(exercise);
        setShowExerciseFlow(true);
    };

    const handleReplacementSelect = (selectedExercise: Exercise) => {
        setPendingReplacementExercise(selectedExercise);
    };

    const handleCloseReplaceSheet = () => {
        setIsOptionalExercisesOpen(false);
        setIsOptionalMode(false);
        setExerciseToReplaceId('');
        setPendingReplacementExercise(null);
        setSimilarExercises([]);
        setReplaceScope('template');
    };

    const handleConfirmExerciseReplace = () => {
        if (!pendingReplacementExercise || !exerciseToReplaceId) {
            return;
        }

        const day: WeekDayName = daysOfWeekFull[selectedDayIndex];
        const newId =
            pendingReplacementExercise.exercise_id ?? pendingReplacementExercise._id ?? '';
        if (!newId) {
            return;
        }
        const payload = {
            [day]: [
                {
                    old_exercise_id: exerciseToReplaceId,
                    new_exercise: newId,
                },
            ],
            scope: replaceScope,
            ...(replaceScope === 'instance' ? { week_number: viewedWeekNumber } : {}),
        };

        modifyExercises(payload, {
            onSuccess: () => {
                setWeeklyProgressState((prevState) => {
                    if (!prevState) {
                        return prevState;
                    }

                    return {
                        ...prevState,
                        days: prevState.days.map((dayData) => {
                            if (dayData.day_of_week.toLowerCase() !== day.toLowerCase()) {
                                return dayData;
                            }

                            return {
                                ...dayData,
                                exercises: dayData.exercises.map((exercise: Exercise) => {
                                    if (exercise.exercise_id === exerciseToReplaceId) {
                                        return {
                                            ...pendingReplacementExercise,
                                            exercise_id: exerciseToReplaceId,
                                        };
                                    }
                                    return exercise;
                                }),
                            };
                        }),
                    };
                });
                setIsOptionalMode(false);
                setIsOptionalExercisesOpen(false);
                setExerciseToReplaceId('');
                setPendingReplacementExercise(null);
                setSimilarExercises([]);
                void queryClient.invalidateQueries({
                    queryKey: WEEKLY_WORKOUT_PROGRESS_QUERY_KEY,
                });
                void refetchWeeklyProgress();
            },
            onError: (error) => console.error('Error replacing exercises:', error.message),
        });
    };

    const handleExerciseComplete = (exerciseId: string) => {
        setCompletingExerciseIds((currentIds) =>
            currentIds.filter((currentId) => currentId !== exerciseId),
        );
        setWeeklyProgressState((prevState) => {
            if (!prevState) {
                return prevState;
            }

            return {
                ...prevState,
                days: prevState.days.map((day) => {
                    const isTargetDay = selectedDay?.date
                        ? day.date === selectedDay.date
                        : day.day_of_week.toLowerCase() === selectedDayName;

                    if (!isTargetDay) {
                        return day;
                    }

                    const updatedExercises = normalizeExercises(
                        day.exercises.map((exercise: Exercise) => {
                            const currentExerciseId = exercise.exercise_id ?? exercise._id;

                            if (currentExerciseId === exerciseId && !exercise.is_completed) {
                                return { ...exercise, is_completed: true };
                            }
                            return exercise;
                        }),
                    );

                    return {
                        ...day,
                        exercises: updatedExercises,
                        is_completed: updatedExercises.every((exercise) => exercise.is_completed),
                    };
                }),
            };
        });
        setRecentlyCompletedExerciseIds((currentIds) =>
            currentIds.includes(exerciseId) ? currentIds : [...currentIds, exerciseId],
        );
        const currentTimeout = completionHighlightTimeoutsRef.current[exerciseId];
        if (currentTimeout) {
            window.clearTimeout(currentTimeout);
        }
        completionHighlightTimeoutsRef.current[exerciseId] = window.setTimeout(() => {
            setRecentlyCompletedExerciseIds((currentIds) =>
                currentIds.filter((currentId) => currentId !== exerciseId),
            );
            delete completionHighlightTimeoutsRef.current[exerciseId];
        }, 1600);
        window.setTimeout(() => {
            void queryClient.invalidateQueries({
                queryKey: WEEKLY_WORKOUT_PROGRESS_QUERY_KEY,
            });
        }, 400);
    };

    const buildDefaultExerciseProgress = (exercise: Exercise): ExerciseProgress => {
        const sets = exercise.sets || 1;
        const reps = exercise.reps || 1;
        const workSeconds = sets * reps * DEFAULT_SECONDS_PER_REP;
        const restSeconds = Math.max(sets - 1, 0) * (exercise.rest_seconds || 0);

        return {
            exercise_id: exercise.exercise_id ?? exercise._id ?? '',
            sets_completed: sets,
            reps_completed: Array.from({ length: sets }, () => reps),
            duration_seconds: workSeconds + restSeconds,
            calories_burned: 0,
            is_completed: true,
        };
    };

    const handleQuickCompleteExercise = (exercise: Exercise) => {
        if (!canCompleteSelectedDay) {
            return;
        }

        const exerciseProgress = buildDefaultExerciseProgress(exercise);

        if (!exerciseProgress.exercise_id || !planId || !selectedDayName) {
            return;
        }

        setCompletingExerciseIds((currentIds) =>
            currentIds.includes(exerciseProgress.exercise_id)
                ? currentIds
                : [...currentIds, exerciseProgress.exercise_id],
        );

        completeWorkout(
            {
                queryParams: { workout_plan_id: planId },
                body: {
                    workout_id: planId,
                    duration_seconds: exerciseProgress.duration_seconds,
                    calories_burned: 0,
                    exercises: [exerciseProgress],
                    day_of_week: selectedDayName,
                    was_skipped: false,
                },
            },
            {
                onSuccess: () => handleExerciseComplete(exerciseProgress.exercise_id),
                onError: (error) => {
                    setCompletingExerciseIds((currentIds) =>
                        currentIds.filter(
                            (currentId) => currentId !== exerciseProgress.exercise_id,
                        ),
                    );
                    console.error('Error marking exercise complete:', error);
                },
            },
        );
    };

    useEffect(() => {
        return () => {
            Object.values(completionHighlightTimeoutsRef.current).forEach((timeoutId) => {
                window.clearTimeout(timeoutId);
            });
            completionHighlightTimeoutsRef.current = {};
        };
    }, []);

    if (sessionLoading || (loadingWeeklyProgress && !weeklyProgressState)) {
        return <LoadingScreen />;
    }

    if (weeklyProgressError) {
        return (
            <Modal
                title="Error"
                message={weeklyProgressError.message}
                onClose={() => router.push('/workouts')}
            />
        );
    }

    const handlePreviousWeek = () => {
        if (!canGoPreviousWeek) return;
        setWeekTransitionDirection(-1);
        setSelectedWeekNumber(viewedWeekNumber - 1);
        setSelectedDayIndex(0);
    };

    const handleNextWeek = () => {
        if (!canGoNextWeek) return;
        setWeekTransitionDirection(1);
        setSelectedWeekNumber(viewedWeekNumber + 1);
        setSelectedDayIndex(0);
    };

    const handleWeekSwipeEnd = (clientX: number) => {
        if (weekSwipeStartX === null) return;

        const deltaX = clientX - weekSwipeStartX;
        setWeekSwipeStartX(null);

        if (Math.abs(deltaX) < WEEK_SWIPE_THRESHOLD_PX) return;

        if (deltaX < 0) {
            handleNextWeek();
        } else {
            handlePreviousWeek();
        }
    };

    return (
        <div className="flex h-[100dvh] flex-col items-center overflow-hidden bg-[#f8faf9] px-4 py-8">
            <div className="flex w-full max-w-3xl shrink-0 flex-row items-center">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mr-4 rounded-full bg-white p-3 text-gray-700 shadow-sm"
                    aria-label={t('a11y.goBack')}
                >
                    <FaArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="flex-1 text-center text-[1.7rem] font-semibold leading-tight text-gray-900">
                    {t('workouts.my-plan.title')}
                </h1>
                <button
                    type="button"
                    onClick={() => setShowOptionsModal(true)}
                    className="ml-4 rounded-full bg-white p-3 text-gray-700 shadow-sm"
                    aria-label={t('a11y.openWorkoutMenu')}
                >
                    <HiDotsHorizontal className="h-6 w-6" />
                </button>
            </div>

            <div className="mt-5 flex min-h-0 w-full max-w-3xl flex-1 flex-col rounded-[2rem] bg-white p-4 shadow-sm">
                <button
                    type="button"
                    onClick={() => setIsSummaryExpanded((isExpanded) => !isExpanded)}
                    className={`shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-5 text-left text-white shadow-xl shadow-slate-900/15 transition-all duration-300 ease-out ${
                        isSummaryExpanded ? 'scale-[1.01]' : 'scale-100'
                    }`}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="flex items-center gap-2 text-sm font-medium text-blue-200">
                                <FaDumbbell className="text-blue-300" />
                                {viewedWeekNumber
                                    ? t('workouts.my-plan.weekNumber', {
                                          week: viewedWeekNumber,
                                      })
                                    : t('workouts.my-plan.currentWeek')}
                            </p>
                            <h2 className="mt-2 text-xl font-semibold leading-tight text-white">
                                {completedTrainingDays} {t('workouts.plan.of')}{' '}
                                {trainingDays.length} {t('workouts.my-plan.trainingDaysDone')}
                            </h2>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-lg font-bold text-white shadow-lg shadow-blue-500/25">
                                {Math.round(weekProgressPercent)}%
                            </div>
                        </div>
                    </div>

                    <div
                        className={`grid transition-all duration-300 ease-out ${
                            isSummaryExpanded
                                ? 'mt-4 grid-rows-[1fr] opacity-100'
                                : 'mt-0 grid-rows-[0fr] opacity-0'
                        }`}
                    >
                        <div className="overflow-hidden">
                            <progress
                                className="h-2 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-blue-400 [&::-webkit-progress-bar]:bg-slate-700/80 [&::-webkit-progress-value]:bg-blue-400"
                                value={weekProgressPercent}
                                max={100}
                                aria-label={t('workouts.my-plan.weekProgress')}
                            />
                            <p className="mt-3 flex items-center gap-2 text-sm text-slate-200">
                                <FaDumbbell className="text-blue-300" />
                                {todayRemaining > 0
                                    ? t('workouts.my-plan.exercisesPendingToday', {
                                          count: todayRemaining,
                                      })
                                    : t('workouts.my-plan.todayCompleted')}
                            </p>
                        </div>
                    </div>
                </button>

                <div
                    className="touch-pan-y overflow-hidden"
                    onPointerDown={(event) => setWeekSwipeStartX(event.clientX)}
                    onPointerUp={(event) => handleWeekSwipeEnd(event.clientX)}
                    onPointerCancel={() => setWeekSwipeStartX(null)}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={viewedWeekNumber}
                            initial={{
                                x: weekTransitionDirection >= 0 ? 42 : -42,
                                opacity: 0,
                                scale: 0.98,
                            }}
                            animate={{ x: 0, opacity: 1, scale: 1 }}
                            exit={{
                                x: weekTransitionDirection >= 0 ? -42 : 42,
                                opacity: 0,
                                scale: 0.98,
                            }}
                            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                        >
                            <div className="mt-4 flex shrink-0 items-center justify-between border-t border-gray-100 py-6">
                                <button
                                    type="button"
                                    onClick={handlePreviousWeek}
                                    disabled={!canGoPreviousWeek}
                                    className={`rounded-full p-2 transition-colors ${
                                        canGoPreviousWeek
                                            ? 'text-gray-700 hover:bg-gray-100'
                                            : 'cursor-not-allowed text-gray-300'
                                    }`}
                                    aria-label={t('workouts.my-plan.previousWeek')}
                                >
                                    <IoChevronBack className="h-6 w-6" />
                                </button>
                                <div className="text-center">
                                    <p className="text-md font-medium text-green-600">
                                        {t('workouts.my-plan.weekNumber', {
                                            week: viewedWeekNumber,
                                        })}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleNextWeek}
                                    disabled={!canGoNextWeek}
                                    className={`rounded-full p-2 transition-colors ${
                                        canGoNextWeek
                                            ? 'text-gray-700 hover:bg-gray-100'
                                            : 'cursor-not-allowed text-gray-300'
                                    }`}
                                    aria-label={t('workouts.my-plan.nextWeek')}
                                >
                                    <IoChevronForward className="h-6 w-6" />
                                </button>
                            </div>

                            <DaysOfWeekSelector
                                days={weekDays}
                                selectedDayIndex={selectedDayIndex}
                                setSelectedDayIndex={setSelectedDayIndex}
                                todayDate={todayDate}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="mt-4 min-h-0 flex-1 overflow-y-auto pb-[calc(2rem+env(safe-area-inset-bottom))] pr-1">
                    {isSelectedRestDay ? (
                        <div className="mt-6 flex flex-col items-center rounded-3xl border border-gray-100 bg-gray-50 px-6 py-12 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
                                <FaMoon className="h-8 w-8" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {t('workouts.my-plan.restDayTitle')}
                            </h2>
                            <p className="mt-2 max-w-xs text-sm text-gray-500">
                                {t('workouts.my-plan.restDayDescription')}
                            </p>
                        </div>
                    ) : selectedDay && selectedExercises.length > 0 ? (
                        <div className="space-y-3">
                            {isOptionalMode && (
                                <div className="flex items-center justify-between gap-3 rounded-3xl border border-blue-100 bg-blue-50 p-4 text-blue-700">
                                    <div>
                                        <h2 className="font-semibold">
                                            {t('workouts.my-plan.replaceExerciseTitle')}
                                        </h2>
                                        <p className="text-sm text-blue-700/80">
                                            {t('workouts.my-plan.replaceModeDescription')}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsOptionalMode(false);
                                            setReplaceScope('template');
                                        }}
                                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm"
                                    >
                                        {t('workouts.my-plan.cancel')}
                                    </button>
                                </div>
                            )}
                            {isDeleteMode && (
                                <div className="flex flex-col gap-3 rounded-3xl border border-red-100 bg-red-50/90 p-4 text-red-800 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="font-semibold">
                                            {t('workouts.my-plan.deleteExercise')}
                                        </h2>
                                        <p className="text-sm text-red-800/85">
                                            {t('workouts.my-plan.deleteExerciseDescription')}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <button
                                            type="button"
                                            onClick={handleCloseDeleteSheet}
                                            className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-800 shadow-sm"
                                        >
                                            {t('workouts.my-plan.cancel')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (deleteSelectionTotal === 0) return;
                                                setIsDeleteSheetOpen(true);
                                            }}
                                            disabled={deleteSelectionTotal === 0}
                                            className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${
                                                deleteSelectionTotal === 0
                                                    ? 'cursor-not-allowed bg-red-100 text-red-300'
                                                    : 'bg-red-600 text-white hover:bg-red-700'
                                            }`}
                                        >
                                            {t('workouts.my-plan.confirm')}
                                        </button>
                                    </div>
                                </div>
                            )}
                            <AnimatePresence initial={false}>
                                {isSelectedDayComplete && (
                                    <motion.div
                                        key={selectedDay?.date ?? selectedDayName}
                                        initial={{ opacity: 0, y: 14, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                                        className="flex items-center gap-3 rounded-3xl border border-green-100 bg-green-50 p-4 text-green-700"
                                    >
                                        <motion.div
                                            initial={{ scale: 0.85, rotate: -10 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 420,
                                                damping: 18,
                                                delay: 0.05,
                                            }}
                                        >
                                            <FaCheckCircle className="h-6 w-6 shrink-0" />
                                        </motion.div>
                                        <div>
                                            <h2 className="font-semibold">
                                                {t('workouts.my-plan.dayCompletedTitle')}
                                            </h2>
                                            <p className="text-sm text-green-700/80">
                                                {t('workouts.my-plan.dayCompletedDescription')}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {selectedExercises.map((exercise: Exercise, index) => {
                                const rowId = exercise.exercise_id ?? exercise._id ?? '';
                                return (
                                    <ExerciseCard
                                        key={`${rowId || index}`}
                                        exercise={exercise}
                                        onClick={(action, targets) =>
                                            handleExerciseCardClick(exercise, action, targets)
                                        }
                                        isDeleteMode={isDeleteMode}
                                        isOptionalMode={isOptionalMode}
                                        onDeleteSelect={handleDeleteSelect}
                                        onOptionalSelect={handleOptionalSelect}
                                        onCompleteSelect={handleQuickCompleteExercise}
                                        canComplete={canCompleteSelectedDay}
                                        isCompleting={Boolean(
                                            rowId && completingExerciseIds.includes(rowId),
                                        )}
                                        isRecentlyCompleted={Boolean(
                                            rowId && recentlyCompletedExerciseIds.includes(rowId),
                                        )}
                                        selectedForDelete={Boolean(
                                            rowId &&
                                            exercisesToDelete[selectedDayName]?.includes(rowId),
                                        )}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mt-6 flex flex-col items-center rounded-3xl border border-gray-100 bg-gray-50 px-6 py-12 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
                                <FaDumbbell className="h-8 w-8" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {t('workouts.my-plan.noExercisesTitle')}
                            </h2>
                            <p className="mt-2 max-w-xs text-sm text-gray-500">
                                {t('workouts.my-plan.noExercises')}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {selectedExercise && !showExerciseFlow && (
                <ExerciseDetailsModal
                    exercise={selectedExercise}
                    onClose={() => setSelectedExercise(null)}
                    onStartExercise={() => handleExerciseStart(selectedExercise)}
                    animationOrigin={exerciseAnimationOrigin}
                    canStartExercise={canCompleteSelectedDay}
                    startDisabledMessage={t('workouts.my-plan.onlyTodayCompletion')}
                />
            )}

            {showExerciseFlow && selectedExercise && (
                <ExerciseFlow
                    exercises={[selectedExercise]}
                    onClose={() => {
                        setShowExerciseFlow(false);
                        setSelectedExercise(null);
                    }}
                    onExerciseComplete={handleExerciseComplete}
                    workoutType="myPlan"
                    userId={userId}
                    workoutPlanId={planId ?? ''}
                    dayOfWeek={selectedDayName}
                    animationOrigin={exerciseAnimationOrigin}
                    completionTarget={exerciseCompletionTarget}
                />
            )}

            {/* Modal for options e.g. Change Exercise and Delete Exercise */}
            <CustomModal
                handleCloseModal={() => setShowOptionsModal(false)}
                isOpen={showOptionsModal}
            >
                {
                    <>
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div className="pl-5 pt-5">
                                <p className="text-sm font-medium text-green-600">
                                    {t('workouts.my-plan.exerciseOptions')}
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold leading-tight text-gray-950">
                                    {t('workouts.my-plan.exerciseOptionsTitle')}
                                </h2>
                                <p className="mt-2 text-sm leading-5 text-gray-500">
                                    {t('workouts.my-plan.exerciseOptionsDescription')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowOptionsModal(false)}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100"
                                aria-label={t('a11y.closeExerciseList')}
                            >
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <button
                                type="button"
                                className="flex w-full items-center gap-4 rounded-3xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-all hover:border-green-100 hover:bg-green-50/50"
                                onClick={handleOptionalMode}
                                aria-label={t('workouts.my-plan.changeExercise')}
                            >
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                                    <FiRefreshCw className="h-5 w-5" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-base font-semibold text-gray-950">
                                        {t('workouts.my-plan.changeExercise')}
                                    </span>
                                    <span className="mt-1 block text-sm leading-5 text-gray-500">
                                        {t('workouts.my-plan.changeExerciseDescription')}
                                    </span>
                                </span>
                            </button>

                            <button
                                type="button"
                                className="flex w-full items-center gap-4 rounded-3xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-all hover:border-red-100 hover:bg-red-50/60"
                                onClick={handleDeleteMode}
                                aria-label={t('workouts.my-plan.deleteExercise')}
                            >
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                                    <FiTrash2 className="h-5 w-5" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-base font-semibold text-gray-950">
                                        {t('workouts.my-plan.deleteExercise')}
                                    </span>
                                    <span className="mt-1 block text-sm leading-5 text-gray-500">
                                        {t('workouts.my-plan.deleteExerciseDescription')}
                                    </span>
                                </span>
                            </button>
                        </div>
                    </>
                }
            </CustomModal>

            <ExerciseDeleteSheet
                isOpen={isDeleteSheetOpen}
                dayLabel={deleteDayLabel}
                count={deleteSelectionTotal}
                scope={deleteScope}
                onScopeChange={setDeleteScope}
                viewedWeekNumber={viewedWeekNumber}
                onConfirm={handleConfirmDelete}
                onClose={handleCloseDeleteSheet}
                confirmDisabled={deleteSelectionTotal === 0}
            />

            <ExerciseReplaceSheet
                isOpen={isOptionalExercisesOpen}
                currentExercise={exerciseBeingReplaced}
                options={similarExercises}
                selectedExercise={pendingReplacementExercise}
                onSelectExercise={handleReplacementSelect}
                onConfirm={handleConfirmExerciseReplace}
                onClose={handleCloseReplaceSheet}
                scope={replaceScope}
                onScopeChange={setReplaceScope}
                viewedWeekNumber={viewedWeekNumber}
            />
        </div>
    );
};

export default React.memo(MyPlan);
