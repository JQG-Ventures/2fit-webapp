import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import WorkoutHeroCard from './WorkoutHeroCard';

const push = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/utils/translateFitnessLevel', () => ({
    translateFitnessLevel: (d: string | null | undefined) => d ?? 'level',
}));

describe('WorkoutHeroCard', () => {
    it('renders skeleton when loading', () => {
        const { container } = render(
            <WorkoutHeroCard pendingExercise={null} planProgress={0} hasPlan={false} isLoading />,
        );
        expect(container.querySelector('.animate-pulse')).toBeTruthy();
    });

    it('no-plan CTA navigates to workouts', async () => {
        const user = userEvent.setup();
        push.mockClear();

        render(
            <WorkoutHeroCard
                pendingExercise={null}
                planProgress={0}
                hasPlan={false}
                isLoading={false}
            />,
        );

        await user.click(screen.getByRole('button'));
        expect(push).toHaveBeenCalledWith('/workouts');
    });

    it('with plan shows exercise copy and progress bar width', () => {
        render(
            <WorkoutHeroCard
                pendingExercise={{
                    name: 'Squat',
                    description: 'Leg day focus area for strength',
                    difficulty: 'intermediate',
                    image_url: '',
                }}
                planProgress={40}
                hasPlan
                isLoading={false}
            />,
        );

        expect(screen.getByText('Squat')).toBeInTheDocument();
        expect(screen.getByText('40%')).toBeInTheDocument();
        const rect = document
            .querySelector('[data-testid="workout-hero-plan-progress"]')
            ?.querySelector('rect');
        expect(rect?.getAttribute('width')).toBe('40');
    });

    it('uses default description when exercise description is empty', () => {
        render(
            <WorkoutHeroCard
                pendingExercise={{
                    name: 'A',
                    description: '',
                    difficulty: 'beginner',
                    image_url: '',
                }}
                planProgress={0}
                hasPlan
                isLoading={false}
            />,
        );
        expect(screen.getByText('home.workoutHero.defaultDescription')).toBeInTheDocument();
    });

    it('shows spinner on CTA while navigating (with plan)', async () => {
        const user = userEvent.setup();
        render(
            <WorkoutHeroCard
                pendingExercise={{
                    name: 'Move',
                    description: 'x',
                    difficulty: 'beginner',
                    image_url: '',
                }}
                planProgress={10}
                hasPlan
                isLoading={false}
            />,
        );

        await user.click(screen.getByRole('button'));
        expect(document.querySelector('.animate-spin')).toBeTruthy();
    });
});
