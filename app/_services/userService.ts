export const fetchUserDataByNumber = async (number: string) => {
	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/by-number/${number}`);
		if (!res.ok) {
			if (res.status == 404) {
				return null;
			}
			throw new Error('Error fetching user profile');
		}
		const data = await res.json();
		return data.message;
	} catch (error) {
		console.error('Error fetching user profile:', error);
		throw error;
	}
};

export const fetchUserDataByEmail = async (email: string) => {
	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/by-email/${email}`);
		if (!res.ok) {
			if (res.status == 404) {
				return null;
			}
			throw new Error('Error fetching user profile');
		}
		const data = await res.json();
		return data.message;
	} catch (error) {
		console.error('Error fetching user profile:', error);
		throw error;
	}
};

export const sendProgressToBackend = async (exercisesProgressData: ExerciseProgress, userId: string, workoutPlanId: string) => {
	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/workouts/progress?user_id=${userId}&workout_plan_id=${workoutPlanId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(exercisesProgressData),
		});

		if (!res.ok) {
			throw new Error('There was a problem saving your progress, try it later');
		}
	} catch (error) {
		throw error;
	}
};

export const sendCompleteToBackend = async (exercisesCompleteData: ExerciseComplete, userId: string) => {
	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/workouts/complete?user_id=${userId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(exercisesCompleteData),
		});

		if (!res.ok) {
			throw new Error('There was a problem saving your progress, try it later');
		}
	} catch (error) {
		throw error;
	}
};