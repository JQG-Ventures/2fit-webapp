import React, { useEffect, useRef } from 'react';
import { FaCaretUp } from 'react-icons/fa';

const HorizontalScrollablePicker = ({ value, onChange, range }) => {
    const pickerRef = useRef(null);
    const isScrollingRef = useRef(false);
    const prevValueRef = useRef(value);
    const scrollTimeoutRef = useRef(null);
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

    const handleScroll = () => {
        const container = pickerRef.current;
        const containerWidth = container.clientWidth;
        const items = container.querySelectorAll('[data-value]');

        let closestItem = null;
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

        if (closestItem) {
            const newValue = Number(closestItem.getAttribute('data-value'));
            if (newValue !== value) {
                isScrollingRef.current = true;
                onChange(newValue);
            }
        }

        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
            let closestItem = null;
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

            if (closestItem) {
                const newValue = Number(closestItem.getAttribute('data-value'));
                if (newValue !== value) {
                    isScrollingRef.current = true;
                    onChange(newValue);
                }
                centerValue(newValue);
            }
        }, 100);
    };

    const centerValue = (value) => {
        if (pickerRef.current) {
            const itemElement = pickerRef.current.querySelector(`[data-value="${value}"]`);
            if (itemElement) {
                const containerWidth = pickerRef.current.clientWidth;
                const itemLeft = itemElement.offsetLeft;
                const itemWidth = itemElement.offsetWidth;
                const targetScrollPosition = itemLeft - containerWidth / 2 + itemWidth / 2;
                pickerRef.current.scrollTo({
                    left: targetScrollPosition,
                    behavior: 'smooth',
                });
            }
        }
    };

    return (
        <div className="h-auto w-full mx-auto flex flex-col justify-center items-center relative">
            <div className="relative w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white pointer-events-none z-10"></div>

                <div
                    className="w-full h-auto overflow-x-scroll no-scrollbar relative"
                    onScroll={handleScroll}
                    ref={pickerRef}
                >
                    <div className="flex flex-row items-center relative space-x-4">
                        {range.map((item) => (
                            <div
                                key={item}
                                data-value={item}
                                className={`w-[80px] h-[80px] flex-shrink-0 flex justify-center items-center text-6xl transition-transform ${
                                    value === item
                                        ? 'text-black font-bold transform scale-110 border-black'
                                        : 'text-gray-500'
                                }`}
                                onClick={() => onChange(item)}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="z-20 flex items-center justify-center mt-2">
                <FaCaretUp className="text-black text-6xl" />
            </div>
        </div>
    );
};

export default HorizontalScrollablePicker;
