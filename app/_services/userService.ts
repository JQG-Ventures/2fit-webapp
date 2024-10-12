export interface UserProfile {
    name: string;
    birthDate: string;
    email: string;
    country: string;
    number: string;
    profile: {
      gender: string;
    };
  }
  
  export const fetchUserData = async (userId: string): Promise<UserProfile> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${userId}`);
      if (!res.ok) {
        throw new Error('Error fetching user profile');
      }
      const data = await res.json();
      return data.data as UserProfile;
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
  