import type { ReactNode } from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { QueryKey, UseQueryResult } from '@tanstack/react-query';

import WorkoutsPage from './page';
import { USER_ACTIVE_PLANS_QUERY_KEY } from '@/app/_constants/queryKeys';
import type { ApiResponse } from '@/app/_types/api';
import type { ActiveUserPlan } from '@/app/_types/home';

interface WorkoutProgressSummary {
    progress: number;
    exercises_left?: Array<Pick<Exercise, '_id'>>;
}

type WorkoutsPageQueryResult<T> = Pick<UseQueryResult<T>, 'data' | 'isLoading' | 'isError'>;
type ActivePlansQueryResult = WorkoutsPageQueryResult<ApiResponse<ActiveUserPlan[]>>;
type PopularWorkoutsQueryResult = WorkoutsPageQueryResult<ApiResponse<WorkoutPlan[]>>;
type MockedUseApiGetResult = ActivePlansQueryResult | PopularWorkoutsQueryResult;
type ProgressResponse = {
    data: ApiResponse<WorkoutProgressSummary>;
};

const push = vi.fn();
const back = vi.fn();
const useApiGetMock = vi.fn();
const axiosGetMock = vi.fn();
const tMock = (key: string) => key;

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push, back }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: tMock,
    }),
}));

vi.mock('swiper/css', () => ({}));
vi.mock('swiper/css/pagination', () => ({}));
vi.mock('swiper/react', () => ({
    Swiper: ({ children }: { children: ReactNode }) => <div data-testid="swiper">{children}</div>,
    SwiperSlide: ({ children }: { children: ReactNode }) => (
        <div data-testid="swiper-slide">{children}</div>
    ),
}));
vi.mock('swiper/modules', () => ({
    Pagination: {},
}));

vi.mock('@/app/utils/apiClient', () => ({
    useApiGet: (key: QueryKey, url: string, options?: unknown): MockedUseApiGetResult =>
        useApiGetMock(key, url, options) as MockedUseApiGetResult,
}));

vi.mock('@/app/utils/axiosInstance', () => ({
    default: {
        get: (
            url: string,
            config?: { params?: Record<string, string> },
        ): Promise<ProgressResponse> => axiosGetMock(url, config) as Promise<ProgressResponse>,
    },
}));

vi.mock('@/app/_components/animations/LoadingScreen', () => ({
    default: () => <div data-testid="loading-screen">loading</div>,
}));

vi.mock('@/app/_components/_sections/PopularWorkoutsSection', () => ({
    default: ({ workouts }: { workouts: WorkoutPlan[] }) => (
        <div data-testid="popular-section">{workouts.length}</div>
    ),
}));

vi.mock('@/app/_components/others/ProgressSlider', () => ({
    default: ({ percentage }: { percentage: number }) => (
        <div data-testid="progress-bar">{percentage}</div>
    ),
}));

vi.mock('@/app/_components/profile/modal', () => ({
    default: ({ message }: { message: string }) => <div data-testid="error-modal">{message}</div>,
}));

describe('Workouts page', () => {
    beforeEach(() => {
        push.mockReset();
        back.mockReset();
        useApiGetMock.mockReset();
        axiosGetMock.mockReset();
    });

    afterEach(() => {
        cleanup();
    });

    it('keeps the loading screen while active plans are still loading', async () => {
        const activePlansResult: ActivePlansQueryResult = {
            data: undefined,
            isLoading: true,
            isError: false,
        };
        const popularWorkoutsResult: PopularWorkoutsQueryResult = {
            data: { status: 'success', message: [] },
            isLoading: false,
            isError: false,
        };

        useApiGetMock.mockImplementation((key: QueryKey): MockedUseApiGetResult => {
            if (key[0] === USER_ACTIVE_PLANS_QUERY_KEY[0]) {
                return activePlansResult;
            }

            if (key[0] === 'popularWorkouts') {
                return popularWorkoutsResult;
            }

            throw new Error(`Unexpected query key: ${String(key[0])}`);
        });

        render(<WorkoutsPage />);
        await act(async () => {});

        expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
        expect(screen.queryByTestId('popular-section')).not.toBeInTheDocument();
        expect(axiosGetMock).not.toHaveBeenCalled();
    });

    it('renders plan progress once active plans and progress requests finish', async () => {
        const activePlansResult: ActivePlansQueryResult = {
            data: {
                status: 'success',
                message: [
                    {
                        id: 'plan-1',
                        name: 'Weekly plan',
                        plan_type: 'personalized',
                    },
                ],
            },
            isLoading: false,
            isError: false,
        };
        const popularWorkoutsResult: PopularWorkoutsQueryResult = {
            data: { status: 'success', message: [] },
            isLoading: false,
            isError: false,
        };

        useApiGetMock.mockImplementation((key: QueryKey): MockedUseApiGetResult => {
            if (key[0] === USER_ACTIVE_PLANS_QUERY_KEY[0]) {
                return activePlansResult;
            }

            if (key[0] === 'popularWorkouts') {
                return popularWorkoutsResult;
            }

            throw new Error(`Unexpected query key: ${String(key[0])}`);
        });
        axiosGetMock.mockResolvedValue({
            data: {
                status: 'success',
                message: {
                    progress: 60,
                    exercises_left: [{ _id: 'exercise-1' }],
                },
            },
        });

        render(<WorkoutsPage />);

        await waitFor(() => {
            expect(screen.getByText('workouts.weeklyRoutine')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.queryByTestId('loading-screen')).not.toBeInTheDocument();
        });
        expect(screen.getByText(/1\s+workouts\.exercise\s+workouts\.left/i)).toBeInTheDocument();
        expect(screen.getByTestId('progress-bar')).toHaveTextContent('60');
    });
});
