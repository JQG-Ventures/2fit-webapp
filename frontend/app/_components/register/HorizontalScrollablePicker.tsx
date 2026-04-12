import React, { useEffect, useRef } from 'react';
import { FaCaretUp } from 'react-icons/fa';

interface HorizontalScrollablePickerProps {
    value: number;
    onChange: (value: number) => void;
    range: number[];
}

const HorizontalScrollablePicker: React.FC<HorizontalScrollablePickerProps> = ({
    value,
    onChange,
    range,
}) => {
    const pickerRef = useRef<HTMLDivElement | null>(null);
    const isScrollingRef = useRef(false);
    const prevValueRef = useRef<number>(value);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const firstRenderRef = useRef(true);

    useEffect(() => {
        if (pickerRef.current) {
            if (firstRenderRef.current) {
                centerValue(value);
                firstRenderRef.current = false;
            } else if (!isScrollingRef.current && prevValueRef.current !== value) {
                centerValue(value);
            }
            prevValueRef.current = value;
            isScrollingRef.current = false;
        }
    }, [value]);

    const getValueFromItem = (item: HTMLDivElement | null): number | null => {
        if (!item) return null;
        const raw = item.getAttribute('data-value');
        if (!raw) return null;
        const parsed = Number(raw);
        return Number.isNaN(parsed) ? null : parsed;
    };

    const findClosestItem = (
        container: HTMLDivElement,
        items: NodeListOf<HTMLDivElement>,
    ): HTMLDivElement | null => {
        const containerWidth = container.clientWidth;
        let closestItem: HTMLDivElement | null = null;
        let minDistance = Infinity;

        items.forEach((item) => {
            const itemRect = item.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const itemCenter = itemRect.left - containerRect.left + itemRect.width / 2;
            const distance = Math.abs(itemCenter - containerWidth / 2);
            if (distance < minDistance) {
                minDistance = distance;
                closestItem = item;
            }
        });

        return closestItem;
    };

    const handleScroll = () => {
        const container = pickerRef.current;
        if (!container) return;

        const items = container.querySelectorAll<HTMLDivElement>('[data-value]');
        const closest = findClosestItem(container, items);

        if (closest) {
            const newValue = getValueFromItem(closest);
            if (newValue !== null && newValue !== value) {
                isScrollingRef.current = true;
                onChange(newValue);
            }
        }

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
            if (!container) return;
            const latestClosest = findClosestItem(container, items);
            if (latestClosest) {
                const newValue = getValueFromItem(latestClosest);
                if (newValue !== null && newValue !== value) {
                    isScrollingRef.current = true;
                    onChange(newValue);
                }
                if (newValue !== null) centerValue(newValue);
            }
        }, 100);
    };

    const centerValue = (val: number) => {
        if (!pickerRef.current) return;
        const itemElement = pickerRef.current.querySelector<HTMLDivElement>(
            `[data-value="${val}"]`,
        );
        if (itemElement) {
            const containerWidth = pickerRef.current.clientWidth;
            const targetScrollPosition =
                itemElement.offsetLeft - containerWidth / 2 + itemElement.offsetWidth / 2;
            pickerRef.current.scrollTo({ left: targetScrollPosition, behavior: 'smooth' });
        }
    };

    return (
        <div className="h-auto w-full mx-auto flex flex-col justify-center items-center relative">
            <div className="relative w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white pointer-events-none z-10" />

                <div
                    className="w-full h-auto overflow-x-scroll no-scrollbar"
                    onScroll={handleScroll}
                    ref={pickerRef}
                >
                    <div className="flex flex-row items-center space-x-2 sm:space-x-4">
                        {range.map((item) => (
                            <div
                                key={item}
                                data-value={item}
                                className={`w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] flex-shrink-0 flex justify-center items-center transition-transform cursor-pointer ${
                                    value === item
                                        ? 'text-black font-bold text-5xl sm:text-6xl scale-110'
                                        : 'text-gray-400 text-3xl sm:text-4xl'
                                }`}
                                onClick={() => onChange(item)}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="z-20 flex items-center justify-center mt-1">
                <FaCaretUp className="text-black text-3xl sm:text-4xl" />
            </div>
        </div>
    );
};

export default HorizontalScrollablePicker;
