"use client";

import React, { useState } from "react";
import PremiumBenefits from "./_components/PremiumBenefits";
import PremiumPlans from "./_components/PremiumPlans";

const PremiumPage = () => {
	const [step, setStep] = useState<"benefits" | "plans" | "cards" | "addCard">("benefits");
	const [isPremium, setIsPremium] = useState(false);
	const [plans, setPlans] = useState([
		{ id: "1", name: "premium.plans.1.name", price: 24.99 },
		{ id: "2", name: "premium.plans.2.name", price: 49.99 },
		{ id: "3", name: "premium.plans.3.name", price: 99.99 }
	]);
	const [selectedPlan, setSelectedPlan] = useState<{ id: string; name: string; price: number } | null>(null);

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
					onCheckout={() => {}}
				/>
			)}
		</div>
	);
};

export default PremiumPage;
