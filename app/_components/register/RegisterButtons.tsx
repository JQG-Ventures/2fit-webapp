'use client';

import React from 'react';
import ButtonWithSpinner from '../../_components/others/ButtonWithSpinner';


export default function RegistrationButtons({
    handleNext,
    handlePrev,
    isSubmittingNext,
    isSubmittingPrev,
    prevText,
    nextText,
    isNextDisabled
}: RegistrationButtonsProps) {
    return (
        <div className="flex flex-row items-center space-x-4 justify-between w-full lg:max-w-3xl">
            <ButtonWithSpinner
                type="button"
                onClick={handlePrev}
                loading={isSubmittingPrev}
                className={'w-full bg-black text-white py-4 rounded-full text-1xl font-semibold hover:bg-gray-800 transition duration-200 mt-4'}
            >
                {prevText}
            </ButtonWithSpinner>

            <ButtonWithSpinner
                type="button"
                onClick={handleNext}
                loading={isSubmittingNext}
                disabled={isNextDisabled}
                className={`w-full ${isNextDisabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-black hover:bg-gray-800'} text-white py-4 rounded-full text-1xl font-semibold transition duration-200 mt-4`}
            >
                {nextText}
            </ButtonWithSpinner>
        </div>
    );
}
