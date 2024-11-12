"use client";

import React, { useEffect, useState, useMemo } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { MdSms, MdEmail } from "react-icons/md";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import LoadingScreen from "../../../_components/animations/LoadingScreen";
import { useFetch } from "../../../_hooks/useFetch";
import Modal from "../../../_components/profile/modal";

interface OptionItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  detail: string;
  isSelected: boolean;
  onClick: () => void;
}

const OptionItem: React.FC<OptionItemProps> = ({ icon: Icon, label, detail, isSelected, onClick }) => (
  <div
    className={`flex items-center border-2 rounded-xl p-6 cursor-pointer transition overflow-hidden ${
      isSelected ? "border-black bg-white" : "border-gray-300"
    }`}
    onClick={onClick}
    style={{ height: "100px", width: "100%" }}
  >
    <div className="bg-green-200 rounded-full p-8">
      <Icon className="text-black text-4xl" />
    </div>
    <div className="ml-4">
      <p className="text-lg text-gray-600 font-medium">{label}</p>
      <p className="text-lg text-black font-semibold pt-1">{detail}</p>
    </div>
  </div>
);

const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId"); // Obtener userId de la URL
  
  const getOptions = useMemo(() => ({ method: "GET" }), []);
  const { data: userData, loading, error } = useFetch(
    userId ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${userId}` : "",
    getOptions
  );
  
  const [selectedOption, setSelectedOption] = useState<"sms" | "email" | null>(null);

  useEffect(() => {
    if (!userId) {
      router.push("/options/forgotpassword/step0"); // Redirigir a Step0 si no hay userId
    }
  }, [userId, router]);

  const handleContinue = () => {
    if (selectedOption) {
      const contactValue = selectedOption === "sms" ? userData?.number : userData?.email;
      router.push(`/options/forgotpassword/step2?contact=${encodeURIComponent(contactValue || "")}`);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) {
    return (
      <Modal
        title="Error"
        message={error}
        onClose={() => router.push("/home")}
      />
    );
  }

  return (
    <div className="flex flex-col justify-between items-center bg-white h-screen p-14">
      {/* Header */}
      <div className="h-[12%] flex flex-row justify-left space-x-8 items-center w-full max-w-3xl">
        <button onClick={() => router.push("/login")} className="text-gray-700">
          <IoIosArrowBack className="text-3xl cursor-pointer" />
        </button>
        <h1 className="text-4xl font-semibold">Forgot Password</h1>
      </div>

      {/* Image Section */}
      <div className="h-[51%] flex flex-col items-center w-full max-w-lg justify-end pb-12">
        <Image
          src="/images/options/forgot-password-illustration.png"
          alt="Forgot Password Illustration"
          width={250}
          height={250}
          className="w-2/3 h-auto"
        />
        <p className="text-2xl text-gray-900 mt-4 text-center px-4">
          Select which contact details should we use to reset your password.
        </p>
      </div>

      {/* Options Section */}
      <div className="h-[30%] flex flex-col justify-start py-6 w-full max-w-3xl space-y-4 overflow-y-auto pt-6">
        <OptionItem
          icon={MdSms}
          label="via SMS:"
          detail={userData?.number || "+1 111 ******99"}
          isSelected={selectedOption === "sms"}
          onClick={() => setSelectedOption("sms")}
        />

        <OptionItem
          icon={MdEmail}
          label="via Email:"
          detail={userData?.email || "and***ey@yourdomain.com"}
          isSelected={selectedOption === "email"}
          onClick={() => setSelectedOption("email")}
        />
      </div>

      {/* Continue Button */}
      <div className="h-[7%] flex w-full max-w-3xl">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full bg-black text-white rounded-full text-2xl font-semibold shadow-lg flex items-center justify-center"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
