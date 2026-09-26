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
  CheckCircle2,
  Filter
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
    <div className="max-w-7xl mx-auto space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-mono font-bold uppercase tracking-wider mb-2 shadow-xs whitespace-nowrap">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-indigo-600" />
            <span>Specialist Review & Triage Cockpit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight truncate">
            Clearances & Manual Review Queue
          </h1>
          <p className="text-xs text-[#64748B] mt-1 truncate">
            Customer complaints awaiting specialist verification, policy clearance, or executive escalation.
          </p>
        </div>

        <button
          onClick={loadQueue}
          className="self-start sm:self-auto px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-[#0F172A] text-xs font-semibold flex items-center gap-2 border border-slate-200 transition-all cursor-pointer shadow-xs shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Main Soft-Modern White Table Card */}
      <div className="rounded-[28px] p-5 sm:p-6 bg-white border border-slate-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04)] space-y-4 w-full min-w-0">
        {/* Top Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-slate-100 w-full min-w-0">
          {/* Smooth Pill Filter Tabs (Jobtrain Spec) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none min-w-0 flex-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                filterType === 'all'
                  ? 'bg-[#0F172A] text-white shadow-sm'
                  : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
              }`}
            >
              All ({allCount})
            </button>

            <button
              onClick={() => setFilterType('blocked')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
                filterType === 'blocked'
                  ? 'bg-[#BE123C] text-white shadow-sm'
                  : 'bg-[#FFF1F2] text-[#BE123C] hover:bg-[#FFE4E6]'
              }`}
            >
              <Lock className="w-3 h-3 shrink-0" />
              <span>Quarantined ({blockedCount})</span>
            </button>

            <button
              onClick={() => setFilterType('p1')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
                filterType === 'p1'
                  ? 'bg-[#B45309] text-white shadow-sm'
                  : 'bg-[#FFFBEB] text-[#B45309] hover:bg-[#FEF3C7]'
              }`}
            >
              <Flame className="w-3 h-3 shrink-0" />
              <span>P1 Critical ({p1Count})</span>
            </button>

            <button
              onClick={() => setFilterType('cleared')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
                filterType === 'cleared'
                  ? 'bg-[#047857] text-white shadow-sm'
                  : 'bg-[#ECFDF5] text-[#047857] hover:bg-[#D1FAE5]'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>Cleared ({clearedCount})</span>
            </button>
          </div>

          {/* Embedded Pill Search Bar */}
          <div className="relative w-full md:w-60 lg:w-72 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, customer, order..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full bg-[#F6F8FC] border border-slate-200/80 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#4F46E5] font-sans transition-all shadow-xs"
            />
          </div>
        </div>

        {/* The Clean Light Table with all 6 columns visible */}
        <div className="overflow-x-auto w-full rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="text-xs font-semibold text-[#64748B] tracking-wider pb-3 border-b border-slate-100 uppercase bg-[#F8FAFC]">
                <th className="py-3 px-3.5 min-w-[200px]">Item & Case</th>
                <th className="py-3 px-2.5 min-w-[120px]">Customer</th>
                <th className="py-3 px-2 w-14">Priority</th>
                <th className="py-3 px-2.5 min-w-[110px]">Department</th>
                <th className="py-3 px-2.5 min-w-[120px]">Status</th>
                <th className="py-3 px-3 w-20 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <div className="w-7 h-7 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <span className="font-mono text-xs text-slate-500">Scanning exception queue...</span>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-800">No tickets matching current filter.</p>
                    <p className="text-xs text-slate-500 mt-1">All tickets in this category have been verified or resolved.</p>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => {
                  const priorityDot = 
                    t.final_priority === 'P1' ? 'bg-[#F43F5E]' :
                    t.final_priority === 'P2' ? 'bg-[#FB923C]' :
                    t.final_priority === 'P3' ? 'bg-[#4F46E5]' :
                    'bg-slate-400';

                  return (
                    <tr 
                      key={t.complaint_id} 
                      className="hover:bg-[#F8FAFC] transition-colors group"
                    >
                      {/* Item Icon (Squircle container) & Case Title */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          {t.product_image_url ? (
                            <img 
                              src={t.product_image_url} 
                              alt={t.product_name || 'Product'} 
                              className="w-8 h-8 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Package className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className="min-w-0 max-w-[200px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-[#0F172A]">
                                {t.complaint_id}
                              </span>
                              {t.evidence_image_url && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold font-mono text-[#F43F5E] bg-rose-50 px-1.5 py-0.5 rounded-full">
                                  <Camera className="w-2.5 h-2.5" />
                                  Photo
                                </span>
                              )}
                            </div>
                            <div className="font-medium text-[#334155] text-xs truncate mt-0.5" title={t.complaint_title}>
                              {t.complaint_title}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Customer & Order */}
                      <td className="py-3.5 px-2.5 whitespace-nowrap">
                        <div className="font-bold text-[#0F172A] truncate max-w-[110px]">{t.customer_name}</div>
                        <div className="text-[10px] text-[#64748B] font-mono">
                          Order #{t.order_reference || t.order_id || 'N/A'}
                        </div>
                      </td>

                      {/* Priority Dot & Badge */}
                      <td className="py-3.5 px-2 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${priorityDot}`}></span>
                          <span className="font-mono font-bold text-xs text-[#0F172A]">
                            {t.final_priority || 'P3'}
                          </span>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-2.5 whitespace-nowrap font-mono text-[#475569] text-[11px] truncate max-w-[110px]">
                        {t.assigned_department}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-2.5 whitespace-nowrap">
                        <StatusBadge status={t.status} />
                      </td>

                      {/* Action Pill Button */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onInspectTicket(t.complaint_id)}
                          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100 transition-all inline-flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
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
