interface WorkoutPlan {
    _id: string;
    name: string;
    description: string;
    duration: number;
    exercises: Exercise[];
    image_url: string;
    level: string;
}
