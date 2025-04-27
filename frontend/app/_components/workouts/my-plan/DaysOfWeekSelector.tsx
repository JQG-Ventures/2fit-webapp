interface DaysOfWeekSelectorProps {
    daysOfWeekLetters: string[];
    selectedDayIndex: number;
    setSelectedDayIndex: (index: number) => void;
}

const DaysOfWeekSelector: React.FC<DaysOfWeekSelectorProps> = ({
    daysOfWeekLetters,
    selectedDayIndex,
    setSelectedDayIndex,
}) => (
    <div className="flex flex-row justify-between p-6">
        {daysOfWeekLetters.map((dayLetter, index) => (
            <button
                key={index}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedDayIndex === index ? 'bg-green-500 text-white' : 'text-gray-700'
                }`}
                onClick={() => setSelectedDayIndex(index)}
            >
                {dayLetter}
            </button>
        ))}
    </div>
);

export default DaysOfWeekSelector;
