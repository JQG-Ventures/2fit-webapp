"use client";

import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";
import { IoChevronBack } from "react-icons/io5";
import { FiMail, FiLock } from "react-icons/fi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from 'next-auth/react';

interface FormData {
	email: string;
	password: string;
}

const userDataFields = [
	{ name: 'email', label: 'Email', placeholder: 'Email', Icon: FiMail },
	{ name: 'password', label: 'Password', placeholder: '******************', type: 'password', Icon: FiLock }
];

export default function Login() {
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const { status } = useSession();
	const [formData, setFormData] = useState<FormData>({
		email: '',
		password: '',
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		setError(null);

		const { email, password } = formData;

		if (!email || !password) {
			setErrors({
				email: !email ? 'Email is required' : '',
				password: !password ? 'Password is required' : ''
			});
			return;
		}

		const response = await signIn("credentials", {
			email,
			password,
			redirect: false,
		});

		if (response?.error) {
			setError("Invalid email or password.");
		} else if (status === "authenticated") {
			router.push("/home");
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handlePrevStep = () => router.push('/');

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
					{userDataFields.map(({ name, label, placeholder, Icon, type = 'text' }) => (
						<div key={name} className="flex flex-wrap -mx-3 mb-6">
							<div className="w-full px-3">
								<div className="flex items-center bg-gray-200 rounded-lg mb-3">
									<Icon className="text-gray-700 mx-3" />
									<input
										className={`appearance-none py-6 text-2xl block w-full bg-gray-200 text-gray-700 border ${errors[name] ? 'border-red-500' : 'border-gray-200'} rounded-lg py-3 px-4 leading-tight focus:outline-none focus:bg-white`}
										id={`grid-${name}`}
										type={type}
										name={name}
										placeholder={placeholder}
										value={formData[name as keyof FormData]}
										onChange={handleChange}
									/>
								</div>
								{errors[name] && <p className="text-red-500 text-xs italic">{errors[name]}</p>}
							</div>
						</div>
					))}
					{error && <p className="text-red-500 text-center mb-4">{error}</p>}
					<div className="flex justify-end mb-10">
						<p className="mt-4 text-[12px]">
							<a href="/forgot-password" className="text-blue-900 font-medium hover:text-blue-500">
								Forgot Password?
							</a>
						</p>
					</div>

					<button
						type="submit"
						className="w-full bg-black text-white py-4 rounded-full text-1xl font-semibold hover:bg-gray-800 transition duration-200"
					>
						Sign In
					</button>
				</form>
			</div>

			<div className="h-[15%] flex flex-col justify-start text-center">
				<p className="text-gray-500 mb-10">Or sign in with</p>
				<div className="flex flex-row justify-evenly space-x-8">
					{[FaApple, FaFacebook, FaGoogle].map((Icon, idx) => (
						<button key={idx} className="text-5xl">
							<Icon className={
								idx === 1 ? 'text-blue-600' :
									idx === 2 ? 'text-red-600' : ''
							} />
						</button>
					))}
				</div>
			</div>

			<div className="h-[5%] text-center content-center">
				<p className="text-gray-500">
					Don't have an account? <a href="/signup" className="text-indigo-600 underline">Sign Up</a>
				</p>
			</div>
		</div>
	);
}
