import React from 'react';

interface ModalProps {
  title: string;
  message: string | Element;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-t-lg shadow-lg w-full mb-0 transform transition-all duration-300 ease-in-out translate-y-10 opacity-100 animate-slide-up">
        <h2 className="text-red-500 text-3xl font-bold text-center">{title}</h2>
        <p className="my-10 text-center">{message}</p>
        <div className="flex justify-center">
          <button 
            onClick={onClose} 
            className="bg-gradient-to-r from-green-400 to-green-600 text-white p-3 rounded-full w-full max-w-xs flex items-center justify-center">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
