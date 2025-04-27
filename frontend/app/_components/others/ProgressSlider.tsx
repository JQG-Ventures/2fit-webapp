import React, { useEffect, useRef, useState } from 'react';

const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
    const pathRef = useRef<any>(null);
    const [pathLength, setPathLength] = useState<number>(1);

    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef?.current.getTotalLength());
        }
    }, []);

    const boundedPercentage = Math.min(Math.max(percentage, 0), 100);
    const progressLength = (boundedPercentage / 100) * pathLength;
    const pointPosition = pathRef.current
        ? pathRef.current.getPointAtLength(progressLength)
        : { x: 150, y: 10 };

    return (
        <div className="relative flex items-center justify-center w-full h-full">
            <svg
                viewBox="0 0 300 100"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
            >
                <path
                    d="M 150,10 H 50 A 40,40 0 0 0 50,90 H 250 A 40,40 0 0 0 250,10 H 150"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.5)"
                    strokeWidth="10"
                />

                <path
                    ref={pathRef}
                    d="M 150,10 H 50 A 40,40 0 0 0 50,90 H 250 A 40,40 0 0 0 250,10 H 150"
                    fill="none"
                    stroke="green"
                    strokeWidth="10"
                    strokeDasharray={`${progressLength}, ${pathLength}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />

                {boundedPercentage > 0 && (
                    <circle cx={pointPosition.x} cy={pointPosition.y} r="8" fill="green" />
                )}
            </svg>

            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-2xl">
                {boundedPercentage}%
            </div>
        </div>
    );
};

export default ProgressBar;
