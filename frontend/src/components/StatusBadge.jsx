import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  ShieldAlert, 
  Clock, 
  HelpCircle, 
  FileX, 
  Lock, 
  RotateCcw, 
  ArrowUpRight,
  Flame,
  Check
} from 'lucide-react';

export function StatusBadge({ status, className = '' }) {
  let badgeStyle = "bg-white/[0.05] text-slate-300 border-white/[0.08]";
  let Icon = HelpCircle;
  const cleanStatus = (status || '').trim();

  switch (cleanStatus) {
    case 'Resolved':
    case 'Resolved & Closed':
    case 'Closed':
      badgeStyle = "bg-[#10B981]/15 text-[#34D399] border-[#10B981]/35 shadow-[0_0_12px_rgba(16,185,129,0.25)]";
      Icon = CheckCircle2;
      break;

    case 'Verified':
    case 'Auto-Dispatched':
      badgeStyle = "bg-[#10B981]/15 text-[#34D399] border-[#10B981]/35 shadow-[0_0_12px_rgba(16,185,129,0.25)]";
      Icon = CheckCircle2;
      break;

    case 'Verified with Warning':
      badgeStyle = "bg-[#06B6D4]/15 text-[#22D3EE] border-[#06B6D4]/35 shadow-[0_0_12px_rgba(6,182,212,0.2)]";
      Icon = AlertTriangle;
      break;

    case 'Partially Verified':
      badgeStyle = "bg-[#7947EA]/15 text-[#C084FC] border-[#7947EA]/35 shadow-[0_0_12px_rgba(121,71,234,0.2)]";
      Icon = Clock;
      break;

    case 'Quarantined':
    case 'Blocked':
      badgeStyle = "bg-[#FF4D73]/15 text-[#FF7B54] border-[#FF4D73]/35 shadow-[0_0_12px_rgba(255,77,115,0.25)]";
      Icon = Lock;
      break;

    case 'Escalated to Admin':
    case 'Escalated':
      badgeStyle = "bg-[#7947EA]/20 text-[#C084FC] border-[#7947EA]/45 shadow-[0_0_15px_rgba(121,71,234,0.3)]";
      Icon = AlertOctagon;
      break;

    case 'Reopened':
      badgeStyle = "bg-[#06B6D4]/15 text-[#38BDF8] border-[#06B6D4]/35 shadow-[0_0_12px_rgba(6,182,212,0.25)]";
      Icon = RotateCcw;
      break;

    case 'In Progress':
    case 'Under Review':
    case 'Needs Review':
      badgeStyle = "bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/35 shadow-[0_0_12px_rgba(245,158,11,0.2)]";
      Icon = Clock;
      break;

    case 'Manual Review Required':
    case 'Contradiction Detected':
      badgeStyle = "bg-[#FF4D73]/20 text-[#FF4D73] border-[#FF4D73]/45 shadow-[0_0_15px_rgba(255,77,115,0.3)]";
      Icon = ShieldAlert;
      break;

    case 'Source Support Missing':
      badgeStyle = "bg-[#7947EA]/15 text-[#C084FC] border-[#7947EA]/35";
      Icon = FileX;
      break;

    case 'Requirement Missing':
      badgeStyle = "bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/35 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
      Icon = AlertTriangle;
      break;

    case 'Outdated Source':
      badgeStyle = "bg-[#FF4D73]/15 text-[#FF7B54] border-[#FF4D73]/35 shadow-[0_0_12px_rgba(255,77,115,0.2)]";
      Icon = AlertOctagon;
      break;

    default:
      badgeStyle = "bg-white/[0.06] text-slate-300 border-white/[0.1]";
      Icon = Check;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono border backdrop-blur-md whitespace-nowrap shrink-0 transition-all ${badgeStyle} ${className}`}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="truncate">{cleanStatus || 'Normal'}</span>
    </span>
  );
}

export function DiffPill({ variant = 'green', children, className = '' }) {
  const styles = {
    green: "bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30",
    red: "bg-[#FF4D73]/15 text-[#FF7B54] border-[#FF4D73]/30",
    amber: "bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/30",
    blue: "bg-[#06B6D4]/15 text-[#22D3EE] border-[#06B6D4]/30",
    purple: "bg-[#7947EA]/15 text-[#C084FC] border-[#7947EA]/30",
    slate: "bg-white/[0.05] text-slate-300 border-white/[0.08]"
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-mono font-medium border backdrop-blur-md whitespace-nowrap shrink-0 ${styles[variant] || styles.slate} ${className}`}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority, className = '' }) {
  const map = {
    P1: "bg-[#FF4D73]/20 text-[#FF4D73] border-[#FF4D73]/40 shadow-[0_0_12px_rgba(255,77,115,0.35)]",
    P2: "bg-[#F59E0B]/20 text-[#FBBF24] border-[#F59E0B]/40 shadow-[0_0_12px_rgba(245,158,11,0.35)]",
    P3: "bg-[#06B6D4]/20 text-[#22D3EE] border-[#06B6D4]/40 shadow-[0_0_12px_rgba(6,182,212,0.35)]",
    P4: "bg-white/[0.05] text-slate-400 border-white/[0.1]"
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono font-bold text-xs border backdrop-blur-md whitespace-nowrap shrink-0 ${map[priority] || map.P3} ${className}`}>
      {priority}
    </span>
  );
}
