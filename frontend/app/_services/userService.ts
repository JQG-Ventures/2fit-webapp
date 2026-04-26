import type { ApiResponse, ApiStatusResponse } from '@/app/_types/api';
import type { AuthApiTokenMessage, AuthTokenState } from '@/app/_types/auth';
import { parseJson } from '@/app/utils/http';
import { useApiDelete, useApiPost, useApiPut } from '@/app/utils/apiClient';

interface ChatResponse {
    message: string;
    response: string;
}

interface ProfileUpdatePayload {
    name?: string;
    email?: string;
    birthdate?: string;
    country?: string;
    gender?: string;
    code_number?: string;
    number?: string;
    profile_image?: string;
}

type RefreshTokenResponse = ApiResponse<AuthApiTokenMessage>;

interface AvailabilityResponse {
    status: string;
    available: boolean;
}

export const isEmailAvailable = async (email: string): Promise<boolean> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('Error checking email availability');
    const data = await parseJson<AvailabilityResponse>(res);
    return data.available;
};

export const isPhoneAvailable = async (number: string): Promise<boolean> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/check-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number }),
    });
    if (!res.ok) throw new Error('Error checking phone availability');
    const data = await parseJson<AvailabilityResponse>(res);
    return data.available;
};

export async function checkUserInBackend(email: string): Promise<boolean> {
    try {
        return !(await isEmailAvailable(email));
    } catch {
        return false;
    }
}

export async function refreshAccessToken(token: AuthTokenState): Promise<AuthTokenState> {
    if (!token.refreshToken) {
        return { ...token, error: 'RefreshAccessTokenError' };
    }

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

        const refreshed = await parseJson<RefreshTokenResponse>(response);
        const newAccess = refreshed.message.access_token;
        const newExp = refreshed.message.expires_at * 1000;

        return {
            ...token,
            accessToken: newAccess,
            accessTokenExpires: newExp,
        };
    } catch {
        return { ...token, error: 'RefreshAccessTokenError' };
    }
}

export const useSendProgressToBackend = () => {
    return useApiPost<
        {
            queryParams: { workout_plan_id: string };
            body: { exercises: ExerciseProgress[]; day_of_week: string };
        },
        ApiStatusResponse
    >('/api/users/workouts/progress');
};

export const useSendCompleteToBackend = () => {
    return useApiPost<
        { queryParams?: { workout_plan_id: string }; body: ExerciseComplete },
        ApiStatusResponse
    >('/api/users/workouts/complete');
};

export const useSaveWorkout = () => {
    return useApiPost<{ queryParams: { workout_id: string } }, ApiStatusResponse>(
        '/api/workouts/saved',
    );
};

export const useDeleteWorkout = () => {
    return useApiDelete<{ queryParams: { workout_id: string } }, ApiStatusResponse>(
        '/api/workouts/saved',
    );
};

export const useEditProfile = () => {
    return useApiPut<ProfileUpdatePayload, ApiStatusResponse>('/api/users/profile');
};

export const useSendMessage = (userPhoneNumber: string) => {
    return useApiPost<{ body: { message: string } }, ChatResponse>('/api/chat', undefined, {
        'User-Phone-Number': userPhoneNumber,
    });
};

export const useResetPassword = () => {
    return useApiPut<{ email: string; password: string }, ApiStatusResponse>(
        '/api/users/reset-password',
    );
};

export const useUpdateProfile = () => {
    return useApiPut<{ settings: Record<string, unknown> }, ApiStatusResponse>(
        '/api/users/profile',
    );
};

export const useUploadProfileImage = () => {
    return useApiPost<{ body: FormData }, ApiStatusResponse & { url: string }>(
        '/api/users/profile/image',
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
            const errorData = await parseJson<ApiStatusResponse>(res);
            throw new Error(errorData.message || 'Error updating password.');
        }

        return await parseJson<ApiStatusResponse>(res);
    } catch (error) {
        throw error;
    }
};

export const useRegisterPlayerId = () => {
    return useApiPost<
        {
            body: { player_id: string; platform: 'web' | 'ios' | 'android' };
        },
        ApiStatusResponse
    >('/api/auth/notifications/player-id');
};

export const useSendChallengeProgress = () => {
    return useApiPost<
        {
            queryParams: { challenge_id: string };
            body: {
                sequence_day: number;
                exercises: {
                    exercise_id: string;
                    sets_completed: number;
                    reps_completed: number[];
                    duration_seconds: number;
                    calories_burned: number;
                    is_completed: boolean;
                }[];
            };
        },
        ApiStatusResponse
    >('/api/challenges/challenges/progress');
};

export const useSendChallengeComplete = () => {
    return useApiPost<
        {
            body: {
                challenge_id: string;
                sequence_day: number;
                exercises: {
                    exercise_id: string;
                    sets_completed: number;
                    reps_completed: number[];
                    duration_seconds: number;
                    calories_burned: number;
                    is_completed: boolean;
                }[];
            };
        },
        ApiStatusResponse
    >('/api/challenges/challenges/complete');
};
