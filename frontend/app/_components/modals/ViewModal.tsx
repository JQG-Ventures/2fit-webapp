import React from 'react';
import { IoMdClose } from 'react-icons/io';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const ViewModal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-lg w-full max-w-5xl p-5 max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-row justify-between p-6 mb-4">
                    <h2 className="text-3xl font-semibold">{title}</h2>

                    <button onClick={onClose} className="text-red-500 hover:text-red-800 mb-4">
                        <IoMdClose className="text-3xl" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[70vh]">{children}</div>
            </div>
        </div>
    );
};

export default ViewModal;
