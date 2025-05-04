// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaRegEnvelope } from 'react-icons/fa';
import { IoCalendarOutline } from 'react-icons/io5';
import Modal from '../../_components/profile/modal';
import InputWithIcon from '../../_components/form/InputWithIcon';
import SelectInput from '../../_components/form/SelectInput';
import LoadingScreen from '../../_components/animations/LoadingScreen';

import 'react-phone-input-2/lib/bootstrap.css';
import PhoneInput from 'react-phone-input-2';
import countries from '@/app/data/countries.json';
import countryCodes from '@/app/data/countryCodes.json';
import { useApiGet } from '@/app/utils/apiClient';
import { useEditProfile } from '@/app/_services/userService';
import { useTranslation } from 'react-i18next';
import CountryInputForm from '@/app/_components/form/CountryInputForm';

const formFields: FormField[] = [
    {
        label: 'Name',
        name: 'name',
        type: 'text',
        placeholder: 'Username',
    },
    {
        label: 'Birth Date',
        name: 'birthdate',
        type: 'date',
        placeholder: 'mm/dd/yyyy',
        icon: IoCalendarOutline,
    },
    {
        label: 'Email',
        name: 'email',
        type: 'email',
        placeholder: 'user@yourdomain.com',
        icon: FaRegEnvelope,
    },
    {
        label: 'Country',
        name: 'country',
        type: 'select',
        options: countryCodes,
    },
    {
        label: 'Gender',
        name: 'gender',
        type: 'select',
        options: [
            { value: 'm', label: 'Male' },
            { value: 'f', label: 'Female' },
        ],
    },
];

const EditProfile: React.FC = () => {
    const { t } = useTranslation('global');
    const router = useRouter();
    const getProfileUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/profile`;
    const { data: profile, isLoading: loadingProfile } = useApiGet<{
        status: string;
        message: any;
    }>([], getProfileUrl);
    const { mutate: editProfile } = useEditProfile();

    const handleEditProfile = async (profile_info: any) => {
        editProfile(profile_info, {
            onSuccess: (data) => {
                if (data.status === 'success') {
                    setSuccessMessage(t('profile.updateProfile.success'));
                }
            },
            onError: () => {
                setErrorMessage(t('profile.updateProfile.error'));
            },
        });
    };

    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [countryCode, setCountryCode] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<React.ReactNode | null>(null);
    const [successMessage, setSuccessMessage] = useState<React.ReactNode | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (profile) {
            setProfileData(profile?.message);
            setCountryCode(profile?.message?.code_number || '');
            setPhoneNumber(profile?.message?.number || '');
        }
    }, [profile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (profileData) {
            setProfileData((prevData) => ({
                ...prevData!,
                [name]: value,
            }));
        }
    };

    const handlePhoneChange = (value: string, data: any) => {
        let phoneCode = data.dialCode;
        let number;
        if (value.startsWith(`${data.dialCode}`)) {
            number = value.replace(phoneCode, '').trim();
        } else {
            number = value;
        }

        if (phoneCode !== countryCode) {
            setPhoneNumber('');
        } else {
            setPhoneNumber(number);
        }

        setCountryCode(phoneCode);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const updatedProfile = {
            name: profileData?.name,
            email: profileData?.email,
            birthdate: profileData?.birthdate,
            country: profileData?.country,
            gender: profileData?.gender,
            code_number: countryCode,
            number: phoneNumber,
        };
        await handleEditProfile(updatedProfile);
        setIsSubmitting(false);
    };

    if (loadingProfile) return <LoadingScreen />;
    if (errorMessage) {
        return (
            <Modal
                title="Error"
                message={t('profile.errorFetching')}
                onClose={() => router.push('/home')}
            />
        );
    }

    return (
        <div className="flex flex-col justify-between items-center bg-white h-screen p-14 lg:pt-[10vh]">
            {(errorMessage || successMessage) && (
                <Modal
                    title={t('profile.editModalTitle')}
                    message={errorMessage || successMessage}
                    onClose={() => router.back()}
                />
            )}
            <div className="h-[10%] flex flex-row justify-left space-x-8 items-center w-full lg:max-w-3xl">
                <button onClick={() => router.back()} className="text-gray-700">
                    <FaArrowLeft className="w-8 h-8" />
                </button>
                <h1 className="text-5xl font-semibold">{t('profile.editModalTitle')}</h1>
            </div>
            <form
                className="h-[90%] flex flex-col justify-between items-center w-full"
                onSubmit={handleSubmit}
            >
                <div className="h-[90%] flex flex-col justify-start py-6 w-full max-w-3xl space-y-8 overflow-y-auto">
                    {formFields.map((field, index) => {
                        if (field.name === 'country') {
                            return (
                                <CountryInputForm
                                    key={index}
                                    selectedCountry={profileData?.country || ''}
                                    onChange={(selectedCountry) => {
                                        setProfileData((prevData) => ({
                                            ...prevData!,
                                            country: selectedCountry,
                                        }));
                                    }}
                                    countryList={countryCodes}
                                />
                            );
                        } else if (field.type === 'select') {
                            return (
                                <SelectInput
                                    key={index}
                                    label={field.label}
                                    name={field.name}
                                    value={profileData?.[field.name] || ''}
                                    onChange={handleInputChange}
                                    options={field.options || []}
                                />
                            );
                        } else if (field.name === 'birthdate') {
                            return (
                                <InputWithIcon
                                    key={index}
                                    label={field.label}
                                    name={field.name}
                                    type={field.type}
                                    placeholder={field.placeholder || ''}
                                    value={
                                        profileData?.birthdate
                                            ? new Date(profileData?.birthdate)
                                                  .toISOString()
                                                  .split('T')[0]
                                            : ''
                                    }
                                    onChange={handleInputChange}
                                    icon={field.icon}
                                />
                            );
                        } else {
                            return (
                                <InputWithIcon
                                    key={index}
                                    label={field.label}
                                    name={field.name}
                                    type={field.type}
                                    placeholder={field.placeholder || ''}
                                    value={profileData?.[field.name] || ''}
                                    onChange={handleInputChange}
                                    icon={field.icon}
                                />
                            );
                        }
                    })}
                    <PhoneInput
                        country={'us'}
                        value={`+${countryCode}${phoneNumber}`}
                        onChange={handlePhoneChange}
                        inputClass="!w-full !py-6 !border-none !bg-gray-200 !rounded-md cursor-pointer focus:!border focus:!border-gray-300 focus:!bg-white"
                    />
                </div>
                <div className="h-[10%] flex flex-col w-full max-w-xl">
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-400 to-green-700 text-white p-4 rounded-full text-2xl font-semibold shadow-lg py-8 flex items-center justify-center"
                        disabled={isSubmitting}
                    >
                        {isSubmitting && (
                            <div className="loader ease-linear rounded-full border-4 border-t-4 border-white h-6 w-6 mr-2 animate-spin"></div>
                        )}
                        {t('profile.updateProfile.updateText')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfile;
