import React, { useEffect, useRef, useState } from 'react';

const ProgressBar = ({ percentage }) => {
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(1); // Default to 1 to prevent division by zero

  useEffect(() => {
    // Get the exact path length of the rounded rectangle once it's rendered
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  // Ensure the percentage is between 0 and 100
  const boundedPercentage = Math.min(Math.max(percentage, 0), 100);

  // Calculate the stroke length for the progress
  const progressLength = (boundedPercentage / 100) * pathLength;

  // Calculate the exact position of the green point based on progress
  const pointPosition = pathRef.current
    ? pathRef.current.getPointAtLength(progressLength)
    : { x: 150, y: 10 }; // Default to top middle if not yet calculated

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <svg
        viewBox="0 0 300 120"
        className="w-full h-full"
        preserveAspectRatio="none" // Ensure the SVG scales without distortion
      >
        {/* Background path (always visible) */}
        <path
          d="
            M 150,10
            H 50
            A 40,40 0 0 0 50,90
            H 250
            A 40,40 0 0 0 250,10
            H 150
          "
          fill="none"
          stroke="white"
          strokeWidth="10"
        />

        {/* Progress path */}
        <path
          ref={pathRef} // Reference to calculate total length
          d="
            M 150,10
            H 50
            A 40,40 0 0 0 50,90
            H 250
            A 40,40 0 0 0 250,10
            H 150
          "
          fill="none"
          stroke={boundedPercentage === 100 ? 'green' : 'white'} // Green when complete, otherwise white
          strokeWidth="10"
          strokeDasharray={`${progressLength}, ${pathLength}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />

        {/* Green point indicating progress */}
        {boundedPercentage > 0 && (
          <circle
            cx={pointPosition.x}
            cy={pointPosition.y}
            r="8"
            fill="green"
          />
        )}
      </svg>

      {/* Centered percentage text */}
      <div className="absolute flex items-center justify-center w-full h-full text-white font-bold text-2xl">
        {boundedPercentage}%
      </div>
    </div>
  );
};

export default ProgressBar;
