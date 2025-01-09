"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";


const PlanCard = ({
	plan,
	selectedPlan,
	onSelect
}: {
	plan: { id: string; name: string; price: number };
	selectedPlan: string | null;
	onSelect: (id: string) => void;
}) => {
	const { t } = useTranslation("global");
	const isSelected = selectedPlan === plan.id;

	return (
		<div
			key={plan.id}
			className={`border-3 ${isSelected ? "border-green-600 bg-green-300/20" : "border-white bg-white"
				} rounded-2xl p-8 flex items-center cursor-pointer transition-transform duration-300 shadow-lg`}
			onClick={() => onSelect(plan.id)}
		>
			<input
				type="radio"
				name="subscription"
				id={`plan${plan.id}`}
				className="hidden peer"
				checked={isSelected}
				readOnly
			/>
			<label
				htmlFor={`plan${plan.id}`}
				className="flex items-center w-full cursor-pointer justify-between"
			>
				<span className="w-8 h-8 inline-flex items-center justify-center rounded-full border-2 border-green-700 mr-4">
					<span
						className={`w-4 h-4 rounded-full transition-opacity duration-200 ${isSelected ? "bg-green-700 opacity-100" : "opacity-0"}`}
					></span>
				</span>
				<div className="flex flex-row justify-between w-full">
					<div className="flex flex-col space-y-2 items-start justify-between">
						<h2 className="font-semibold text-3xl">{t(plan.name)}</h2>
						<p className="text-lg text-gray-600">{t("BePremium.note")}</p>
					</div>
					<div className="flex items-center">
						<h2 className="font-semibold text-4xl text-gray-800">
							<span className="text-lg">$</span>{plan.price}<span className="text-lg">/m</span>
						</h2>
					</div>
				</div>
			</label>
		</div>
	);
};

interface PremiumPlansProps {
	selectedPlan: { id: string; name: string; price: number } | null;
	setSelectedPlan: (selectedPlan: { id: string; name: string; price: number } | null) => void;
	plans: { id: string; name: string; price: number }[];
	onCheckout: () => void;
}

const PremiumPlans: React.FC<PremiumPlansProps> = ({ selectedPlan, setSelectedPlan, plans, onCheckout }) => {
	const { t } = useTranslation("global");
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
			<div
				className="relative w-full h-full bg-cover bg-center bg-no-repeat"
				style={{ backgroundImage: "url('/images/onboarding-3.jpg')" }}
			>
				<div
					className="absolute inset-0 bg-gradient-to-t from-white via-white/75 to-white/25"
					aria-hidden="true"
				></div>
				<div className="relative z-10 p-6 h-full flex items-center flex-col">
					<div className="h-[45%] lg:max-w-3xl flex flex-col items-center justify-end space-y-8 pb-10 md:pb-6 md:pt-10">
						<h6 className="text-7xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800">
							{t("BePremium.title")}
						</h6>
						<h2 className="text-5xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800">
							{t("BePremium.subtitle")}
						</h2>
						<p className="text-3xl text-gray-900">{t("BePremium.description")}</p>
					</div>

					<div className="h-[40%] lg:max-w-3xl w-full flex flex-col justify-center space-y-5">
						{plans.map((plan) => (
							<PlanCard
								key={plan.id}
								plan={plan}
								selectedPlan={selectedPlan?.id || null}
								onSelect={(id) => setSelectedPlan(plans.find((p) => p.id === id) || null)}
							/>
						))}
					</div>

					<div className="h-[10%] lg:max-w-3xl w-full mt-10 md:mt-6">
						<button
							onClick={() => onCheckout()}
							disabled={!selectedPlan}
							className={`w-full bg-gradient-to-r from-green-400 to-green-700 text-white p-4 rounded-full text-2xl font-semibold shadow-lg py-8 flex items-center justify-center ${!selectedPlan ? "opacity-50 cursor-not-allowed" : ""
								}`}
						>
							{t("BePremium.checkout")}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PremiumPlans;