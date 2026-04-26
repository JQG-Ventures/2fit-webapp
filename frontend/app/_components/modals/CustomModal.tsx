'use client';

import type { FC, ReactNode } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    handleCloseModal: () => void;
    children: ReactNode;
}

const CustomModal: FC<ConfirmationModalProps> = ({ isOpen, handleCloseModal, children }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[999] flex items-end justify-center bg-black/45 px-3"
            onClick={handleCloseModal}
        >
            <div
                className="mb-0 w-full max-w-2xl animate-slide-up rounded-t-[2rem] bg-[#f8faf9] p-5 pb-[calc(2.5rem+env(safe-area-inset-bottom))] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};

export default CustomModal;
