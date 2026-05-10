import React from 'react';
import { QueryClient, QueryClientProvider, type UseQueryResult } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    USER_ACTIVE_PLANS_QUERY_KEY,
    WEEKLY_WORKOUT_PROGRESS_QUERY_KEY,
} from '@/app/_constants/queryKeys';

const navigation = vi.hoisted(() => ({
    push: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: navigation.push }),
}));

const mockUseApiGet = vi.fn();
vi.mock('@/app/utils/apiClient', () => ({
    useApiGet: (key: string[], url: string, options?: unknown): UseQueryResult<unknown> =>
        mockUseApiGet(key, url, options) as UseQueryResult<unknown>,
}));

vi.mock('next-auth/react', () => ({
    useSession: () => ({
        data: { user: { id: 'user-1', userName: 'Alice' } },
        status: 'authenticated',
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k }),
}));

const mockMutate = vi.fn();
vi.mock('@/app/_services/userService', () => ({
    useDeleteWorkout: () => ({ mutate: mockMutate }),
}));

const axiosMocks = vi.hoisted(() => ({
    get: vi.fn(),
}));
vi.mock('@/app/utils/axiosInstance', () => ({
    default: { get: axiosMocks.get },
}));

import { useHomeDashboard } from './useHomeDashboard';

function createClient() {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });
}

function wrap(client: QueryClient) {
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    };
}

function defaultApiMock(key: string[]) {
    const k = key[0];
    if (k === 'savedWorkoutPlans')
        return { data: { status: 'success', message: [] }, isLoading: false };
    if (k === 'homeExplore') return { data: { status: 'success', message: [] }, isLoading: false };
    if (k === 'homeByLevel') return { data: { status: 'success', message: [] }, isLoading: false };
    if (k === WEEKLY_WORKOUT_PROGRESS_QUERY_KEY[0]) return { data: undefined, isLoading: false };
    if (k === USER_ACTIVE_PLANS_QUERY_KEY[0])
        return {
            data: {
                status: 'success',
                message: [{ id: 'ch1', type: 'challenge', name: 'C', plan_type: 'challenge' }],
            },
            isLoading: false,
        };
    return { data: undefined, isLoading: false };
}

