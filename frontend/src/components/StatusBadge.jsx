import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, ShieldAlert, Clock, HelpCircle, FileX } from 'lucide-react';

export function StatusBadge({ status, className = '' }) {
  let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  let Icon = HelpCircle;

  switch (status) {
    case 'Verified':
      badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
      Icon = CheckCircle2;
      break;
    case 'Verified with Warning':
      badgeStyle = "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800";
      Icon = AlertTriangle;
      break;
    case 'Partially Verified':
      badgeStyle = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800";
      Icon = Clock;
      break;
    case 'Source Support Missing':
      badgeStyle = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800";
      Icon = FileX;
      break;
    case 'Requirement Missing':
      badgeStyle = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800";
      Icon = AlertTriangle;
      break;
    case 'Outdated Source':
      badgeStyle = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800";
      Icon = AlertOctagon;
      break;
    case 'Manual Review Required':
    case 'Contradiction Detected':
      badgeStyle = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800";
      Icon = ShieldAlert;
      break;
    default:
      badgeStyle = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
      Icon = HelpCircle;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle} ${className}`}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{status}</span>
    </span>
  );
}

export function DiffPill({ variant = 'green', children, className = '' }) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    red: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
    amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
    slate: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${styles[variant] || styles.slate} ${className}`}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority, className = '' }) {
  const map = {
    P1: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
    P2: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    P3: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
    P4: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs border ${map[priority] || map.P3} ${className}`}>
      {priority}
    </span>
  );
}

