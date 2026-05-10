import React from 'react';
import { FaSpinner } from 'react-icons/fa';

interface ButtonWithSpinnerProps {
    type?: 'button' | 'submit' | 'reset';
    onClick?: () => void;
    loading: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    ariaLabel: string;
    replaceContentOnLoading?: boolean;
    spinnerClassName?: string;
}

const ButtonWithSpinner: React.FC<ButtonWithSpinnerProps> = ({
    type = 'button',
    onClick,
    loading,
    disabled,
    children,
    className = '',
    style,
    ariaLabel,
    replaceContentOnLoading = false,
    spinnerClassName = '',
}) => {
    return (
        <button
            type={type}
            onClick={!loading ? onClick : undefined}
            disabled={disabled || loading}
            aria-label={ariaLabel}
            className={`${className} flex items-center justify-center ${
                loading ? 'cursor-not-allowed opacity-50' : ''
            }`}
            style={style}
        >
            {!loading || !replaceContentOnLoading ? children : null}
            {loading && (
                <FaSpinner
                    className={`${replaceContentOnLoading ? '' : 'ml-4'} animate-spin ${spinnerClassName}`.trim()}
                />
            )}
        </button>
    );
};

export default ButtonWithSpinner;
