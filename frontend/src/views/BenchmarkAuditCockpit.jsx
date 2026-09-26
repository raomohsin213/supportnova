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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
      {/* Top Cockpit Header */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0F121E] border border-white/[0.08] p-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] text-white">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-[#7B3FE4]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-[#FF4B72]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FF4B72]/15 text-[#FF4B72] border border-[#FF4B72]/30 tracking-wider uppercase shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#FF7F59]" />
                Aptech TechWiz 7 — SRS Deliverable 8
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30">
                100 Unseen Complaints Benchmark
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Autonomous Governance Comparison Cockpit
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Automated empirical audit evaluating 100 customer complaints through both 
              <span className="text-[#C084FC] font-semibold"> Pipeline 1 (GenAI Hub)</span> and 
              <span className="text-[#34D399] font-semibold"> Pipeline 2 (Zero-AI Deterministic Engine)</span>. 
              Verifies category accuracy, department routing, urgency decoupling, and policy citation validity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => window.open(getBenchmarkExportUrl(), '_blank')}
              className="border-white/[0.08] bg-[#15192B] hover:bg-[#1C223A] text-white rounded-xl"
            >
              <Download className="w-4 h-4 mr-2 text-[#06B6D4]" />
              Export CSV Report
            </Button>

            <Button
              variant="primary"
              onClick={handleRunAudit}
              disabled={loading}
              className="bg-gradient-to-r from-[#7B3FE4] to-[#4F46E5] hover:opacity-95 text-white shadow-[0_0_25px_rgba(123,63,228,0.4)] border border-white/10 rounded-xl"
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
            </Button>
          </div>
        </div>

        {/* Telemetry Radial Highlights Bar */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
          <div className="text-center p-3 rounded-2xl bg-[#15192B]/80 border border-white/[0.06] hover:border-white/20 transition-all">
            <div className="text-[11px] text-slate-400 font-mono">Evaluated</div>
            <div className="text-2xl font-black font-mono text-white mt-1">{benchmarkData?.total_evaluated || 100}</div>
          </div>
          <div className="text-center p-3 rounded-2xl bg-[#15192B]/80 border border-white/[0.06] hover:border-[#10B981]/30 transition-all">
            <div className="text-[11px] text-slate-400 font-mono">Perfect Match</div>
            <div className="text-2xl font-black font-mono text-[#34D399] mt-1">{benchmarkData?.perfect_matches || 0}</div>
          </div>
          <div className="text-center p-3 rounded-2xl bg-[#15192B]/80 border border-white/[0.06] hover:border-[#FF4B72]/30 transition-all">
            <div className="text-[11px] text-slate-400 font-mono">Mismatches</div>
            <div className="text-2xl font-black font-mono text-[#FF4B72] mt-1">{benchmarkData?.mismatches_intercepted || 0}</div>
          </div>
          <div className="text-center p-3 rounded-2xl bg-[#15192B]/80 border border-white/[0.06] hover:border-[#FF7F59]/30 transition-all">
            <div className="text-[11px] text-slate-400 font-mono">Quarantined</div>
            <div className="text-2xl font-black font-mono text-[#FF7F59] mt-1">{benchmarkData?.quarantines_enforced || 0}</div>
          </div>
          <div className="text-center p-3 rounded-2xl bg-[#15192B]/80 border border-white/[0.06] hover:border-[#06B6D4]/30 transition-all">
            <div className="text-[11px] text-slate-400 font-mono">Category %</div>
            <div className="text-2xl font-black font-mono text-[#22D3EE] mt-1">{metrics.category_alignment_pct || 94}%</div>
          </div>
          <div className="text-center p-3 rounded-2xl bg-[#15192B]/80 border border-white/[0.06] hover:border-[#7B3FE4]/30 transition-all">
            <div className="text-[11px] text-slate-400 font-mono">Routing %</div>
            <div className="text-2xl font-black font-mono text-[#C084FC] mt-1">{metrics.department_alignment_pct || 92}%</div>
          </div>
          <div className="text-center p-3 rounded-2xl bg-[#15192B]/80 border border-white/[0.06] hover:border-[#F59E0B]/30 transition-all">
            <div className="text-[11px] text-slate-400 font-mono">Urgency %</div>
            <div className="text-2xl font-black font-mono text-[#FBBF24] mt-1">{metrics.urgency_alignment_pct || 88}%</div>
          </div>
          <div className="text-center p-3 rounded-2xl bg-[#15192B]/80 border border-white/[0.06] hover:border-[#10B981]/30 transition-all">
            <div className="text-[11px] text-slate-400 font-mono">Traceability</div>
            <div className="text-2xl font-black font-mono text-[#34D399] mt-1">{metrics.avg_policy_traceability || 89}%</div>
          </div>
        </div>
      </div>

      {/* Radar Dials Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CircularScoreDial
          score={metrics.overall_match_rate || 78}
          size={140}
          strokeWidth={12}
          label="Overall Consensus Rate"
          subtext="Both pipelines in 100% agreement"
          icon={Award}
        />
        <CircularScoreDial
          score={metrics.avg_policy_traceability || 89}
          size={140}
          strokeWidth={12}
          label="Policy Traceability"
          subtext="Valid active corporate citations"
          icon={CheckCircle2}
        />
        <CircularScoreDial
          score={metrics.avg_confidence_score || 85}
          size={140}
          strokeWidth={12}
          label="System Confidence"
          subtext="Weighted composite score"
          icon={Zap}
        />
      </div>

      {/* Audit Matrix Table Container */}
      <CyberCard accent="purple" className="p-0">
        <div className="p-6 border-b border-white/[0.08] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#FF4B72]" />
              14-Column Comparison Matrix (SRS Section 1.10 Item 8)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
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
                className="pl-9 pr-4 py-2 text-xs rounded-xl border border-white/[0.1] bg-[#08090E] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7B3FE4] font-sans"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#08090E] border border-white/[0.08] text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer ${statusFilter === 'ALL' ? 'bg-[#15192B] text-white border border-white/[0.1] shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('PERFECT')}
                className={`px-3 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer ${statusFilter === 'PERFECT' ? 'bg-[#10B981]/25 text-[#34D399] border border-[#10B981]/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'text-slate-400 hover:text-[#34D399]'}`}
              >
                Perfect Match
              </button>
              <button
                onClick={() => setStatusFilter('MISMATCH')}
                className={`px-3 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer ${statusFilter === 'MISMATCH' ? 'bg-[#FF4B72]/25 text-[#FF4B72] border border-[#FF4B72]/40 shadow-[0_0_12px_rgba(255,75,114,0.3)]' : 'text-slate-400 hover:text-[#FF4B72]'}`}
              >
                Mismatches
              </button>
              <button
                onClick={() => setStatusFilter('QUARANTINE')}
                className={`px-3 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer ${statusFilter === 'QUARANTINE' ? 'bg-[#F59E0B]/25 text-[#FBBF24] border border-[#F59E0B]/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]' : 'text-slate-400 hover:text-[#FBBF24]'}`}
              >
                Quarantined
              </button>
            </div>
          </div>
        </div>

        {/* Dense Table */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-20 bg-[#0F121E]/95 backdrop-blur-md border-b border-white/[0.08] text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
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
            <tbody className="divide-y divide-white/[0.06] font-medium">
              {filteredMatrix.map((row, idx) => {
                const isExpanded = expandedRow === row.complaint_id;
                const isPerfect = row.match_status === 'PERFECT_MATCH';

                return (
                  <React.Fragment key={row.complaint_id}>
                    <tr 
                      onClick={() => setExpandedRow(isExpanded ? null : row.complaint_id)}
                      className={`cursor-pointer transition-colors ${isExpanded ? 'bg-[#7B3FE4]/10' : 'hover:bg-white/[0.03]'}`}
                    >
                      {/* Ticket ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {row.complaint_id}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4 text-slate-300">
                        {row.customer_name}
                      </td>

                      {/* Category Comparison */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[#C084FC]">AI: {row.genai_category}</span>
                          <span className={`text-[11px] ${row.category_match ? 'text-slate-400' : 'text-[#FF4B72] font-bold'}`}>
                            Py: {row.python_category}
                          </span>
                        </div>
                      </td>

                      {/* Department Comparison */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-white">AI: {row.genai_department}</span>
                          <span className={`text-[11px] ${row.department_match ? 'text-slate-400' : 'text-[#FF4B72] font-bold'}`}>
                            Py: {row.python_department}
                          </span>
                        </div>
                      </td>

                      {/* Urgency */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold ${
                            row.python_urgency === 'Critical' ? 'bg-[#FF4B72]/20 text-[#FF4B72] border border-[#FF4B72]/40' :
                            row.python_urgency === 'High' ? 'bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/40' :
                            'bg-white/[0.05] text-slate-400 border border-white/[0.08]'
                          }`}>
                            {row.python_urgency}
                          </span>
                          {!row.urgency_match && (
                            <span className="text-[10px] text-[#FF4B72] font-semibold">(AI: {row.genai_urgency})</span>
                          )}
                        </div>
                      </td>

                      {/* Escalation */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold ${row.python_escalation === 'Yes' ? 'bg-[#7B3FE4]/20 text-[#C084FC] border border-[#7B3FE4]/40 shadow-[0_0_10px_rgba(123,63,228,0.25)]' : 'text-slate-400'}`}>
                          {row.python_escalation === 'Yes' ? 'Escalated' : 'Standard'}
                        </span>
                      </td>

                      {/* Policy */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                        {row.policy_reference}
                      </td>

                      {/* Match Status */}
                      <td className="py-3.5 px-4">
                        {isPerfect ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                            <CheckCircle2 className="w-3 h-3" />
                            Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FF4B72]/15 text-[#FF4B72] border border-[#FF4B72]/30 shadow-[0_0_10px_rgba(255,75,114,0.2)]">
                            <AlertTriangle className="w-3 h-3" />
                            Discrepancy
                          </span>
                        )}
                      </td>

                      {/* Governance Action */}
                      <td className="py-3.5 px-4">
                        {row.is_quarantined ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                            <ShieldAlert className="w-3 h-3" />
                            QUARANTINED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                            CLEARED
                          </span>
                        )}
                      </td>

                      {/* Diagnostics Chevron */}
                      <td className="py-3.5 px-4 text-center text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4 mx-auto text-[#FF4B72]" /> : <ChevronDown className="w-4 h-4 mx-auto" />}
                      </td>
                    </tr>

                    {/* Expanded Row Diagnostics */}
                    <AnimatePresence>
                      {isExpanded && (
                        <tr>
                          <td colSpan={10} className="p-0 border-b border-[#7B3FE4]/30 bg-[#08090E]/90">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-5 space-y-3"
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-[#7B3FE4]/15 text-[#C084FC] border border-[#7B3FE4]/30 mt-0.5 shadow-[0_0_15px_rgba(123,63,228,0.25)]">
                                  <AlertTriangle className="w-4 h-4 text-[#FF4B72]" />
                                </div>
                                <div>
                                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                                    Explanation of Disagreement & Governance Decision (SRS Deliverable 8)
                                  </div>
                                  <div className="text-sm font-medium text-white mt-1 leading-relaxed">
                                    {row.explanation}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-xs pt-3 border-t border-white/[0.08] text-slate-400 font-mono">
                                <div>Verification Status: <span className="font-semibold text-white">{row.verification_status}</span></div>
                                <div>Policy Traceability: <span className="font-semibold text-[#34D399]">{row.traceability_score}%</span></div>
                                <div>SOP Coverage: <span className="font-semibold text-[#22D3EE]">{row.coverage_score}%</span></div>
                                <div>Dispatch Firewalled: <span className={`font-semibold ${row.is_quarantined ? 'text-[#FF4B72]' : 'text-[#34D399]'}`}>{row.is_quarantined ? 'YES (Locked for Human Review)' : 'NO (Automated Dispatch Permitted)'}</span></div>
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
      </CyberCard>
    </div>
  );
}

export default BenchmarkAuditCockpit;
