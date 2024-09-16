'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaCalendarAlt, FaEnvelope, FaGlobe, FaPhoneAlt, FaUser } from 'react-icons/fa';
import countries from '@/app/data/countries.json';
import { fetchUserData, UserProfile } from '../../_services/userService';

const EditProfile: React.FC = () => {
  const router = useRouter();
  
  const [profileData, setProfileData] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const data = await fetchUserData('50683285554');
        setProfileData(data);
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (profileData) {
      setProfileData((prevData) => ({
        ...prevData!,
        [name]: value,
      }));
    }
  };

  if (!profileData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white p-6">
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
        <div className="pl-2">
          <label className="block text-black mb-1 font-bold">Name</label>
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
        <div className="pl-2">
          <label className="block text-black mb-1 font-bold">Birth Date</label>
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm flex items-center justify-between">
            <input
              type="text"
              name="birthDate"
              value={profileData.birthDate}
              onChange={handleInputChange}
              placeholder="mm/dd/yyyy"
              className="w-full border-none focus:ring-0 placeholder-gray-500 bg-transparent"
            />
            <FaCalendarAlt className="text-black" />
          </div>
        </div>

        {/* Email */}
        <div className="pl-2">
          <label className="block text-black mb-1 font-bold">Email</label>
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm flex items-center justify-between">
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              placeholder="user@yourdomain.com"
              className="w-full border-none focus:ring-0 placeholder-gray-500 bg-transparent"
            />
            <FaEnvelope className="text-black" />
          </div>
        </div>

        {/* Country */}
        <div className="pl-2">
          <label className="block text-black mb-1 font-bold">Country</label>
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm flex items-center justify-between">
            <select
              name="country"
              value={profileData.country}
              onChange={handleInputChange}
              className="w-full border-none focus:ring-0 bg-transparent"
            >
              {countries.map((country, index) => (
                <option key={index} value={country}>{country}</option>
              ))}
            </select>
            <FaGlobe className="text-black" />
          </div>
        </div>

        {/* Phone Number */}
        <div className="pl-2">
          <label className="block text-black mb-1 font-bold">Phone Number</label>
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm flex items-center justify-between">
            <FaPhoneAlt className="text-black mr-2" />
            <input
              type="tel"
              name="number"
              value={profileData.number}
              onChange={handleInputChange}
              placeholder="+1 111 467 378 399"
              className="w-full border-none focus:ring-0 placeholder-gray-500 bg-transparent"
            />
          </div>
        </div>

        {/* Gender */}
        <div className="pl-2">
          <label className="block text-black mb-1 font-bold">Gender</label>
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
            <FaUser className="text-black" />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white p-4 rounded-full text-2xl font-semibold shadow-lg"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
