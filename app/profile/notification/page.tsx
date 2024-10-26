'use client';

import ToggleButton from '../../_components/profile/togglebutton';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';

interface NotificationItemProps {
  label: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ label }) => (
  <div className="flex items-center justify-between w-full py-5 pl-7">
    <div className="flex items-center space-x-4">
      <span className="text-3xl">{label}</span>
    </div>
    <ToggleButton />
  </div>
);

const Notification: React.FC = () => {
  const router = useRouter();

  const notificationItems = [
    'General Notification',
    'Sound',
    'Vibrate',
    'App Updates',
    'New Services Available',
    'New Tips Available'
  ];

  return (
    <div className="flex flex-col justify-between items-center bg-white h-screen p-14 lg:pt-[10vh]">

      <div className="h-[12%] flex flex-row justify-left space-x-8 items-center w-full lg:max-w-3xl">
        <button onClick={() => router.back()} className="text-gray-700">
          <FaArrowLeft className="w-8 h-8" />
        </button>
        <h1 className="text-5xl font-semibold">Notifications</h1>
      </div>

      <div className="h-[88%] flex flex-col justify-start py-6 w-full max-w-3xl space-y-8 overflow-y-auto">
        {notificationItems.map((item, index) => (
          <NotificationItem key={index} label={item} />
        ))}
      </div>
    </div>
  );
};

export default Notification;
