import React from 'react';

interface ProgressBarProps {
  current: number;
  target: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, target }) => {
  const percentage = Math.min(100, Math.max(0, (current / target) * 100));
  const radius = 90; // Slightly larger
  const stroke = 20; // Thicker stroke for better visibility
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color logic based on progress
  let colorClass = "text-rehab-blue";
  if (percentage >= 100) colorClass = "text-rehab-green";
  else if (percentage < 30) colorClass = "text-rehab-orange";

  return (
    <div className="relative flex flex-col items-center justify-center my-8">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 drop-shadow-sm"
      >
        {/* Background Circle */}
        <circle
          stroke="#F3F4F6"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress Circle */}
        <circle
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={colorClass}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
         <span className={`text-5xl font-black tracking-tighter ${colorClass}`}>
          {current.toLocaleString()}
        </span>
        <span className="text-xl text-gray-500 font-bold mt-1">
          / {target.toLocaleString()} 걸음
        </span>
      </div>
    </div>
  );
};