'use client';

import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaCalendarAlt, FaEnvelope, FaGlobe, FaPhoneAlt, FaUser } from 'react-icons/fa';
import countries from '@/app/data/countries.json';

const EditProfile = () => {
  const router = useRouter();

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

        <div className="pl-2">
          <label className="block text-black mb-1 font-bold">Name</label>
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
            <input
              type="text"
              placeholder="Username"
              className="w-full border-none focus:ring-0 placeholder-gray-500 bg-transparent"
            />
          </div>
        </div>

        
        <div className="pl-2">
          <label className="block text-black mb-1 font-bold">Birth Date</label>
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm flex items-center justify-between">
            <input
              type="text"
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
              placeholder="user@yourdomain.com"
              className="w-full border-none focus:ring-0 placeholder-gray-500 bg-transparent"
            />
            <FaEnvelope className="text-black" />
          </div>
        </div>

        
        <div className="pl-2">
          <label className="block text-black mb-1 font-bold">Country</label>
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm flex items-center justify-between">
            <select className="w-full border-none focus:ring-0 bg-transparent">
              {countries.map((country, index) => (
                <option key={index} value={country}>{country}</option>
              ))}
            </select>
            <FaGlobe className="text-black" />
          </div>
        </div>
        
        <div className="pl-2">
          <label className="block text-black mb-1 font-bold">Phone Number</label>
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm flex items-center justify-between">
            <FaPhoneAlt className="text-black mr-2" />
            <input
              type="tel"
              placeholder="+1 111 467 378 399"
              className="w-full border-none focus:ring-0 placeholder-gray-500 bg-transparent"
            />
          </div>
        </div>

        <div className="pl-2">
          <label className="block text-black mb-1 font-bold">Gender</label>
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm flex items-center justify-between">
            <select className="w-full border-none focus:ring-0 bg-transparent">
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
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
