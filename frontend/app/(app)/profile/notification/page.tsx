'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import ToggleButton from '@/app/_components/profile/ToggleButton';
import Modal from '@/app/_components/profile/modal';
import LoadingScreen from '@/app/_components/animations/LoadingScreen';
import { useApiGet } from '@/app/utils/apiClient';
import { useTranslation } from 'react-i18next';
import { useUpdateProfile } from '@/app/_services/userService';
import type { ApiResponse } from '@/app/_types/api';
import type { AppUserProfile } from '@/app/_types/profile';

interface NotificationItemProps {
    label: string;
    isOn: boolean;
    onToggle: () => void;
}

const NotificationItem: React.FC<NotificationItemProps & { toggleAriaLabel: string }> = ({
    label,
    isOn,
    onToggle,
    toggleAriaLabel,
}) => (
    <div className="flex items-center justify-between w-full py-5">
        <div className="flex items-center space-x-4">
            <span className="text-3xl">{label}</span>
        </div>
        <ToggleButton isOn={isOn} onToggle={onToggle} ariaLabel={toggleAriaLabel} />
    </div>
);

const Notification: React.FC = () => {
    const router = useRouter();
    const { t } = useTranslation('global');

    const getProfileUrl = '/api/users/profile';
    const {
        data: userData,
        isLoading,
        isError,
    } = useApiGet<ApiResponse<AppUserProfile>>([], getProfileUrl);

    const updateNotifications = useUpdateProfile();

    const notificationItems = useMemo(
        () => [
            { label: t('profile.Notifications.GeneralNotifications'), key: 'general' },
            { label: t('profile.Notifications.AppUpdates'), key: 'updates' },
            { label: t('profile.Notifications.NewServicesAvailable'), key: 'services' },
            { label: t('profile.Notifications.NewTipsAvailable'), key: 'tips' },
        ],
        [t],
    );

    const [notifications, setNotifications] = useState({
        general: false,
        updates: false,
        services: false,
        tips: false,
    });

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const storedNotifications =
            userData?.message.settings?.notifications ??
            userData?.message.settings?.security_settings ??
            {};

        setNotifications({
            general: storedNotifications.general ?? false,
            updates: storedNotifications.updates ?? false,
            services: storedNotifications.services ?? false,
            tips: storedNotifications.tips ?? false,
        });
    }, [userData]);

    const handleToggle = useCallback(
        async (type: keyof typeof notifications) => {
            const previousState = notifications[type];
            const newStatus = !previousState;
            const updatedNotifications = { ...notifications, [type]: newStatus };

            setNotifications(updatedNotifications);

            try {
                const updatedProfile = {
                    settings: {
                        notifications: {
                            ...updatedNotifications,
                        },
                        security_settings: userData?.message.settings?.security_settings ?? {},
                        nutrition_enabled: userData?.message.settings?.nutrition_enabled ?? false,
                        language_preference:
                            userData?.message.settings?.language_preference ?? 'es',
                    },
                };

                await updateNotifications.mutateAsync(updatedProfile);
            } catch {
                setNotifications({ ...notifications, [type]: previousState });
                setErrorMessage(t('profile.Notifications.ErrorMessage'));
            }
        },
        [notifications, userData, updateNotifications, t],
    );

    if (isLoading) return <LoadingScreen />;
    if (isError) {
        return (
            <Modal
                title="Error"
                message={t('profile.Notifications.FetchError')}
                onClose={() => router.push('/home')}
            />
        );
    }

    return (
        <div className="flex flex-col justify-between items-center bg-white h-screen p-14 lg:pt-[10vh]">
            {errorMessage && (
                <Modal title="Error" message={errorMessage} onClose={() => setErrorMessage(null)} />
            )}

            <div className="h-[12%] flex flex-row justify-left space-x-8 items-center w-full lg:max-w-3xl">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-gray-700"
                    aria-label={t('a11y.goBack')}
                >
                    <FaArrowLeft className="w-8 h-8" />
                </button>
                <h1 className="text-5xl font-semibold">{t('profile.Notifications.Title')}</h1>
            </div>

            <div className="h-[88%] flex flex-col justify-start py-6 w-full max-w-3xl space-y-8 overflow-y-auto">
                {notificationItems.map((item) => (
                    <NotificationItem
                        key={item.key}
                        label={item.label}
                        toggleAriaLabel={t('a11y.toggleSetting', { label: item.label })}
                        isOn={notifications[item.key as keyof typeof notifications]}
                        onToggle={() => handleToggle(item.key as keyof typeof notifications)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Notification;
