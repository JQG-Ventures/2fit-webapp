'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaRegEnvelope } from 'react-icons/fa';
import { IoCalendarOutline } from 'react-icons/io5';
import { detectCountryCode } from '@/app/utils/phoneUtils';
import { fetchUserData, UserProfile, UpdateUserProfile } from '../../_services/userService';
import Modal from '../../_components/profile/modal';
import InputWithIcon from '../../_components/form/InputWithIcon';
import SelectInput from '../../_components/form/SelectInput';
import PhoneInput from '../../_components/form/PhoneInput';
import countries from '@/app/data/countries.json';
import countryCodes from '@/app/data/countryCodes.json';
import { useSession } from 'next-auth/react';

interface FormField {
	label: string;
	name: string;
	type: string;
	placeholder?: string;
	icon?: React.ComponentType<any>;
	options?: { value: string | number; label: string }[];
}

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
	const { data: session, status } = useSession();

	const [userId, setUserId] = useState<string>('');
	const [profileData, setProfileData] = useState<UserProfile | null>(null);
	const [countryCode, setCountryCode] = useState<string>('');
	const [phoneNumber, setPhoneNumber] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<React.ReactNode | null>(null);
	const [successMessage, setSuccessMessage] = useState<React.ReactNode | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	useEffect(() => {
		if (status === 'authenticated' && session?.user?.userId) {
			setUserId(session.user.userId);
		} else if (status === 'unauthenticated') {
			router.back();
		}
	}, [session, status, router]);

	useEffect(() => {
		const loadUserProfile = async () => {
			if (!userId) return;
			try {
				const data = await fetchUserData(userId);
				setProfileData({
					_id: data._id,
					name: data.name,
					email: data.email,
					birthdate: data.birthdate,
					country: data.country,
					gender: data.profile.gender,
					number: data.number,
				});

				if (data.number) {
					const detectedCountryCode = detectCountryCode(data.number);
					setCountryCode(detectedCountryCode.code);
					setPhoneNumber(detectedCountryCode.number);
				}
			} catch {
				setErrorMessage(
					<>
						Error loading user profile.<br />
						Please try again later.
					</>
				);
			} finally {
				setLoading(false);
			}
		};
		loadUserProfile();
	}, [userId]);

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
				setProfileData((prevData) => ({
					...prevData!,
					birthdate: value,
				}));
			} else {
				setProfileData((prevData) => ({
					...prevData!,
					[name]: value,
				}));
			}
		}
	};

	const handleCloseModal = () => {
		setErrorMessage(null);
		setSuccessMessage(null);
		router.push('/home');
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const { _id, ...rest } = profileData!;
			const updatedProfile = {
				...rest,
				number: `${countryCode}${phoneNumber}`.replace("+", ""),
			};
			await UpdateUserProfile(userId, updatedProfile);
			setSuccessMessage("Profile updated successfully.");
		} catch {
			setErrorMessage(
				<>
					Error updating profile.<br />
					Please try again later.
				</>
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-white">
				<div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-64 w-64"></div>
			</div>
		);
	}

	if (!profileData) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-white p-6">
				<p className="text-center text-gray-500">
					We are currently having issues... please try again later.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col justify-between items-center bg-white h-screen p-14 lg:pt-[10vh]">
			{(errorMessage || successMessage) && (
				<Modal
					message={errorMessage || successMessage}
					onClose={handleCloseModal}
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
						if (field.type === 'select') {
							return (
								<SelectInput
									key={index}
									label={field.label}
									name={field.name}
									value={profileData[field.name] || ''}
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
									value={profileData.birthdate || ''}
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
									value={profileData[field.name]}
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
