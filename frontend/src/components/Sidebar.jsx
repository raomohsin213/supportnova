import React from 'react';
import { 
  Sliders, 
  AlertCircle, 
  BarChart3, 
  ShoppingBag, 
  FileText, 
  Database, 
  Cpu, 
  ShieldCheck,
  Send,
  Lock,
  KeyRound,
  Shield,
  Layers,
  LayoutDashboard
} from 'lucide-react';
import { SYSTEM_PERSONAS } from './AuthLoginModal';

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  blockedCount = 0, 
  activeRole = 'support_agent', 
  onRoleChange = () => {},
  onOpenAuthModal = () => {}
}) {
  // Strict Role-Based Access Control (RBAC) Navigation Definitions
  const roleNavItems = {
    customer: [
      { id: 'customer', label: 'NovaStore & Orders', icon: ShoppingBag },
      { id: 'submit', label: 'Submit Complaint', icon: Send },
    ],
    support_agent: [
      { id: 'queue', label: 'Review Queue', icon: AlertCircle, badge: blockedCount },
      { id: 'workspace', label: 'Diff Inspector', icon: Sliders },
    ],
    system_admin: [
      { id: 'workspace', label: 'Diff Inspector', icon: Sliders },
      { id: 'queue', label: 'Review Queue', icon: AlertCircle, badge: blockedCount },
      { id: 'benchmark', label: '100-Case Cockpit', icon: Cpu, badge: 'SRS 8' },
      { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
      { id: 'policies', label: 'Policy Registry', icon: FileText },
      { id: 'rules', label: 'Rule Matrix', icon: Database },
    ],
  };

  const navItems = roleNavItems[activeRole] || roleNavItems.support_agent;
  const currentProfile = SYSTEM_PERSONAS[activeRole] || SYSTEM_PERSONAS.support_agent;

  return (
    <aside className="w-20 bg-white border-r border-slate-100 flex flex-col justify-between py-6 items-center select-none shrink-0 z-20">
      {/* Top Section: Squircle Brand Logo */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Squircle Brand Logo with Soft Indigo/Purple Gradient */}
        <div 
          onClick={() => {
            if (activeRole === 'customer') {
              setActiveTab('customer');
            } else if (activeRole === 'support_agent') {
              setActiveTab('queue');
            } else {
              setActiveTab('workspace');
            }
          }}
          title="SupportNova — Autonomous AI Governance"
          className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)] cursor-pointer hover:scale-105 transition-transform"
        >
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>

        {/* Navigation Icon Column */}
        <nav className="flex flex-col items-center gap-2.5 w-full px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`relative p-3 rounded-2xl transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-200/60 scale-105'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />

                {/* Micro Badge Counter */}
                {item.badge !== undefined && (typeof item.badge === 'number' ? item.badge > 0 : Boolean(item.badge)) && (
                  <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-tight shadow-xs ${
                    typeof item.badge === 'string'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#F43F5E] text-white animate-pulse'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Active Profile Avatar & Auth Modal Trigger */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        {/* Security Shield Indicator Icon */}
        <div 
          title="Autonomous Policy Precision: 99.8% Ground-Truth Active" 
          className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 shadow-xs cursor-help"
        >
          <Shield className="w-4 h-4 text-emerald-600" />
        </div>

        {/* Profile Avatar Pill Button with Online Ring */}
        <button
          type="button"
          onClick={onOpenAuthModal}
          title={`Active Persona: ${currentProfile.name} (${currentProfile.title}). Click to switch role / log in.`}
          className="relative p-1 rounded-full hover:scale-105 transition-transform cursor-pointer group"
        >
          <img
            src={currentProfile.avatar}
            alt={currentProfile.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-slate-100 group-hover:ring-indigo-300 transition-all"
          />
          <span className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
            activeRole === 'customer' ? 'bg-emerald-500' : activeRole === 'support_agent' ? 'bg-indigo-600' : 'bg-rose-500'
          }`} />
        </button>
      </div>
    </aside>
  );
}
