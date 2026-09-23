import React from 'react';
import { 
  ShieldCheck, 
  SplitSquareVertical, 
  AlertCircle, 
  BarChart3, 
  FileText, 
  Database, 
  Send,
  UserCheck,
  Globe,
  Users,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export function Navbar({ 
  activeTab, 
  setActiveTab, 
  blockedCount = 0,
  activeRole = 'system_admin',
  onRoleChange = () => {},
  onOpenGuide = () => {}
}) {
  const navItems = [
    { id: 'workspace', label: 'Diff Inspector', icon: SplitSquareVertical },
    { id: 'queue', label: 'Review Queue', icon: AlertCircle, badge: blockedCount },
    { id: 'submit', label: 'Intake Portal', icon: Send },
    { id: 'customer', label: 'Customer Portal', icon: Globe },
    { id: 'analytics', label: 'Executive Dashboard', icon: BarChart3 },
    { id: 'policies', label: 'Policy Registry', icon: FileText },
    { id: 'rules', label: 'Rule Matrix', icon: Database },
  ];

  const roleColors = {
    system_admin: 'text-purple-400 bg-purple-950/40 border-purple-500/30',
    support_manager: 'text-blue-400 bg-blue-950/40 border-blue-500/30',
    reviewer: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
    support_agent: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30',
    customer: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
  };

  return (
    <header className="sticky top-0 z-40 bg-dark-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('workspace')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-[0_0_18px_rgba(6,182,212,0.35)]">
              <div className="w-full h-full bg-dark-900 rounded-[11px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
                  SupportNova
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  TechWiz 7
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Autonomous AI Governance & Ground-Truth
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap relative ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-red-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls: Judge Guide & Role Switcher */}
          <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-slate-800">
            {/* Interactive Judge Guide Button */}
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-500/30 transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)]"
              title="Click for Evaluator Walkthrough & Quick Scenarios"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Judge Guide</span>
            </button>

            {/* RBAC Role Persona Selector (FR i, FR ii) */}
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={activeRole}
                onChange={(e) => onRoleChange(e.target.value)}
                className={`text-[11px] font-mono font-semibold rounded-lg px-2.5 py-1.5 border focus:outline-none transition-colors cursor-pointer ${
                  roleColors[activeRole] || 'text-slate-300 bg-slate-900 border-slate-700'
                }`}
                title="Switch persona to test Role-Based Access Control"
              >
                <option value="system_admin" className="bg-dark-900 text-white">Role: System Admin</option>
                <option value="support_manager" className="bg-dark-900 text-white">Role: Support Manager</option>
                <option value="reviewer" className="bg-dark-900 text-white">Role: Reviewer / QA</option>
                <option value="support_agent" className="bg-dark-900 text-white">Role: Support Agent</option>
                <option value="customer" className="bg-dark-900 text-white">Role: Customer (Public)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
