import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  Headphones, 
  ShoppingBag,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

export const SYSTEM_PERSONAS = {
  customer: {
    role: 'customer',
    name: 'Customer',
    email: 'customer@novastore.com',
    password: 'Customer123!',
    title: 'Customer Account',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    description: 'NovaStore catalog, order tracking, and complaint tickets.',
    icon: ShoppingBag,
    gradient: 'from-[#10B981] to-[#059669]',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  support_agent: {
    role: 'support_agent',
    name: 'Alex Chen',
    email: 'specialist@supportnova.internal',
    password: 'Specialist2025!',
    title: 'Support Specialist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    description: 'Review queue triage, diff inspection, and customer communications.',
    icon: Headphones,
    gradient: 'from-[#4F46E5] to-[#7C3AED]',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  system_admin: {
    role: 'system_admin',
    name: 'Dr. Alexander Vance',
    email: 'admin@supportnova.gov',
    password: 'AdminVault99!',
    title: 'System Administrator',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    description: 'Autonomous governance, policy management, and 100-case cockpit.',
    icon: ShieldCheck,
    gradient: 'from-[#F43F5E] to-[#FB923C]',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200'
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
      name: selectedRole === 'customer' ? 'Sarah Jenkins' : persona.name,
      email: email.trim() || persona.email,
      title: persona.title,
      avatar: persona.avatar
    };

    onLogin(userPayload);
    toast.success(`Signed in as ${userPayload.name}`, {
      description: `Active role updated to ${selectedRole.toUpperCase()}.`
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

      {/* Main Floating Modal Container */}
      <div className="relative w-full max-w-lg rounded-[32px] bg-white border border-slate-100 shadow-board overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Top Gradient Hairline Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400" />

        <div className="p-7 sm:p-8 space-y-6">
          {/* Header Row: Title & Close Button */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
                Sign In to SupportNova
              </h2>
              <p className="text-xs text-[#64748B] mt-1 font-medium">
                Select your account type to access the platform
              </p>
            </div>

            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Account Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#334155] uppercase tracking-wider block">
              Select Account
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {Object.entries(SYSTEM_PERSONAS).map(([key, item]) => {
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
                        {key === 'customer' ? 'Customer' : key === 'support_agent' ? 'Specialist' : 'Admin'}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-[#0F172A] truncate">
                        {key === 'customer' ? 'Customer' : item.name}
                      </div>
                      <div className="text-[10px] text-[#64748B] font-mono truncate">
                        {item.title}
                      </div>
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
              <label className="text-xs font-bold text-[#334155] uppercase tracking-wider block">
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
              <label className="text-xs font-bold text-[#334155] uppercase tracking-wider block">
                Password
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

            {/* Action Button */}
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-full text-xs font-bold text-white bg-[#0F172A] hover:bg-slate-800 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] mt-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
