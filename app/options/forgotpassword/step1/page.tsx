"use client";

import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { MdSms, MdEmail } from "react-icons/md";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import LoadingScreen from "../../../_components/animations/LoadingScreen";
import Modal from "../../../_components/profile/modal";
import { useTranslation } from "react-i18next";
import { useApiGet } from "../../../utils/apiClient";
import { useLoading } from "../../../_providers/LoadingProvider";

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
  const { t } = useTranslation("global");
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const { setLoading } = useLoading();

  const userApiUrl = userId ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/by-email/${userId}` : "";
  const { data: userData, isLoading, isError } = useApiGet<{ status: string; message: any }>(["user", userId!], userApiUrl, { enabled: !!userId });

  const [selectedOption, setSelectedOption] = useState<"sms" | "email" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (!userId) {
      router.push("/options/forgotpassword/step0");
    }
  }, [userId, router]);

  const handleContinue = () => {
    if (selectedOption) {
      setIsSubmitting(true);
      const contactValue = selectedOption === "sms" ? userData?.message?.number : userData?.message?.email;
      router.push(`/options/forgotpassword/step2?contact=${encodeURIComponent(contactValue || "")}`);
    }
  };

  if (isLoading) return <LoadingScreen />;


  return (
    <div className="flex flex-col justify-between items-center bg-white h-screen p-14">

      dev
    </div>
  );
};

export default ForgotPassword;