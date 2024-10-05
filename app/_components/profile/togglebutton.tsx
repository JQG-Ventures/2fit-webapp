'use client'; 

import { useState } from 'react';

const ToggleButton = () => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`w-14 h-7 flex items-center rounded-full p-1 ${
        isDark ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <div
        className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ${
          isDark ? 'translate-x-7' : ''
        }`}
      ></div>
    </button>
  );
};

export default ToggleButton;
