export type Weekday =
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday';

export type AuthProvider = 'default' | 'google' | 'meta' | 'apple';
export type FitnessGoal = 'weight' | 'keep' | 'strength' | 'muscle';
export type FitnessLevel = 'beginner' | 'irregular' | 'intermediate' | 'advanced';
export type WorkoutType = 'cardio' | 'strength' | 'yoga' | 'dance' | 'stretch';
export type Gender = 'm' | 'f';

export interface TrainingPreferences {
    preferred_muscle_groups: string[];
    equipment: string[];
    available_days: Weekday[];
    workout_types: WorkoutType[];
    saved_workouts: string[];
}

export interface Preferences {
    water_consumption: number | null;
    dietary_restrictions: string[];
    dietary_goals: string | null;
    preferences: string[];
}

export interface NotificationSettings {
    face_id: boolean;
    remember_me: boolean;
    touch_id: boolean;
}

export interface SecuritySettings {
    general: boolean;
    updates: boolean;
    services: boolean;
    tips: boolean;
    bot: boolean;
    reminders: boolean;
}

export interface Settings {
    notifications: NotificationSettings;
    nutrition_enabled: boolean;
    language_preference: string;
    security_settings: SecuritySettings;
}

export interface AutomationData {
    profile_complete: boolean;
    message_sent: boolean;
    greetings_sent: boolean;
    created_by_bot: boolean;
    last_motivational_message: string | null;
}

export interface RegisterData {
    email: string;
    password: string;
    auth_provider: AuthProvider;
    name: string;
    last: string;
    age: string;
    birthdate: string;
    country: string;
    countryCode: string;
    code_number: string;
    number: string;
    gender: Gender | '';
    height: number;
    weight: number;
    target_weight: number;
    fitness_goal: FitnessGoal | '';
    fitness_level: FitnessLevel | '';
    workout_type: WorkoutType[];
    training_days_per_week: Weekday[];
    training_preferences: TrainingPreferences;
    preferences: Preferences;
    settings: Settings;
    automation_data: AutomationData;
}

export type DeepPartial<T> =
    T extends Array<infer U>
        ? Array<DeepPartial<U>>
        : T extends object
          ? { [K in keyof T]?: DeepPartial<T[K]> }
          : T;

export type RegisterDraft = DeepPartial<RegisterData>;
