import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  ShieldAlert, 
  Filter, 
  Search, 
  ArrowRight, 
  Clock, 
  Flame, 
  FileX, 
  AlertOctagon,
  RefreshCw,
  Lock,
  Package,
  Camera,
  ArrowUpRight,
  Inbox,
  CheckCircle2
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { fetchTickets } from '../services/api';

export function ManualReviewQueue({ onInspectTicket }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('inbox'); // 'inbox', 'blocked', 'escalated', 'p1', 'all'
  const [search, setSearch] = useState('');

  const loadQueue = async () => {
    setLoading(true);
    try {
      const res = await fetchTickets({ limit: 500 });
      setTickets(res.tickets || []);
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  // Filter logic: if user enters search text, search across ALL tickets immediately
  const filteredTickets = tickets.filter((t) => {
    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      return (t.customer_name && t.customer_name.toLowerCase().includes(s)) ||
             (t.customer_email && t.customer_email.toLowerCase().includes(s)) ||
             (t.complaint_title && t.complaint_title.toLowerCase().includes(s)) ||
             (t.complaint_id && t.complaint_id.toLowerCase().includes(s)) ||
             (t.product_name && t.product_name.toLowerCase().includes(s)) ||
             (t.order_reference && t.order_reference.toLowerCase().includes(s));
    }

    if (filterType === 'inbox') {
      return t.is_automated_dispatch_blocked || t.status === 'Needs Review' || t.status === 'Manual Review Required' || t.status === 'Quarantined';
    }
    if (filterType === 'blocked') {
      return t.status === 'Quarantined' || t.status === 'Manual Review Required' || (t.is_automated_dispatch_blocked && t.status !== 'Escalated to Admin');
    }
    if (filterType === 'escalated') {
      return t.status === 'Escalated to Admin' || t.escalation_level === 'Tier 6';
    }
    if (filterType === 'p1') {
      return t.final_priority === 'P1';
    }
    return true; // 'all'
  });

  const inboxCount = tickets.filter(t => t.is_automated_dispatch_blocked || t.status === 'Needs Review' || t.status === 'Manual Review Required' || t.status === 'Quarantined').length;
  const blockedCount = tickets.filter(t => t.status === 'Quarantined' || t.status === 'Manual Review Required' || (t.is_automated_dispatch_blocked && t.status !== 'Escalated to Admin')).length;
  const escalatedCount = tickets.filter(t => t.status === 'Escalated to Admin' || t.escalation_level === 'Tier 6').length;
  const p1Count = tickets.filter(t => t.final_priority === 'P1').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Specialist Review & Triage Cockpit
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Manual Review & Escalation Queue
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Customer complaints with attached defect photos awaiting specialist verification or executive admin escalation.
          </p>
        </div>

        <button
          onClick={loadQueue}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <button
            onClick={() => setFilterType('inbox')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              filterType === 'inbox'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Inbox className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Needs Review ({inboxCount})</span>
          </button>

          <button
            onClick={() => setFilterType('blocked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              filterType === 'blocked'
                ? 'bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Quarantined ({blockedCount})</span>
          </button>

          <button
            onClick={() => setFilterType('escalated')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              filterType === 'escalated'
                ? 'bg-purple-50 text-purple-700 border border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Escalated to Admin ({escalatedCount})</span>
          </button>

          <button
            onClick={() => setFilterType('p1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              filterType === 'p1'
                ? 'bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>P1 Critical ({p1Count})</span>
          </button>

          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filterType === 'all'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All Tickets ({tickets.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search all tickets (e.g. TICK-..., Sarah)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px] bg-slate-50 dark:bg-slate-800/40">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Customer & Tier</th>
                <th className="py-3 px-4">Item & Evidence</th>
                <th className="py-3 px-4">Complaint Title</th>
                <th className="py-3 px-4">Priority & SLA</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Validation Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <span className="font-mono text-xs">Scanning exception queue...</span>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No tickets matching filter.</p>
                    <p className="text-xs text-slate-500 mt-1">All tickets in this category have been verified or resolved.</p>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.complaint_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      {t.complaint_id}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">{t.customer_name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[150px]">
                        {t.customer_email || `${t.customer_tier || 'Standard'} Tier`}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {t.product_image_url ? (
                          <img 
                            src={t.product_image_url} 
                            alt={t.product_name || 'Product'} 
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                            {t.product_name || 'NovaStore Item'}
                          </div>
                          {t.evidence_image_url ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                              <Camera className="w-3 h-3" />
                              Evidence
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">No Photo</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-700 dark:text-slate-300 font-sans">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {t.complaint_title}
                      </div>
                      {t.status === 'Escalated to Admin' && t.human_reviewer_notes && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800 line-clamp-1" title={t.human_reviewer_notes}>
                          <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">Admin Note: {t.human_reviewer_notes}</span>
                        </div>
                      )}
                      {t.status === 'Verified' && t.official_resolution_message && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-sans line-clamp-1 italic" title={t.official_resolution_message}>
                          <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">Sent: {t.official_resolution_message}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={t.final_priority || 'P3'} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                      {t.assigned_department}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onInspectTicket(t.complaint_id)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs hover:border-indigo-300"
                      >
                        <span>Inspect & Take Action</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
