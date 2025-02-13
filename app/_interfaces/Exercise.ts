interface Exercise {
    _id?: string;
    exercise_id?: string;
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
    exercise_id?: string;
    reps: number;
    sets: number;
    rest_seconds: number;
    duration?: number;
    name: string;
    description: string;
    category: string;
    image_url: string;
    video_url?: string;
    muscle_group: string[];
    difficulty?: string;
    level?: string;
    equipment: string[];
    currentSet?: number;
    totalSets?: number;
    is_completed?: boolean;
}

interface ExerciseProgress {
    exercise_id: string;
    sets_completed: number;
    reps_completed: number[];
    duration_seconds: number;
    calories_burned: number;
    is_completed: boolean;
}

// interface ExerciseProgress {
//     exercises: ExerciseProgressModel[];
//     day_of_week: string;
// }

interface ExerciseComplete {
    workout_id: string;
    duration_seconds: number,
    calories_burned: number,
    exercises: ExerciseProgress[],
    sequence_day?: string,
    day_of_week?: string,
    was_skipped: boolean
}

interface WeeklyProgressData {
    days: {
      day_of_week: string;
      exercises: Exercise[];
    }[];
}