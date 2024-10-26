'use client';

import ToggleButton from '../../_components/profile/togglebutton';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { MdKeyboardArrowRight } from "react-icons/md";

interface SecurityItemProps {
  label: string;
  hasArrow?: boolean;
}

const SecurityItem: React.FC<SecurityItemProps> = ({ label, hasArrow = false }) => (
  <div className="flex items-center justify-between w-full py-5 pl-7">
    <div className="flex items-center space-x-4">
      <span className="text-3xl">{label}</span>
    </div>
    {hasArrow ? (
      <MdKeyboardArrowRight className="text-gray-500 w-12 h-12" />
    ) : (
      <ToggleButton />
    )}
  </div>
);

const Security: React.FC = () => {
  const router = useRouter();

  const securityItems = [
    { label: 'Face ID' },
    { label: 'Remember me' },
    { label: 'Touch ID' },
    { label: 'Google Authenticator', hasArrow: true }
  ];

  return (
    <div className="flex flex-col justify-between items-center bg-white h-screen p-14 lg:pt-[10vh]">

      <div className="h-[12%] flex flex-row justify-left space-x-8 items-center w-full lg:max-w-3xl">
        <button onClick={() => router.back()} className="text-gray-700">
          <FaArrowLeft className="w-8 h-8" />
        </button>
        <h1 className="text-5xl font-semibold">Security</h1>
      </div>

      <div className="h-[78%] flex flex-col justify-start py-6 w-full max-w-3xl space-y-8 overflow-y-auto">
        {securityItems.map((item, index) => (
          <SecurityItem key={index} label={item.label} hasArrow={item.hasArrow} />
        ))}
      </div>

      <div className="h-[10%] flex w-full max-w-3xl">
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-400 to-green-700 text-white p-4 rounded-full text-2xl font-semibold shadow-lg flex items-center justify-center"
        >
          Change Password
        </button>
      </div>
    </div>
  );
};

export default Security;