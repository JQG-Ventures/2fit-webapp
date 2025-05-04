import { useApiDelete, useApiPost, useApiPut } from '../utils/apiClient';

export const fetchUserDataByNumber = async (number: string) => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/by-number/${number}`,
        );
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
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/by-email/${email}`,
        );
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

export async function checkUserInBackend(email: string) {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/by-email/${email}`,
            {
                method: 'GET',
            },
        );
        if (!res.ok) {
            return null;
        }
        const data = await res.json();
        return data?.message;
    } catch (error) {
        console.error('Error checking user in backend:', error);
        return null;
    }
}

export async function refreshAccessToken(token: any) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/refresh-token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.refreshToken}`,
                },
            },
        );

        if (!response.ok) {
            throw new Error('Failed to refresh access token');
        }

        const refreshed = await response.json();
        const newAccess = refreshed.message.access_token;
        const newExp = refreshed.message.expires_at * 1000;

        return {
            ...token,
            accessToken: newAccess,
            accessTokenExpires: newExp,
        };
    } catch (error) {
        return { ...token, error: 'RefreshAccessTokenError' };
    }
}

export const useSendProgressToBackend = () => {
    return useApiPost<
        {
            queryParams: { workout_plan_id: string };
            body: { exercises: ExerciseProgress[]; day_of_week: string };
        },
        { status: string; message: string }
    >('/api/users/workouts/progress');
};

export const useSendCompleteToBackend = () => {
    return useApiPost<{ body: ExerciseComplete }, { status: string; message: string }>(
        '/api/users/workouts/complete',
    );
};

export const useSaveWorkout = () => {
    return useApiPost<{ queryParams: { workout_id: string } }, { status: string; message: string }>(
        '/api/workouts/saved',
    );
};

export const useDeleteWorkout = () => {
    return useApiDelete<
        { queryParams: { workout_id: string } },
        { status: string; message: string }
    >('/api/workouts/saved');
};

export const useEditProfile = () => {
    return useApiPut<any, { status: string; message: string }>('/api/users/profile');
};

export const useSendMessage = (userPhoneNumber: string) => {
    return useApiPost<{ body: { message: string } }, { message: string; response: string }>(
        '/api/chat',
        undefined,
        { 'User-Phone-Number': userPhoneNumber },
    );
};

export const useResetPassword = () => {
    return useApiPut<{ email: string; password: string }, { status: string; message: string }>(
        '/api/users/reset-password',
    );
};

export const useUpdateProfile = () => {
    return useApiPut<{ settings: object }, { status: string; message: string }>(
        '/api/users/profile',
    );
};

export const useUploadProfileImage = () => {
    return useApiPost<{ body: FormData }, { status: string; message: string; url: string }>(
        '/api/users/profile/image',
        undefined,
        { 'Content-Type': 'multipart/form-data' },
    );
};

export const updatePassword = async (contact: string, code: string, newPassword: string) => {
    try {
        const body = JSON.stringify({
            contact,
            code,
            new_password: newPassword,
        });

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/update-password`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body,
            },
        );

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Error updating password.');
        }

        return await res.json();
    } catch (error) {
        throw error;
    }
};
