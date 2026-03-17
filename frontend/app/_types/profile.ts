export interface ProfileToggleGroup {
    general?: boolean;
    updates?: boolean;
    services?: boolean;
    tips?: boolean;
    bot?: boolean;
    reminders?: boolean;
    face_id?: boolean;
    remember_me?: boolean;
    touch_id?: boolean;
}

export interface ProfileSettings {
    notifications?: ProfileToggleGroup;
    security_settings?: ProfileToggleGroup;
    nutrition_enabled?: boolean;
    language_preference?: string;
}

export interface AppUserProfile extends UserProfile {
    settings?: ProfileSettings;
}
