import React from 'react';
import { FaDumbbell } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface Props {
    progressData: PlanWithProgress[];
    onContinue: (planId: string, planType: string) => void;
}

export const ChallengeProgressWidget: React.FC<Props> = ({ progressData, onContinue }) => {
    const { t } = useTranslation('global');

    // filter only "challenge" plans
    const challenges = progressData.filter((plan) => plan.plan_type === 'challenge');

    if (challenges.length === 0) return null;

    return (
        <div className="w-full overflow-hidden rounded-3xl lg:max-w-3xl shadow-xl bg-white flex flex-col items-left justify-between p-6 space-y-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {t('workouts.challenges.activeChallenges')}
            </h2>

            {challenges.map((plan) => {
                const prog = plan.progressData;
                // show placeholder if no progressData yet
                if (!prog) {
                    return (
                        <div key={plan.id} className="animate-pulse flex flex-col space-y-4 py-6">
                            <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/3 mx-auto"></div>
                            <div className="h-3 bg-gray-300 rounded w-full"></div>
                            <div className="h-3 bg-gray-300 rounded w-full"></div>
                        </div>
                    );
                }

                const { total_days, days, name } = prog;
                const completedCount = days!.filter((d) => d.is_completed).length;
                const todayInProgress = days!.find((d) => d.status === 'in_progress');
                let currentDayNumber = completedCount + 1;
                if (todayInProgress) {
                    currentDayNumber = todayInProgress.sequence_day;
                }
                if (currentDayNumber > total_days) {
                    currentDayNumber = total_days;
                }

                return (
                    <React.Fragment key={plan.id}>
                        <div className="flex items-center space-x-4">
                            <div className="bg-green-500 p-3 rounded-full">
                                <FaDumbbell className="text-white text-xl" />
                            </div>
                            <span className="text-2xl font-semibold text-black">{name}</span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-green-500 h-3 rounded-full"
                                style={{
                                    width: `${(completedCount / total_days) * 100}%`,
                                }}
                            ></div>
                        </div>

                        <p className="text-gray-800 text-lg font-medium">
                            {`${t('workouts.challenges.day')} ${currentDayNumber} ${t(
                                'workouts.challenges.of',
                            )} ${total_days}`}
                        </p>

                        <button
                            className="w-full bg-green-500 mt-6 text-white py-3 rounded-2xl text-lg font-semibold hover:bg-green-600 transition"
                            onClick={() => onContinue(plan.id, plan.plan_type)}
                        >
                            {t('workouts.continue')}
                        </button>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default ChallengeProgressWidget;
