export const getSavedWorkoutPlansByUser = async (userId: String) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/saved/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Could not retrieve saved workouts for the user');
        }

        return await response.json();
    } catch (error) {
        console.error('Error retrieving the user saved workouts:', error);
        throw error;
    }
};

export const saveWorkout = async (userId: string, workoutId: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/saved/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({"workouts": [workoutId]})
        });

        return response;
    } catch (error) {
        console.error('Error saving workout:', error);
        throw error;
    }
};

export const deleteUserSavedWorkout = async (userId: string, workoutId: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/workouts/saved/${userId}/${workoutId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete workout');
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting workout:', error);
        throw error;
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
            throw new Error('Could not retrieve guided workouts');
        }

        return await response.json();
    } catch (error) {
        console.error('Error retrieving the guided workouts:', error);
        throw error;
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
            throw new Error('Could not retrieve workouts for the user');
        }

        return await response.json();
    } catch (error) {
        console.error('Error retrieving the library workouts:', error);
        throw error;
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
            throw new Error('Could not retrieve library workouts.');
        }

        return await response.json();
    } catch (error) {
        console.error('Error retrieving library workouts:', error);
        throw error;
    }
};