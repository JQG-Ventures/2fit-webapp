'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaRegEnvelope } from 'react-icons/fa';
import { IoCalendarOutline } from 'react-icons/io5';
import Modal from '../../_components/profile/modal';
import InputWithIcon from '../../_components/form/InputWithIcon';
import SelectInput from '../../_components/form/SelectInput';
import LoadingScreen from '../../_components/animations/LoadingScreen';
import PhoneInput from '../../_components/form/PhoneInput';
import countries from '@/app/data/countries.json';
import countryCodes from '@/app/data/countryCodes.json';
import { useSessionContext } from '../../_providers/SessionProvider';
import { useFetch } from '../../_hooks/useFetch';
import { useUpdateProfile } from '@/app/_hooks/useUpdateProfile';

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
		options: countries.map((country) => ({ value: country, label: country })),
	},
	{
		label: 'Gender',
		name: 'gender',
		type: 'select',
		options: [
			{ value: 0, label: 'Male' },
			{ value: 1, label: 'Female' },
			{ value: 2, label: 'Other' },
		],
	},
];

const EditProfile: React.FC = () => {
	const router = useRouter();
	const { userId, token, loading: sessionLoading } = useSessionContext();
	const getOptions = useMemo(() => ({
		method: 'GET',
	}), []);

	const { data: userData, loading, error } = useFetch(
		userId ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${userId}` : '',
		getOptions
	);
	const { updateProfile, loading: updating, error: updateError, success: updateSuccess } = useUpdateProfile();
	const [profileData, setProfileData] = useState<UserProfile | null>(null);
	const [countryCode, setCountryCode] = useState<string>('');
	const [phoneNumber, setPhoneNumber] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<React.ReactNode | null>(null);
	const [successMessage, setSuccessMessage] = useState<React.ReactNode | null>(null);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	useEffect(() => {
		if (userData) {
			setProfileData(userData);
		}

	}, [userData]);

	const convertToInputDateFormat = (dateString) => {
		if (!dateString) return '';
		const [day, month, year] = dateString.split('/');
		return `${year}-${month}-${day}`;
	};

	const convertDateToDisplayFormat = (dateString) => {
		const [year, month, day] = dateString.split('-');
		return `${day}/${month}/${year}`;
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		if (name === 'countryCode') {
			setCountryCode(value);
		} else if (name === 'number') {
			setPhoneNumber(value);
		} else if (profileData) {
			if (name === 'gender') {
				setProfileData((prevData) => ({
					...prevData!,
					profile: { ...prevData.profile, gender: Number(value) },
				}));
			} else if (name === 'birthdate') {
				const formattedDate = convertDateToDisplayFormat(value);
				setProfileData((prevData) => ({
					...prevData!,
					birthdate: formattedDate,
				}));
			} else {
				setProfileData((prevData) => ({
					...prevData!,
					[name]: value,
				}));
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const updatedProfile = {
				name: profileData?.name,
				email: profileData?.email,
				birthdate: profileData?.birthdate,
				country: profileData?.country,
				'profile.gender': profileData?.profile?.gender,
				number: `${countryCode}${phoneNumber}`.replace("+", ""),
			};
	
			await updateProfile(userId, updatedProfile, token?.accessToken);
			setSuccessMessage("Profile updated successfully.");
		} catch {
			setErrorMessage("There was an error updating the profile")
		} finally {
			setIsSubmitting(false);
		}
	};

	if (loading) return <LoadingScreen />;
	if (error) {
		return (
			<Modal
				title="Error"
				message={error}
				onClose={() => router.push('/home')}
			/>
		);
	}

	return (
		<div className="flex flex-col justify-between items-center bg-white h-screen p-14 lg:pt-[10vh]">
			{(errorMessage || successMessage) && (
				<Modal
					message={errorMessage || successMessage}
					onClose={() => router.back()}
				/>
			)}
			<div className="h-[10%] flex flex-row justify-left space-x-8 items-center w-full lg:max-w-3xl">
				<button onClick={() => router.back()} className="text-gray-700">
					<FaArrowLeft className="w-8 h-8" />
				</button>
				<h1 className="text-5xl font-semibold">Edit Profile</h1>
			</div>
			<form
				className="h-[90%] flex flex-col justify-between items-center w-full"
				onSubmit={handleSubmit}
			>
				<div className="h-[90%] flex flex-col justify-start py-6 w-full max-w-3xl space-y-8 overflow-y-auto">
				{formFields.map((field, index) => {
					if (field.name === 'gender') {
						return (
							<SelectInput
								key={index}
								label={field.label}
								name={field.name}
								value={profileData?.profile?.gender !== undefined ? String(profileData.profile.gender) : ''}
								onChange={handleInputChange}
								options={field.options || []}
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
								value={profileData?.birthdate ? convertToInputDateFormat(profileData.birthdate) : ''}
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
						label="Phone Number"
						countryCode={countryCode}
						phoneNumber={phoneNumber}
						onChange={handleInputChange}
						countryCodes={countryCodes}
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
						Update
					</button>
				</div>
			</form>
		</div>
	);
};

export default EditProfile;
