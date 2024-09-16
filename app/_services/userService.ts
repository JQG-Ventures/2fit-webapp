// services/userService.ts

// Definimos la interfaz para el perfil del usuario
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
  
  // Función para obtener los datos del usuario desde la API
  export const fetchUserData = async (userId: string): Promise<UserProfile> => {
    try {
      const res = await fetch(`http://localhost:5001/users/${userId}`);
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
  
  // Función para normalizar el valor de género (de la UI al backend)
  export const normalizeGender = (value: string): string => {
    const genderMap: { [key: string]: string } = {
      Male: 'masculino',
      Female: 'femenino',
      Other: 'otro',
    };
    return genderMap[value] || 'otro';
  };
  
  // Función para obtener el valor de género (del backend a la UI)
  export const getGenderValue = (gender: string): string => {
    return gender === 'masculino' ? 'Male' : gender === 'femenino' ? 'Female' : 'Other';
  };
  