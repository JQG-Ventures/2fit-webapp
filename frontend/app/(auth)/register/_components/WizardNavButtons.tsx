'use client';

import React from 'react';

interface WizardNavButtonsProps {
    onPrev?: () => void;
    onNext: () => void;
    isNextDisabled?: boolean;
    prevText: string;
    nextText: string;
    isSubmitting?: boolean;
}

export default function WizardNavButtons({
    onPrev,
    onNext,
    isNextDisabled = false,
    prevText,
    nextText,
    isSubmitting = false,
}: WizardNavButtonsProps) {
    return (
        <div className="flex gap-4 pb-2">
            {onPrev && (
                <button
                    type="button"
                    onClick={onPrev}
                    className="flex-1 border border-gray-300 text-gray-700 py-[18px] rounded-full text-[17px] font-bold hover:bg-gray-50 transition duration-200"
                >
                    {prevText}
                </button>
            )}
            <button
                type="button"
                onClick={onNext}
                disabled={isNextDisabled || isSubmitting}
                className={`flex-1 py-[18px] rounded-full text-[17px] font-bold transition duration-200 ${
                    isNextDisabled || isSubmitting
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-gray-800'
                }`}
            >
                {isSubmitting ? '...' : nextText}
            </button>
        </div>
    );
}
