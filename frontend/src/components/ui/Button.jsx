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
  const baseStyles = 'inline-flex items-center justify-center rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:bg-indigo-800',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm active:bg-blue-800',
    secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700',
    outline: 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs',
    ghost: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
    destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm active:bg-rose-800',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm active:bg-emerald-800'
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
