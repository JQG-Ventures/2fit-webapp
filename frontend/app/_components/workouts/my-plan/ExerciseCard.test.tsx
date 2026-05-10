import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import ExerciseCard from './ExerciseCard';

vi.mock('next/image', () => {
    const MockNextImage = ({ alt }: { alt: string }) => (
        <div aria-label={alt} data-testid="mock-next-image" role="img" />
    );
    MockNextImage.displayName = 'MockNextImage';

    return {
        default: MockNextImage,
    };
});

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
    motion: {
        div: forwardRef<
            HTMLDivElement,
            ComponentPropsWithoutRef<'div'> & {
                animate?: unknown;
                initial?: unknown;
                exit?: unknown;
                transition?: unknown;
                layout?: unknown;
            }
        >(function MockMotionDiv(
            {
                children,
                animate: _animate,
                initial: _initial,
                exit: _exit,
                transition: _transition,
                layout: _layout,
                ...props
            },
            ref,
        ) {
            return (
                <div ref={ref} {...props}>
                    {children}
                </div>
            );
        }),
        span: forwardRef<
            HTMLSpanElement,
            ComponentPropsWithoutRef<'span'> & {
                animate?: unknown;
                initial?: unknown;
                exit?: unknown;
                transition?: unknown;
                layout?: unknown;
            }
        >(function MockMotionSpan(
            {
                children,
                animate: _animate,
                initial: _initial,
                exit: _exit,
                transition: _transition,
                layout: _layout,
                ...props
            },
            ref,
        ) {
            return (
                <span ref={ref} {...props}>
                    {children}
                </span>
            );
        }),
        button: forwardRef<
            HTMLButtonElement,
            ComponentPropsWithoutRef<'button'> & {
                animate?: unknown;
                initial?: unknown;
                exit?: unknown;
                transition?: unknown;
                layout?: unknown;
            }
        >(function MockMotionButton(
            {
                children,
                animate: _animate,
                initial: _initial,
                exit: _exit,
                transition: _transition,
                layout: _layout,
                ...props
            },
            ref,
        ) {
            return (
                <button ref={ref} {...props}>
                    {children}
                </button>
            );
        }),
    },
}));

const baseExercise: Exercise = {
    _id: 'exercise-1',
    exercise_id: 'exercise-1',
    name: 'Push Up',
    image_url: '',
    sets: 3,
    reps: 12,
    rest_seconds: 45,
    category: 'strength',
    muscle_group: ['Chest'],
    difficulty: 'beginner',
    description: 'desc',
    equipment: [],
    is_completed: false,
};

describe('ExerciseCard', () => {
    it('calls quick complete when the check button is pressed', async () => {
        const user = userEvent.setup();
        const onCompleteSelect = vi.fn();

        render(
            <ExerciseCard
                exercise={baseExercise}
                onClick={vi.fn()}
                isDeleteMode={false}
                isOptionalMode={false}
                onDeleteSelect={vi.fn()}
                onOptionalSelect={vi.fn()}
                onCompleteSelect={onCompleteSelect}
                selectedForDelete={false}
                canComplete
                isCompleting={false}
                isRecentlyCompleted={false}
            />,
        );

        await user.click(
            screen.getByRole('button', {
                name: /workouts\.my-plan\.markExerciseDone: Push Up/i,
            }),
        );

        expect(onCompleteSelect).toHaveBeenCalledWith(baseExercise);
    });

    it('renders a spinner state while the exercise is completing', () => {
        render(
            <ExerciseCard
                exercise={baseExercise}
                onClick={vi.fn()}
                isDeleteMode={false}
                isOptionalMode={false}
                onDeleteSelect={vi.fn()}
                onOptionalSelect={vi.fn()}
                onCompleteSelect={vi.fn()}
                selectedForDelete={false}
                canComplete
                isCompleting
                isRecentlyCompleted={false}
            />,
        );

        expect(screen.getByTestId('exercise-completing-button')).toBeDisabled();
        expect(screen.getByText('workouts.my-plan.completingExercise')).toBeInTheDocument();
    });

    it('renders the success flash state right after completion', () => {
        render(
            <ExerciseCard
                exercise={{ ...baseExercise, is_completed: true }}
                onClick={vi.fn()}
                isDeleteMode={false}
                isOptionalMode={false}
                onDeleteSelect={vi.fn()}
                onOptionalSelect={vi.fn()}
                onCompleteSelect={vi.fn()}
                selectedForDelete={false}
                canComplete
                isCompleting={false}
                isRecentlyCompleted
            />,
        );

        expect(screen.getByTestId('exercise-completed-button')).toBeDisabled();
        expect(screen.getByText('workouts.my-plan.exerciseCompleted')).toBeInTheDocument();
    });
});
