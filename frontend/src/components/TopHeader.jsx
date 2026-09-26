import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Clock, 
  Check, 
  Trash2,
  X
} from 'lucide-react';
import { SYSTEM_PERSONAS } from './AuthLoginModal';

export function TopHeader({ 
  searchQuery = '',
  setSearchQuery = () => {},
  activeRole = 'support_agent',
  onOpenAuthModal = () => {}
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'P1 Critical Safety Hazard Flagged',
      desc: 'TICK-4B54D757: Smoke/spark incident tagged for immediate safety review.',
      time: '5m ago',
      type: 'critical',
      unread: true,
    },
    {
      id: 2,
      title: 'New Customer Conversation Message',
      desc: 'Sarah Jenkins submitted a photo & reply on TICK-92833627.',
      time: '12m ago',
      type: 'message',
      unread: true,
    },
    {
      id: 3,
      title: 'Deterministic Policy Clearance',
      desc: 'DEL-POL-04 verified with 100% ground-truth clearance for TICK-92833627.',
      time: '28m ago',
      type: 'success',
      unread: false,
    },
  ]);

  const currentProfile = SYSTEM_PERSONAS[activeRole] || SYSTEM_PERSONAS.support_agent;
  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const markItemRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  return (
    <header className="h-18 bg-white border-b border-slate-100 px-6 sm:px-8 flex items-center justify-between gap-4 w-full shrink-0 relative z-30">
      {/* Pill-Shaped Search Input Bar */}
      <div className="relative flex-1 min-w-[160px] max-w-xs sm:max-w-sm lg:max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tickets, orders, emails..."
          className="w-full pl-10 pr-12 py-2.5 rounded-full bg-[#F1F5F9] focus:bg-white border border-slate-200/80 focus:border-indigo-500 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-hidden transition-all shadow-xs"
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:block">
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-full bg-white text-slate-400 border border-slate-200 shadow-xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Action Controls in Pill Shapes */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Interactive Notification Bell with Working Dropdown */}
        <div className="relative shrink-0">
          <button 
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              notificationsOpen ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-200' : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-600'
            }`}
            title="System Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#F43F5E] text-white text-[9px] font-mono font-bold flex items-center justify-center ring-2 ring-white pointer-events-none">
              {unreadCount}
            </span>
          )}

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setNotificationsOpen(false)} 
              />
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-100 rounded-3xl p-4 shadow-board z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Panel Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#0F172A]">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                      >
                        Mark read
                      </button>
                    )}
                    <button 
                      onClick={() => setNotificationsOpen(false)}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markItemRead(n.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                          n.unread 
                            ? 'bg-[#F6F8FC] border-slate-200/80 hover:bg-indigo-50/40 hover:border-indigo-200' 
                            : 'bg-white border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                          n.type === 'critical' ? 'bg-rose-50 text-rose-600' :
                          n.type === 'message' ? 'bg-indigo-50 text-indigo-600' :
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          {n.type === 'critical' ? <AlertTriangle className="w-4 h-4" /> :
                           n.type === 'message' ? <MessageSquare className="w-4 h-4" /> :
                           <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-xs font-bold truncate ${n.unread ? 'text-[#0F172A]' : 'text-[#475569]'}`}>
                              {n.title}
                            </span>
                            {n.unread && (
                              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed line-clamp-2">
                            {n.desc}
                          </p>
                          <span className="text-[10px] font-mono text-[#94A3B8] mt-1 block">
                            {n.time}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-[#94A3B8]">
                      No notifications right now
                    </div>
                  )}
                </div>

                {/* Footer Clear All */}
                {notifications.length > 0 && (
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#94A3B8] font-mono">
                      System Event Stream
                    </span>
                    <button
                      onClick={clearAll}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear all</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* User Profile Pill Chip */}
        <button
          type="button"
          onClick={onOpenAuthModal}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-slate-200/60 transition-all cursor-pointer group shrink-0"
          title="Click to Switch Persona or Log In"
        >
          <img
            src={currentProfile.avatar}
            alt={currentProfile.name}
            className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <div className="text-left hidden lg:block max-w-[120px]">
            <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight truncate">
              {currentProfile.name}
            </div>
            <div className="text-[10px] text-slate-400 font-mono leading-tight truncate">
              {activeRole === 'customer' ? 'Customer' : activeRole === 'support_agent' ? 'Specialist' : 'Admin'}
            </div>
          </div>
          <KeyRound className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors hidden sm:block shrink-0 ml-0.5" />
        </button>

      </div>
    </header>
  );
}
