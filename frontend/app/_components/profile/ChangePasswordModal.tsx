'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ChangePasswordModalProps {
	onClose: () => void;
	onSubmit: (newPassword: string) => void;
	errorMessage?: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose, onSubmit, errorMessage }) => {
	const { t } = useTranslation('global');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const validatePassword = (password: string) =>
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])[^ ]{8,}$/.test(password);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		const validationErrors: Record<string, string> = {};

		if (!newPassword) {
			validationErrors.newPassword = t('ChangePasswordModal.passwordRequired') || 'Password is required.';
		} else if (!validatePassword(newPassword)) {
			validationErrors.newPassword =
				t('ChangePasswordModal.passwordValidationError') ||
				'Password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character, and contain no spaces.';
		}

		if (!confirmPassword) {
			validationErrors.confirmPassword = t('ChangePasswordModal.confirmPasswordRequired') || 'Please confirm your password.';
		} else if (newPassword !== confirmPassword) {
			validationErrors.confirmPassword =
				t('ChangePasswordModal.passwordsDoNotMatch') || 'Passwords do not match.';
		}

		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			setIsSubmitting(false);
			return;
		}

		try {
			await onSubmit(newPassword);
		} catch (error) {
			console.error('Error submitting new password:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
			<form
				className="bg-white p-14 rounded-lg w-full max-w-2xl space-y-12"
				onSubmit={handleSubmit}
			>
				<h2 className="text-4xl font-semibold">{t('ChangePasswordModal.title') || 'Change Password'}</h2>

				<div className='flex flex-col space-y-8 my-16'>
					<div className="">
						<label htmlFor="newPassword" className="block text-2xl text-gray-700 mb-4">
							{t('ChangePasswordModal.newPassword') || 'New Password'}
						</label>
						<input
							type="password"
							id="newPassword"
							className="appearance-none py-6 text-2xl block w-full bg-gray-200 text-gray-700 rounded-lg py-4 px-4 mb-3 leading-tight focus:border focus:border-gray-300 focus:bg-white"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
						/>
						{errors.newPassword && (
							<p className="text-red-500 text-lg mt-2">{errors.newPassword}</p>
						)}
					</div>

					<div className="">
						<label htmlFor="confirmPassword" className="block text-2xl text-gray-700 mb-4">
							{t('ChangePasswordModal.confirmPassword') || 'Confirm Password'}
						</label>
						<input
							type="password"
							id="confirmPassword"
							className="appearance-none py-6 text-2xl block w-full bg-gray-200 text-gray-700 rounded-lg py-4 px-4 mb-3 leading-tight focus:border focus:border-gray-300 focus:bg-white"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>
						{errors.confirmPassword && (
							<p className="text-red-500 text-lg mt-2">{errors.confirmPassword}</p>
						)}
					</div>
				</div>

				{errorMessage && (
					<p className="text-red-500 text-2xl mb-8">{errorMessage}</p>
				)}

				<div className="flex justify-between">
					<button
						type="button"
						className="px-8 py-4 bg-gray-300 text-gray-700 rounded-full text-2xl"
						onClick={onClose}
					>
						{t('ChangePasswordModal.cancel') || 'Cancel'}
					</button>
					<button
						type="submit"
						className={`px-8 py-4 bg-green-500 text-white rounded-full text-2xl font-semibold ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
						disabled={isSubmitting}
					>
						{isSubmitting ? (t('ChangePasswordModal.updating') || 'Updating...') : (t('ChangePasswordModal.update') || 'Update')}
					</button>
				</div>
			</form>
		</div>
	);
};

export default ChangePasswordModal;
