import React from 'react';
import { motion } from 'framer-motion';

export function CircularScoreDial({
  score = 0,
  value,
  size = 100,
  strokeWidth = 8,
  label = 'Score',
  subtext = '',
  subtitle,
  icon: Icon,
  minimal = false,
  whiteMode = false
}) {
  const actualScore = value !== undefined ? value : score;
  const actualSubtext = subtitle !== undefined ? subtitle : subtext;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(Math.max(actualScore, 0), 100);
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  // Determine color scheme based on Jobtrain/Finova gradients or whiteMode
  let strokeColor = '#10B981';
  let textColor = 'text-[#10B981]';

  if (whiteMode) {
    strokeColor = '#FFFFFF';
    textColor = 'text-white';
  } else if (normalizedScore < 60) {
    strokeColor = '#F43F5E';
    textColor = 'text-[#F43F5E]';
  } else if (normalizedScore < 85) {
    strokeColor = '#F59E0B';
    textColor = 'text-[#F59E0B]';
  } else {
    strokeColor = '#4F46E5';
    textColor = 'text-[#4F46E5]';
  }

  const containerClass = minimal
    ? "flex flex-col items-center justify-center p-2 text-center"
    : whiteMode
    ? "flex flex-col items-center justify-center p-3 text-center"
    : "flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all";

  return (
    <div className={containerClass}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            className={whiteMode ? "stroke-white/20" : "stroke-slate-100"}
          />

          {/* Dynamic Progress Arc with framer-motion */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            stroke={strokeColor}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {Icon && <Icon className={`w-4 h-4 mb-0.5 ${whiteMode ? 'text-white' : textColor}`} />}
          <span className={`text-2xl font-black font-mono tracking-tight ${whiteMode ? 'text-white' : 'text-[#0F172A]'}`}>
            {normalizedScore}
            <span className={`text-xs font-semibold ${whiteMode ? 'text-white/80' : 'opacity-70'}`}>%</span>
          </span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <div className={`text-[11px] font-bold font-mono tracking-wider uppercase ${whiteMode ? 'text-white' : 'text-[#0F172A]'}`}>
          {label}
        </div>
        {actualSubtext && (
          <div className={`text-[10px] mt-0.5 ${whiteMode ? 'text-white/80' : 'text-[#64748B]'}`}>
            {actualSubtext}
          </div>
        )}
      </div>
    </div>
  );
}

export default CircularScoreDial;
