import { useApiDelete, useApiPost, useApiPut } from '../utils/apiClient';

export const useDeleteExercises = (workout_plan_id: string) => {
    return useApiPut<any, { status: string; message: string }>(
        `/api/workouts/plans/${workout_plan_id}/delete-exercises`,
    );
};

export const useModifyExercises = (workout_plan_id: string) => {
    return useApiPut<any, { status: string; message: string }>(
        `/api/workouts/plans/${workout_plan_id}/update-exercises`,
    );
};
