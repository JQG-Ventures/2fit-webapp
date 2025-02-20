"use client";

import React, { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Modal from "../../../_components/profile/modal";
import { fetchUserDataByEmail } from "../../../_services/userService";
import { useTranslation } from "react-i18next";

const Step0: React.FC = () => {
  const { t } = useTranslation("global");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const userData = await fetchUserDataByEmail(email);

      if (!userData || !userData._id) {
        setError(t("ForgotPassword.step0.userNotFound"));
        setIsSubmitting(false);
        return;
      }

      router.push(`/options/forgotpassword/step1?userId=${userData.email}`);
    } catch (err) {
      setError(t("ForgotPassword.step0.errorOccurred"));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col justify-between items-center bg-white h-screen p-14">
      <div className="h-[12%] flex flex-row justify-left space-x-8 items-center w-full max-w-3xl">
        <button onClick={() => router.push("/login")} className="text-gray-700">
          <IoIosArrowBack className="text-3xl cursor-pointer" />
        </button>
        <h1 className="text-4xl font-semibold">
          {t("ForgotPassword.forgotPassword")}
        </h1>
      </div>

      <div className="h-[61%] flex flex-col items-center w-full max-w-lg justify-end pb-12">
      <Image
        src="/images/options/forgot-password-illustration.jpg"
        alt="Forgot Password"
        width={250}
        height={250}
        unoptimized
        className="w-2/3 h-auto"
      />
        <p className="text-2xl text-gray-900 mt-4 text-center px-4">
          {t("ForgotPassword.step0.enterEmailPrompt")}
        </p>
      </div>

      <div className="h-[20%] flex flex-col justify-start py-6 w-full max-w-3xl space-y-4 overflow-y-auto pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col w-full">
          <input
            type="email"
            placeholder={t("ForgotPassword.step0.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-2 border-gray-300 p-6 rounded-xl text-2xl"
          />
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </form>
      </div>

      <div className="h-[7%] flex w-full max-w-3xl">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-black text-white rounded-full text-2xl font-semibold shadow-lg flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? t("ForgotPassword.step0.submitting")
            : t("ForgotPassword.step0.continue")}
        </button>
      </div>
    </div>
  );
};

export default Step0;
