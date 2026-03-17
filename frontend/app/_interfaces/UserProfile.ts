interface UserProfile {
    _id: string;
    name: string;
    last?: string;
    birthdate: string;
    email: string;
    country: string;
    code_number?: string;
    number: string;
    gender: string;
    profile: Record<string, unknown> | null;
    profile_image?: string;
}
