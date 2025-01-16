"use client";

import React, { useState } from "react";
import PremiumBenefits from "./_components/PremiumBenefits";
import PremiumPlans from "./_components/PremiumPlans";
import PaymentCards from "./_components/PaymentCards";

const PremiumPage = () => {
	const [step, setStep] = useState<"benefits" | "plans" | "cards" | "addCard">("benefits");
	const [isPremium, setIsPremium] = useState(false);
	const [cards, setCards] = useState([]);
	const [plans, setPlans] = useState([
		{ id: "1", name: "BePremium.plans.1.name", price: 24.99 },
		{ id: "2", name: "BePremium.plans.2.name", price: 49.99 },
		{ id: "3", name: "BePremium.plans.3.name", price: 99.99 }
	]);
	const [selectedPlan, setSelectedPlan] = useState<{ id: string; name: string; price: number } | null>(null);

	const handleAddCard = (cardInfo: any, saveCard: boolean) => {
		setStep("cards");
	};

	const goBack = () => {
		if (step === "addCard") setStep("cards");
		else if (step === "cards") setStep("plans");
		else if (step === "plans") setStep("benefits");
	};

	const onPayPlan = (cardId: string, planId: string) => {
		console.log(cardId, planId)
	}

	return (
		<div className="">
			{step === "benefits" && (
				<PremiumBenefits isPremium={isPremium} onContinue={() => setStep("plans")} />
			)}
			{step === "plans" && (
				<PremiumPlans
					selectedPlan={selectedPlan}
					setSelectedPlan={setSelectedPlan}
					plans={plans}
					onCheckout={() => setStep("cards")}
				/>
			)}
			{step === "cards" && (
				<PaymentCards
					cards={cards}
					selectedPlan={selectedPlan!}
					onAddCard={() => setStep("addCard")}
					onPay={onPayPlan}
					onBack={goBack}
				/>
			)}
		</div>
	);
};

export default PremiumPage;
