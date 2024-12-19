export interface ExerciseFlowProps {
    exercises: Exercise[];
    onClose: () => void;
    onExerciseComplete: (exerciseId: string) => void;
    workoutType: string;
    userId: string;
    workoutPlanId: string;
}

export interface State {
    currentExerciseIndex: number;
    currentSet: number;
    isRest: boolean;
    isCountdown: boolean;
    isCompleted: boolean;
    restDuration: number;
    nextExerciseDetails: Exercise | null;
    completeMessage: string | null;
    exercisesProgress: ExerciseProgress[];
    exerciseStartTime: number | null;
    workoutStartTime: number | null;
}

export type Action =
    | { type: 'END_COUNTDOWN' }
    | { type: 'START_REST'; restDuration: number; nextExercise: Exercise | null }
    | { type: 'START_EXERCISE'; currentSet: number }
    | { type: 'COMPLETE_EXERCISE' }
    | { type: 'SET_EXERCISE_INDEX'; index: number }
    | { type: 'SET_CURRENT_SET'; set: number }
    | { type: 'ADD_EXERCISE_PROGRESS'; progress: ExerciseProgress }
    | { type: 'COMPLETE_WORKOUT' }
    | { type: 'SET_COMPLETE_MESSAGE'; message: string | null };


export interface ExerciseProgress {
    exercise_id: string;
    sets_completed: number;
    reps_completed: number[];
    duration_seconds: number;
    calories_burned: number;
    is_completed: boolean;
}
