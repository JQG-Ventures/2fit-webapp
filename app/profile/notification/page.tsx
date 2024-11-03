'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import ToggleButton from '../../_components/profile/togglebutton';
import Modal from '../../_components/profile/modal';
import LoadingScreen from '../../_components/animations/LoadingScreen';
import { useSessionContext } from '../../_providers/SessionProvider';
import { useFetch } from '../../_hooks/useFetch';
import { useUpdateProfile } from '../../_hooks/useUpdateProfile';
import { useTranslation } from 'react-i18next';

interface NotificationItemProps {
  label: string;
  isOn: boolean;
  onToggle: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ label, isOn, onToggle }) => (
  <div className="flex items-center justify-between w-full py-5 pl-7">
    <div className="flex items-center space-x-4">
      <span className="text-3xl">{label}</span>
    </div>
    <ToggleButton isOn={isOn} onToggle={onToggle} />
  </div>
);

const Notification: React.FC = () => {
  const router = useRouter();
  const { userId, token, loading: sessionLoading } = useSessionContext();
  const getOptions = useMemo(() => ({ method: 'GET' }), []);
  const { t } = useTranslation('global');

  const { data: userData, loading, error } = useFetch(
    userId ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${userId}` : '',
    getOptions
  );
  const { updateProfile } = useUpdateProfile();

  const [notifications, setNotifications] = useState({
    general: false,
    updates: false,
    services: false,
    tips: false
  });

  const [errorMessage, setErrorMessage] = useState<React.ReactNode | null>(null);
  const [successMessage, setSuccessMessage] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    if (userData?.settings?.notifications) {

      setNotifications({
        general: userData.settings.notifications.general,
        updates: userData.settings.notifications.updates,
        services: userData.settings.notifications.services,
        tips: userData.settings.notifications.tips
      });
    }
  }, [userData]);

  const handleToggle = async (type: keyof typeof notifications) => {
    const newStatus = !notifications[type];
    const updatedNotifications = { ...notifications, [type]: newStatus };
    setNotifications(updatedNotifications);

    try {
      const updatedProfile = {
        settings: {
          notifications: {
            general: updatedNotifications.general,
            updates: updatedNotifications.updates,
            services: updatedNotifications.services,
            tips: updatedNotifications.tips,
            bot: true,    
            reminders: true,  
          },
          nutrition_enabled: userData.settings.nutrition_enabled,
          language_preference: userData.settings.language_preference,
        },
      };
      await updateProfile(userId, updatedProfile, token);
    } catch {
      setErrorMessage(`Hubo un error al actualizar la configuración de notificaciones de ${type}.`);
    }
  };

  if (loading || sessionLoading) return <LoadingScreen />;
  if (error) {
    return (
      <Modal
        title="Error"
        message={error}
        onClose={() => router.push('/home')}
      />
    );
  }

  const notificationItems = [
    { label: t('profile.Notifications.GeneralNotifications'), key: 'general' },      
    { label: t('profile.Notifications.AppUpdates'), key: 'updates' },
    { label: t('profile.Notifications.NewServicesAvailable'), key: 'services' },
    { label: t('profile.Notifications.NewTipsAvailable'), key: 'tips' },
  ];

  return (
    <div className="flex flex-col justify-between items-center bg-white h-screen p-14 lg:pt-[10vh]">
      {errorMessage && (
        <Modal
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
      {successMessage && (
        <Modal
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
      <div className="h-[12%] flex flex-row justify-left space-x-8 items-center w-full lg:max-w-3xl">
        <button onClick={() => router.back()} className="text-gray-700">
          <FaArrowLeft className="w-8 h-8" />
        </button>
        <h1 className="text-5xl font-semibold">{t('profile.Notifications.Title')}</h1>
      </div>

      <div
        className="h-[88%] flex flex-col justify-start py-6 w-full max-w-3xl space-y-8 overflow-y-auto"
      >
        {notificationItems.map((item) => (
          <NotificationItem
            key={item.key}
            label={item.label}
            isOn={notifications[item.key as keyof typeof notifications]}
            onToggle={() => handleToggle(item.key as keyof typeof notifications)}
          />
        ))}
      </div>
    </div>
  );
};

export default Notification;
