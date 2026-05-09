'use client';

import { useTranslation } from 'react-i18next';

interface DaysOfWeekSelectorProps {
    days: {
        day_of_week: string;
        date?: string;
        is_completed?: boolean;
        exercises?: Pick<Exercise, 'is_completed'>[];
    }[];
    selectedDayIndex: number;
    setSelectedDayIndex: (index: number) => void;
    todayDate: string;
}

const DaysOfWeekSelector: React.FC<DaysOfWeekSelectorProps> = ({
    days,
    selectedDayIndex,
    setSelectedDayIndex,
    todayDate,
}) => {
    const { t } = useTranslation('global');

    const formatDayLetter = (day: string) => {
        const dayLabels: Record<string, string> = {
            monday: 'Lu',
            tuesday: 'Ma',
            wednesday: 'Mi',
            thursday: 'Ju',
            friday: 'Vi',
            saturday: 'Sa',
            sunday: 'Do',
        };

        return dayLabels[day.toLowerCase()] ?? day.slice(0, 2);
    };

    const formatDayNumber = (date?: string) => {
        if (!date) return '';

        return new Date(`${date}T00:00:00`).getDate();
    };

    const isPastDay = (date?: string) => {
        if (!date) return false;

        return date < todayDate;
    };

    return (
        <div className="py-4">
            <div className="grid grid-cols-7 justify-items-center gap-2">
                {days.map((day, index) => {
                    const exercises = day.exercises ?? [];
                    const isSelected = selectedDayIndex === index;
                    const isToday = day.date === todayDate;
                    const isRestDay = exercises.length === 0;
                    const isCompleted =
                        day.is_completed ||
                        (exercises.length > 0 &&
                            exercises.every((exercise) => exercise.is_completed));
                    const isMissed = !isToday && !isRestDay && !isCompleted && isPastDay(day.date);

                    return (
                        <button
                            key={day.date ?? day.day_of_week}
                            type="button"
                            className={`relative flex h-16 w-[95%] min-w-0 flex-col items-center justify-center rounded-2xl border text-sm transition-all ${
                                isSelected
                                    ? 'border-gray-950 bg-gray-950 text-white shadow-lg shadow-gray-900/20'
                                    : isToday
                                      ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                      : isCompleted
                                        ? 'border-green-500 bg-gray-50 text-gray-500'
                                        : isMissed
                                          ? 'border-red-500 bg-gray-50 text-gray-500'
                                          : 'border-gray-100 bg-gray-50 text-gray-400'
                            }`}
                            onClick={() => setSelectedDayIndex(index)}
                            aria-label={t('a11y.dayOfWeek', { day: day.day_of_week })}
                        >
                            <span className="text-[9px] font-normal uppercase">
                                {formatDayLetter(day.day_of_week)}
                            </span>
                            <span className="text-lg font-semibold">
                                {formatDayNumber(day.date)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default DaysOfWeekSelector;
