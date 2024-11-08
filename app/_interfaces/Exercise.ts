interface Exercise {
    exercise_id: string;
    reps: number;
    sets: number;
    rest_seconds: number;
    duration?: number;
    name: string;
    description: string;
    category: string;
    image_url: string;
    muscle_group: string[];
    difficulty?: string;
    level?: string;
    equipment: string[];
    is_completed?: boolean;
}

interface ExerciseView {
    exercise_id: string;
    reps: number;
    sets: number;
    rest_seconds: number;
    duration?: number;
    name: string;
    description: string;
    category: string;
    image_url: string;
    muscle_group: string[];
    difficulty?: string;
    level?: string;
    equipment: string[];
    currentSet?: number;
    totalSets?: number;
    is_completed?: boolean;
}