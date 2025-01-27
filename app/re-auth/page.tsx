"use client";

import React, { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const ReauthPage = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      signOut({ callbackUrl: '/login', redirect: true });
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl mb-4">Session Expired</h1>
      <p className="mb-8">Please wait, logging out...</p>
      {/* Your spinner/loading component here */}
      <div className="loader" />
    </div>
  );
};

export default ReauthPage;
