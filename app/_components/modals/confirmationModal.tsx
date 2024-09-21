'use client';

import { FC } from 'react';
import { AiOutlineClose } from 'react-icons/ai';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    question: string;
    confirmText: string;
    cancelText: string;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    question,
    confirmText,
    cancelText
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center relative z-60 w-11/12 max-w-lg sm:w-5/6">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                    aria-label="Close"
                >
                    <AiOutlineClose size={20} />
                </button>
                <div className='py-4'>
                    <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
                    <p className="mb-6">{question}</p>
                </div>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onConfirm}
                        className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg hover:bg-red-600"
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-gray-400"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
