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
        className="bg-white p-14 rounded-lg w-full max-w-2xl"
        onSubmit={handleSubmit}
      >
        <h2 className="text-4xl font-semibold mb-8">{t('ChangePasswordModal.title') || 'Change Password'}</h2>

        <div className="mb-8">
          <label htmlFor="newPassword" className="block text-2xl text-gray-700 mb-4">
            {t('ChangePasswordModal.newPassword') || 'New Password'}
          </label>
          <input
            type="password"
            id="newPassword"
            className={`w-full p-5 border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg text-2xl`}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {errors.newPassword && (
            <p className="text-red-500 text-lg mt-2">{errors.newPassword}</p>
          )}
        </div>

        <div className="mb-8">
          <label htmlFor="confirmPassword" className="block text-2xl text-gray-700 mb-4">
            {t('ChangePasswordModal.confirmPassword') || 'Confirm Password'}
          </label>
          <input
            type="password"
            id="confirmPassword"
            className={`w-full p-5 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg text-2xl`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-lg mt-2">{errors.confirmPassword}</p>
          )}
        </div>

        {errorMessage && (
          <p className="text-red-500 text-2xl mb-8">{errorMessage}</p>
        )}

        <div className="flex justify-end space-x-8">
          <button
            type="button"
            className="px-8 py-4 bg-gray-300 text-gray-700 rounded-lg text-2xl"
            onClick={onClose}
          >
            {t('ChangePasswordModal.cancel') || 'Cancel'}
          </button>
          <button
            type="submit"
            className={`px-8 py-4 bg-green-500 text-white rounded-lg text-2xl font-semibold ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
