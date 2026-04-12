import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { PlanWithProgress } from '@/app/_types/challenges';

import ChallengeProgressWidget from './ChallengeProgressWidget';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const baseProgress = (id: string): PlanWithProgress => ({
    id,
    plan_type: 'challenge',
    name: 'Test challenge',
    progressData: {
        challenge_id: id,
        name: 'Test challenge',
        total_days: 3,
        progress: 33,
        days: [
            {
                sequence_day: 1,
                date: '2026-01-01',
                is_completed: true,
                status: 'completed',
                exercises: [],
            },
            {
                sequence_day: 2,
                date: '2026-01-02',
                is_completed: false,
                status: 'in_progress',
                exercises: [],
            },
            {
                sequence_day: 3,
                date: '2026-01-03',
                is_completed: false,
                status: 'pending',
                exercises: [],
            },
        ],
    },
});

describe('ChallengeProgressWidget', () => {
    it('renders loading skeleton', () => {
        const { container } = render(
            <ChallengeProgressWidget progressData={[]} onContinue={vi.fn()} isLoading />,
        );
        expect(container.querySelector('.animate-pulse')).toBeTruthy();
    });

    it('returns null when no challenge plans', () => {
        const { container } = render(
            <ChallengeProgressWidget progressData={[]} onContinue={vi.fn()} isLoading={false} />,
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders pulse placeholder when progressData is null', () => {
        const data: PlanWithProgress[] = [
            {
                id: 'c1',
                plan_type: 'challenge',
                name: 'X',
                progressData: null,
            },
        ];
        const { container } = render(
            <ChallengeProgressWidget progressData={data} onContinue={vi.fn()} isLoading={false} />,
        );
        expect(container.querySelector('.animate-pulse')).toBeTruthy();
    });

    it('renders challenge row and calls onContinue', async () => {
        const onContinue = vi.fn();
        const user = userEvent.setup();
        render(
            <ChallengeProgressWidget
                progressData={[baseProgress('plan-1')]}
                onContinue={onContinue}
                isLoading={false}
            />,
        );

        expect(screen.getByText('Test challenge')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'a11y.continueChallenge' }));
        expect(onContinue).toHaveBeenCalledWith('plan-1', 'challenge');
    });

    it('caps current day when completed exceeds total_days edge', () => {
        const data: PlanWithProgress[] = [
            {
                id: 'c2',
                plan_type: 'challenge',
                name: 'Edge',
                progressData: {
                    challenge_id: 'c2',
                    name: 'Edge',
                    total_days: 2,
                    progress: 100,
                    days: [
                        {
                            sequence_day: 1,
                            date: '2026-01-01',
                            is_completed: true,
                            status: 'completed',
                            exercises: [],
                        },
                        {
                            sequence_day: 2,
                            date: '2026-01-02',
                            is_completed: true,
                            status: 'completed',
                            exercises: [],
                        },
                    ],
                },
            },
        ];
        render(
            <ChallengeProgressWidget progressData={data} onContinue={vi.fn()} isLoading={false} />,
        );
        expect(screen.getByText(/workouts.challenges.day/)).toBeInTheDocument();
    });
});
