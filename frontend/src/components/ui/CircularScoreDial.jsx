import React from 'react';
import { motion } from 'framer-motion';

export function CircularScoreDial({
  score = 0,
  value,
  size = 130,
  strokeWidth = 10,
  label = 'Score',
  subtext = '',
  subtitle,
  icon: Icon
}) {
  const actualScore = value !== undefined ? value : score;
  const actualSubtext = subtitle !== undefined ? subtitle : subtext;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(Math.max(actualScore, 0), 100);
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  // Determine color scheme based on score thresholds
  let colorConfig = {
    stroke: 'url(#gradient-emerald)',
    glow: 'rgba(16, 185, 129, 0.25)',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  };

  if (normalizedScore < 60) {
    colorConfig = {
      stroke: 'url(#gradient-rose)',
      glow: 'rgba(244, 63, 94, 0.25)',
      textColor: 'text-rose-600 dark:text-rose-400',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
    };
  } else if (normalizedScore < 85) {
    colorConfig = {
      stroke: 'url(#gradient-amber)',
      glow: 'rgba(245, 158, 11, 0.25)',
      textColor: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    };
  }

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="gradient-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="gradient-amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="gradient-rose" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            className="stroke-slate-200 dark:stroke-slate-800"
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
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {normalizedScore}
            <span className="text-xs font-semibold opacity-70">%</span>
          </span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <div className="text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300">
          {label}
        </div>
        {actualSubtext && (
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            {actualSubtext}
          </div>
        )}
      </div>
    </div>
  );
}

export default CircularScoreDial;
