'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import ToggleButton from '../../_components/profile/togglebutton';
import Modal from '../../_components/profile/modal';
import LoadingScreen from '../../_components/animations/LoadingScreen';
import { useApiGet } from '../../utils/apiClient';
import { useTranslation } from 'react-i18next';
import { useLoading } from '../../_providers/LoadingProvider';
import { useUpdateProfile } from '../../_services/userService';

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
  const { t } = useTranslation('global');
  const { setLoading } = useLoading();

  const getProfileUrl = '/api/users/profile';
  const { data: userData, isLoading, isError } = useApiGet<{ status: string; message: any }>([], getProfileUrl);

  const updateNotifications = useUpdateProfile();

  const [notifications, setNotifications] = useState({
    general: false,
    updates: false,
    services: false,
    tips: false,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(isLoading);
    if (userData?.message?.settings?.notifications) {
      setNotifications({
        general: userData.message.settings.notifications.general,
        updates: userData.message.settings.notifications.updates,
        services: userData.message.settings.notifications.services,
        tips: userData.message.settings.notifications.tips,
      });
    }
  }, [isLoading, setLoading, userData]);

  const handleToggle = async (type: keyof typeof notifications) => {
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
          nutrition_enabled: userData.message.settings.nutrition_enabled,
          language_preference: userData.message.settings.language_preference,
        },
      };
  
      const response = await updateNotifications.mutateAsync(updatedProfile);
  
      setSuccessMessage(t('profile.Notifications.SuccessMessage'));
    } catch (error) {
  
      setNotifications({ ...notifications, [type]: previousState });
      setErrorMessage(t('profile.Notifications.ErrorMessage'));
    }
  };
  

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

  const notificationItems = [
    { label: t('profile.Notifications.GeneralNotifications'), key: 'general' },
    { label: t('profile.Notifications.AppUpdates'), key: 'updates' },
    { label: t('profile.Notifications.NewServicesAvailable'), key: 'services' },
    { label: t('profile.Notifications.NewTipsAvailable'), key: 'tips' },
  ];

  return (
    <div className="flex flex-col justify-between items-center bg-white h-screen p-14 lg:pt-[10vh]">
      {errorMessage && <Modal message={errorMessage} onClose={() => setErrorMessage(null)} />}
      {successMessage && <Modal message={successMessage} onClose={() => setSuccessMessage(null)} />}

      <div className="h-[12%] flex flex-row justify-left space-x-8 items-center w-full lg:max-w-3xl">
        <button onClick={() => router.back()} className="text-gray-700">
          <FaArrowLeft className="w-8 h-8" />
        </button>
        <h1 className="text-5xl font-semibold">{t('profile.Notifications.Title')}</h1>
      </div>

      <div className="h-[88%] flex flex-col justify-start py-6 w-full max-w-3xl space-y-8 overflow-y-auto">
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
