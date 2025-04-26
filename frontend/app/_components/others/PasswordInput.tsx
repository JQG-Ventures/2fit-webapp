import React, { useState } from "react";
import { RiLock2Line } from "react-icons/ri";

interface PasswordInputProps {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ placeholder, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex items-center border-2 rounded-lg px-6 py-6 w-full">
      <RiLock2Line className="text-3xl mr-4" />
      
      <input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="flex-1 text-2xl outline-none"
      />
    </div>
  );
};

export default PasswordInput;
