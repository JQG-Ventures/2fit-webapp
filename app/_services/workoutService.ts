export const saveWorkout = async (userId: string, workoutId: string, token: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/saved/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ "workouts": [workoutId] })
        });

        return response;
    } catch (error) {
        return {};
    }
};

export const deleteUserSavedWorkout = async (userId: string, workoutId: string, token: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/saved/${userId}/${workoutId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return {};
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting workout:', error);
        return {};
    }
};

export const getGuidedWorkouts = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/guided`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            return {};
        }

        return await response.json();
    } catch (error) {
        return {};
    }
};

export const getWorkoutPlans = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/plans`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            return {};
        }

        return await response.json();
    } catch (error) {
        return {};
    }
};

export const getLibraryWorkoutCount = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/library`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            return {};
        }

        return await response.json();
    } catch (error) {
        return {};
    }
};

export const getWorkoutPlanById = async (planId: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/plans/${planId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch workout details');
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error('Error fetching workout data:', error);
        throw new Error(error.message || 'Something went wrong');
    }
};

export const getExercisesByLevel = async (level: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/library/level/${level}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            return { error: 'Failed to get exercises.' };
        }

        return await response.json();
    } catch (error) {
        return { error: 'An error occurred getting exercises, please try later.' };
    }
};