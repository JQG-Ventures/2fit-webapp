'use client';

interface ToggleButtonProps {
  isOn: boolean;
  onToggle: () => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ isOn, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`w-14 h-7 flex items-center rounded-full p-1 ${
        isOn ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <div
        className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ${
          isOn ? 'translate-x-7' : ''
        }`}
      ></div>
    </button>
  );
};

export default ToggleButton;
