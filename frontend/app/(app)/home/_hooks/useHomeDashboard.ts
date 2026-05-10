'use client';

import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import { useApiGet } from '@/app/utils/apiClient';
import { useDeleteWorkout } from '@/app/_services/userService';
import axiosInstance from '@/app/utils/axiosInstance';
import { API_ROUTES } from '@/lib/apiRoutes';
import {
    USER_ACTIVE_PLANS_QUERY_KEY,
    WEEKLY_WORKOUT_PROGRESS_QUERY_KEY,
} from '@/app/_constants/queryKeys';
import type { HomeDiscoveryCard, HomeLevelFilter } from '@/app/_types/homeDiscovery';
import type {
    ActiveUserPlan,
    WeeklyProgressExercise,
    WeeklyProgressMessage,
} from '@/app/_types/workoutProgress';
import type { PlanWithProgress, ChallengeProgress } from '@/app/_types/challenges';
import type { ApiResponse } from '@/app/_types/api';
import type { AppClientSession } from '@/app/_types/appSession';
import { mergeChallengePlansWithProgress } from '@/app/(app)/home/_lib/mergeChallengeProgress';
import { HOME_BY_LEVEL_CARD_LIMIT, HOME_EXPLORE_CARD_LIMIT } from '@/app/(app)/home/constants';

const CHALLENGE_PROGRESS_STALE_MS = 1000 * 60 * 5;

export function useHomeDashboard(trainingLevel: HomeLevelFilter) {
    const { t } = useTranslation('global');
    const router = useRouter();
    const { data: sessionData, status: sessionStatus } = useSession();
    const session = sessionData as AppClientSession | null;
    const userId = session?.user?.id ?? session?.user?.userId;
    const userName = session?.user?.userName ?? session?.user?.name ?? t('home.greeting.guestName');

    const { mutate: deleteSavedWorkout } = useDeleteWorkout();

    const savedWorkoutPlansUrl = API_ROUTES.workouts.saved;
    const homeExploreUrl = `${API_ROUTES.workouts.homeExplore}?limit=${HOME_EXPLORE_CARD_LIMIT}`;
    const homeByLevelUrl = `${API_ROUTES.workouts.homeByLevel}?level=${trainingLevel}&limit=${HOME_BY_LEVEL_CARD_LIMIT}`;
    const activePlansUrl = API_ROUTES.workouts.weeklyProgress;
    const getActivePlansUrl = API_ROUTES.users.activePlans;

    const { data: savedWorkoutPlans } = useApiGet<ApiResponse<WorkoutPlan[]>>(
        ['savedWorkoutPlans'],
        savedWorkoutPlansUrl,
    );
    const { data: exploreCards, isLoading: loadingExplore } = useApiGet<
        ApiResponse<HomeDiscoveryCard[]>
    >(['homeExplore'], homeExploreUrl);
    const { data: byLevelCards, isLoading: loadingByLevel } = useApiGet<
        ApiResponse<HomeDiscoveryCard[]>
    >(['homeByLevel', trainingLevel], homeByLevelUrl);
    const { data: activePlans, isLoading: loadingActivePlans } = useApiGet<
        ApiResponse<WeeklyProgressMessage>
    >(WEEKLY_WORKOUT_PROGRESS_QUERY_KEY, activePlansUrl);
    const { data: userActivePlans, isLoading: loadingUserActivePlans } = useApiGet<
        ApiResponse<ActiveUserPlan[]>
    >(USER_ACTIVE_PLANS_QUERY_KEY, getActivePlansUrl);

    const challengePlansForProgress = useMemo(
        () =>
            (userActivePlans?.message ?? []).filter(
                (p): p is ActiveUserPlan & { plan_type: 'challenge' } =>
                    p.plan_type === 'challenge',
            ),
        [userActivePlans?.message],
    );

    const challengeIds = useMemo(
        () => challengePlansForProgress.map((p) => p.id),
        [challengePlansForProgress],
    );

    const { data: challengeProgressData, isLoading: loadingChallengeProgress } = useQuery<
        PlanWithProgress[]
    >({
        queryKey: ['challengeProgress', challengeIds],
        queryFn: async () => {
            if (!challengeIds.length) return [];
            const params = new URLSearchParams(
                challengeIds.map((id) => ['challenge_ids', id] as [string, string]),
            );
            const response = await axiosInstance.get<ApiResponse<ChallengeProgress[]>>(
                `${API_ROUTES.challenges.progressBatch}?${params.toString()}`,
            );
            const progresses = response.data.message ?? [];
            return mergeChallengePlansWithProgress(challengePlansForProgress, progresses);
        },
        enabled: !loadingUserActivePlans && challengeIds.length > 0,
        staleTime: CHALLENGE_PROGRESS_STALE_MS,
    });

    const todayExercise = useMemo((): WeeklyProgressExercise | null => {
        const msg = activePlans?.message;
        if (!msg?.days?.length) return null;

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        const todayPlan = msg.days.find((entry) => entry.date === todayStr);

        if (todayPlan) {
            return todayPlan.exercises.find((exercise) => !exercise.is_completed) ?? null;
        }

        return null;
    }, [activePlans?.message]);

    const weeklyMessage = activePlans?.message;
    const planProgress = weeklyMessage ? weeklyMessage.progress : 0;

    const sessionsThisWeek = useMemo(() => {
        const days = weeklyMessage?.days;
        if (!days?.length) return 0;
        return days.filter((d) => d.is_completed).length;
    }, [weeklyMessage?.days]);

    const handleDeleteWorkout = useCallback(
        (id: string): Promise<void> =>
            new Promise((resolve, reject) => {
                deleteSavedWorkout(
                    { queryParams: { workout_id: id } },
                    {
                        onSuccess: () => resolve(),
                        onError: (error: unknown) => {
                            if (process.env.NODE_ENV === 'development') {
                                console.error('[useHomeDashboard] deleteSavedWorkout', error);
                            }
                            reject(error);
                        },
                    },
                );
            }),
        [deleteSavedWorkout],
    );

    const handleContinue = useCallback(
        (planId: string, planType: string) => {
            if (planType === 'personalized') {
                router.push(`/workouts/my-plan/${planId}`);
            } else if (planType === 'challenge') {
                router.push(`/workouts/challenges/${planId}`);
            }
        },
        [router],
    );

    const hasActivePlans = !!userId && (userActivePlans?.message?.length ?? 0) > 0;

    return {
        t,
        sessionStatus,
        userId,
        userName,
        savedWorkoutPlans,
        exploreCards,
        byLevelCards,
        activePlans,
        userActivePlans,
        loadingExplore,
        loadingByLevel,
        loadingActivePlans,
        loadingUserActivePlans,
        challengeIds,
        challengeProgressData,
        loadingChallengeProgress,
        todayExercise,
        planProgress,
        sessionsThisWeek,
        handleDeleteWorkout,
        handleContinue,
        hasActivePlans,
    };
}
