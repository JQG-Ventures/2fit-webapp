"use client";
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";
import { IoChevronBack } from "react-icons/io5";
import { FiMail, FiLock } from "react-icons/fi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import * as actions from "@/actions";

export default function Login() {
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const response = await actions.signIn(formData);
		if (!!response?.error) {
			console.error(response.error);
			setError(response?.error);
		} else {
			router.push("/home");
		}
	};
	const [errors, setErrors] = useState({});
	const handleChange = (e: any) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};
	const user_data_fields = [
		{ name: 'email', label: 'Email', placeholder: 'Email', Icon: FiMail },
		{ name: 'password', label: 'Password', placeholder: '******************', type: 'password', FiLock }
	];

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
				<form className="w-full lg:max-w-3xl" onSubmit={handleSubmit}
				>
					{user_data_fields.map(({ name, label, placeholder, Icon, type = 'text' }) => (
						<div key={name} className="flex flex-wrap -mx-3 mb-6">
							<div className="w-full px-3">
								<input
									className={`appearance-none py-6 text-2xl block w-full bg-gray-200 text-gray-700 border ${errors[name] ? 'border-red-500' : 'border-gray-200'} rounded-lg py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white`}
									id={`grid-${name}`}
									type={type}
									name={name}
									placeholder={placeholder}
									value={formData.name}
									onChange={handleChange}
								/>
								{errors.name && <p className="text-red-500 text-xs italic">{errors[name]}</p>}
							</div>
						</div>
					))}
					<div className="flex justify-end mb-10">
						<p className="mt-4 text-[12px]">
							<a href="/login" className="text-blue-900 font-medium hover:text-blue-500">
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
							<Icon className={idx === 1 ? 'text-blue-600' : idx === 2 ? 'text-red-600' : ''} />
						</button>
					))}
				</div>
			</div>

			<div className="h-[5%] text-center content-center">
				<p className="text-gray-500">
					Don't you have an account? <a href="#" className="text-indigo-600 underline">Sign Up</a>
				</p>
			</div>
		</div>
	);
}
