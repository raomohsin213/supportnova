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
  minimal = false
}) {
  const actualScore = value !== undefined ? value : score;
  const actualSubtext = subtitle !== undefined ? subtitle : subtext;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(Math.max(actualScore, 0), 100);
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  // Determine color scheme based on Finova gradients
  let colorConfig = {
    stroke: 'url(#gradient-finova-emerald)',
    glow: 'rgba(16, 185, 129, 0.35)',
    textColor: 'text-[#10B981]',
    badgeBg: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
  };

  if (normalizedScore < 60) {
    colorConfig = {
      stroke: 'url(#gradient-finova-sunset)',
      glow: 'rgba(255, 77, 115, 0.35)',
      textColor: 'text-[#FF4D73]',
      badgeBg: 'bg-[#FF4D73]/15 text-[#FF4D73] border-[#FF4D73]/30'
    };
  } else if (normalizedScore < 85) {
    colorConfig = {
      stroke: 'url(#gradient-finova-amber)',
      glow: 'rgba(245, 158, 11, 0.35)',
      textColor: 'text-[#F59E0B]',
      badgeBg: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
    };
  } else {
    colorConfig = {
      stroke: 'url(#gradient-finova-violet)',
      glow: 'rgba(121, 71, 234, 0.35)',
      textColor: 'text-[#7947EA]',
      badgeBg: 'bg-[#7947EA]/15 text-[#C084FC] border-[#7947EA]/30'
    };
  }

  const containerClass = minimal
    ? "flex flex-col items-center justify-center p-2 text-center"
    : "flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#111424] backdrop-blur-xl border border-white/[0.08] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] transition-all hover:border-[#7947EA]/40";

  return (
    <div className={containerClass}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="gradient-finova-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="gradient-finova-violet" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7B3FE4" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
            <linearGradient id="gradient-finova-amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FF7F59" />
            </linearGradient>
            <linearGradient id="gradient-finova-sunset" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF4B72" />
              <stop offset="100%" stopColor="#FF7F59" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            className="stroke-white/[0.06]"
          />

          {/* Dynamic Progress Arc with framer-motion */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            stroke={colorConfig.stroke}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {Icon && <Icon className={`w-4 h-4 mb-0.5 ${colorConfig.textColor}`} />}
          <span className="text-2xl font-black font-mono tracking-tight text-white">
            {normalizedScore}
            <span className="text-xs font-semibold opacity-70">%</span>
          </span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <div className="text-[11px] font-bold font-mono tracking-wider uppercase text-slate-300">
          {label}
        </div>
        {actualSubtext && (
          <div className="text-[10px] text-slate-400 mt-0.5">
            {actualSubtext}
          </div>
        )}
      </div>
    </div>
  );
}

export default CircularScoreDial;
