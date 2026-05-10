import { describe, expect, it } from 'vitest';

import { USER_ACTIVE_PLANS_QUERY_KEY, WEEKLY_WORKOUT_PROGRESS_QUERY_KEY } from './queryKeys';

describe('queryKeys', () => {
    it('keeps weekly progress and active user plans on distinct cache keys', () => {
        expect(WEEKLY_WORKOUT_PROGRESS_QUERY_KEY).not.toEqual(USER_ACTIVE_PLANS_QUERY_KEY);
        expect(WEEKLY_WORKOUT_PROGRESS_QUERY_KEY[0]).not.toBe(USER_ACTIVE_PLANS_QUERY_KEY[0]);
    });
});
