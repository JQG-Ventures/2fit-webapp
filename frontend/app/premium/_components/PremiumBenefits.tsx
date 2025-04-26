import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { useTranslation } from "react-i18next";
import { MdOutlineSmartToy } from "react-icons/md";
import { FaBowlFood } from "react-icons/fa6";
import { GiProgression } from "react-icons/gi";

interface PremiumBenefitsProps {
    isPremium: boolean;
    onContinue: () => void;
}

const PremiumBenefits: React.FC<PremiumBenefitsProps> = ({ isPremium, onContinue }) => {
    const router = useRouter();
    const { t } = useTranslation('global');
    const benefits = [
        {
            title: t("premium.benefit1Title"),
            description: t("premium.benefit1Description"),
            icon: MdOutlineSmartToy
        },
        {
            title: t("premium.benefit2Title"),
            description: t("premium.benefit2Description"),
            icon: FaBowlFood
        },
        {
            title: t("premium.benefit3Title"),
            description: t("premium.benefit3Description"),
            icon: GiProgression
        }
    ]

    return (
        <div className="flex flex-col justify-between items-center bg-gray-50 h-screen p-10 lg:pt-[10vh]">
            <div className="h-[10%] flex flex-row justify-start items-center space-x-8 items-start w-full lg:max-w-3xl">
                <button onClick={() => router.back()} className="text-gray-700">
                    <FaArrowLeft className="w-8 h-8" />
                </button>
                <h2 className="text-5xl font-semibold"><span className="text-green-500">{t("premium.premiumTitle1")}</span> {t("premium.premiumTitle2")}</h2>
            </div>

            <div className="h-[20%] flex flex-col w-full justify-end space-y-6 lg:max-w-3xl">
                <h1 className="text-4xl">1 week free - $24.99/mo</h1>
                <p>Unlock your ultimate fitness potential with a membership designed to guide and support you every step of the way.</p>
            </div>

            <div className="h-[60%] flex flex-col justify-center items-center w-full lg:max-w-3xl">
                {benefits.map((benefit) => (
                    <div className="flex flex-row space-x-8 my-8 items-center" key={benefit.title}>
                        <benefit.icon className="w-24 h-24"></benefit.icon>
                        <div className="flex flex-col">
                            <h1 className="font-semibold my-2">{benefit.title}</h1>
                            <p className="text-lg">{benefit.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {!isPremium && (
                <div className="h-[10%] flex flex-col w-full lg:max-w-3xl">
                    <button onClick={onContinue} className="w-full bg-gradient-to-r from-green-400 to-green-700 text-white p-4 rounded-full text-2xl font-semibold shadow-lg py-8 flex items-center justify-center">
                        {t('premium.continue')}
                    </button>
                </div>
            )}
        </div>
    );
}

export default PremiumBenefits;
