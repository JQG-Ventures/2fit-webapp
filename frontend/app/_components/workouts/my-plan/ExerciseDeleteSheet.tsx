'use client';

import { motion } from 'framer-motion';
import { FiCheck, FiTrash2, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import ExerciseScopeBlock from '@/app/_components/workouts/my-plan/ExerciseScopeBlock';
import type { PlanChangeScope } from '@/app/_types/planChangeScope';

type ExerciseDeleteSheetProps = {
    isOpen: boolean;
    dayLabel: string;
    count: number;
    scope: PlanChangeScope;
    onScopeChange: (s: PlanChangeScope) => void;
    viewedWeekNumber: number;
    onConfirm: () => void;
    onClose: () => void;
    confirmDisabled?: boolean;
};

const ExerciseDeleteSheet: React.FC<ExerciseDeleteSheetProps> = ({
    isOpen,
    dayLabel,
    count,
    scope,
    onScopeChange,
    viewedWeekNumber,
    onConfirm,
    onClose,
    confirmDisabled = false,
}) => {
    const { t } = useTranslation('global');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 sm:items-center">
            <motion.div
                className="flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] bg-[#f8faf9] shadow-2xl sm:rounded-[2rem]"
                initial={{ y: 40, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="sticky top-0 z-10 border-b border-gray-100 bg-[#f8faf9]/95 px-5 pb-5 pt-[calc(2rem+env(safe-area-inset-top))] backdrop-blur">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="flex items-center gap-2 text-base font-medium text-red-600">
                                <FiTrash2 className="h-4 w-4" />
                                {t('workouts.my-plan.deleteSheetTitle')}
                            </p>
                            <h2 className="mt-2 text-xl font-semibold leading-tight text-gray-950">
                                {t('workouts.my-plan.deleteSheetSubtitle', {
                                    count,
                                    day: dayLabel,
                                })}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50"
                            aria-label={t('a11y.closeExerciseList')}
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    <ExerciseScopeBlock
                        value={scope}
                        onChange={onScopeChange}
                        weekNumber={viewedWeekNumber}
                    />
                    <p className="text-base leading-relaxed text-gray-500">
                        {t('workouts.my-plan.deleteSheetSummary', { count })}
                    </p>
                </div>

                <div className="border-t border-gray-100 bg-white/95 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            {t('workouts.my-plan.cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={confirmDisabled}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-base font-semibold transition-colors ${
                                confirmDisabled
                                    ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                    : 'bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600'
                            }`}
                        >
                            <FiCheck className="h-4 w-4" />
                            {t('workouts.my-plan.confirmDeleteExercises')}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ExerciseDeleteSheet;
