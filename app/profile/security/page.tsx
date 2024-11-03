'use client';

import React, { useEffect, useState, useMemo } from 'react';
import ToggleButton from '../../_components/profile/togglebutton';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { useSessionContext } from '../../_providers/SessionProvider';
import { useFetch } from '../../_hooks/useFetch';
import { useTranslation } from 'react-i18next';
import ChangePasswordModal from '../../_components/profile/ChangePasswordModal';
import { updateUserCredentials } from '../../_services/userService'; 
import LoadingScreen from '../../_components/animations/LoadingScreen';
import Modal from '../../_components/profile/modal';

interface SecurityItemProps {
  label: string;
  hasArrow?: boolean;
  isOn?: boolean;
  onToggle?: () => void;
}

const SecurityItem: React.FC<SecurityItemProps> = ({ label, hasArrow = false, isOn, onToggle }) => (
  <div className="flex items-center justify-between w-full py-5 pl-7">
    <div className="flex items-center space-x-4">
      <span className="text-3xl">{label}</span>
    </div>
    {hasArrow ? (
      <MdKeyboardArrowRight className="text-gray-500 w-12 h-12" />
    ) : (
      <ToggleButton isOn={isOn} onToggle={onToggle} />
    )}
  </div>
);

const Security: React.FC = () => {
  const router = useRouter();
  const { userId, token, loading: sessionLoading } = useSessionContext();
  const getOptions = useMemo(
    () => ({
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );
  const { t } = useTranslation('global');

  const { data: userData, loading, error } = useFetch(
    userId ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${userId}` : '',
    getOptions
  );

  const [securitySettings, setSecuritySettings] = useState({
    faceID: false,
    rememberMe: false,
    touchID: false,
  });

  const [errorMessage, setErrorMessage] = useState<React.ReactNode | null>(null);
  const [successMessage, setSuccessMessage] = useState<React.ReactNode | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [passwordUpdateError, setPasswordUpdateError] = useState('');

  useEffect(() => {
    if (userData?.settings?.security) {
      setSecuritySettings({
        faceID: userData.settings.security.faceID,
        rememberMe: userData.settings.security.rememberMe,
        touchID: userData.settings.security.touchID,
      });
    }
  }, [userData]);

  const handleToggle = (type: keyof typeof securitySettings) => {
    const newStatus = !securitySettings[type];
    const updatedSecuritySettings = { ...securitySettings, [type]: newStatus };
    setSecuritySettings(updatedSecuritySettings);
  };

  const handlePasswordChangeSubmit = async (newPassword: string) => {
    try {
      const email = userData.email;
      await updateUserCredentials(userId, email, newPassword, token);
      setSuccessMessage(t('profile.Security.Successfullchangepswd'));
      setIsChangePasswordModalOpen(false);
    } catch (error) {
      setPasswordUpdateError(t('profile.Security.Failedchangepswd'));
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

  const securityItems = [
    { label: t('profile.Security.FaceID'), key: 'faceID' },
    { label: t('profile.Security.RememberMe'), key: 'rememberMe' },
    { label: t('profile.Security.TouchID'), key: 'touchID' },
    { label: t('profile.Security.GoogleAuthenticator'), hasArrow: true },
  ];

  return (
    <div className="flex flex-col justify-between items-center bg-white h-screen p-14 lg:pt-[10vh]">
      {errorMessage && (
        <Modal message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}
      {successMessage && (
        <Modal message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}

      <div className="h-[12%] flex flex-row justify-left space-x-8 items-center w-full lg:max-w-3xl">
        <button onClick={() => router.back()} className="text-gray-700">
          <FaArrowLeft className="w-8 h-8" />
        </button>
        <h1 className="text-5xl font-semibold">{t('profile.Security.Title')}</h1>
      </div>

      <div className="h-[78%] flex flex-col justify-start py-6 w-full max-w-3xl space-y-8 overflow-y-auto">
        {securityItems.map((item, index) => (
          <SecurityItem
            key={index}
            label={item.label}
            hasArrow={item.hasArrow}
            isOn={
              item.hasArrow
                ? undefined
                : securitySettings[item.key as keyof typeof securitySettings]
            }
            onToggle={
              item.hasArrow
                ? undefined
                : () => handleToggle(item.key as keyof typeof securitySettings)
            }
          />
        ))}
      </div>

      <div className="h-[10%] flex w-full max-w-3xl">
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-400 to-green-700 text-white p-4 rounded-full text-2xl font-semibold shadow-lg flex items-center justify-center"
          onClick={() => setIsChangePasswordModalOpen(true)}
        >
          {t('profile.Security.ChangePassword')}
        </button>
      </div>

      {isChangePasswordModalOpen && (
        <ChangePasswordModal
          onClose={() => {
            setIsChangePasswordModalOpen(false);
            setPasswordUpdateError('');
          }}
          onSubmit={handlePasswordChangeSubmit}
          errorMessage={passwordUpdateError}
        />
      )}
    </div>
  );
};

export default Security;
