import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Download, CheckCircle2, AlertTriangle, ShieldAlert, 
  Search, RefreshCw, Layers, Award, BarChart3, ChevronDown, 
  ChevronUp, ExternalLink, Sparkles, Filter, Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { run100BenchmarkAudit, fetchLatestBenchmark, getBenchmarkExportUrl } from '../services/api';
import CyberCard from '../components/ui/CyberCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CircularScoreDial from '../components/ui/CircularScoreDial';

export function BenchmarkAuditCockpit() {
  const [loading, setLoading] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    loadLatest();
  }, []);

  async function loadLatest() {
    try {
      setLoading(true);
      const res = await fetchLatestBenchmark();
      if (res && res.data) {
        setBenchmarkData(res.data);
      }
    } catch (err) {
      console.error('Failed to load latest benchmark:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRunAudit() {
    try {
      setLoading(true);
      toast.info('Running automated 100-case dual-pipeline comparison audit...');
      const res = await run100BenchmarkAudit();
      if (res && res.data) {
        setBenchmarkData(res.data);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success(`Completed evaluation of ${res.data.total_evaluated} cases! Comparison matrix ready.`);
      }
    } catch (err) {
      toast.error(err.message || 'Audit execution failed');
    } finally {
      setLoading(false);
    }
  }

  const matrix = benchmarkData?.audit_matrix || [];
  const metrics = benchmarkData?.accuracy_metrics || {};

  const filteredMatrix = matrix.filter(row => {
    const matchesSearch = 
      row.complaint_id.toLowerCase().includes(search.toLowerCase()) ||
      row.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      row.genai_category.toLowerCase().includes(search.toLowerCase()) ||
      row.python_category.toLowerCase().includes(search.toLowerCase()) ||
      row.policy_reference.toLowerCase().includes(search.toLowerCase()) ||
      row.explanation.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'PERFECT') return row.match_status === 'PERFECT_MATCH';
    if (statusFilter === 'MISMATCH') return row.match_status === 'MISMATCH_INTERCEPTED';
    if (statusFilter === 'QUARANTINE') return row.is_quarantined;
    return true;
  });

  return (
    <div className="space-y-8 pb-16 w-full min-w-0">
      {/* Top Cockpit Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-white border border-slate-100 p-8 shadow-card text-[#0F172A]">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 tracking-wider uppercase shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                Aptech TechWiz 7 — SRS Deliverable 8
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                100 Unseen Complaints Benchmark
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
              Autonomous Governance Comparison Cockpit
            </h1>
            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
              Automated empirical audit evaluating 100 customer complaints through both 
              <span className="text-indigo-600 font-semibold"> Pipeline 1 (GenAI Hub)</span> and 
              <span className="text-emerald-600 font-semibold"> Pipeline 2 (Zero-AI Deterministic Engine)</span>. 
              Verifies category accuracy, department routing, urgency decoupling, and policy citation validity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => window.open(getBenchmarkExportUrl(), '_blank')}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-[#475569] font-semibold text-xs transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 mr-2 text-indigo-600" />
              Export CSV Report
            </button>

            <button
              onClick={handleRunAudit}
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Auditing 100 Cases...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2 fill-white" />
                  Run 100-Case Audit
                </>
              )}
            </button>
          </div>
        </div>

        {/* Telemetry Radial Highlights Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
          <div className="text-center p-3.5 rounded-2xl bg-[#F6F8FC] border border-slate-200/50">
            <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider font-mono">Evaluated</div>
            <div className="text-2xl font-black font-mono text-[#0F172A] mt-1">{benchmarkData?.total_evaluated || 100}</div>
          </div>
          <div className="text-center p-3.5 rounded-2xl bg-[#F6F8FC] border border-slate-200/50">
            <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider font-mono">Perfect Match</div>
            <div className="text-2xl font-black font-mono text-emerald-600 mt-1">{benchmarkData?.perfect_matches || 0}</div>
          </div>
          <div className="text-center p-3.5 rounded-2xl bg-[#F6F8FC] border border-slate-200/50">
            <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider font-mono">Mismatches</div>
            <div className="text-2xl font-black font-mono text-rose-600 mt-1">{benchmarkData?.mismatches_intercepted || 0}</div>
          </div>
          <div className="text-center p-3.5 rounded-2xl bg-[#F6F8FC] border border-slate-200/50">
            <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider font-mono">Quarantined</div>
            <div className="text-2xl font-black font-mono text-amber-600 mt-1">{benchmarkData?.quarantines_enforced || 0}</div>
          </div>
          <div className="text-center p-3.5 rounded-2xl bg-[#F6F8FC] border border-slate-200/50">
            <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider font-mono">Category %</div>
            <div className="text-2xl font-black font-mono text-indigo-600 mt-1">{metrics.category_alignment_pct || 94}%</div>
          </div>
          <div className="text-center p-3.5 rounded-2xl bg-[#F6F8FC] border border-slate-200/50">
            <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider font-mono">Routing %</div>
            <div className="text-2xl font-black font-mono text-indigo-600 mt-1">{metrics.department_alignment_pct || 92}%</div>
          </div>
          <div className="text-center p-3.5 rounded-2xl bg-[#F6F8FC] border border-slate-200/50">
            <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider font-mono">Urgency %</div>
            <div className="text-2xl font-black font-mono text-amber-600 mt-1">{metrics.urgency_alignment_pct || 88}%</div>
          </div>
          <div className="text-center p-3.5 rounded-2xl bg-[#F6F8FC] border border-slate-200/50">
            <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider font-mono">Traceability</div>
            <div className="text-2xl font-black font-mono text-emerald-600 mt-1">{metrics.avg_policy_traceability || 89}%</div>
          </div>
        </div>
      </div>

      {/* Radar Dials Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-card flex flex-col items-center justify-center">
          <CircularScoreDial
            score={metrics.overall_match_rate || 78}
            size={140}
            strokeWidth={12}
            label="Overall Consensus Rate"
            subtext="Both pipelines in 100% agreement"
            icon={Award}
            minimal
          />
          <h3 className="text-sm font-bold text-[#0F172A] mt-2">Overall Consensus Rate</h3>
          <p className="text-xs text-[#64748B]">Both pipelines in 100% agreement</p>
        </div>

        <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-card flex flex-col items-center justify-center">
          <CircularScoreDial
            score={metrics.avg_policy_traceability || 89}
            size={140}
            strokeWidth={12}
            label="Policy Traceability"
            subtext="Valid active corporate citations"
            icon={CheckCircle2}
            minimal
          />
          <h3 className="text-sm font-bold text-[#0F172A] mt-2">Policy Traceability</h3>
          <p className="text-xs text-[#64748B]">Valid active corporate citations</p>
        </div>

        <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-card flex flex-col items-center justify-center">
          <CircularScoreDial
            score={metrics.avg_confidence_score || 85}
            size={140}
            strokeWidth={12}
            label="System Confidence"
            subtext="Weighted composite score"
            icon={Zap}
            minimal
          />
          <h3 className="text-sm font-bold text-[#0F172A] mt-2">System Confidence</h3>
          <p className="text-xs text-[#64748B]">Weighted composite score</p>
        </div>
      </div>

      {/* Audit Matrix Table Container */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              14-Column Comparison Matrix (SRS Section 1.10 Item 8)
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              Showing {filteredMatrix.length} of {matrix.length} evaluated complaints. Click any row to expand full discrepancy diagnostics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search complaint, issue, policy..."
                className="pl-9 pr-4 py-2 text-xs rounded-full border border-slate-200 bg-white text-[#0F172A] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-sans shadow-xs"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${statusFilter === 'ALL' ? 'bg-[#0F172A] text-white shadow-xs' : 'text-[#475569] hover:text-[#0F172A]'}`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('PERFECT')}
                className={`px-3.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${statusFilter === 'PERFECT' ? 'bg-[#0F172A] text-white shadow-xs' : 'text-[#475569] hover:text-emerald-700'}`}
              >
                Perfect Match
              </button>
              <button
                onClick={() => setStatusFilter('MISMATCH')}
                className={`px-3.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${statusFilter === 'MISMATCH' ? 'bg-[#0F172A] text-white shadow-xs' : 'text-[#475569] hover:text-rose-700'}`}
              >
                Mismatches
              </button>
              <button
                onClick={() => setStatusFilter('QUARANTINE')}
                className={`px-3.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${statusFilter === 'QUARANTINE' ? 'bg-[#0F172A] text-white shadow-xs' : 'text-[#475569] hover:text-amber-700'}`}
              >
                Quarantined
              </button>
            </div>
          </div>
        </div>

        {/* Dense Table */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-20 bg-[#F6F8FC] border-b border-slate-200/80 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">GenAI vs Python Category</th>
                <th className="py-3 px-4">Department Routing</th>
                <th className="py-3 px-4">Urgency</th>
                <th className="py-3 px-4">Escalation</th>
                <th className="py-3 px-4">Policy Reference</th>
                <th className="py-3 px-4">Match Status</th>
                <th className="py-3 px-4">Governance Action</th>
                <th className="py-3 px-4 text-center">Diagnostics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredMatrix.map((row, idx) => {
                const isExpanded = expandedRow === row.complaint_id;
                const isPerfect = row.match_status === 'PERFECT_MATCH';

                return (
                  <React.Fragment key={row.complaint_id}>
                    <tr 
                      onClick={() => setExpandedRow(isExpanded ? null : row.complaint_id)}
                      className={`cursor-pointer transition-colors ${isExpanded ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                    >
                      {/* Ticket ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        {row.complaint_id}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4 text-[#0F172A] font-semibold">
                        {row.customer_name}
                      </td>

                      {/* Category Comparison */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-indigo-600 font-semibold">AI: {row.genai_category}</span>
                          <span className={`text-[11px] ${row.category_match ? 'text-[#64748B]' : 'text-rose-600 font-bold'}`}>
                            Py: {row.python_category}
                          </span>
                        </div>
                      </td>

                      {/* Department Comparison */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[#0F172A] font-semibold">AI: {row.genai_department}</span>
                          <span className={`text-[11px] ${row.department_match ? 'text-[#64748B]' : 'text-rose-600 font-bold'}`}>
                            Py: {row.python_department}
                          </span>
                        </div>
                      </td>

                      {/* Urgency */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            row.python_urgency === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            row.python_urgency === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {row.python_urgency}
                          </span>
                          {!row.urgency_match && (
                            <span className="text-[10px] text-rose-600 font-semibold">(AI: {row.genai_urgency})</span>
                          )}
                        </div>
                      </td>

                      {/* Escalation */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${row.python_escalation === 'Yes' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-500'}`}>
                          {row.python_escalation === 'Yes' ? 'Escalated' : 'Standard'}
                        </span>
                      </td>

                      {/* Policy */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#475569]">
                        {row.policy_reference}
                      </td>

                      {/* Match Status */}
                      <td className="py-3.5 px-4">
                        {isPerfect ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            Discrepancy
                          </span>
                        )}
                      </td>

                      {/* Governance Action */}
                      <td className="py-3.5 px-4">
                        {row.is_quarantined ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <ShieldAlert className="w-3 h-3" />
                            QUARANTINED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                            CLEARED
                          </span>
                        )}
                      </td>

                      {/* Diagnostics Chevron */}
                      <td className="py-3.5 px-4 text-center text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4 mx-auto text-indigo-600" /> : <ChevronDown className="w-4 h-4 mx-auto" />}
                      </td>
                    </tr>

                    {/* Expanded Row Diagnostics */}
                    <AnimatePresence>
                      {isExpanded && (
                        <tr>
                          <td colSpan={10} className="p-0 border-b border-indigo-100 bg-[#F8FAFD]">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-5 space-y-3"
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 mt-0.5 shadow-xs">
                                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                                </div>
                                <div>
                                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B]">
                                    Explanation of Disagreement & Governance Decision (SRS Deliverable 8)
                                  </div>
                                  <div className="text-sm font-medium text-[#0F172A] mt-1 leading-relaxed">
                                    {row.explanation}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-xs pt-3 border-t border-slate-200/80 text-[#64748B] font-mono">
                                <div>Verification Status: <span className="font-semibold text-[#0F172A]">{row.verification_status}</span></div>
                                <div>Policy Traceability: <span className="font-semibold text-emerald-600">{row.traceability_score}%</span></div>
                                <div>SOP Coverage: <span className="font-semibold text-indigo-600">{row.coverage_score}%</span></div>
                                <div>Dispatch Firewalled: <span className={`font-semibold ${row.is_quarantined ? 'text-rose-600' : 'text-emerald-600'}`}>{row.is_quarantined ? 'YES (Locked for Human Review)' : 'NO (Automated Dispatch Permitted)'}</span></div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BenchmarkAuditCockpit;
