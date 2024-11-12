"use client";

import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useRouter, useSearchParams } from "next/navigation";

interface VerificationCodeInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBackspace: () => void;
  id: string;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({ value, onChange, onBackspace, id }) => (
  <input
    type="text"
    maxLength={1}
    value={value}
    onChange={onChange}
    onKeyDown={(e) => {
      if (e.key === "Backspace") onBackspace();
    }}
    id={id}
    className="w-20 h-20 text-3xl text-center border-2 rounded-md focus:outline-none focus:border-purple-500"
  />
);

interface ResendCodeProps {
  timeLeft: number;
  onResend: () => void;
}

const ResendCode: React.FC<ResendCodeProps> = ({ timeLeft, onResend }) => (
  <p className="text-xl text-center mt-4">
    Resend code in{" "}
    <span className="text-green-500 font-semibold">
      {timeLeft > 0 ? (
        `${timeLeft} s`
      ) : (
        <button onClick={onResend} className="text-green-500 underline">
          Resend
        </button>
      )}
    </span>
  </p>
);

const VerificationScreen: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contact = searchParams.get("contact") || "+1 111 ******99";
  
  const [code, setCode] = useState(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);

  const obfuscateContact = (contact: string): string => {
    return /^\+?\d{7,}$/.test(contact)
      ? contact.slice(0, -4) + "****"
      : contact;
  };

  const displayedContact = obfuscateContact(contact);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleCodeChange = (index: number, value: string) => {
    if (/^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < code.length - 1) {
        document.getElementById(`code-input-${index + 1}`)?.focus();
      }
    }
  };

  const handleBackspace = (index: number) => {
    if (index > 0 && !code[index]) {
      document.getElementById(`code-input-${index - 1}`)?.focus();
    }
  };

  const handleResend = () => {
    setTimeLeft(60);
    // Aquí puedes agregar la lógica para reenviar el código
  };

  const handleVerify = () => {
    const enteredCode = code.join("");
    if (enteredCode === "1234") {  // Verificar si el código es correcto
      router.push(`/options/forgotpassword/step3?code=${enteredCode}&contact=${encodeURIComponent(contact)}`);  // Redirigir a step 3 con el código y el contacto en la URL
    } else {
      alert("Incorrect code"); // Mostrar un mensaje de error si el código no es correcto
    }
  };

  return (
    <div className="flex flex-col justify-between items-center bg-white h-screen p-14">
      {/* Header */}
      <div className="h-[10%] flex flex-row justify-left space-x-8 items-center w-full max-w-3xl">
        <button onClick={() => router.back()} className="text-gray-700">
          <IoIosArrowBack className="text-3xl cursor-pointer" />
        </button>
        <h1 className="text-4xl font-semibold">Code Verification</h1>
      </div>

      {/* Code Sent Info */}
      <div className="h-[41%] flex flex-col items-center justify-end w-full max-w-lg pb-10">
        <p className="text-2xl text-gray-900 text-center px-4">
          Code has been sent to {displayedContact}
        </p>
      </div>

      {/* Verification Code Input */}
      <div className="h-[41%] flex flex-col items-center space-y-4">
        <div className="flex justify-center space-x-6">
          {code.map((digit, index) => (
            <VerificationCodeInput
              key={index}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onBackspace={() => handleBackspace(index)}
              id={`code-input-${index}`}
            />
          ))}
        </div>
        <div className="pt-4">
            <ResendCode timeLeft={timeLeft} onResend={handleResend} />
        </div>
      </div>

      {/* Verify Button */}
      <div className="h-[7%] flex w-full max-w-3xl">
        <button
          type="button"
          onClick={handleVerify}  // Cambiar aquí para llamar a handleVerify
          className="w-full bg-black text-white rounded-full text-2xl font-semibold shadow-lg flex items-center justify-center"
        >
          Verify
        </button>
      </div>
    </div>
  );
};

export default VerificationScreen;
