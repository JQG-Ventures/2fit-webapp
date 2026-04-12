export type ActivePlanType = 'library' | 'paid' | 'personalized' | 'challenge';

export interface ActiveUserPlan {
    id: string;
    name: string;
    plan_type: ActivePlanType;
}

export interface WeeklyProgressExercise {
    exercise_id: string;
    name: string | null;
    sets: number;
    reps: number;
    rest_seconds: number;
    difficulty: string | null;
    description: string | null;
    image_url: string | null;
    video_url?: string | null;
    is_completed: boolean;
}

export interface WeeklyProgressDay {
    day_of_week: string;
    date: string;
    is_completed: boolean;
    exercises: WeeklyProgressExercise[];
}

export interface WeeklyProgressMessage {
    week_start_date: string;
    week_end_date: string;
    progress: number;
    days: WeeklyProgressDay[];
}
