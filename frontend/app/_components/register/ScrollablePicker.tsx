import React, { useCallback, useEffect, useRef } from 'react';

interface ScrollablePickerProps {
    value: number;
    onChange: (value: number) => void;
    range: number[];
}

const ScrollablePicker: React.FC<ScrollablePickerProps> = ({ value, onChange, range }) => {
    const pickerRef = useRef<HTMLDivElement | null>(null);

    const centerValue = useCallback(
        (value: number) => {
            if (pickerRef.current) {
                const itemHeight = 80;
                const targetIndex = range.indexOf(value);
                const targetScrollPosition =
                    targetIndex * itemHeight - pickerRef.current.clientHeight / 2 + itemHeight / 2;
                pickerRef.current.scrollTo({
                    top: targetScrollPosition,
                    behavior: 'smooth',
                });
            }
        },
        [range],
    );

    useEffect(() => {
        if (pickerRef.current) {
            centerValue(value);
        }
    }, [centerValue, value]);

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const containerHeight = event.currentTarget.clientHeight;
        const scrollPosition = event.currentTarget.scrollTop;
        const itemHeight = 80;

        const centeredIndex = Math.round(
            (scrollPosition + containerHeight / 2 - itemHeight / 2) / itemHeight,
        );
        const newValue = range[Math.min(range.length - 1, Math.max(0, centeredIndex))];
        onChange(newValue);
    };

    return (
        <div className="h-full w-auto mx-auto flex justify-center items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white pointer-events-none z-10"></div>

            <div
                className="w-full h-full overflow-y-scroll no-scrollbar"
                onScroll={handleScroll}
                ref={pickerRef}
            >
                <div className="flex flex-col items-center relative">
                    {range.map((item) => (
                        <div
                            key={item}
                            className={`h-[80px] flex justify-center items-center transition-colors ${
                                value === item
                                    ? 'text-black font-bold text-6xl border-t-4 border-b-4 border-black'
                                    : 'text-gray-500 text-4xl'
                            }`}
                            onClick={() => centerValue(item)}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ScrollablePicker;
