import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  UserCheck, 
  KeyRound, 
  CheckCircle2, 
  Cpu, 
  Headphones, 
  ShoppingBag,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';

export const SYSTEM_PERSONAS = {
  customer: {
    role: 'customer',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@novastore.com',
    password: 'Customer123!',
    title: 'Verified Customer (NovaStore VIP)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    description: 'Access NovaStore catalog, place orders, track live complaint tickets, and submit evidence.',
    icon: ShoppingBag,
    gradient: 'from-[#10B981] to-[#059669]',
    badgeBg: 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30'
  },
  support_agent: {
    role: 'support_agent',
    name: 'Alex Chen',
    email: 'support.chen@supportnova.internal',
    password: 'Specialist2025!',
    title: 'Senior Support Specialist (Tier 2)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    description: 'Verify quarantined complaints, inspect Diff discrepancies, and request customer photo evidence.',
    icon: Headphones,
    gradient: 'from-[#7947EA] to-[#4F46E5]',
    badgeBg: 'bg-[#7947EA]/15 text-[#C084FC] border-[#7947EA]/30'
  },
  system_admin: {
    role: 'system_admin',
    name: 'Dr. Alexander Vance',
    email: 'admin.vance@supportnova.gov',
    password: 'AdminVault99!',
    title: 'Executive System Administrator',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    description: 'Full executive governance authority: 100-Case Audit Cockpit, Policy Registry, Rule Matrix, and overrides.',
    icon: ShieldCheck,
    gradient: 'from-[#FF4D73] to-[#FF7B54]',
    badgeBg: 'bg-[#FF4D73]/15 text-[#FF7B54] border-[#FF4D73]/30'
  }
};

export function AuthLoginModal({ 
  isOpen, 
  onClose, 
  activeRole = 'support_agent', 
  onLogin = () => {} 
}) {
  const [selectedRole, setSelectedRole] = useState(activeRole);
  const [email, setEmail] = useState(SYSTEM_PERSONAS[activeRole]?.email || SYSTEM_PERSONAS.support_agent.email);
  const [password, setPassword] = useState(SYSTEM_PERSONAS[activeRole]?.password || SYSTEM_PERSONAS.support_agent.password);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  if (!isOpen) return null;

  const handleSelectPreset = (roleKey) => {
    setSelectedRole(roleKey);
    const persona = SYSTEM_PERSONAS[roleKey];
    if (persona) {
      setEmail(persona.email);
      setPassword(persona.password);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const persona = SYSTEM_PERSONAS[selectedRole] || SYSTEM_PERSONAS.support_agent;
    const userPayload = {
      role: selectedRole,
      name: persona.name,
      email: email.trim() || persona.email,
      title: persona.title,
      avatar: persona.avatar
    };

    onLogin(userPayload);
    toast.success(`Authenticated as ${persona.name} (${persona.title})`, {
      description: `Active role updated to ${selectedRole.toUpperCase()}. Layout adjusted instantly.`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed Ambient Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Main Glassmorphic Modal Container */}
      <div className="relative w-full max-w-xl rounded-[32px] bg-white border border-slate-100 shadow-board overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Top Gradient Hairline Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400" />

        <div className="p-7 sm:p-9 space-y-6">
          {/* Header Row: Title & Close Button */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] font-bold">
                  Enterprise RBAC Access Engine
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
                Authentication Portal
              </h2>
              <div className="w-16 h-1 mt-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400" />
            </div>

            <div className="flex items-center gap-2.5">
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F6F8FC] text-[#475569] border border-slate-200 text-xs font-mono font-semibold shadow-xs">
                <span>Welcome back</span>
                <Lock className="w-3 h-3 text-indigo-600" />
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 1-Click Role Persona Quick Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#334155] font-mono uppercase tracking-wider">
                Select Persona (Instant 1-Click Fill)
              </label>
              <span className="text-[11px] text-indigo-600 font-mono font-semibold">No reload needed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {Object.entries(SYSTEM_PERSONAS).map(([key, item]) => {
                const Icon = item.icon;
                const isSelected = selectedRole === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectPreset(key)}
                    className={`relative p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-indigo-50 border-indigo-400 shadow-sm ring-2 ring-indigo-200' 
                        : 'bg-[#F6F8FC] border-slate-200/70 hover:border-slate-300 hover:bg-[#EEF2F8]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className="relative">
                        <img 
                          src={item.avatar} 
                          alt={item.name} 
                          className="w-8 h-8 rounded-full object-cover border border-white shadow-xs"
                        />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                          key === 'customer' ? 'bg-emerald-500' : key === 'support_agent' ? 'bg-indigo-500' : 'bg-rose-500'
                        }`} />
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                        key === 'customer' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        key === 'support_agent' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {key === 'customer' ? 'Customer' : key === 'support_agent' ? 'Agent' : 'Admin'}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-[#0F172A] truncate">{item.name}</div>
                      <div className="text-[10px] text-[#64748B] font-mono truncate">{item.role}</div>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Credentials */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#334155] font-mono uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F6F8FC] border border-slate-200 text-xs font-mono text-[#0F172A] placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#334155] font-mono uppercase tracking-wider block">
                Access Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#F6F8FC] border border-slate-200 text-xs font-mono text-[#0F172A] placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center justify-between text-xs text-[#64748B] pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>I agree to RBAC Governance Terms</span>
              </label>
              <span className="text-[11px] font-mono text-emerald-600 font-semibold">Auth Token: Valid</span>
            </div>

            {/* Glowing Gradient Action Button */}
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-full text-xs font-bold text-white bg-[#0F172A] hover:bg-slate-800 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Sign In & Switch Persona</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </form>

          {/* Footer Security Badge & Encryption Info */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#64748B] font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F6F8FC] border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secure & Encrypted • 256-bit State</span>
            </div>

            <div className="flex items-center gap-2 text-[#64748B]">
              <span>RBAC Role:</span>
              <span className="text-[#0F172A] font-bold uppercase">{selectedRole}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
