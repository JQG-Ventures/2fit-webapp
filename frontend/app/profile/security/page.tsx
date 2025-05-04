'use client';

import React, { useEffect, useState } from 'react';
import ToggleButton from '../../_components/profile/togglebutton';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { useApiGet } from '../../utils/apiClient';
import { useTranslation } from 'react-i18next';
import ChangePasswordModal from '../../_components/profile/ChangePasswordModal';
import Modal from '../../_components/profile/modal';
import LoadingScreen from '../../_components/animations/LoadingScreen';
import { useLoading } from '../../_providers/LoadingProvider';
import { useResetPassword } from '../../_services/userService';

interface SecurityItemProps {
    label: string;
    hasArrow?: boolean;
    isOn?: boolean;
    onToggle?: () => void;
}

const SecurityItem: React.FC<SecurityItemProps> = ({ label, hasArrow = false, isOn, onToggle }) => (
    <div className="flex items-center justify-between w-full py-5">
        <div className="flex items-center space-x-4">
            <span className="text-3xl">{label}</span>
        </div>
        {hasArrow ? (
            <MdKeyboardArrowRight className="text-gray-500 w-12 h-12" />
        ) : (
            <ToggleButton isOn={isOn!} onToggle={onToggle!} />
        )}
    </div>
);

const Security: React.FC = () => {
    const router = useRouter();
    const { t } = useTranslation('global');
    const { setLoading } = useLoading();

    const resetPassword = useResetPassword();

    const getProfileUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/profile`;
    const {
        data: userData,
        isLoading,
        isError,
    } = useApiGet<{ status: string; message: any }>([], getProfileUrl);

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
        setLoading(isLoading);
        if (userData?.message?.settings?.security) {
            setSecuritySettings({
                faceID: userData.message.settings.security.faceID,
                rememberMe: userData.message.settings.security.rememberMe,
                touchID: userData.message.settings.security.touchID,
            });
        }
    }, [isLoading, setLoading, userData]);

    const handleToggle = (key: keyof typeof securitySettings) => {
        setSecuritySettings((prevSettings) => ({
            ...prevSettings,
            [key]: !prevSettings[key],
        }));
    };

    const handlePasswordChangeSubmit = async (newPassword: string) => {
        try {
            const email = userData?.message?.email;

            if (!email) {
                throw new Error('User data is incomplete');
            }
            const response = await resetPassword.mutateAsync({
                email,
                password: newPassword,
            });

            setSuccessMessage(response.message);
            setIsChangePasswordModalOpen(false);
        } catch (error) {
            setPasswordUpdateError(t('profile.Security.Failedchangepswd'));
        }
    };

    if (isLoading) return <LoadingScreen />;
    if (isError) {
        return (
            <Modal
                title="Error"
                message={t('profile.errorFetching')}
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
                <Modal
                    title={''}
                    message={t('profile.Security.Failedchangepswd')}
                    onClose={() => setErrorMessage(null)}
                />
            )}
            {successMessage && (
                <Modal
                    title={''}
                    message={t('profile.Security.Successfullchangepswd')}
                    onClose={() => setSuccessMessage(null)}
                />
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

            <div className="h-[10%] flex flex-col w-full max-w-xl">
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-400 to-green-700 text-white p-4 py-8 rounded-full text-2xl font-semibold shadow-lg flex items-center justify-center"
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
