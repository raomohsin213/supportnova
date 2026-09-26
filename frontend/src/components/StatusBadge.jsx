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
  Check
} from 'lucide-react';

export function StatusBadge({ status, className = '' }) {
  let badgeStyle = "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]";
  let Icon = CheckCircle2;
  const cleanStatus = (status || '').trim();

  switch (cleanStatus) {
    case 'Resolved':
    case 'Resolved & Closed':
    case 'Closed':
    case 'Verified':
    case 'Auto-Dispatched':
      badgeStyle = "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]";
      Icon = CheckCircle2;
      break;

    case 'Verified with Warning':
      badgeStyle = "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]";
      Icon = AlertTriangle;
      break;

    case 'Partially Verified':
    case 'In Progress':
    case 'Under Review':
    case 'Needs Review':
      badgeStyle = "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]";
      Icon = Clock;
      break;

    case 'Quarantined':
    case 'Blocked':
      badgeStyle = "bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]";
      Icon = Lock;
      break;

    case 'Escalated to Admin':
    case 'Escalated':
      badgeStyle = "bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]";
      Icon = AlertOctagon;
      break;

    case 'Reopened':
      badgeStyle = "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]";
      Icon = RotateCcw;
      break;

    case 'Manual Review Required':
    case 'Contradiction Detected':
      badgeStyle = "bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]";
      Icon = ShieldAlert;
      break;

    case 'Source Support Missing':
    case 'Requirement Missing':
      badgeStyle = "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]";
      Icon = AlertTriangle;
      break;

    case 'Outdated Source':
      badgeStyle = "bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]";
      Icon = AlertOctagon;
      break;

    default:
      badgeStyle = "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]";
      Icon = Check;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono border whitespace-nowrap shrink-0 transition-all ${badgeStyle} ${className}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">{cleanStatus || 'Normal'}</span>
    </span>
  );
}

export function DiffPill({ variant = 'green', children, className = '' }) {
  const styles = {
    green: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",
    red: "bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]",
    amber: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
    blue: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
    purple: "bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]",
    slate: "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border whitespace-nowrap shrink-0 ${styles[variant] || styles.slate} ${className}`}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority, className = '' }) {
  const map = {
    P1: "bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3] font-bold",
    P2: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A] font-bold",
    P3: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE] font-bold",
    P4: "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0] font-medium"
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-xs border whitespace-nowrap shrink-0 ${map[priority] || map.P3} ${className}`}>
      {priority}
    </span>
  );
}
