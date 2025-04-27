'use client';

interface ToggleButtonProps {
    isOn: boolean;
    onToggle: () => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ isOn, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className={`w-16 h-8 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none  ${
                isOn ? 'bg-green-500' : 'bg-gray-300'
            }`}
        >
            <div
                className={`w-6 h-6 rounded-full shadow-md transform duration-300 border ${
                    isOn
                        ? 'translate-x-8 bg-white border-green-600'
                        : 'translate-x-0 bg-white border-gray-400'
                }`}
            ></div>
        </button>
    );
};

export default ToggleButton;
