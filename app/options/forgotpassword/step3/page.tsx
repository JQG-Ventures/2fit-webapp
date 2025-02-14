"use client";

import React, { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import PasswordInput from "../../../_components/others/PasswordInput";
import { updatePassword } from "../../../_services/userService";
import SuccessModal from "../../../_components/modals/SuccessModal";
import { useTranslation } from "react-i18next";

const CreatePasswordScreen: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationCode = searchParams.get("code") || "";
  const contactInfo = searchParams.get("contact") || "";
  const { t } = useTranslation("global");

  const [rememberMe, setRememberMe] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const validatePassword = (password: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const validationErrors: Record<string, string> = {};

    if (!newPassword) {
      validationErrors.newPassword = t(
        "ForgotPassword.step3.createPasswordScreen.errorMessages.passwordRequired"
      );
    } else if (!validatePassword(newPassword)) {
      validationErrors.newPassword = t(
        "ForgotPassword.step3.createPasswordScreen.errorMessages.passwordInvalid"
      );
    }

    if (!confirmPassword) {
      validationErrors.confirmPassword = t(
        "ForgotPassword.step3.createPasswordScreen.errorMessages.confirmPasswordRequired"
      );
    } else if (newPassword !== confirmPassword) {
      validationErrors.confirmPassword = t(
        "ForgotPassword.step3.createPasswordScreen.errorMessages.passwordsDoNotMatch"
      );
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await updatePassword(contactInfo, verificationCode, newPassword);
      setShowModal(true);
    } catch (error) {
      setApiError(
        t("ForgotPassword.step3.createPasswordScreen.errorMessages.apiError")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.push("/login");
  };

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-between items-center bg-white h-screen p-16"
      >
        <div className="h-[10%] flex flex-row justify-left space-x-10 items-center w-full max-w-3xl">
          <button onClick={() => router.back()} className="text-gray-700">
            <IoIosArrowBack className="text-4xl cursor-pointer" />
          </button>
          <h1 className="text-5xl font-semibold">
            {t("ForgotPassword.step3.createPasswordScreen.headerTitle")}
          </h1>
        </div>

        <div className="h-[50%] flex flex-col items-center w-full max-w-lg justify-end pb-8">
          <Image
            src="/images/options/newpassword.png"
            alt={t("ForgotPassword.step3.createPasswordScreen.imageAlt")}
            width={350}
            height={350}
            className="w-full"
          />
        </div>

        <div className="h-[33%] flex flex-col w-full max-w-3xl space-y-8">
          <p className="text-3xl text-gray-900 p-4 font-semibold">
            {t("ForgotPassword.step3.createPasswordScreen.instruction")}
          </p>

          <PasswordInput
            placeholder={t(
              "ForgotPassword.step3.createPasswordScreen.newPasswordPlaceholder"
            )}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {errors.newPassword && (
            <p className="text-red-500 text-base mt-2">{errors.newPassword}</p>
          )}

          <PasswordInput
            placeholder={t(
              "ForgotPassword.step3.createPasswordScreen.confirmPasswordPlaceholder"
            )}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-base mt-2">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {apiError && <p className="text-red-500 text-lg mt-4">{apiError}</p>}

        <div className="h-[7%] flex w-full max-w-3xl mt-10">
          <button
            type="submit"
            className={`w-full bg-black text-white rounded-full text-2xl font-semibold shadow-lg flex items-center justify-center ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t(
                  "ForgotPassword.step3.createPasswordScreen.continueButton.loadingText"
                )
              : t(
                  "ForgotPassword.step3.createPasswordScreen.continueButton.defaultText"
                )}
          </button>
        </div>
      </form>

      {showModal && <SuccessModal onClose={handleCloseModal} />}
    </div>
  );
};

export default CreatePasswordScreen;
