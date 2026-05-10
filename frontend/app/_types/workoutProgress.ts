import type { ChallengeProgress } from '@/app/_types/challenges';

export type ActivePlanType = 'library' | 'paid' | 'personalized' | 'challenge';

export interface ActiveUserPlan {
    id: string;
    type: ActivePlanType;
    name: string;
    plan_type: ActivePlanType;
}

export interface WorkoutFlowExercise {
    _id?: string;
    exercise_id?: string;
    name: string | null;
    sets: number;
    reps: number;
    rest_seconds: number;
    description: string | null;
    image_url: string | null;
    video_url?: string | null;
    difficulty?: string | null;
    muscle_group?: string[];
    is_completed?: boolean;
}

export interface WeeklyProgressExercise extends WorkoutFlowExercise {
    exercise_id: string;
    difficulty: string | null;
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
    current_week: number;
    week_number: number;
    total_weeks: number;
    progress: number;
    days: WeeklyProgressDay[];
}

export interface WorkoutDisplayDay extends Omit<WeeklyProgressDay, 'exercises'> {
    exercises: WorkoutFlowExercise[];
}

export interface WorkoutDisplayMessage extends Omit<WeeklyProgressMessage, 'days'> {
    days: WorkoutDisplayDay[];
}

export interface WorkoutProgressExerciseLeft {
    exercise_id: string;
    reps: number;
    rest_seconds: number;
    sets?: number;
    sets_left?: number;
    total_sets?: number;
}

export interface WorkoutProgressSummary {
    progress: number;
    exercises_left: WorkoutProgressExerciseLeft[];
}

export type ActivePlanProgressData = WorkoutProgressSummary | ChallengeProgress;
