export async function getSimilarExercises(exercise_id: string, token: any) {
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/exercises/similar-exercises/${exercise_id}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
            if (response.status == 404) {
				return null;
			}
			throw new Error('Failed to get similar exercises');
		}
        
        const data = await response.json();
        return data.message;
	} catch (error) {
		console.error(`Error fetching similar exercises for exercise id ${exercise_id}`, error);
		throw error;
	}
}