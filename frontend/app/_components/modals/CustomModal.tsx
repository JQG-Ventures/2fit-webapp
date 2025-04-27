'use client';

import { FC } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    handleCloseModal: () => void;
    children: React.ReactNode;
}

const CustomModal: FC<ConfirmationModalProps> = ({ isOpen, handleCloseModal, children }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50 z-[999]"
            onClick={handleCloseModal}
        >
            <div
                className="bg-white p-10 rounded-t-3xl shadow-xl w-full mb-0 transform transition-all duration-300 ease-in-out translate-y-10 opacity-100 animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};

export default CustomModal;
