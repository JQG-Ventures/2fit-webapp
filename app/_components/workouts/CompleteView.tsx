'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

const CompleteView: React.FC<{goToPlan: string}> = ({ goToPlan }) => {
    const router = useRouter();
    const { t } = useTranslation('global');

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    return (
        <div className="bg-white h-screen p-10 flex flex-col w-full justify-between">
            <div className="flex flex-col items-center max-w-3xl mx-auto h-[80%] py-14">
                <div className="relative w-full h-[70%]"> 
                    <Image 
                        src="/images/congrats.png" 
                        alt="Congratulations" 
                        layout="fill" 
                        objectFit="contain" 
                    /> 
                </div>
                <h2 className="text-5xl my-5 text-center font-semibold bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
                    {t("workouts.plan.congrats")}
                </h2>
                <h2 className="text-center">{t("workouts.plan.completedSentence")}</h2>

                <div className="w-full border-t border-gray-300 my-5"></div>

                <div className="h-[20%] w-full flex flex-row justify-evenly items-center">
                    <div className="flex flex-col items-center">
                        <h2 className="text-4xl font-bold">10</h2>
                        <span className="text-lg">{t("workouts.plan.workouts")}</span>
                    </div>

                    <div className="h-[60%] border-l border-r border-gray-300 mx-4"></div>

                    <div className="flex flex-col items-center">
                        <h2 className="text-4xl font-bold">340</h2>
                        <span className="text-lg">Cal</span>
                    </div>

                    <div className="h-[60%] border-l border-r border-gray-300 mx-4"></div>

                    <div className="flex flex-col items-center">
                        <h2 className="text-4xl font-bold">10:00</h2>
                        <span className="text-lg">{t("workouts.plan.minutes")}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col justify-evenly items-center h-[20%]">
                <button 
                    className="w-full lg:max-w-3xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-white py-6 rounded-full text-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                    onClick={() => handleNavigation(goToPlan)}
                >
                    {t("workouts.plan.goto")}
                </button>
                <button 
                    className="w-full lg:max-w-3xl bg-green-100 hover:bg-green-200 text-black text-2xl font-bold py-6 rounded-full shadow-lg transition duration-300 ease-in-out"
                    onClick={() => handleNavigation('/home')}
                >
                    <span className='text-xl'>{t("workouts.plan.home")}</span>
                </button>
            </div>
        </div>
    );
};

export default CompleteView;
