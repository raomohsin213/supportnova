import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  children,
  disabled,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FE4] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    default: 'bg-gradient-to-r from-[#7B3FE4] to-[#4F46E5] text-white hover:from-[#8B5CF6] hover:to-[#6366F1] shadow-[0_0_20px_rgba(123,63,228,0.35)] border border-white/10 active:scale-[0.98]',
    primary: 'bg-gradient-to-r from-[#FF4B72] to-[#FF7F59] text-white hover:opacity-95 shadow-[0_0_20px_rgba(255,75,114,0.35)] border border-white/10 active:scale-[0.98]',
    secondary: 'bg-[#15192B] text-slate-200 hover:bg-[#1C223A] border border-white/[0.08] hover:border-white/20 active:scale-[0.98]',
    outline: 'border border-white/[0.12] bg-[#0F121E]/70 text-slate-200 hover:bg-[#15192B] hover:border-[#7B3FE4]/40 shadow-xs active:scale-[0.98]',
    ghost: 'text-slate-400 hover:text-white hover:bg-white/[0.06] active:scale-[0.98]',
    destructive: 'bg-gradient-to-r from-[#FF4B72] to-[#E11D48] text-white hover:opacity-95 shadow-[0_0_20px_rgba(255,75,114,0.4)] border border-white/10 active:scale-[0.98]',
    success: 'bg-gradient-to-r from-[#059669] to-[#10B981] text-white hover:opacity-95 shadow-[0_0_20px_rgba(16,185,129,0.35)] border border-white/10 active:scale-[0.98]'
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    default: 'h-9 px-4 py-2 text-xs gap-2',
    lg: 'h-10 px-5 text-sm gap-2.5',
    icon: 'h-9 w-9 p-0 flex items-center justify-center'
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
export { cn };
export default Button;
