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
  HelpCircle,
  ShoppingBag
} from 'lucide-react';
import { ThemeToggle } from './ui/ThemeToggle';

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
    { id: 'customer', label: 'NovaStore & Orders', icon: ShoppingBag },
    { id: 'analytics', label: 'Executive Dashboard', icon: BarChart3 },
    { id: 'policies', label: 'Policy Registry', icon: FileText },
    { id: 'rules', label: 'Rule Matrix', icon: Database },
  ];

  const roleStyles = {
    system_admin: 'text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-300 dark:bg-purple-950/50 dark:border-purple-800',
    support_manager: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/50 dark:border-blue-800',
    reviewer: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/50 dark:border-amber-800',
    support_agent: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-300 dark:bg-indigo-950/50 dark:border-indigo-800',
    customer: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800'
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Enterprise Brand */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveTab('workspace')}>
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  SupportNova
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  TechWiz 7
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-600 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls: Judge Guide, Role Switcher, & Theme Toggle */}
          <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
            {/* Interactive Judge Guide Button */}
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800 transition-colors shadow-xs cursor-pointer"
              title="Click for Evaluator Walkthrough & Quick Scenarios"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Judge Guide</span>
            </button>

            {/* RBAC Role Persona Selector (FR i, FR ii) */}
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={activeRole}
                onChange={(e) => onRoleChange(e.target.value)}
                className={`text-[11px] font-mono font-semibold rounded-lg px-2.5 py-1.5 border focus:outline-none transition-colors cursor-pointer ${
                  roleStyles[activeRole] || 'text-slate-700 bg-white border-slate-200 dark:text-slate-300 dark:bg-slate-900 dark:border-slate-700'
                }`}
                title="Switch persona to test Role-Based Access Control"
              >
                <option value="system_admin">Role: System Admin</option>
                <option value="support_manager">Role: Support Manager</option>
                <option value="reviewer">Role: Reviewer / QA</option>
                <option value="support_agent">Role: Support Agent</option>
                <option value="customer">Role: Customer (Public)</option>
              </select>
            </div>

            {/* Theme Toggle Button (Light / Dark) */}
            <ThemeToggle />
          </div>

        </div>
      </div>
    </header>
  );
}
