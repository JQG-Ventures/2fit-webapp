// @ts-nocheck
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "../../_components/register/RegisterProvider";
import { registerUser } from "../../_services/registerService";
import { useTranslation } from "react-i18next";
import { signIn, useSession } from "next-auth/react";

export default function RegisterStep11() {
    const { t } = useTranslation("global");
    const router = useRouter();
    const { data } = useRegister();
    const { data: session } = useSession();
    const [textIndex, setTextIndex] = useState(0);
    const [showText, setShowText] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const hasRegistered = useRef(false);
    const texts = [
        t("RegisterPagestep11.texts.0"),
        t("RegisterPagestep11.texts.1"),
        t("RegisterPagestep11.texts.2"),
        t("RegisterPagestep11.texts.3"),
        t("RegisterPagestep11.texts.4")
    ];

    const changeText = useCallback(() => {
        setShowText(false);
        setTimeout(() => {
            setTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
            setShowText(true);
        }, 500);
    }, [texts.length]);

    useEffect(() => {
        const changeTextInterval = setInterval(changeText, 2500);

        async function handleRegistration() {
            if (hasRegistered.current) return;
            hasRegistered.current = true;

            try {
                delete data["countryCode"];

                const registerResult = await registerUser(data);

                if (!registerResult || registerResult?.status === "error") {
                    setErrorMessage(t("RegisterPagestep11.errormsg"));
                    setIsLoading(false);
                    return;
                }

                if (data.auth_provider === "default") {
                    const password = data.password;
                    const email = data.email;
                    const response = await signIn("credentials", {
                        email,
                        password,
                        redirect: false
                    });
                    if (!response?.ok) {
                        setErrorMessage(t("RegisterPagestep11.errormsg"));
                        setIsLoading(false);
                        setTimeout(() => {
                            router.push("/");
                        }, 1100);
                        return;
                    }
                    setTimeout(() => {
                        router.push("/home");
                    }, 3000);

                } else if (data.auth_provider === "google") {
                    const googleIdToken = session?.googleIdToken;

                    if (!googleIdToken) {
                        setErrorMessage("No Google ID token available. Please sign in again.");
                        setIsLoading(false);
                        return;
                    }
                    const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google-login`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id_token: googleIdToken })
                        }
                    );
                    if (!res.ok) {
                        const errData = await res.json();
                        setErrorMessage(errData?.message || "Could not complete Google login");
                        setIsLoading(false);
                        return;
                    }
                    const data = await res.json();

                    await signIn("flaskgoogle", {
                        access_token: data.message.access_token,
                        refresh_token: data.message.refresh_token,
                        expires_at: data.message.expires_at,
                        user_id: data.message.user_id,
                        user_name: data.message.name,
                        redirect: false
                    });

                    setTimeout(() => {
                        router.push("/home");
                    }, 3000);
                }
            } catch (error) {
                setErrorMessage(t("RegisterPagestep11.errormsg"));
                setIsLoading(false);
            }
        }

        handleRegistration();
        return () => {
            clearInterval(changeTextInterval);
        };
    }, [router, data, changeText, t, session]);

    function handleRetry() {
        router.push("/");
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-white p-4">
            <div className="w-full max-w-lg flex flex-col items-center justify-evenly h-[60vh] text-center">
                {isLoading ? (
                    <>
                        <h2 className="text-5xl font-bold mb-10">
                            {t("RegisterPagestep11.creating.0")}
                            <br />
                            {t("RegisterPagestep11.creating.1")}
                        </h2>
                        <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mb-10"></div>
                        <div className={`transition-opacity duration-500 ${showText ? "opacity-100" : "opacity-0"}`}>
                            <p className="text-2xl">{texts[textIndex]}</p>
                        </div>
                    </>
                ) : (
                    <div>
                        <h2 className="text-3xl font-bold text-red-600 mb-6">{errorMessage}</h2>
                        <button
                            onClick={handleRetry}
                            className="mt-4 px-6 py-4 bg-red-500 text-white text-2xl rounded-lg"
                        >
                            {t("RegisterPagestep11.homebtn")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
