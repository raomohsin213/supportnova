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
  ChevronDown
} from 'lucide-react';
import { ThemeToggle } from './ui/ThemeToggle';

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  blockedCount = 0, 
  activeRole = 'customer', 
  onRoleChange = () => {} 
}) {
  const navItems = [
    { id: 'workspace', label: 'Diff Inspector', icon: Sliders },
    { id: 'queue', label: 'Clearances & Queue', icon: AlertCircle, badge: blockedCount },
    { id: 'benchmark', label: '100-Case Audit Cockpit', icon: Cpu, badge: 'SRS 8' },
    { id: 'analytics', label: 'Executive Analytics', icon: BarChart3 },
    { id: 'customer', label: 'NovaStore Portal', icon: ShoppingBag },
    { id: 'policies', label: 'Policy Registry', icon: FileText },
    { id: 'rules', label: 'Rule Matrix', icon: Database },
  ];

  const roleNameMap = {
    customer: { name: 'Sarah Jenkins', title: 'Verified Customer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80' },
    support_agent: { name: 'Sarah Jenkins', title: 'Senior Support Specialist', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
    reviewer: { name: 'Marcus Sterling', title: 'Compliance Auditor', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
    system_admin: { name: 'Dr. Alexander Vance', title: 'System Administrator', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80' },
  };

  const currentProfile = roleNameMap[activeRole] || roleNameMap.support_agent;

  return (
    <aside className="w-64 fixed top-0 left-0 bottom-0 h-screen z-40 finova-sidebar flex flex-col justify-between p-4 select-none">
      {/* Top Header / Logo */}
      <div className="space-y-6">
        <div 
          onClick={() => setActiveTab('workspace')}
          className="flex items-center gap-3 px-2 py-1 cursor-pointer group transition-transform"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7947EA] to-[#4F46E5] text-white shadow-[0_0_20px_rgba(121,71,234,0.45)] border border-white/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-[#FF4D73] transition-colors">
                SupportNova
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-[#7947EA]/20 text-[#C084FC] border border-[#7947EA]/30">
                FINTECH OS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight">
              Autonomous Governance
            </p>
          </div>
        </div>

        {/* Navigation Menu List */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  isActive
                    ? 'finova-pill-active'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (typeof item.badge === 'number' ? item.badge > 0 : Boolean(item.badge)) && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-tight ${
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

      {/* Bottom Profile Card */}
      <div className="p-3.5 rounded-2xl bg-[#111424] border border-white/[0.08] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src={currentProfile.avatar}
                alt={currentProfile.name}
                className="w-9 h-9 rounded-full object-cover border border-white/20 shadow-xs"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-[#0B0D18]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">
                {currentProfile.name}
              </h4>
              <p className="text-[10px] text-slate-400 truncate font-mono">
                {currentProfile.title}
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Role Selector Pill */}
        <div className="pt-2 border-t border-white/[0.06]">
          <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
            Active Persona:
          </label>
          <div className="relative">
            <select
              value={activeRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="w-full text-xs font-semibold rounded-xl px-2.5 py-1.5 bg-[#161A2E] text-slate-200 border border-white/[0.08] focus:outline-none focus:border-[#7947EA] cursor-pointer appearance-none pr-7"
            >
              <option value="customer">👤 Customer (NovaStore)</option>
              <option value="support_agent">🎧 Support Specialist</option>
              <option value="system_admin">🛡️ System Administrator</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>
    </aside>
  );
}
