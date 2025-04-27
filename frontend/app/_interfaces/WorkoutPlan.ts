interface WorkoutPlan {
    _id: string;
    name: string;
    description: string;
    plan_type: 'library' | 'paid' | 'personalized' | 'challenge';
    duration_weeks: number;
    price: number;
    image_url: string;
    video_url: string;
    workout_schedule: WorkoutDay[];
    level: 'beginner' | 'intermediate' | 'advanced';
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    is_active: boolean;
}

interface WorkoutDay {
    day_of_week?:
        | 'monday'
        | 'tuesday'
        | 'wednesday'
        | 'thursday'
        | 'friday'
        | 'saturday'
        | 'sunday'
        | '';
    sequence_day?: number;
    exercises: Exercise[];
}
