'use client'; 

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaEdit, FaBell, FaLock, FaQuestionCircle, FaMoon, FaPowerOff, FaUser } from 'react-icons/fa';
import { IoIosArrowDropright } from "react-icons/io";
import { SlOptionsVertical } from "react-icons/sl";
import ToggleButton from '../_components/profile/togglebutton';
import { fetchUserData, UserProfile } from '../_services/userService'; // Importar la función y la interfaz

const ProfilePage: React.FC = () => {
  const router = useRouter();
  
  // Definir el estado con el tipo UserData o undefined (mientras se cargan los datos)
  const [userData, setUserData] = useState<UserProfile | undefined>(undefined);

  // Llamar al backend para obtener los datos del usuario
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await fetchUserData('50683285554'); // Cambia '123' por el ID dinámico si es necesario
        setUserData(data); // Actualizar el estado con los datos del usuario
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen px-6 py-10">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold pl-4">Profile</h1>
        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-400">
          <SlOptionsVertical className="text-gray-700 w-5 h-5" /> 
        </div>
      </header>

      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <Image
            src="/images/userprofile.png " 
            alt="Profile Picture"
            width={120}
            height={120}
            className="rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div className="absolute bottom-0 right-0 bg-green-500 p-1 rounded-full">
            <FaEdit className="text-white w-5 h-5" />
          </div>
        </div>
        <h2 className="text-3xl font-semibold mt-4">{userData?.name || 'Loading...'}</h2>
        <p className="text-gray-400">{userData?.email || 'Loading...'}</p>
      </div>

      <div className="bg-gradient-to-r from-green-400 to-green-600 text-white rounded-[25px] p-5 mb-8 shadow-lg w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 pl-4">
          <span className="bg-yellow-500 text-black rounded-full px-3 py-1 text-2xl font-bold">PRO</span>
          <h3 className="font-semibold text-2xl">Upgrade to Premium</h3>
        </div>
        <IoIosArrowDropright className="text-white w-8 h-8" />
      </div>
      <p className="text-xl mt-2 text-gray-200 pl-4">Enjoy workout access without ads and restrictions</p>
    </div>

    <div className="border-t border-gray-300 my-4"></div> 
      <div className="space-y-6 w-full">
        {/* Edit Profile */}
        <div
          className="flex items-center space-x-4 cursor-pointer w-full py-4 pl-4"  
          onClick={() => router.push('/profile/edit')} 
        >
          <FaUser className="text-gray-500 w-6 h-6" />
          <span className="text-2xl font-medium w-full">Edit Profile</span>
        </div>

        {/* Notifications */}
        <div className="flex items-center space-x-4 cursor-pointer w-full py-4 pl-4">
          <FaBell className="text-gray-500 w-6 h-6" />
          <span className="text-2xl font-medium w-full">Notifications</span>
        </div>

        {/* Security */}
        <div className="flex items-center space-x-4 cursor-pointer w-full py-4 pl-4">
          <FaLock className="text-gray-500 w-6 h-6" />
          <span className="text-2xl font-medium w-full">Security</span>
        </div>

        {/* Help */}
        <div className="flex items-center space-x-4 cursor-pointer w-full py-4 pl-4">
          <FaQuestionCircle className="text-gray-500 w-6 h-6" />
          <span className="text-2xl font-medium w-full">Help</span>
        </div>

        <div className="flex items-center justify-between w-full py-4 pl-4">
          <div className="flex items-center space-x-4">
            <FaMoon className="text-gray-500 w-6 h-6" />
            <span className="text-2xl font-medium">Dark Theme</span>
          </div>
          <ToggleButton /> 
        </div>

        <div className="flex items-center space-x-4 text-red-500 cursor-pointer w-full py-4 pl-4">
          <FaPowerOff className="text-red-500 w-6 h-6" />
          <span className="text-2xl font-medium w-full">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
