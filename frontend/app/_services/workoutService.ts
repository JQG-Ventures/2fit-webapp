import { useApiPut } from '../utils/apiClient';
import type { ApiStatusResponse } from '../_types/api';

export type ExerciseDeletePayload = Record<string, string[]>;

export interface ExerciseReplacement {
    old_exercise_id: string;
    new_exercise: string;
}

export type ExerciseModifyPayload = Record<string, ExerciseReplacement[]>;

export const useDeleteExercises = (workout_plan_id: string) =>
    useApiPut<ExerciseDeletePayload, ApiStatusResponse>(
        `/api/workouts/plans/${workout_plan_id}/delete-exercises`,
    );

export const useModifyExercises = (workout_plan_id: string) =>
    useApiPut<ExerciseModifyPayload, ApiStatusResponse>(
        `/api/workouts/plans/${workout_plan_id}/update-exercises`,
    );
