'use client'; 

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { IoIosArrowDropright, IoIosLogOut } from "react-icons/io";
import { SlOptionsVertical } from "react-icons/sl";
import ToggleButton from '../_components/profile/togglebutton';
import { fetchUserData, UserProfile } from '../_services/userService';
import { MdModeEditOutline } from "react-icons/md";
import { CiUser, CiBellOn, CiLock, CiCircleQuestion } from "react-icons/ci";
import { BsMoon } from "react-icons/bs";
import Modal from '../_components/profile/modal'; // Ajusta la ruta según tu estructura de carpetas

const ProfilePage: React.FC = () => {
  const router = useRouter();
  
  const [userData, setUserData] = useState<UserProfile | undefined>(undefined);
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); 

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await fetchUserData('user_50686134777'); 
        setUserData(data);
      } catch (error) {
        console.error('Error loading user data:', error);
        setErrorMessage('Error loading user data. Please try again later.');
      }
    };

    loadUserData();
  }, []);

  const handleClick = (index: number, path: string) => {
    setPressedIndex(index);
    setTimeout(() => {
      router.push(path);
      setPressedIndex(null);
    }, 150);
  };

  const handleCloseModal = () => {
    setErrorMessage(null);
    router.push('/home');
  };

  return (
    <div className="bg-gray-50 min-h-screen px-6 py-10 pb-32">
      {errorMessage && (
        <Modal
          message={errorMessage}
          onClose={handleCloseModal}
        />
      )}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold pl-4">Profile</h1>
        <div className="flex items-center justify-center w-10 h-10">
          <SlOptionsVertical className="text-gray-700 w-7 h-7" /> 
        </div>
      </header>

      <div className="flex flex-col items-center mb-8 overflow-hidden">
        <div className="relative w-40 h-40">
          <Image
            src="/images/userprofile.png" 
            alt="Profile Picture"
            width={120}
            height={120}
            className="rounded-full object-cover border-4 border-white shadow-lg w-full h-full"
          />
          <div 
            className="absolute bottom-0 right-0 bg-green-500 p-1 rounded-full cursor-pointer"
            onClick={() => router.push('/profile/edit')}
          >
            <MdModeEditOutline className="text-white w-8 h-8 ml-1" />
          </div>
        </div>
        <h2 className="text-3xl font-semibold mt-4 truncate max-w-full text-center">
          {userData?.name || 'Username'}
        </h2>
        <p className="text-gray-400 overflow-hidden text-ellipsis max-w-full text-center">
          {userData?.email || 'user@yourdomain.com'}
        </p>
      </div>

      <div className="bg-gradient-to-r from-green-400 to-green-700 text-white rounded-[25px] p-5 mb-8 shadow-lg w-full py-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 pl-4">
            <span className="bg-gradient-to-b from-yellow-300 to-yellow-700 text-white rounded-full px-4 py-2 text-2xl pl-4 pr-4">PRO</span>
            <h3 className="font-semibold text-3xl">Upgrade to Premium</h3>
          </div>
          <IoIosArrowDropright className="text-white w-10 h-10" />
        </div>
        <p className="text-2xl mt-2 text-gray-200 pl-4">Enjoy workout access without ads and restrictions</p>
      </div>

      <div className="border-t border-gray-300 my-4"></div> 

      <div className="space-y-6 w-full">
        {/* Edit Profile */}
        <div 
          className={`flex items-center space-x-4 cursor-pointer w-full py-6 pl-4 hover:bg-gray-200 transition duration-200 ${pressedIndex === 0 ? 'transform scale-95 shadow-inner' : ''}`} 
          onClick={() => handleClick(0, '/profile/edit')}
          onMouseDown={() => setPressedIndex(0)}
          onMouseUp={() => setPressedIndex(null)}
        >
          <CiUser className="text-gray-500 w-12 h-12" />
          <span className="text-3xl font-medium w-full">Edit Profile</span>
        </div>

        {/* Notifications */}
        <div 
          className={`flex items-center space-x-4 cursor-pointer w-full py-6 pl-4 hover:bg-gray-200 transition duration-200 ${pressedIndex === 1 ? 'transform scale-95 shadow-inner' : ''}`} 
          onClick={() => handleClick(1, '/profile/notifications')}
          onMouseDown={() => setPressedIndex(1)}
          onMouseUp={() => setPressedIndex(null)}
        >
          <CiBellOn className="text-gray-500 w-12 h-12" />
          <span className="text-3xl font-medium w-full">Notifications</span>
        </div>

        {/* Security */}
        <div 
          className={`flex items-center space-x-4 cursor-pointer w-full py-6 pl-4 hover:bg-gray-200 transition duration-200 ${pressedIndex === 2 ? 'transform scale-95 shadow-inner' : ''}`} 
          onClick={() => handleClick(2, '/profile/security')}
          onMouseDown={() => setPressedIndex(2)}
          onMouseUp={() => setPressedIndex(null)}
        >
          <CiLock className="text-gray-500 w-12 h-12" />
          <span className="text-3xl font-medium w-full">Security</span>
        </div>

        {/* Help */}
        <div 
          className={`flex items-center space-x-4 cursor-pointer w-full py-6 pl-4 hover:bg-gray-200 transition duration-200 ${pressedIndex === 3 ? 'transform scale-95 shadow-inner' : ''}`} 
          onClick={() => handleClick(3, '/profile/help')}
          onMouseDown={() => setPressedIndex(3)}
          onMouseUp={() => setPressedIndex(null)}
        >
          <CiCircleQuestion className="text-gray-500 w-12 h-12" />
          <span className="text-3xl font-medium w-full">Help</span>
        </div>

        <div className="flex items-center justify-between w-full py-6 pl-4">
          <div className="flex items-center space-x-4">
            <BsMoon className="text-gray-500 w-8 h-8" />
            <span className="text-3xl font-medium">Dark Theme</span>
          </div>
          <ToggleButton /> 
        </div>

        {/* Logout */}
        <div 
          className={`flex items-center space-x-4 text-red-500 cursor-pointer w-full py-6 pl-4 hover:bg-gray-200 transition duration-200 ${pressedIndex === 4 ? 'transform scale-95 shadow-inner' : ''}`} 
          onClick={() => handleClick(4, '/profile/logout')}
          onMouseDown={() => setPressedIndex(4)}
          onMouseUp={() => setPressedIndex(null)}
        >
          <IoIosLogOut className="text-red-500 w-9 h-9" />
          <span className="text-3xl font-medium w-full">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
