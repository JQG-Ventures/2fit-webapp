"use client";

import React, { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import PasswordInput from "../../../_components/others/PasswordInput";
import { updatePassword } from "../../../_services/userService";
import SuccessModal from "../../../_components/modals/SuccessModal"; // Asegúrate de ajustar la ruta si es necesario

const CreatePasswordScreen: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationCode = searchParams.get("code") || "";
  const contactInfo = searchParams.get("contact") || "";
  
  const [rememberMe, setRememberMe] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false); // Estado para controlar el modal

  const validatePassword = (password: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const validationErrors: Record<string, string> = {};

    if (!newPassword) {
      validationErrors.newPassword = "Password is required.";
    } else if (!validatePassword(newPassword)) {
      validationErrors.newPassword =
        "Password must be at least 8 characters, include uppercase, lowercase, a number, and a special character.";
    }

    if (!confirmPassword) {
      validationErrors.confirmPassword = "Please confirm your password.";
    } else if (newPassword !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await updatePassword(contactInfo, verificationCode, newPassword);
      setShowModal(true); // Mostrar el modal al éxito
    } catch (error) {
      setApiError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.push("/login"); // Redirige al usuario a la página de inicio al cerrar el modal
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex flex-col justify-between items-center bg-white h-screen p-16">
        {/* Header */}
        <div className="h-[10%] flex flex-row justify-left space-x-10 items-center w-full max-w-3xl">
          <button onClick={() => router.back()} className="text-gray-700">
            <IoIosArrowBack className="text-4xl cursor-pointer" />
          </button>
          <h1 className="text-5xl font-semibold">Create New Password</h1>
        </div>

        {/* Image Section */}
        <div className="h-[50%] flex flex-col items-center w-full max-w-lg justify-end pb-8">
          <Image
            src="/images/options/newpassword.png"
            alt="Create New Password Illustration"
            width={350}
            height={350}
            className="w-full"
          />
        </div>

        {/* Password Inputs */}
        <div className="h-[33%] flex flex-col w-full max-w-3xl space-y-8">
          <p className="text-3xl text-gray-900 p-4 font-semibold">Create Your New Password</p>
          
          {/* New Password Input */}
          <PasswordInput
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {errors.newPassword && (
            <p className="text-red-500 text-base mt-2">{errors.newPassword}</p>
          )}

          {/* Confirm Password Input */}
          <PasswordInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-base mt-2">{errors.confirmPassword}</p>
          )}

          <div className="flex items-center space-x-4 mt-6 justify-center w-full">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="w-6 h-6 rounded"
            />
            <span className="text-2xl text-black font-semibold">Remember me</span>
          </div>
        </div>

        {/* Error Message */}
        {apiError && <p className="text-red-500 text-lg mt-4">{apiError}</p>}

        {/* Continue Button */}
        <div className="h-[7%] flex w-full max-w-3xl mt-10">
          <button
            type="submit"
            className={`w-full bg-black text-white rounded-full text-2xl font-semibold shadow-lg flex items-center justify-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Continue"}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {showModal && <SuccessModal onClose={handleCloseModal} />}
    </div>
  );
};

export default CreatePasswordScreen;
