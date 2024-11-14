
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

export const updateUserCredentials = async (
	userId: string,
	email: string,
	password: string,
	token: string,
  ) => {
	try {
	  const body = JSON.stringify({
		email,
		password,
	  });
  
	  const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${userId}/credentials`,
		{
		  method: 'PUT',
		  headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		  },
		  body,
		}
	  );
  
	  if (!res.ok) {
		const errorData = await res.json();
		throw new Error(errorData.message || 'Error updating user credentials.');
	  }
  
	  const data = await res.json();
	  return data;
	} catch (error) {
	  throw error;
	}
  };
  
  
