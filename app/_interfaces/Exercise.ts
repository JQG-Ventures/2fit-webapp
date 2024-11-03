interface Exercise {
    exercise_id: string;
    reps: number;
    sets: number;
    rest_seconds: number;
    details: {
        _id: string,
        name: string,
        description: string,
        category: string,
        image_url: string,
        muscle_group: string[],
        difficulty: string,
        equipment: string[],
        is_active: boolean
    }
}