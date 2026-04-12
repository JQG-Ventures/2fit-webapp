import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import HomeStatsRow from './HomeStatsRow';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('framer-motion', () => ({
    motion: {
        span: ({
            children,
            initial: _i,
            animate: _a,
            transition: _t,
            ...rest
        }: PropsWithChildren<Record<string, unknown>>) => <span {...rest}>{children}</span>,
    },
    useReducedMotion: () => false,
}));

describe('HomeStatsRow', () => {
    it('shows loading skeleton when isLoading', () => {
        const { container } = render(
            <HomeStatsRow streakDays={0} sessionsThisWeek={0} totalSessions={0} isLoading />,
        );
        expect(screen.getByLabelText('home.stats.loadingAria')).toHaveAttribute(
            'aria-busy',
            'true',
        );
        expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    });

    it('shows streak empty state when streak is zero', () => {
        render(
            <HomeStatsRow
                streakDays={0}
                sessionsThisWeek={2}
                totalSessions={5}
                isLoading={false}
            />,
        );
        expect(screen.getByText('home.stats.streakEmpty')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('shows streak label when streak is positive', () => {
        render(
            <HomeStatsRow
                streakDays={3}
                sessionsThisWeek={1}
                totalSessions={10}
                isLoading={false}
            />,
        );
        expect(screen.getByText('home.stats.streakLabel')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('re-animates week stat when sessionsThisWeek increases', () => {
        const { rerender } = render(
            <HomeStatsRow
                streakDays={0}
                sessionsThisWeek={1}
                totalSessions={0}
                isLoading={false}
            />,
        );
        expect(screen.getByText('1')).toBeInTheDocument();
        rerender(
            <HomeStatsRow
                streakDays={0}
                sessionsThisWeek={3}
                totalSessions={0}
                isLoading={false}
            />,
        );
        expect(screen.getByText('3')).toBeInTheDocument();
    });
});
