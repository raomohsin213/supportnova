import React from 'react';
import { motion } from 'framer-motion';

export default function CyberCard({
  children,
  className = '',
  accent = 'cyan', // cyan, emerald, amber, rose, purple, blue
  hoverEffect = true,
  onClick
}) {
  const accentGradients = {
    cyan: 'from-cyan-500 via-blue-500 to-indigo-500',
    emerald: 'from-emerald-500 via-teal-500 to-cyan-500',
    amber: 'from-amber-500 via-orange-500 to-rose-500',
    rose: 'from-rose-500 via-pink-500 to-purple-500',
    purple: 'from-purple-500 via-indigo-500 to-blue-500',
    blue: 'from-blue-600 via-cyan-500 to-teal-400'
  };

  const gradientBar = accentGradients[accent] || accentGradients.cyan;

  return (
    <motion.div
      onClick={onClick}
      whileHover={hoverEffect ? { y: -2, transition: { duration: 0.2 } } : {}}
      className={`relative overflow-hidden rounded-2xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-2xl dark:shadow-black/40 backdrop-blur-xl ${className}`}
    >
      {/* Top Cyber Accent Line */}
      <div className={`h-[2px] w-full bg-gradient-to-r ${gradientBar}`} />

      {/* Content */}
      <div className="p-5">
        {children}
      </div>
    </motion.div>
  );
}

export { CyberCard };
