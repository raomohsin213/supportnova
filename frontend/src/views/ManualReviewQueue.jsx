import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  ShieldAlert, 
  Search, 
  ArrowRight, 
  Clock, 
  Flame, 
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
  const [filterType, setFilterType] = useState('all'); // 'all', 'blocked', 'p1', 'cleared', 'inbox', 'escalated'
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

  // Filter logic: search takes precedence across fields
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

    if (filterType === 'blocked') {
      return t.status === 'Quarantined' || t.status === 'Manual Review Required' || (t.is_automated_dispatch_blocked && t.status !== 'Escalated to Admin');
    }
    if (filterType === 'p1') {
      return t.final_priority === 'P1';
    }
    if (filterType === 'cleared') {
      return t.status === 'Verified' || !t.is_automated_dispatch_blocked;
    }
    if (filterType === 'inbox') {
      return t.is_automated_dispatch_blocked || t.status === 'Needs Review' || t.status === 'Manual Review Required' || t.status === 'Quarantined' || t.status === 'Reopened';
    }
    if (filterType === 'escalated') {
      return t.status === 'Escalated to Admin' || t.escalation_level === 'Tier 6';
    }
    return true; // 'all'
  });

  const allCount = tickets.length;
  const blockedCount = tickets.filter(t => t.status === 'Quarantined' || t.status === 'Manual Review Required' || (t.is_automated_dispatch_blocked && t.status !== 'Escalated to Admin')).length;
  const p1Count = tickets.filter(t => t.final_priority === 'P1').length;
  const clearedCount = tickets.filter(t => t.status === 'Verified' || !t.is_automated_dispatch_blocked).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7947EA]/15 text-[#C084FC] border border-[#7947EA]/30 text-xs font-mono font-bold uppercase tracking-wider mb-2 shadow-xs">
            <ShieldAlert className="w-3.5 h-3.5" />
            Specialist Review & Triage Cockpit
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Clearances & Manual Review Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Customer complaints awaiting specialist verification, policy clearance, or executive escalation.
          </p>
        </div>

        <button
          onClick={loadQueue}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-[#161A2E] hover:bg-[#1C213A] text-slate-200 text-xs font-semibold flex items-center gap-2 border border-white/[0.08] transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Main Finova Recent Transactions Style Card */}
      <div className="rounded-3xl p-6 bg-[#111424] border border-white/[0.09] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] space-y-5">
        {/* Top Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          {/* Smooth Pill Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterType === 'all'
                  ? 'finova-pill-active'
                  : 'text-slate-400 hover:text-white bg-[#161A2E] border border-white/5'
              }`}
            >
              All Tickets ({allCount})
            </button>

            <button
              onClick={() => setFilterType('blocked')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                filterType === 'blocked'
                  ? 'bg-gradient-to-r from-[#FF4D73] to-[#FF7B54] text-white shadow-[0_4px_15px_rgba(255,77,115,0.35)]'
                  : 'text-slate-400 hover:text-white bg-[#161A2E] border border-white/5'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-[#FF4D73]" />
              <span>Quarantined ({blockedCount})</span>
            </button>

            <button
              onClick={() => setFilterType('p1')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                filterType === 'p1'
                  ? 'bg-gradient-to-r from-[#FF7B54] to-[#F59E0B] text-white shadow-[0_4px_15px_rgba(255,123,84,0.35)]'
                  : 'text-slate-400 hover:text-white bg-[#161A2E] border border-white/5'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#FF7B54]" />
              <span>P1 Critical ({p1Count})</span>
            </button>

            <button
              onClick={() => setFilterType('cleared')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                filterType === 'cleared'
                  ? 'bg-gradient-to-r from-[#059669] to-[#10B981] text-white shadow-[0_4px_15px_rgba(16,185,129,0.35)]'
                  : 'text-slate-400 hover:text-white bg-[#161A2E] border border-white/5'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Cleared ({clearedCount})</span>
            </button>
          </div>

          {/* Embedded Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, customer, order..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#161A2E] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7947EA] font-sans"
            />
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 tracking-wider pb-4 border-b border-white/[0.06] uppercase">
                <th className="py-3 px-4">Item & Case</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <div className="w-7 h-7 border-2 border-[#7947EA] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <span className="font-mono text-xs">Scanning exception queue...</span>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <ShieldAlert className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white">No tickets matching current filter.</p>
                    <p className="text-xs text-slate-400 mt-1">All tickets in this category have been verified or resolved.</p>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => {
                  const priorityDot = 
                    t.final_priority === 'P1' ? 'bg-[#FF4D73] shadow-[0_0_8px_rgba(255,77,115,0.6)] text-[#FF4D73]' :
                    t.final_priority === 'P2' ? 'bg-[#FF7B54] text-[#FF7B54]' :
                    t.final_priority === 'P3' ? 'bg-[#4F46E5] text-[#818CF8]' :
                    'bg-slate-400 text-slate-400';

                  return (
                    <tr 
                      key={t.complaint_id} 
                      className="hover:bg-[#161A2E]/80 transition-colors group"
                    >
                      {/* Item Icon (Squircle container) & Case Title */}
                      <td className="py-4.5 px-4">
                        <div className="flex items-center gap-3.5">
                          {t.product_image_url ? (
                            <img 
                              src={t.product_image_url} 
                              alt={t.product_name || 'Product'} 
                              className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#7947EA]/10 border border-[#7947EA]/20 text-[#C084FC] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0 max-w-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-white">
                                {t.complaint_id}
                              </span>
                              {t.evidence_image_url && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-[#FF4D73]">
                                  <Camera className="w-3 h-3" />
                                  Photo
                                </span>
                              )}
                            </div>
                            <div className="font-medium text-slate-200 text-xs truncate mt-0.5" title={t.complaint_title}>
                              {t.complaint_title}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Customer & Order */}
                      <td className="py-4.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-white">{t.customer_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Order #{t.order_reference || t.order_id || 'N/A'}
                        </div>
                      </td>

                      {/* Priority Dot & Badge */}
                      <td className="py-4.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${priorityDot.split(' ')[0]}`}></span>
                          <span className="font-mono font-bold text-xs text-white">
                            {t.final_priority || 'P3'}
                          </span>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-4.5 px-4 whitespace-nowrap font-mono text-slate-300 text-[11px]">
                        {t.assigned_department}
                      </td>

                      {/* Status */}
                      <td className="py-4.5 px-4 whitespace-nowrap">
                        <StatusBadge status={t.status} />
                      </td>

                      {/* Action */}
                      <td className="py-4.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onInspectTicket(t.complaint_id)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#161A2E] hover:bg-[#1C213A] text-slate-200 hover:text-white border border-white/10 transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs group-hover:border-[#7947EA]/40"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#7947EA]" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
