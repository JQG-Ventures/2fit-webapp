import type { RegisterData, RegisterDraft } from '@/app/_types/register';

export function createInitialRegisterData(): RegisterData {
    return {
        email: '',
        password: '',
        auth_provider: 'default',
        name: '',
        last: '',
        age: '',
        birthdate: '',
        country: '',
        countryCode: '',
        code_number: '',
        number: '',
        gender: '',
        height: 175,
        weight: 70,
        target_weight: 70,
        fitness_goal: '',
        fitness_level: '',
        workout_type: [],
        training_days_per_week: [],
        training_preferences: {
            preferred_muscle_groups: [],
            equipment: [],
            available_days: [],
            workout_types: [],
            saved_workouts: [],
        },
        preferences: {
            water_consumption: null,
            dietary_restrictions: [],
            dietary_goals: null,
            preferences: [],
        },
        settings: {
            notifications: {
                face_id: false,
                remember_me: false,
                touch_id: false,
            },
            nutrition_enabled: false,
            language_preference: 'es',
            security_settings: {
                general: true,
                updates: true,
                services: true,
                tips: true,
                bot: true,
                reminders: true,
            },
        },
        automation_data: {
            profile_complete: false,
            message_sent: false,
            greetings_sent: false,
            created_by_bot: false,
            last_motivational_message: null,
        },
    };
}

export function buildRegisterPayload(data: RegisterDraft): RegisterData {
    const initialData = createInitialRegisterData();

    return {
        ...initialData,
        ...data,
        code_number: data.code_number ?? data.countryCode ?? initialData.code_number,
        workout_type:
            data.workout_type ??
            data.training_preferences?.workout_types ??
            initialData.workout_type,
        training_days_per_week:
            data.training_days_per_week ??
            data.training_preferences?.available_days ??
            initialData.training_days_per_week,
        training_preferences: {
            ...initialData.training_preferences,
            ...data.training_preferences,
            available_days:
                data.training_preferences?.available_days ??
                data.training_days_per_week ??
                initialData.training_preferences.available_days,
            workout_types:
                data.training_preferences?.workout_types ??
                data.workout_type ??
                initialData.training_preferences.workout_types,
        },
        preferences: {
            ...initialData.preferences,
            ...data.preferences,
        },
        settings: {
            ...initialData.settings,
            ...data.settings,
            notifications: {
                ...initialData.settings.notifications,
                ...data.settings?.notifications,
            },
            security_settings: {
                ...initialData.settings.security_settings,
                ...data.settings?.security_settings,
            },
        },
        automation_data: {
            ...initialData.automation_data,
            ...data.automation_data,
        },
    };
}