describe('useHomeDashboard', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    beforeEach(() => {
        vi.clearAllMocks();
        navigation.push.mockClear();
        mockUseApiGet.mockImplementation((key: string[]) => defaultApiMock(key));
        axiosMocks.get.mockResolvedValue({
            data: {
                status: 'success',
                message: [
                    {
                        challenge_id: 'ch1',
                        name: 'C',
                        total_days: 1,
                        progress: 0,
                        days: [],
                    },
                ],
            },
        });
    });

    it('fetches batch challenge progress and merges into plans', async () => {
        const client = createClient();
        const { result } = renderHook(() => useHomeDashboard('all'), {
            wrapper: wrap(client),
        });

        await waitFor(() => expect(result.current.challengeIds).toEqual(['ch1']));
        await waitFor(() => expect(result.current.challengeProgressData?.[0]?.id).toBe('ch1'));
        expect(axiosMocks.get).toHaveBeenCalled();
        const calledUrl = axiosMocks.get.mock.calls[0][0] as string;
        expect(calledUrl).toContain('/api/challenges/challenges/progress/batch');
        expect(calledUrl).toContain('challenge_ids=ch1');
    });

    it('does not call batch endpoint when there are no challenge plans', async () => {
        mockUseApiGet.mockImplementation((key: string[]) => {
            if (key[0] === USER_ACTIVE_PLANS_QUERY_KEY[0]) {
                return {
                    data: {
                        status: 'success',
                        message: [{ id: 'p1', type: 'library', name: 'Lib', plan_type: 'library' }],
                    },
                    isLoading: false,
                };
            }
            return defaultApiMock(key);
        });
        const client = createClient();
        const { result } = renderHook(() => useHomeDashboard('all'), {
            wrapper: wrap(client),
        });

        await waitFor(() => expect(result.current.challengeIds).toEqual([]));
        await waitFor(() => expect(axiosMocks.get).not.toHaveBeenCalled());
    });

    it('handleContinue routes by plan type', async () => {
        navigation.push.mockClear();
        const client = createClient();
        const { result } = renderHook(() => useHomeDashboard('beginner'), {
            wrapper: wrap(client),
        });

        await waitFor(() => expect(result.current.handleContinue).toBeDefined());
        result.current.handleContinue('plan-a', 'personalized');
        expect(navigation.push).toHaveBeenCalledWith('/workouts/my-plan/plan-a');
        result.current.handleContinue('chal-b', 'challenge');
        expect(navigation.push).toHaveBeenCalledWith('/workouts/challenges/chal-b');
    });

    it('handleDeleteWorkout resolves when mutation succeeds', async () => {
        mockMutate.mockImplementation(
            (_args: unknown, opts?: { onSuccess?: () => void; onError?: (e: unknown) => void }) => {
                opts?.onSuccess?.();
            },
        );
        const client = createClient();
        const { result } = renderHook(() => useHomeDashboard('all'), {
            wrapper: wrap(client),
        });

        await waitFor(() => expect(result.current.handleDeleteWorkout).toBeDefined());
        await expect(result.current.handleDeleteWorkout('w1')).resolves.toBeUndefined();
        expect(mockMutate).toHaveBeenCalled();
    });

    it('handleDeleteWorkout rejects when mutation fails', async () => {
        const err = new Error('delete failed');
        mockMutate.mockImplementation(
            (_args: unknown, opts?: { onSuccess?: () => void; onError?: (e: unknown) => void }) => {
                opts?.onError?.(err);
            },
        );
        const client = createClient();
        const { result } = renderHook(() => useHomeDashboard('all'), {
            wrapper: wrap(client),
        });

        await waitFor(() => expect(result.current.handleDeleteWorkout).toBeDefined());
        await expect(result.current.handleDeleteWorkout('w1')).rejects.toBe(err);
    });

    it('logs in development when delete fails', async () => {
        const err = new Error('delete failed');
        mockMutate.mockImplementation(
            (_args: unknown, opts?: { onSuccess?: () => void; onError?: (e: unknown) => void }) => {
                opts?.onError?.(err);
            },
        );
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.stubEnv('NODE_ENV', 'development');

        try {
            const client = createClient();
            const { result } = renderHook(() => useHomeDashboard('all'), {
                wrapper: wrap(client),
            });

            await waitFor(() => expect(result.current.handleDeleteWorkout).toBeDefined());
            await expect(result.current.handleDeleteWorkout('w1')).rejects.toBeDefined();
            expect(spy).toHaveBeenCalledWith('[useHomeDashboard] deleteSavedWorkout', err);
        } finally {
            vi.unstubAllEnvs();
            spy.mockRestore();
        }
    });

    it('computes sessionsThisWeek from weekly message', async () => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        const iso = `${y}-${m}-${d}`;

        mockUseApiGet.mockImplementation((key: string[]) => {
            if (key[0] === WEEKLY_WORKOUT_PROGRESS_QUERY_KEY[0]) {
                return {
                    data: {
                        status: 'success',
                        message: {
                            progress: 50,
                            week_start_date: iso,
                            week_end_date: iso,
                            current_week: 1,
                            week_number: 1,
                            total_weeks: 1,
                            days: [
                                {
                                    day_of_week: 'Sun',
                                    date: iso,
                                    is_completed: true,
                                    exercises: [],
                                },
                                {
                                    day_of_week: 'Mon',
                                    date: '2026-04-13',
                                    is_completed: false,
                                    exercises: [],
                                },
                            ],
                        },
                    },
                    isLoading: false,
                };
            }
            return defaultApiMock(key);
        });

        const client = createClient();
        const { result } = renderHook(() => useHomeDashboard('all'), {
            wrapper: wrap(client),
        });

        await waitFor(() => expect(result.current.sessionsThisWeek).toBe(1));
        await waitFor(() => expect(result.current.planProgress).toBe(50));
        vi.useRealTimers();
    });

    it('picks today pending exercise when weekly message has matching date', async () => {
        const today = new Date('2026-06-15T10:00:00Z');
        vi.setSystemTime(today);
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        const iso = `${y}-${m}-${d}`;

        mockUseApiGet.mockImplementation((key: string[]) => {
            if (key[0] === WEEKLY_WORKOUT_PROGRESS_QUERY_KEY[0]) {
                return {
                    data: {
                        status: 'success',
                        message: {
                            progress: 10,
                            week_start_date: iso,
                            week_end_date: iso,
                            current_week: 1,
                            week_number: 1,
                            total_weeks: 1,
                            days: [
                                {
                                    day_of_week: 'Mon',
                                    date: iso,
                                    is_completed: false,
                                    exercises: [
                                        {
                                            exercise_id: 'e1',
                                            name: 'Push',
                                            sets: 3,
                                            reps: 10,
                                            rest_seconds: 60,
                                            difficulty: 'easy',
                                            description: 'desc',
                                            image_url: '',
                                            is_completed: false,
                                        },
                                        {
                                            exercise_id: 'e2',
                                            name: 'Done',
                                            sets: 1,
                                            reps: 1,
                                            rest_seconds: 0,
                                            difficulty: 'easy',
                                            description: '',
                                            image_url: '',
                                            is_completed: true,
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                    isLoading: false,
                };
            }
            return defaultApiMock(key);
        });

        const client = createClient();
        const { result } = renderHook(() => useHomeDashboard('all'), {
            wrapper: wrap(client),
        });

        await waitFor(() => expect(result.current.todayExercise?.name).toBe('Push'));
    });

    it('returns null todayExercise when all exercises for today are completed', async () => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        const iso = `${y}-${m}-${d}`;

        mockUseApiGet.mockImplementation((key: string[]) => {
            if (key[0] === WEEKLY_WORKOUT_PROGRESS_QUERY_KEY[0]) {
                return {
                    data: {
                        status: 'success',
                        message: {
                            progress: 0,
                            week_start_date: iso,
                            week_end_date: iso,
                            current_week: 1,
                            week_number: 1,
                            total_weeks: 1,
                            days: [
                                {
                                    day_of_week: 'Sun',
                                    date: iso,
                                    is_completed: false,
                                    exercises: [
                                        {
                                            exercise_id: 'e1',
                                            name: 'Done',
                                            sets: 1,
                                            reps: 1,
                                            rest_seconds: 0,
                                            difficulty: 'easy',
                                            description: '',
                                            image_url: '',
                                            is_completed: true,
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                    isLoading: false,
                };
            }
            return defaultApiMock(key);
        });

        const client = createClient();
        const { result } = renderHook(() => useHomeDashboard('all'), {
            wrapper: wrap(client),
        });

        await waitFor(() => expect(result.current.todayExercise).toBeNull());
    });

    it('returns null todayExercise when weekly days do not include today', async () => {
        mockUseApiGet.mockImplementation((key: string[]) => {
            if (key[0] === WEEKLY_WORKOUT_PROGRESS_QUERY_KEY[0]) {
                return {
                    data: {
                        status: 'success',
                        message: {
                            progress: 0,
                            week_start_date: '2020-01-01',
                            week_end_date: '2020-01-07',
                            current_week: 1,
                            week_number: 1,
                            total_weeks: 1,
                            days: [
                                {
                                    day_of_week: 'Mon',
                                    date: '2020-01-01',
                                    is_completed: false,
                                    exercises: [
                                        {
                                            exercise_id: 'e1',
                                            name: 'Old',
                                            sets: 1,
                                            reps: 1,
                                            rest_seconds: 0,
                                            difficulty: 'easy',
                                            description: '',
                                            image_url: '',
                                            is_completed: false,
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                    isLoading: false,
                };
            }
            return defaultApiMock(key);
        });

        const client = createClient();
        const { result } = renderHook(() => useHomeDashboard('all'), {
            wrapper: wrap(client),
        });

        await waitFor(() => expect(result.current.todayExercise).toBeNull());
    });

    it('sets hasActivePlans when user has active plans', async () => {
        const client = createClient();
        const { result } = renderHook(() => useHomeDashboard('all'), {
            wrapper: wrap(client),
        });

        await waitFor(() => expect(result.current.hasActivePlans).toBe(true));
    });
});
