export interface UserProfile {
	_id: string;
	name: string;
	birthdate: string;
	email: string;
	country: string;
	number: string;
	gender: string;
}

export const fetchUserData = async (userId: string, token: string) => {
	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${userId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
			}
		});
		if (!res.ok) {
			throw new Error('Error fetching user profile');
		}
		const data = await res.json();
		return data.data;
	} catch (error) {
		console.error('Error fetching user profile:', error);
		throw error;
	}
};

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
		return data.data;
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
		return data.data;
	} catch (error) {
		console.error('Error fetching user profile:', error);
		throw error;
	}
};

export const UpdateUserProfile = async (userId: string, data: object, token: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
			body: JSON.stringify(data)
        });

        if (!response.ok) {
            return {};
        }

        return await response.json();
    } catch (error) {
        return {};
    }
};

export const normalizeGender = (value: string): string => {
	const genderMap: { [key: string]: string } = {
		Male: 'masculino',
		Female: 'femenino',
		Other: 'otro',
	};
	return genderMap[value] || 'otro';
};

export const getGenderValue = (gender: string): string => {
	return gender === 'masculino' ? 'Male' : gender === 'femenino' ? 'Female' : 'Other';
};

export const fetchUserConversation = async (userId: string, token: string) => {
	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/conversation/${userId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
			}
		});

		if (!res.ok) {
			if (res.status == 404) {
				return [];
			} 
			throw new Error('Error fetching user conversation');
		}
		const data = await res.json();
		return data.message;
	} catch (error) {
		console.error('Error fetching user conversation:', error);
		throw error;
	}
};
