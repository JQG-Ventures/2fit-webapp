export type HomeDiscoveryCardType = 'workout_plan' | 'challenge';

export type HomeLevelFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

export interface HomeDiscoveryCard {
    id: string;
    card_type: HomeDiscoveryCardType;
    title: string;
    description: string;
    image_url: string;
    level: string;
    plan_type: string;
    estimated_minutes: number;
    day_count: number;
    exercise_count: number;
}
