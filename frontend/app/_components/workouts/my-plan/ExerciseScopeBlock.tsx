'use client';

import { useTranslation } from 'react-i18next';
import type { PlanChangeScope } from '@/app/_types/planChangeScope';

type ExerciseScopeBlockProps = {
    value: PlanChangeScope;
    onChange: (v: PlanChangeScope) => void;
    weekNumber: number;
};

const ExerciseScopeBlock: React.FC<ExerciseScopeBlockProps> = ({ value, onChange, weekNumber }) => {
    const { t } = useTranslation('global');

    return (
        <section className="mb-5 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="mb-3 text-lg font-semibold text-gray-900">
                {t('workouts.my-plan.changeScopeLabel')}
            </p>
            <div className="space-y-2">
                <label
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors ${
                        value === 'template'
                            ? 'border-green-200 bg-green-50/50'
                            : 'border-gray-100 bg-white hover:bg-gray-50/80'
                    }`}
                >
                    <input
                        type="radio"
                        name="plan-change-scope"
                        className="mt-0.5 h-4 w-4 border-gray-300 text-green-600"
                        checked={value === 'template'}
                        onChange={() => onChange('template')}
                    />
                    <span>
                        <span className="block text-base font-semibold text-gray-900">
                            {t('workouts.my-plan.scopeTemplate')}
                        </span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-gray-500">
                            {t('workouts.my-plan.scopeTemplateHint')}
                        </span>
                    </span>
                </label>
                <label
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors ${
                        value === 'instance'
                            ? 'border-green-200 bg-green-50/50'
                            : 'border-gray-100 bg-white hover:bg-gray-50/80'
                    }`}
                >
                    <input
                        type="radio"
                        name="plan-change-scope"
                        className="mt-0.5 h-4 w-4 border-gray-300 text-green-600"
                        checked={value === 'instance'}
                        onChange={() => onChange('instance')}
                    />
                    <span>
                        <span className="block text-base font-semibold text-gray-900">
                            {t('workouts.my-plan.scopeInstance', { week: weekNumber })}
                        </span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-gray-500">
                            {t('workouts.my-plan.scopeInstanceHint')}
                        </span>
                    </span>
                </label>
            </div>
        </section>
    );
};

export default ExerciseScopeBlock;
