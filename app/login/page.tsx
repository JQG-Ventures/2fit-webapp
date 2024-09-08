"use client";
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";
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
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <input
          type="text"
          placeholder="Phone/Email"
          name="email"
          id="email"
          required
          className="w-full p-3 mb-4 border border-gray-300 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          id="password"
          required
          className="w-full p-3 mb-6 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="w-full bg-black text-white p-3 rounded hover:bg-blue-600 transition"
        >
          Login
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
            <div className="flex justify-center space-x-8">
              {[FaApple, FaFacebook, FaGoogle].map((Icon, idx) => (
                <button key={idx} className="text-6xl">
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
          <p className="mt-4">
            Don't have an account?{" "}
            <a href="/register/step1" className="text-blue-500 hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
