type RawChallenge = {
    _id: string;
    name: string;
    description: string;
    duration_days: number;
    level: string;
    image_url: string;
    price: number;
    category: string[];
    intensity: boolean;
    workout_schedule: {
        sequence_day: number;
        name: string;
        is_rest: boolean;
        exercises: Exercise[];
    }[];
    equipment: string[];
};

type FormattedChallenge = {
    title: string;
    description: string;
    days: number;
    difficulty: string;
    equipment: boolean;
    image: string;
    schedule: {
        week: number;
        days: {
            name?: string;
            rest: boolean;
        }[];
    }[];
};

interface ChallengeProgress {
    challenge_id?: string;
    name: string;
    total_days: number;
    progress: number;
    days?: Array<{
        sequence_day: number;
        date: string;
        is_completed: boolean;
        status: 'completed' | 'failed' | 'in_progress' | 'pending';
        exercises: Array<{
            exercise_id: string;
            name: string;
            sets: number;
            reps: number;
            rest_seconds: number;
            image_url: string;
            is_completed: boolean;
        }>;
    }>;
}

type ChallengeDay = {
    sequence_day: number;
    is_completed: boolean;
    status: 'completed' | 'failed' | 'in_progress' | 'pending';
};

type PlanWithProgress = {
    id: string;
    plan_type: 'challenge';
    name: string;
    progressData: ChallengeProgress | null;
};
