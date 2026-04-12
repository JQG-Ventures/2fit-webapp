import { describe, expect, it } from 'vitest';

import type { ActiveUserPlan } from '@/app/_types/home';
import type { ChallengeProgress } from '@/app/_types/challenges';

import { mergeChallengePlansWithProgress } from './mergeChallengeProgress';

const basePlan = (id: string, name: string): ActiveUserPlan & { plan_type: 'challenge' } => ({
    id,
    name,
    plan_type: 'challenge',
});

describe('mergeChallengePlansWithProgress', () => {
    it('returns empty array when plans is empty', () => {
        expect(mergeChallengePlansWithProgress([], [])).toEqual([]);
    });

    it('maps progress by challenge_id and attaches to plan id', () => {
        const plans = [basePlan('c1', 'Alpha'), basePlan('c2', 'Beta')];
        const progresses: ChallengeProgress[] = [
            {
                challenge_id: 'c2',
                name: 'Beta',
                total_days: 7,
                progress: 10,
                days: [],
            },
            {
                challenge_id: 'c1',
                name: 'Alpha',
                total_days: 7,
                progress: 20,
                days: [],
            },
        ];

        const merged = mergeChallengePlansWithProgress(plans, progresses);
        expect(merged).toHaveLength(2);
        expect(merged[0]).toMatchObject({
            id: 'c1',
            plan_type: 'challenge',
            name: 'Alpha',
            progressData: progresses[1],
        });
        expect(merged[1]).toMatchObject({
            id: 'c2',
            name: 'Beta',
            progressData: progresses[0],
        });
    });

    it('uses null progressData when no matching challenge_id', () => {
        const plans = [basePlan('c1', 'Only')];
        const merged = mergeChallengePlansWithProgress(plans, []);
        expect(merged[0].progressData).toBeNull();
    });

    it('ignores progress entries without challenge_id', () => {
        const plans = [basePlan('c1', 'Only')];
        const progresses = [
            {
                challenge_id: '',
                name: 'x',
                total_days: 1,
                progress: 0,
                days: [],
            } as ChallengeProgress,
        ];
        const merged = mergeChallengePlansWithProgress(plans, progresses);
        expect(merged[0].progressData).toBeNull();
    });

    it('last duplicate challenge_id in input wins in the map', () => {
        const plans = [basePlan('c1', 'One')];
        const first: ChallengeProgress = {
            challenge_id: 'c1',
            name: 'first',
            total_days: 1,
            progress: 1,
            days: [],
        };
        const second: ChallengeProgress = {
            challenge_id: 'c1',
            name: 'second',
            total_days: 1,
            progress: 2,
            days: [],
        };
        const merged = mergeChallengePlansWithProgress(plans, [first, second]);
        expect(merged[0].progressData?.name).toBe('second');
    });
});
