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

interface WorkoutPlan {
    _id: string;
    name: string;
    description: string;
    plan_type: 'library' | 'paid' | 'personalized' | 'challenge';
    duration_weeks: number | null;
    price: number | null;
    image_url: string;
    video_url: string;
    workout_schedule: WorkoutDay[];
    level: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
}
