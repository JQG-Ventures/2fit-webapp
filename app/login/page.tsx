"use client";
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";
import { FiMail, FiLock } from "react-icons/fi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import * as actions from "@/actions";

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const response = await actions.signIn(formData);
    if (!!response?.error) {
      console.error(response.error);
      setError(response?.error);
    } else {
      router.push("/home");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-7xl font-semibold mt-0 mb-[3.5rem] ml-[4rem]">
        Login to your Account
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl"
      >
        <div className="relative mb-6">
          <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="email"
            placeholder="Email"
            name="email"
            id="email"
            required
            className="w-full pl-10 pr-3 py-3 no-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative mb-[6rem]">
          <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="password"
            placeholder="Password"
            name="password"
            id="password"
            required
            className="w-full pl-10 pr-3 py-3 no-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-4 rounded-full text-1xl font-semibold hover:bg-gray-800 transition duration-200"
        >
          Sign In
        </button>
      </form>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {/* <p className="mt-4">
        <a href="/" className="font-medium hover:underline">
          Forgot Password?
        </a>
      </p> */}

      <div className="absolute bottom-[30px] ">
        <div className="flex justify-center mb-20">
          <div className="text-center">
            <p className="text-gray-500 mb-12">Or sign in with</p>
            <div className="flex justify-center space-x-[7rem]">
              {[FaApple, FaFacebook, FaGoogle].map((Icon, idx) => (
                <button key={idx} className="text-5xl">
                  <Icon
                    className={
                      idx === 1
                        ? "text-blue-600"
                        : idx === 2
                        ? "text-red-600"
                        : ""
                    }
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="mt-4 text-gray-400">
            Don't have an account?{" "}
            <a
              href="/register/step1"
              className="text-black font-semibold hover:underline"
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
