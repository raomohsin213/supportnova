import React from 'react';
import { motion } from 'framer-motion';

export default function CyberCard({
  children,
  className = '',
  accent = 'purple', // cyan, emerald, amber, rose, purple, blue, sunset, violet
  hoverEffect = true,
  onClick
}) {
  const accentGradients = {
    cyan: 'from-[#06B6D4] via-[#3B82F6] to-[#7B3FE4]',
    emerald: 'from-[#10B981] via-[#059669] to-[#06B6D4]',
    amber: 'from-[#F59E0B] via-[#FF7F59] to-[#FF4B72]',
    rose: 'from-[#FF4B72] via-[#FF7F59] to-[#7B3FE4]',
    purple: 'from-[#7B3FE4] via-[#4F46E5] to-[#FF4B72]',
    blue: 'from-[#3B82F6] via-[#06B6D4] to-[#10B981]',
    sunset: 'from-[#FF4B72] to-[#FF7F59]',
    violet: 'from-[#7B3FE4] to-[#4F46E5]'
  };

  const gradientBar = accentGradients[accent] || accentGradients.purple;

  return (
    <motion.div
      onClick={onClick}
      whileHover={hoverEffect ? { y: -2, transition: { duration: 0.2 } } : {}}
      className={`relative overflow-hidden rounded-2xl bg-[#111525]/85 border border-white/[0.08] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl hover:border-[#7B3FE4]/40 hover:shadow-[0_12px_35px_-10px_rgba(123,63,228,0.25)] transition-all ${className}`}
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
