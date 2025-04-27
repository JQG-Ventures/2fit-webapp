import React from 'react';
import { FaSpinner } from 'react-icons/fa';

interface ButtonWithSpinnerProps {
    type?: 'button' | 'submit' | 'reset';
    onClick?: () => void;
    loading: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    className?: string;
}

const ButtonWithSpinner: React.FC<ButtonWithSpinnerProps> = ({
    type = 'button',
    onClick,
    loading,
    disabled,
    children,
    className = '',
}) => {
    return (
        <button
            type={type}
            onClick={!loading ? onClick : undefined}
            disabled={disabled || loading}
            className={`${className} flex items-center justify-center ${
                loading ? 'cursor-not-allowed opacity-50' : ''
            }`}
        >
            {children}
            {loading && <FaSpinner className="ml-4 animate-spin" />}
        </button>
    );
};

export default ButtonWithSpinner;
