import { useState } from 'react';

type UpdateProfilePayload = Partial<UserProfile>;

export const useUpdateProfile = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const updateProfile = async (
        userId: string,
        updatedProfile: UpdateProfilePayload,
        token: string,
    ): Promise<unknown | null> => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${userId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(updatedProfile),
                },
            );

            if (!response.ok) {
                const errorMsg = await response.text();
                throw new Error(errorMsg || 'Failed to update profile.');
            }

            setSuccess('Profile updated successfully.');
            return (await response.json()) as unknown;
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'Error updating profile.');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { updateProfile, loading, error, success };
};
