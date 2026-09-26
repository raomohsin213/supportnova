import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  BookOpen, 
  ChevronDown, 
  ShieldAlert, 
  Flame, 
  AlertOctagon, 
  FileX, 
  Ban, 
  CheckCircle2,
  Bell,
  KeyRound
} from 'lucide-react';
import { SYSTEM_PERSONAS } from './AuthLoginModal';

export function TopHeader({ 
  onOpenGuide = () => {}, 
  onSelectScenario = () => {},
  searchQuery = '',
  setSearchQuery = () => {},
  activeRole = 'support_agent',
  onOpenAuthModal = () => {}
}) {
  const [presetsOpen, setPresetsOpen] = useState(false);
  const currentProfile = SYSTEM_PERSONAS[activeRole] || SYSTEM_PERSONAS.support_agent;

  const presets = [
    {
      id: 'TC-ADV-001',
      badge: 'Case A',
      title: 'Prompt Injection Jailbreak',
      tag: 'Security Trap',
      icon: ShieldAlert,
      color: 'text-[#F43F5E]'
    },
    {
      id: 'TC-ADV-002',
      badge: 'Case B',
      title: 'Calm Hazard (Smoking Battery)',
      tag: 'Tone Bias Trap',
      icon: Flame,
      color: 'text-[#FB923C]'
    },
    {
      id: 'TC-ADV-003',
      badge: 'Case C',
      title: 'Screaming Minor Delay (P4 Dampen)',
      tag: 'Tone Bias Trap',
      icon: AlertOctagon,
      color: 'text-[#F59E0B]'
    },
    {
      id: 'TC-ADV-004',
      badge: 'Case D',
      title: 'Outdated Policy Citation (REF-POL-01)',
      tag: 'Version Governance',
      icon: FileX,
      color: 'text-[#7C3AED]'
    },
    {
      id: 'TC-ADV-005',
      badge: 'Case E',
      title: 'Prohibited Cash Compensation Demand',
      tag: 'Compliance Trap',
      icon: Ban,
      color: 'text-[#F43F5E]'
    },
    {
      id: 'TC-ADV-006',
      badge: 'Case F',
      title: 'Clean Match Auto-Dispatch Cleared',
      tag: 'Straight-Through',
      icon: CheckCircle2,
      color: 'text-[#10B981]'
    }
  ];

  return (
    <header className="h-18 bg-white border-b border-slate-100 px-6 sm:px-8 flex items-center justify-between gap-4 w-full shrink-0">
      {/* Pill-Shaped Search Input Bar */}
      <div className="relative flex-1 min-w-[160px] max-w-xs sm:max-w-sm lg:max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tickets, orders, emails..."
          className="w-full pl-10 pr-12 py-2.5 rounded-full bg-[#F1F5F9] focus:bg-white border border-slate-200/80 focus:border-[#4F46E5] text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none transition-all shadow-xs"
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:block">
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-full bg-white text-slate-400 border border-slate-200 shadow-xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Action Controls in Pill Shapes */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Active Evaluation Presets Pill Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setPresetsOpen(!presetsOpen)}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="1-Click Evaluation Traps"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FB923C] shrink-0" />
            <span className="hidden sm:inline">Evaluation Presets</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${presetsOpen ? 'rotate-180' : ''}`} />
          </button>

          {presetsOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setPresetsOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200/80 rounded-2xl p-2 shadow-xl z-50 space-y-1">
                <div className="px-3 py-2 border-b border-slate-100">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-bold block">
                    1-Click Evaluation Traps (SRS 1.2 & 1.8)
                  </span>
                  <span className="text-xs text-slate-700">
                    Select a preset to load into Diff Inspector
                  </span>
                </div>
                {presets.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        onSelectScenario(preset.id);
                        setPresetsOpen(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer group"
                    >
                      <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-indigo-50 transition-colors mt-0.5">
                        <Icon className={`w-4 h-4 ${preset.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-mono font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                            {preset.badge}: {preset.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                          {preset.tag} • {preset.id}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Judge Guide Pill Button */}
        <button
          onClick={onOpenGuide}
          className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5 text-white/90 shrink-0" />
          <span className="hidden sm:inline">Judge Guide</span>
        </button>

        {/* Circular Notification Bell */}
        <div className="relative shrink-0">
          <button 
            type="button"
            className="w-9 h-9 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="System Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#F43F5E] text-white text-[8px] font-mono font-bold flex items-center justify-center ring-2 ring-white">
            2
          </span>
        </div>

        {/* User Profile Pill Chip */}
        <button
          type="button"
          onClick={onOpenAuthModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-slate-200/60 transition-all cursor-pointer group shrink-0"
          title="Click to Switch Persona or Log In"
        >
          <img
            src={currentProfile.avatar}
            alt={currentProfile.name}
            className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <div className="text-left hidden lg:block max-w-[110px]">
            <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight truncate">
              {currentProfile.name}
            </div>
            <div className="text-[9px] text-slate-400 font-mono leading-tight truncate">
              {activeRole === 'customer' ? 'Customer' : activeRole === 'support_agent' ? 'Specialist' : 'Admin'}
            </div>
          </div>
          <KeyRound className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors hidden sm:block shrink-0 ml-0.5" />
        </button>
      </div>
    </header>
  );
}
