import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, XCircle, ShieldAlert, Clock, HelpCircle, FileX } from 'lucide-react';

export function StatusBadge({ status, className = '' }) {
  let badgeStyle = "bg-slate-800 text-slate-300 border-slate-700";
  let Icon = HelpCircle;

  switch (status) {
    case 'Verified':
      badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]";
      Icon = CheckCircle2;
      break;
    case 'Verified with Warning':
      badgeStyle = "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]";
      Icon = AlertTriangle;
      break;
    case 'Partially Verified':
      badgeStyle = "bg-blue-500/10 text-blue-400 border-blue-500/30";
      Icon = Clock;
      break;
    case 'Source Support Missing':
      badgeStyle = "bg-purple-500/10 text-purple-400 border-purple-500/30 animate-pulse";
      Icon = FileX;
      break;
    case 'Requirement Missing':
      badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/30";
      Icon = AlertTriangle;
      break;
    case 'Outdated Source':
      badgeStyle = "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse";
      Icon = AlertOctagon;
      break;
    case 'Manual Review Required':
    case 'Contradiction Detected':
      badgeStyle = "bg-red-500/15 text-red-400 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse";
      Icon = ShieldAlert;
      break;
    default:
      badgeStyle = "bg-slate-800 text-slate-300 border-slate-700";
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
    green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    red: "bg-red-500/15 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.15)]",
    amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    blue: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    slate: "bg-slate-800 text-slate-400 border-slate-700"
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${styles[variant] || styles.slate} ${className}`}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority, className = '' }) {
  const map = {
    P1: "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse",
    P2: "bg-amber-500/20 text-amber-400 border-amber-500/50",
    P3: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    P4: "bg-slate-700 text-slate-300 border-slate-600"
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs border ${map[priority] || map.P3} ${className}`}>
      {priority}
    </span>
  );
}
