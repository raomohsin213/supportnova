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
  ChevronDown,
  Send,
  Lock,
  Sparkles,
  KeyRound,
  Shield
} from 'lucide-react';
import { ThemeToggle } from './ui/ThemeToggle';
import { SYSTEM_PERSONAS } from './AuthLoginModal';

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  blockedCount = 0, 
  activeRole = 'support_agent', 
  onRoleChange = () => {},
  onOpenAuthModal = () => {}
}) {
  // Strict Role-Based Access Control (RBAC) Navigation Definitions with Clean, Non-Truncating Labels
  const roleNavItems = {
    customer: [
      { id: 'customer', label: 'Store & Orders', icon: ShoppingBag },
      { id: 'submit', label: 'Submit Complaint', icon: Send },
    ],
    support_agent: [
      { id: 'queue', label: 'Review Queue', icon: AlertCircle, badge: blockedCount },
      { id: 'workspace', label: 'Diff Inspector', icon: Sliders },
      { id: 'customer', label: 'NovaStore Portal', icon: ShoppingBag },
    ],
    system_admin: [
      { id: 'workspace', label: 'Diff Inspector', icon: Sliders },
      { id: 'queue', label: 'Review Queue', icon: AlertCircle, badge: blockedCount },
      { id: 'benchmark', label: '100-Case Cockpit', icon: Cpu, badge: 'SRS 8' },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'customer', label: 'NovaStore Portal', icon: ShoppingBag },
      { id: 'policies', label: 'Policies', icon: FileText },
      { id: 'rules', label: 'Rule Matrix', icon: Database },
    ],
  };

  const navItems = roleNavItems[activeRole] || roleNavItems.support_agent;
  const currentProfile = SYSTEM_PERSONAS[activeRole] || SYSTEM_PERSONAS.support_agent;

  return (
    <aside className="w-64 fixed top-0 left-0 bottom-0 h-screen z-40 finova-sidebar flex flex-col justify-between p-3.5 select-none overflow-y-auto">
      {/* Top Header / Logo & Nav Items */}
      <div className="space-y-5">
        {/* SupportNova Brand (Clean Finova Style) */}
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
          className="flex items-center gap-3 px-2 py-1 cursor-pointer group transition-transform"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7947EA] to-[#4F46E5] text-white shadow-[0_0_20px_rgba(121,71,234,0.45)] border border-white/20 group-hover:scale-105 transition-transform shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-[#FF4D73] transition-colors truncate">
                SupportNova
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight truncate">
              Autonomous Governance
            </p>
          </div>
        </div>

        {/* Dynamic RBAC Navigation Menu */}
        <div>
          <div className="px-2.5 pb-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            <span className="truncate">
              {activeRole === 'customer' 
                ? 'Customer Experience' 
                : activeRole === 'support_agent' 
                ? 'Specialist Operations' 
                : 'Executive Controls'}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ml-1 ${
              activeRole === 'customer' ? 'bg-[#10B981]' : activeRole === 'support_agent' ? 'bg-[#7947EA]' : 'bg-[#FF4D73]'
            }`} />
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full rounded-xl px-3 py-2.5 text-xs font-semibold flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                    isActive
                      ? 'finova-pill-active'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (typeof item.badge === 'number' ? item.badge > 0 : Boolean(item.badge)) && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-tight shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : typeof item.badge === 'string'
                        ? 'bg-[#7947EA]/25 text-[#C084FC] border border-[#7947EA]/40'
                        : 'bg-[#FF4D73] text-white animate-pulse shadow-[0_0_12px_rgba(255,77,115,0.6)]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Middle/Bottom Finova Mini Card (Image 4 Widget Style) */}
      <div className="space-y-2.5 pt-3">
        <div className="p-3 rounded-2xl bg-gradient-to-b from-[#161A2E]/80 to-[#111424] border border-white/[0.08] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[#7947EA]/15 rounded-full blur-xl pointer-events-none group-hover:bg-[#7947EA]/25 transition-all" />
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Shield className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Security Shield</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-full text-[8px] font-mono font-bold bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30">
              Active
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-black text-white font-mono tracking-tight">99.8%</span>
            <span className="text-[9px] text-slate-400 font-mono">Policy Precision</span>
          </div>
          <div className="w-full bg-white/[0.06] h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-[#7947EA] to-[#10B981] h-full rounded-full w-[99.8%]" />
          </div>
        </div>

        {/* Bottom Profile Card & Authentication / Role Switcher */}
        <div className="p-3 rounded-2xl bg-[#111424] border border-white/[0.08] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={currentProfile.avatar}
                  alt={currentProfile.name}
                  className="w-8 h-8 rounded-full object-cover border border-white/20 shadow-xs"
                />
                <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-[#0B0D18] ${
                  activeRole === 'customer' ? 'bg-[#10B981]' : activeRole === 'support_agent' ? 'bg-[#7947EA]' : 'bg-[#FF4D73]'
                }`} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate">
                  {currentProfile.name}
                </h4>
                <p className="text-[9px] text-slate-400 truncate font-mono">
                  {currentProfile.title}
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Quick Persona Switcher & Login Modal Trigger */}
          <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block">
                Active Persona:
              </label>
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="text-[9px] text-[#C084FC] hover:text-white font-mono flex items-center gap-1 cursor-pointer transition-colors"
                title="Open Glassmorphic Login & Role Switcher"
              >
                <KeyRound className="w-2.5 h-2.5 text-[#FF4D73]" />
                <span>Switch / Login</span>
              </button>
            </div>

            <div className="relative">
              <select
                value={activeRole}
                onChange={(e) => onRoleChange(e.target.value)}
                className="w-full text-[11px] font-semibold rounded-xl px-2 py-1.5 bg-[#161A2E] text-slate-200 border border-white/[0.08] focus:outline-none focus:border-[#7947EA] cursor-pointer appearance-none pr-6 transition-colors"
              >
                <option value="customer">👤 Customer (NovaStore)</option>
                <option value="support_agent">🎧 Support Specialist</option>
                <option value="system_admin">🛡️ System Administrator</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
