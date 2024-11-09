"use client";

import React, { useState, useEffect } from "react";
import ButtonWithSpinner from "../others/ButtonWithSpinner";
import { IoIosCloseCircle } from "react-icons/io";
import { useTranslation } from "react-i18next";

const Premium = ({ onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const { t } = useTranslation("global");

  useEffect(() => {
    const updateScreenSize = () => setIsDesktop(window.innerWidth >= 1024);
    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  const handleSubscribe = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  if (isDesktop) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-500 opacity-100">
        <div
          className="relative bg-white max-w-4xl rounded-3xl shadow-lg p-10 bg-cover bg-center bg-no-repeat transform scale-110"
          style={{
            backgroundImage: "url('/images/onboarding-3.jpg')",
            maxHeight: "90vh",
            marginTop: "5vh",
            overflowY: "hidden",
          }}
        >
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none z-50"
            onClick={() => {
              onClose();
            }}
          >
            <IoIosCloseCircle className="w-12 h-12" />
          </button>

          <div className="relative z-10 bg-white/70 rounded-3xl p-4 absolute inset-0 -m-10 ">
            <div className="relative w-full max-w-5xl flex flex-col items-start justify-center space-y-8 overflow-hidden">
              <div className="h-[20%] md:pb-2 md:mb-2">
                <div className="flex flex-col items-start space-y-5 pb-10 md:pb-6 md:pt-10">
                  <h6 className="text-7xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">
                    {t("BePremium.title")}
                  </h6>
                  <h2 className="text-6xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-300">
                    {t("BePremium.subtitle")}
                  </h2>
                  <p className="text-3xl text-gray-700">
                    {t("BePremium.description")}
                  </p>
                </div>
              </div>

              <div className="w-full space-y-8 mt-6 md:mt-2 h-[40%]">
                {["1", "2", "3"].map((plan) => (
                  <div
                    key={plan}
                    className={`border-2 ${
                      selectedPlan === plan
                        ? "border-green-700 bg-green-300/20"
                        : "border-gray-200 bg-white"
                    } rounded-2xl p-8 flex items-center justify-between cursor-pointer transition-transform duration-300 shadow-lg`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <input
                      type="radio"
                      name="subscription"
                      id={`plan${plan}`}
                      className="hidden peer"
                      checked={selectedPlan === plan}
                      readOnly
                    />
                    <label
                      htmlFor={`plan${plan}`}
                      className="flex items-center w-full cursor-pointer justify-between"
                    >
                      <span className="w-8 h-8 inline-flex items-center justify-center rounded-full border-2 border-green-700 mr-4">
                        <span
                          className={`w-4 h-4 rounded-full transition-opacity duration-200 ${
                            selectedPlan === plan
                              ? "bg-green-700 opacity-100"
                              : "opacity-0"
                          }`}
                        ></span>
                      </span>
                      <div className="flex flex-col w-full">
                        <div className="flex items-center justify-between">
                          <h2 className="font-semibold text-4xl">
                            {plan === "1"
                              ? t("BePremium.plans.1.name")
                              : plan === "2"
                              ? t("BePremium.plans.2.name")
                              : t("BePremium.plans.3.name")}
                          </h2>
                          <h2 className="font-semibold text-4xl text-gray-800">
                            {plan === "1"
                              ? t("BePremium.plans.1.price")
                              : plan === "2"
                              ? t("BePremium.plans.2.price")
                              : t("BePremium.plans.3.price")}
                          </h2>
                        </div>
                        <p className="text-2xl text-gray-600">
                          {t("BePremium.note")}
                        </p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="w-full mt-10 md:mt-6 h-[20%] flex justify-center">
                <ButtonWithSpinner
                  onClick={handleSubscribe}
                  loading={loading}
                  className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full text-3xl font-semibold shadow-2xl transition-transform shadow-green-500/50 py-6"
                >
                  {t("BePremium.subscribeButton")}
                </ButtonWithSpinner>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
      <div
        className="relative w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/onboarding-3.jpg')" }}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none z-50"
          onClick={() => {
            onClose();
          }}
        >
          <IoIosCloseCircle className="w-12 h-12" />
        </button>

        <div className="relative z-10 p-6 h-full flex flex-col justify-end md:justify-start">
          <div className="relative w-full max-w-5xl flex flex-col items-start justify-center space-y-10">
            <div className="pb-16">
              <div className="flex flex-col items-start space-y-5 pb-10 md:pb-6 md:pt-10">
                <h6 className="text-7xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">
                  {t("BePremium.title")}
                </h6>
                <h2 className="text-6xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-300">
                  {t("BePremium.subtitle")}
                </h2>
                <p className="text-3xl text-gray-700">
                  {t("BePremium.description")}
                </p>
              </div>

              <div className="w-full space-y-5 mt-6 md:mt-2">
                {["1", "2", "3"].map((plan) => (
                  <div
                    key={plan}
                    className={`border-2 ${
                      selectedPlan === plan
                        ? "border-green-700 bg-green-300/20"
                        : "border-gray-200 bg-white"
                    } rounded-2xl p-8 flex items-center cursor-pointer transition-transform duration-300 shadow-lg`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <input
                      type="radio"
                      name="subscription"
                      id={`plan${plan}`}
                      className="hidden peer"
                      checked={selectedPlan === plan}
                      readOnly
                    />
                    <label
                      htmlFor={`plan${plan}`}
                      className="flex items-center w-full cursor-pointer justify-between"
                    >
                      <span className="w-8 h-8 inline-flex items-center justify-center rounded-full border-2 border-green-700 mr-4">
                        <span
                          className={`w-4 h-4 rounded-full transition-opacity duration-200 ${
                            selectedPlan === plan
                              ? "bg-green-700 opacity-100"
                              : "opacity-0"
                          }`}
                        ></span>
                      </span>
                      <div className="flex flex-col w-full">
                        <div className="flex items-center justify-between">
                          <h2 className="font-semibold text-3xl">
                            {plan === "1"
                              ? t("BePremium.plans.1.name")
                              : plan === "2"
                              ? t("BePremium.plans.2.name")
                              : t("BePremium.plans.3.name")}
                          </h2>
                          <h2 className="font-semibold text-4xl text-gray-800">
                            {plan === "1"
                              ? t("BePremium.plans.1.price")
                              : plan === "2"
                              ? t("BePremium.plans.2.price")
                              : t("BePremium.plans.3.price")}
                          </h2>
                        </div>
                        <p className="text-xl text-gray-600">
                          {t("BePremium.note")}
                        </p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="w-full mt-10 md:mt-6">
                <ButtonWithSpinner
                  onClick={handleSubscribe}
                  loading={loading}
                  className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full text-3xl font-semibold shadow-2xl transition-transform shadow-green-500/50 py-6"
                >
                  {t("BePremium.subscribeButton")}
                </ButtonWithSpinner>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;
