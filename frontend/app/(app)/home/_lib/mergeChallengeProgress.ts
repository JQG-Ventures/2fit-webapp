import type { ActiveUserPlan } from '@/app/_types/home';
import type { ChallengeProgress, PlanWithProgress } from '@/app/_types/challenges';

/**
 * Joins active challenge plans with API progress objects by `challenge_id`,
 * so order mismatches between request and response cannot mis-assign progress.
 */
export function mergeChallengePlansWithProgress(
    plans: Array<ActiveUserPlan & { plan_type: 'challenge' }>,
    progresses: ChallengeProgress[],
): PlanWithProgress[] {
    const byChallengeId = new Map<string, ChallengeProgress>();
    for (const prog of progresses) {
        if (prog?.challenge_id) {
            byChallengeId.set(prog.challenge_id, prog);
        }
    }

    return plans.map((plan) => ({
        id: plan.id,
        plan_type: 'challenge' as const,
        name: plan.name,
        progressData: byChallengeId.get(plan.id) ?? null,
    }));
}
