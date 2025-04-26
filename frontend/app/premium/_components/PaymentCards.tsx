"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { RiVisaLine } from "react-icons/ri";
import { BiLogoMastercard } from "react-icons/bi";
import { FaCreditCard, FaPlus, FaApple, FaArrowLeft, FaCcAmex } from "react-icons/fa";


const PaymentCards: React.FC<{
    cards: { id: number; last4: string; name: string; expDate: string; kind: string }[];
    selectedPlan: { id: string; name: string; price: number };
    onPay: (cardId: string, plaId: string) => void;
    onAddCard: () => void;
    onBack: () => void;
  }> = ({ cards, selectedPlan, onPay, onAddCard, onBack }) => {  
    const { t } = useTranslation("global");
    const [selectedCard, setSelectedCard] = useState<number | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"card" | "applePay">("card");
    return (
        <div className="flex flex-col justify-between items-center bg-gray-50 h-screen p-10 lg:pt-[10vh]">
            <div className="h-[10%] flex flex-row space-x-6 items-center w-full lg:max-w-3xl">
                <button onClick={onBack} className="text-gray-700">
                    <FaArrowLeft className="w-8 h-8" />
                </button>
                <h2 className="text-5xl font-semibold">{t("payment.checkoutTitle")}</h2>
            </div>

            <div className="h-[10%] flex flex-row space-x-8 w-full lg:max-w-3xl justify-start items-center">
                <button
                    className={`flex items-center w-1/2 justify-center space-x-4 px-6 py-3 rounded-lg text-lg font-semibold shadow-md ${selectedPaymentMethod === "card" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                        }`}
                    onClick={() => setSelectedPaymentMethod("card")}
                >
                    <FaCreditCard className="w-10 h-10" />
                    <span>{t("payment.methodCard")}</span>
                </button>
                <button
                    className={`flex items-center w-1/2 justify-center space-x-4 px-6 py-3 rounded-lg text-lg font-semibold shadow-md ${selectedPaymentMethod === "applePay"
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                        }`}
                    onClick={() => setSelectedPaymentMethod("applePay")}
                >
                    <FaApple className="w-10 h-10" />
                    <span>Apple Pay</span>
                </button>
            </div>

            <div className="h-[45%] flex flex-col w-full space-y-6 lg:max-w-3xl">
                <h3 className="text-2xl font-semibold">{t("payment.selectCard")}</h3>
                <div className="flex space-x-6 overflow-x-auto pb-4">
                    {cards.map((card) => (
                        <div
                            key={card.id}
                            className={`w-3/4 h-70 flex-shrink-0 rounded-lg shadow-md p-6 cursor-pointer border-2 ${selectedCard === card.id ? "border-green-600" : "border-gray-200"
                                }`}
                            onClick={() => setSelectedCard(card.id)}
                        >
                            <div className="flex flex-col justify-between h-full">
                                <div className="flex justify-end items-center">
                                    {card.kind === "VISA" && <RiVisaLine className="w-14 h-14" />}
                                    {card.kind === "MasterCard" && (<BiLogoMastercard className="w-14 h-14" />)}
                                    {card.kind === "AMEX" && <FaCcAmex  className="w-14 h-14" />}
                                </div>

                                <p className="text-2xl text-gray-600 tracking-widest">**** **** **** {card.last4}</p>

                                <div className="flex flex-row justify-between mt-4">
                                    <p className="text-xl text-gray-500">{card.name}</p>
                                    <p className="text-xl text-gray-500">{card.expDate}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={onAddCard}
                        className="w-3/4 h-60 flex-shrink-0 rounded-lg shadow-md bg-gray-200 flex items-center justify-center cursor-pointer"
                    >
                        <FaPlus className="w-8 h-8 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="h-[15%] flex flex-col justify-evenly w-full lg:max-w-3xl space-y-6">
                <div className="flex justify-between items-center">
                    <span className="text-2xl font-semibold">{t("payment.totalAmount")}</span>
                    <span className="text-3xl font-bold text-green-700">${selectedPlan.price}</span>
                </div>
                <button
                    onClick={() => onPay(`${selectedCard!}`, selectedPlan?.id)}
                    disabled={!selectedCard}
                    className={`w-full bg-gradient-to-r from-green-400 to-green-700 text-white p-4 rounded-full text-2xl font-semibold shadow-lg py-8 flex items-center justify-center ${!selectedCard ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                >
                    {t("payment.payNow")}
                </button>
            </div>
        </div>
    );
};

export default PaymentCards;  
