import { useApiPut } from '@/app/utils/apiClient';
import type { ApiStatusResponse } from '@/app/_types/api';
import type { PlanChangeScope } from '@/app/_types/planChangeScope';

export type { PlanChangeScope };

export type DeleteExercisesBody = {
    [k: string]: string[] | string | number | undefined;
} & {
    scope?: PlanChangeScope;
    week_number?: number;
};

export interface ExerciseReplacement {
    old_exercise_id: string;
    new_exercise: string;
}

export type ModifyExercisesBody = {
    [k: string]: ExerciseReplacement[] | string | number | undefined;
} & {
    scope?: PlanChangeScope;
    week_number?: number;
};

export const useDeleteExercises = (workout_plan_id: string) =>
    useApiPut<DeleteExercisesBody, ApiStatusResponse>(
        `/api/workouts/plans/${workout_plan_id}/delete-exercises`,
    );

export const useModifyExercises = (workout_plan_id: string) =>
    useApiPut<ModifyExercisesBody, ApiStatusResponse>(
        `/api/workouts/plans/${workout_plan_id}/update-exercises`,
    );
