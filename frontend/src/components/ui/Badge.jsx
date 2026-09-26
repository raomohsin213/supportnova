import React from 'react';
import { cn } from './Button';

export function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'bg-white/[0.05] text-slate-200 border-white/[0.08]',
    primary: 'bg-[#7B3FE4]/15 text-[#C084FC] border-[#7B3FE4]/35 shadow-[0_0_12px_rgba(123,63,228,0.2)]',
    success: 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/35 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    warning: 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/35 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    destructive: 'bg-[#FF4B72]/15 text-[#FF7F59] border-[#FF4B72]/35 shadow-[0_0_12px_rgba(255,75,114,0.2)]',
    coral: 'bg-gradient-to-r from-[#FF4B72]/20 to-[#FF7F59]/20 text-[#FF4B72] border-[#FF4B72]/40 shadow-[0_0_12px_rgba(255,75,114,0.2)]',
    violet: 'bg-gradient-to-r from-[#7B3FE4]/20 to-[#4F46E5]/20 text-[#C084FC] border-[#7B3FE4]/40 shadow-[0_0_12px_rgba(123,63,228,0.2)]',
    cyan: 'bg-[#06B6D4]/15 text-[#22D3EE] border-[#06B6D4]/35 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
    outline: 'text-slate-300 border-white/[0.12] bg-white/[0.02]',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-mono font-bold tracking-tight transition-colors focus:outline-none backdrop-blur-md',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export default Badge;
