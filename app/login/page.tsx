'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";
import { IoChevronBack } from "react-icons/io5";
import { FiMail, FiLock } from "react-icons/fi";
import { useSession, signIn } from 'next-auth/react';
import ButtonWithSpinner from '../_components/others/ButtonWithSpinner';
import InputWithIcon from '../_components/form/InputWithIcon';
import { IconType } from 'react-icons';

interface FormData {
	email: string;
	password: string;
}

interface FormField {
	name: keyof FormData;
	label: string;
	placeholder: string;
	type: string;
	Icon?: IconType;
}

const formFields: FormField[] = [
	{ name: 'email', label: 'Email or Number', placeholder: 'Email or number', type: 'text', Icon: FiMail },
	{ name: 'password', label: 'Password', placeholder: '******************', type: 'password', Icon: FiLock }
];

export default function Login() {
	const [errors, setErrors] = useState<{ [key in keyof FormData]?: string }>({});
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const { status } = useSession();
	const [formData, setFormData] = useState<FormData>({
		email: '',
		password: '',
	});
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [isSocialLoading, setIsSocialLoading] = useState<{ [provider: string]: boolean }>({
		google: false,
		facebook: false,
		apple: false,
	});
	const [showModal, setShowModal] = useState<boolean>(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		setError(null);
		setIsSubmitting(true);

		const { email, password } = formData;

		if (!email || !password) {
			setErrors({
				email: !email ? 'Email is required' : undefined,
				password: !password ? 'Password is required' : undefined
			});
			setIsSubmitting(false);
			return;
		}

		const response = await signIn("credentials", {
			email,
			password,
			redirect: false,
		});

		if (response?.error) {
			setError("Invalid email or password.");
			setIsSubmitting(false);
		} else if (response?.ok) {
			router.push("/home");
		} else {
			setError("An unexpected error occurred. Please try again.");
			setIsSubmitting(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handlePrevStep = () => router.push('/');

	const handleSocialSignIn = async (provider: string) => {
		setIsSocialLoading(prev => ({ ...prev, [provider]: true }));
		try {
			await signIn(provider, { callbackUrl: '/home' });
		} catch (err) {
			setError("Social sign-in failed. Please try again.");
			setShowModal(true);
		} finally {
			setIsSocialLoading(prev => ({ ...prev, [provider]: false }));
		}
	};

	return (
		<div className="flex flex-col h-screen bg-white p-10 items-center">

			<div className='h-[15%] pt-20 w-full lg:max-w-3xl'>
				<button onClick={handlePrevStep} className="text-4xl lg:hidden">
					<IoChevronBack />
				</button>
			</div>

			<div className='h-[15%] flex flex-row w-full lg:max-w-3xl'>
				<button onClick={handlePrevStep} className="hidden text-4xl lg:flex mr-14 mt-5 text-center">
					<IoChevronBack />
				</button>
				<h1 className='text-6xl font-semibold'>Login to <br />your Account</h1>
			</div>

			<div className='h-[50%] flex w-full items-center justify-center'>
				<form className="w-full lg:max-w-3xl" onSubmit={handleSubmit}>
					{formFields.map(({ name, label, placeholder, Icon, type }, index) => (
						<InputWithIcon
							key={index}
							label={label}
							name={name}
							type={type}
							placeholder={placeholder}
							value={formData[name]}
							onChange={handleChange}
							Icon={Icon}
							error={errors[name]}
						/>
					))}
					{error && (
						<p className="text-red-500 text-center mb-4">
							{error}
						</p>
					)}
					<div className="flex justify-end mb-10">
						<p className="mt-4 text-[12px]">
							<a href="/forgot-password" className="text-blue-900 font-medium hover:text-blue-500">
								Forgot Password?
							</a>
						</p>
					</div>

					<ButtonWithSpinner
						type="submit"
						loading={isSubmitting}
						className="w-full bg-black text-white py-4 rounded-full text-1xl font-semibold hover:bg-gray-800 transition duration-200"
					>
						Sign In
					</ButtonWithSpinner>
				</form>
			</div>

			<div className="h-[15%] flex flex-col justify-start text-center">
				<p className="text-gray-500 mb-10">Or sign in with</p>
				<div className="flex flex-row justify-evenly space-x-8">
					{[
						{ icon: FaApple, name: 'apple' },
						{ icon: FaFacebook, name: 'facebook' },
						{ icon: FaGoogle, name: 'google' },
					].map(({ icon: Icon, name }, idx) => (
						<ButtonWithSpinner
							key={idx}
							type="button"
							loading={isSocialLoading[name]}
							onClick={() => handleSocialSignIn(name)}
							className="text-5xl"
						>
							<Icon className={
								name === 'facebook' ? 'text-blue-600' :
									name === 'google' ? 'text-red-600' : ''
							} />
						</ButtonWithSpinner>
					))}
				</div>
			</div>

			<div className="h-[5%] text-center content-center">
				<p className="text-gray-500">
					Don't have an account? <a href="/register" className="text-indigo-600 underline">Sign Up</a>
				</p>
			</div>
		</div>
	);
}
