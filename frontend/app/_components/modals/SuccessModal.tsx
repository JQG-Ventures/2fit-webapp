import React from 'react';
import { FaCheckSquare } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface SuccessModalProps {
    onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ onClose }) => {
    const { t } = useTranslation('global');

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-3xl py-28 px-12 w-[100%] max-w-2xl text-center shadow-2xl relative flex flex-col">
                <div className="relative flex items-center justify-center mb-12">
                    <div className="bg-green-500 border-4 border-green-500 rounded-full w-40 h-40 flex items-center justify-center relative">
                        <FaCheckSquare className="text-white text-6xl" />
                    </div>

                    <div className="absolute top-0 left-10 bg-green-400 rounded-full w-6 h-6"></div>
                    <div className="absolute top-0 right-10 bg-green-400 rounded-full w-6 h-6"></div>
                    <div className="absolute top-16 left-24 bg-green-400 rounded-full w-3 h-3"></div>
                    <div className="absolute top-16 right-24 bg-green-400 rounded-full w-3 h-3"></div>
                    <div className="absolute bottom-0 left-10 bg-green-400 rounded-full w-5 h-5"></div>
                    <div className="absolute bottom-0 right-10 bg-green-400 rounded-full w-5 h-5"></div>
                </div>

                <h2 className="text-4xl font-bold mb-6">
                    {t('ForgotPassword.step3.createPasswordScreen.modal.successTitle')}
                </h2>
                <p className="text-gray-600 mb-10 text-2xl">
                    {t('ForgotPassword.step3.createPasswordScreen.modal.successMessage')}
                </p>

                <div className="flex-grow"></div>

                <button
                    onClick={onClose}
                    className="bg-green-500 text-white w-full py-6 rounded-full text-2xl font-semibold"
                >
                    {t('ForgotPassword.step3.createPasswordScreen.modal.goToHomepage')}
                </button>
            </div>
        </div>
    );
};

export default SuccessModal;
