import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  MessageSquare, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { trackComplaint, fetchRecentPublicComplaints } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export function CustomerPortal() {
  const [searchId, setSearchId] = useState('TC-ADV-001');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => {
    async function loadRecent() {
      try {
        const list = await fetchRecentPublicComplaints();
        setRecentComplaints(list || []);
      } catch (err) {
        console.error('Failed to load recent complaints:', err);
      }
    }
    loadRecent();
    handleSearch('TC-ADV-001');
  }, []);

  async function handleSearch(idToSearch) {
    const id = (idToSearch || searchId).trim();
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await trackComplaint(id);
      setTicket(data);
    } catch (err) {
      setError(err.message || 'Unable to locate complaint with this reference.');
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Hero Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          Public Customer Status Portal (SRS Step 61, FR lxvi)
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Track Your Support Resolution
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
          Enter your reference ID to monitor real-time review progress, assigned department, and official company communication.
        </p>
      </div>

      {/* Tracking Search Bar */}
      <div className="max-w-2xl mx-auto">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="relative flex items-center"
        >
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Complaint ID (e.g., TC-ADV-001, CMP-00002)..."
            className="w-full pl-12 pr-32 py-3.5 bg-dark-900/90 border border-slate-700/80 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-xl"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-semibold text-xs transition-all shadow-md flex items-center gap-1.5"
          >
            {loading ? 'Searching...' : 'Track Ticket'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* 1-Click Recent Chips */}
        {recentComplaints.length > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap justify-center">
            <span className="text-[11px] font-mono text-slate-500">Quick Track:</span>
            {recentComplaints.slice(0, 4).map((c) => (
              <button
                key={c.complaint_id}
                type="button"
                onClick={() => { setSearchId(c.complaint_id); handleSearch(c.complaint_id); }}
                className="px-2.5 py-1 rounded-lg bg-dark-900 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
              >
                {c.complaint_id}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Ticket Result Card */}
      {ticket && (
        <div className="bg-dark-900/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Top Status & Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-bold font-mono text-white">{ticket.complaint_id}</span>
                <StatusBadge status={ticket.status} />
                {ticket.is_repeat_complaint && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    PRIORITY ACCOUNT
                  </span>
                )}
              </div>
              <h2 className="text-base text-slate-200 mt-1 font-medium">{ticket.complaint_title}</h2>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>{ticket.assigned_department}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Target SLA: {ticket.sla_target_hours}h</span>
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="py-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-4">
              Resolution Lifecycle
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-300">
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                <span className="text-xs font-semibold block">1. Submitted</span>
                <span className="text-[10px] text-slate-400">{ticket.submitted_date || 'Logged'}</span>
              </div>
              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-300">
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                <span className="text-xs font-semibold block">2. Dual-Engine Triage</span>
                <span className="text-[10px] text-slate-400">Rules Validated</span>
              </div>
              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-300">
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                <span className="text-xs font-semibold block">3. Assigned</span>
                <span className="text-[10px] text-slate-400">{ticket.assigned_department}</span>
              </div>
              <div className={`p-3 rounded-xl border text-xs font-semibold ${
                ticket.status === 'Verified' 
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                  : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
              }`}>
                <Clock className="w-4 h-4 mx-auto mb-1" />
                <span className="block">4. Resolution</span>
                <span className="text-[10px] opacity-80">{ticket.status}</span>
              </div>
            </div>
          </div>

          {/* Official Customer Response */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              Latest Communication from Customer Care:
            </span>
            <div className="p-4 rounded-xl bg-dark-950/80 border border-slate-800 text-sm text-slate-200 leading-relaxed italic font-sans whitespace-pre-line">
              "{ticket.customer_response}"
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <span>Last Status Synchronized: {ticket.latest_update || 'Just now'}</span>
            <span className="text-slate-400 font-mono text-[11px]">
              Protected by SupportNova Autonomous Ground-Truth Governance
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
