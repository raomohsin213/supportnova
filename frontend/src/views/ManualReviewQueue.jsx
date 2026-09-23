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
  Lock
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { fetchTickets } from '../services/api';

export function ManualReviewQueue({ onInspectTicket }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('blocked'); // 'blocked', 'p1', 'hallucination', 'all'
  const [search, setSearch] = useState('');

  const loadQueue = async () => {
    setLoading(true);
    try {
      const res = await fetchTickets({ limit: 100 });
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

  // Filter logic
  const filteredTickets = tickets.filter((t) => {
    if (search) {
      const s = search.toLowerCase();
      const match = t.customer_name.toLowerCase().includes(s) ||
                    t.complaint_title.toLowerCase().includes(s) ||
                    t.complaint_id.toLowerCase().includes(s);
      if (!match) return false;
    }

    if (filterType === 'blocked') {
      return t.is_automated_dispatch_blocked;
    }
    if (filterType === 'p1') {
      return t.final_priority === 'P1';
    }
    if (filterType === 'hallucination') {
      return t.status === 'Source Support Missing' || t.status === 'Outdated Source' || t.traceability_score === 0;
    }
    return true; // 'all'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Governance Exception Queue
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Manual Review & Escalation Queue
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Complaints held by Pipeline 2 due to safety keywords, prohibited compensation, hallucinated policies, or tone decoupling overrides.
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
            onClick={() => setFilterType('blocked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              filterType === 'blocked'
                ? 'bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Dispatch Blocked ({tickets.filter(t => t.is_automated_dispatch_blocked).length})</span>
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
            <span>P1 Critical ({tickets.filter(t => t.final_priority === 'P1').length})</span>
          </button>

          <button
            onClick={() => setFilterType('hallucination')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              filterType === 'hallucination'
                ? 'bg-purple-50 text-purple-700 border border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Citation Issues</span>
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
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search queue..."
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
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <span className="font-mono text-xs">Scanning exception queue...</span>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
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
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">{t.customer_tier} Tier</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-700 dark:text-slate-300 font-sans">
                      {t.complaint_title}
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
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Inspect Diff</span>
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
