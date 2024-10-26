'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { IoIosArrowDroprightCircle, IoIosLogOut } from 'react-icons/io';
import Image from 'next/image';
import ToggleButton from '../_components/profile/togglebutton';
import { MdModeEditOutline } from 'react-icons/md';
import { BsMoon } from 'react-icons/bs';
import Modal from '../_components/profile/modal';
import LoadingScreen from '../_components/animations/LoadingScreen';
import SettingItem from '../_components/others/SettingItem';
import { CiUser, CiBellOn, CiLock, CiCircleQuestion } from 'react-icons/ci';
import { useFetch } from '../_hooks/useFetch';
import { useSessionContext } from '../_providers/SessionProvider';
import Premium from '../_components/profile/PremiumContent';

const ProfilePage: React.FC = () => {
	const router = useRouter();
	const { userId, loading: sessionLoading } = useSessionContext();
	const [showPremium, setShowPremium] = useState(false);
	const options = useMemo(() => ({
		method: 'GET',
	}), []);

	const { data: userData, loading, error } = useFetch(
		userId ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${userId}` : '',
		options
	);

	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const settings = [
		{ label: 'Edit Profile', icon: CiUser, path: '/profile/edit' },
		{ label: 'Notifications', icon: CiBellOn, path: '/profile/notifications' },
		{ label: 'Security', icon: CiLock, path: '/profile/security' },
		{ label: 'Help', icon: CiCircleQuestion, path: '/profile/help' },
	];

	useEffect(() => {
		if (!sessionLoading && !userId) {
			router.push('/login');
		}
	}, [userId, sessionLoading, router]);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		await signOut({
			callbackUrl: '/',
			redirect: true,
		});
	};

	const handleSetting = async (setting) => {
		setIsLoading(true);
		router.push(setting.path);
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

	return (
		<div className="flex flex-col justify-between items-center bg-gray-50 h-screen p-10 lg:pt-[10vh]">
			{showPremium && (
				<Premium onClose={() => setShowPremium(false)} />
			)}

			<div className="h-[10%] flex justify-left items-center w-full lg:hidden">
				<h1 className="text-5xl font-semibold pl-4">Profile</h1>
			</div>

			<div className="h-[20%] flex flex-col items-center w-full lg:max-w-6xl">
				<div className="relative w-40 h-40">
					<Image
						src="/images/userprofile.png"
						alt="Profile Picture"
						width={160}
						height={160}
						className="rounded-full object-cover border-4 border-white shadow-lg w-full h-full"
					/>
					<div
						className="absolute bottom-0 right-0 bg-green-500 p-1 rounded-full cursor-pointer"
						onClick={() => router.push('/profile/edit')}
					>
						<MdModeEditOutline className="text-white w-8 h-8 ml-1" />
					</div>
				</div>
				<h2 className="text-3xl font-semibold mt-4 truncate max-w-full text-center">
					{userData?.name || 'Username'}
				</h2>
				<p className="text-gray-400 overflow-hidden text-ellipsis max-w-full text-center">
					{userData?.email || 'user@yourdomain.com'}
				</p>
			</div>

			<div
				className="h-[12%] w-full lg:max-w-6xl bg-gradient-to-r from-green-400 to-green-700 flex flex-col justify-center text-white rounded-[25px] px-8 shadow-lg w-full cursor-pointer"
				onClick={() => setShowPremium(true)}
			>
				<div className="flex flex-row items-center justify-between">
					<div className="flex justify-left space-x-6 w-[80%] items-center pb-4">
						<span className="bg-gradient-to-b from-yellow-300 to-yellow-700 text-white rounded-full px-4 py-2 text-2xl">
							PRO
						</span>
						<h3 className="font-semibold text-3xl">Upgrade to Premium</h3>
					</div>
					<IoIosArrowDroprightCircle className="text-white w-10 h-10" />
				</div>
				<p className="text-xl">
					Enjoy workout access without ads and restrictions
				</p>
			</div>
 
			<div className="border-t border-gray-300 w-full my-14 lg:my-0 lg:max-w-6xl"></div>

			<div className="w-full h-[45%] mb-24 overflow-y-auto lg:max-w-6xl lg:mb-0">
				{settings.map((setting, index) => (
					<SettingItem
						key={index}
						label={setting.label}
						icon={setting.icon}
						onClick={() => handleSetting(setting)}
						isLoading={isLoading}
					/>
				))}

				<div className="flex items-center justify-between w-full py-8 px-4">
					<div className="flex items-center space-x-4">
						<BsMoon className="text-gray-500 w-5 h-5" />
						<span className="text-3xl font-medium">Dark Theme</span>
					</div>
					<ToggleButton />
				</div>

				<SettingItem
					label="Logout"
					icon={IoIosLogOut}
					isRed
					onClick={handleLogout}
					isLoading={isLoggingOut}
				/>
			</div>
		</div>
	);
};

export default ProfilePage;