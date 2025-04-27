interface RegistrationButtonsProps {
    handleNext: () => void;
    handlePrev: () => void;
    isSubmittingNext: boolean;
    isSubmittingPrev: boolean;
    prevText: string;
    nextText: string;
    isNextDisabled: boolean;
}
