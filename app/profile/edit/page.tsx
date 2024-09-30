'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaRegEnvelope, FaPhoneAlt } from 'react-icons/fa';
import { IoCalendarOutline } from "react-icons/io5";
import { CiGlobe } from "react-icons/ci";
import countries from '@/app/data/countries.json';  
import countryCodes from '@/app/data/countryCodes.json';  
import { detectCountryCode } from '@/app/utils/phoneUtils';  
import { fetchUserData, UserProfile } from '../../_services/userService';

const EditProfile: React.FC = () => {
  const router = useRouter();
  
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [countryCode, setCountryCode] = useState<string>("");  
  const [phoneNumber, setPhoneNumber] = useState<string>("");  

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const data = await fetchUserData('user_50662633238');
        setProfileData(data);
        
        if (data?.number) {
          const detectedCountryCode = detectCountryCode(data.number);  
          setCountryCode(detectedCountryCode.code);
          setPhoneNumber(detectedCountryCode.number);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "countryCode") {
      setCountryCode(value);  
    } else if (name === "number") {
      setPhoneNumber(value);  
    } else if (profileData) {
      setProfileData((prevData) => ({
        ...prevData!,
        [name]: value,
      }));
    }
  };

  if (!profileData) {
    return <div className="m-auto my-auto text-center min-h-screen bg-white p-6 pb-40">
      <p className='py-80'>We are currently having issues... please try again later.</p>
      </div>;
  }

  return (
    <div className="text-black min-h-screen bg-white p-6 pb-40">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="text-gray-700">
          <FaArrowLeft className="w-8 h-8" />
        </button>
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <div></div> 
      </header>
      
      <form className="space-y-6">
        {/* Name */}
        <div className="pl-2 py-3">
          <label className="block text-gray-500 text-base mb-1">Name</label>
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleInputChange}
              placeholder="Username"
              className="w-full border-none focus:ring-0 placeholder-gray-500 bg-transparent"
            />
          </div>
        </div>

        {/* Birth Date */}
        <div className="pl-2 py-3">
          <label className="block text-gray-500 text-base mb-1">Birth Date</label>
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm flex items-center justify-between">
            <input
              type="text"
              name="birthDate"
              value={profileData.birthDate}
              onChange={handleInputChange}
              placeholder="mm/dd/yyyy"
              className="w-full border-none focus:ring-0 placeholder-gray-500 bg-transparent"
            />
            <IoCalendarOutline className="text-black w-8 h-8" />
          </div>
        </div>

        {/* Email */}
        <div className="pl-2 py-3">
          <label className="block text-gray-500 text-base mb-1">Email</label>
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm flex items-center justify-between">
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              placeholder="user@yourdomain.com"
              className="w-full border-none focus:ring-0 placeholder-gray-500 bg-transparent"
            />
            <FaRegEnvelope className="text-black" />
          </div>
        </div>

        {/* Country */}
        <div className="pl-2 py-3">
          <label className="block text-gray-500 text-base mb-1">Country</label>
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm flex items-center justify-between">
            <select
              name="country"
              value={profileData.country || ""}
              onChange={handleInputChange}
              className="w-full border-none focus:ring-0 bg-transparent "
            >
              <option value="">Select your country</option> {/* Placeholder */}
              {countries.map((country, index) => (
                <option key={index} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Phone Number */}
        <div className="pl-2 py-3">
          <label className="block text-gray-500 text-base mb-1">Phone Number</label>
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm flex items-center justify-between">
            <FaPhoneAlt className="text-black mr-2" />

            {/* Dropdown list for country codes */}
            <div className="mr-2">
              <select
                name="countryCode"
                value={countryCode}  
                onChange={handleInputChange}
                className="bg-transparent text-black focus:ring-0 border-none"
              >
                <option value="">Select Code</option> {/* Placeholder */}
                {countryCodes.map((country, index) => (
                  <option key={index} value={country.code}>
                    {country.code} <span className="text-gray-500">({country.abbreviation})</span>
                  </option>
                ))}
              </select>
            </div>

            {/* Phone number input */}
            <input
              type="tel"
              name="number"
              value={phoneNumber}
              onChange={handleInputChange}
              placeholder="111 467 378 399"
              className="w-full border-none focus:ring-0 placeholder-gray-500 bg-transparent"
            />
          </div>
        </div>

        {/* Gender */}
        <div className="pl-2 py-3">
          <label className="block text-gray-500 text-base mb-1">Gender</label>
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm flex items-center justify-between">
            <select
              name="gender"
              value={profileData.profile.gender}
              onChange={handleInputChange}
              className="w-full border-none focus:ring-0 bg-transparent"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-400 to-green-700 text-white p-4 rounded-full text-2xl font-semibold shadow-lg py-8"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
