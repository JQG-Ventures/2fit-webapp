'use client';

import { FC } from 'react';
import CustomModal from './CustomModal';


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
        <CustomModal isOpen={isOpen} handleCloseModal={onClose}>
            {
                <div className="w-full justify-center items-center space-y-12">
                    <h1 className="text-center">{question}</h1>
                    <div className={`h-[10%] flex flex-row justify-evenly items-center w-full`}>
                        <button
                            onClick={onConfirm}
                            type="submit"
                            className="w-[45%] max-w-xl bg-gradient-to-r from-green-400 to-green-700 text-white px-4 rounded-full text-2xl font-semibold shadow-lg py-4 flex items-center justify-center"
                        >
                            {confirmText}
                        </button>
                        <button
                            onClick={onClose}
                            type="submit"
                            className="w-[45%] max-w-xl bg-red-500 text-white px-4 rounded-full text-2xl font-semibold shadow-lg py-4 flex items-center justify-center"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            }
        </CustomModal>
    );
};

export default ConfirmationModal;
