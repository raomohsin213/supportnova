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
      color: 'text-[#FF4D73]'
    },
    {
      id: 'TC-ADV-002',
      badge: 'Case B',
      title: 'Calm Hazard (Smoking Battery)',
      tag: 'Tone Bias Trap',
      icon: Flame,
      color: 'text-[#FF7B54]'
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
      color: 'text-[#C084FC]'
    },
    {
      id: 'TC-ADV-005',
      badge: 'Case E',
      title: 'Prohibited Cash Compensation Demand',
      tag: 'Compliance Trap',
      icon: Ban,
      color: 'text-[#FF4D73]'
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
    <header className="sticky top-0 z-30 h-16 bg-[#080911]/85 backdrop-blur-xl border-b border-white/[0.06] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 w-full min-w-0">
      {/* Search Bar with ⌘K tag (fluid sizing) */}
      <div className="relative flex-1 min-w-[140px] max-w-xs sm:max-w-sm lg:max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tickets, orders, emails..."
          className="w-full pl-10 pr-10 sm:pr-12 py-2 rounded-xl bg-[#111424] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7947EA] transition-all font-sans"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:block">
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-white/[0.08] text-slate-400 border border-white/[0.08] shadow-xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Action Controls: Presets Dropdown, Notification Bell, User Pill & Judge Guide */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Active Evaluation Presets Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setPresetsOpen(!presetsOpen)}
            className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold bg-[#111424] hover:bg-[#161A2E] text-slate-200 border border-white/[0.08] hover:border-white/[0.15] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="1-Click Evaluation Traps"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF7B54] shrink-0" />
            <span className="hidden xl:inline">Adversarial Presets</span>
            <span className="hidden sm:inline xl:hidden">Presets</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${presetsOpen ? 'rotate-180' : ''}`} />
          </button>

          {presetsOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setPresetsOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-80 bg-[#111424] border border-white/[0.1] rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 space-y-1">
                <div className="px-3 py-2 border-b border-white/[0.06]">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-bold block">
                    1-Click Evaluation Traps (SRS 1.2 & 1.8)
                  </span>
                  <span className="text-xs text-slate-300">
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
                      className="w-full text-left p-2.5 rounded-xl hover:bg-[#161A2E] transition-colors flex items-start gap-2.5 cursor-pointer group"
                    >
                      <div className="p-1.5 rounded-lg bg-white/[0.04] group-hover:bg-[#7947EA]/20 transition-colors mt-0.5">
                        <Icon className={`w-4 h-4 ${preset.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-mono font-bold text-white group-hover:text-[#FF7B54] transition-colors truncate">
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

        {/* Judge Guide Button */}
        <button
          onClick={onOpenGuide}
          className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#7947EA]/20 to-[#4F46E5]/20 hover:from-[#7947EA]/30 hover:to-[#4F46E5]/30 text-white border border-[#7947EA]/40 shadow-[0_0_15px_rgba(121,71,234,0.3)] transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#C084FC] shrink-0" />
          <span className="hidden sm:inline">Judge Guide</span>
        </button>

        {/* Notification Bell */}
        <div className="relative shrink-0">
          <button 
            type="button"
            className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-[#111424] hover:bg-[#161A2E] text-slate-300 hover:text-white border border-white/[0.08] flex items-center justify-center transition-colors cursor-pointer"
            title="System Notifications"
          >
            <Bell className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#FF4D73] text-white text-[8px] font-mono font-bold flex items-center justify-center ring-2 ring-[#080911] shadow-[0_0_8px_rgba(255,77,115,0.7)]">
            2
          </span>
        </div>

        {/* User Profile Pill Button (Image 4 Finova Style) */}
        <button
          type="button"
          onClick={onOpenAuthModal}
          className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#111424] hover:bg-[#161A2E] border border-white/[0.08] hover:border-[#7947EA]/50 transition-all cursor-pointer group shrink-0"
          title="Click to Switch Persona or Log In"
        >
          <div className="relative shrink-0">
            <img
              src={currentProfile.avatar}
              alt={currentProfile.name}
              className="w-7 h-7 rounded-full object-cover border border-white/20"
            />
            <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ring-1 ring-[#111424] ${
              activeRole === 'customer' ? 'bg-[#10B981]' : activeRole === 'support_agent' ? 'bg-[#7947EA]' : 'bg-[#FF4D73]'
            }`} />
          </div>
          <div className="text-left hidden lg:block max-w-[110px]">
            <div className="text-xs font-bold text-white group-hover:text-[#C084FC] transition-colors leading-tight truncate">
              {currentProfile.name}
            </div>
            <div className="text-[9px] text-slate-400 font-mono leading-tight truncate">
              {activeRole === 'customer' ? 'NovaStore VIP' : activeRole === 'support_agent' ? 'Specialist' : 'Administrator'}
            </div>
          </div>
          <KeyRound className="w-3 h-3 text-slate-400 group-hover:text-[#FF4D73] transition-colors hidden sm:block shrink-0" />
        </button>
      </div>
    </header>
  );
}
