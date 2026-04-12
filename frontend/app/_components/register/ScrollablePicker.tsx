import React, { useCallback, useEffect, useRef } from 'react';

interface ScrollablePickerProps {
    value: number;
    onChange: (value: number) => void;
    range: number[];
}

const ITEM_HEIGHT = 64;

const ScrollablePicker: React.FC<ScrollablePickerProps> = ({ value, onChange, range }) => {
    const pickerRef = useRef<HTMLDivElement | null>(null);

    const centerValue = useCallback(
        (val: number) => {
            if (!pickerRef.current) return;
            const targetIndex = range.indexOf(val);
            const targetScrollPosition =
                targetIndex * ITEM_HEIGHT - pickerRef.current.clientHeight / 2 + ITEM_HEIGHT / 2;
            pickerRef.current.scrollTo({ top: targetScrollPosition, behavior: 'smooth' });
        },
        [range],
    );

    useEffect(() => {
        if (pickerRef.current) centerValue(value);
    }, [centerValue, value]);

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const { clientHeight, scrollTop } = event.currentTarget;
        const centeredIndex = Math.round(
            (scrollTop + clientHeight / 2 - ITEM_HEIGHT / 2) / ITEM_HEIGHT,
        );
        const newValue = range[Math.min(range.length - 1, Math.max(0, centeredIndex))];
        onChange(newValue);
    };

    return (
        <div className="w-full max-w-[200px] h-[320px] mx-auto flex justify-center items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white pointer-events-none z-10" />

            <div
                className="w-full h-full overflow-y-scroll no-scrollbar"
                onScroll={handleScroll}
                ref={pickerRef}
            >
                <div className="flex flex-col items-center">
                    {range.map((item) => (
                        <div
                            key={item}
                            className={`h-[64px] w-full flex justify-center items-center transition-all cursor-pointer ${
                                value === item
                                    ? 'text-black font-bold text-5xl sm:text-6xl border-t-4 border-b-4 border-black'
                                    : 'text-gray-400 text-3xl sm:text-4xl'
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
