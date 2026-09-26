import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  PieChart as PieIcon, 
  Clock, 
  Users, 
  CheckCircle,
  FileX,
  Lock,
  RefreshCw,
  Download,
  FileSpreadsheet,
  FlaskConical,
  CopyCheck,
  Repeat
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { fetchDashboardMetrics, getExportUrl } from '../services/api';

const SENTIMENT_COLORS = {
  Positive: '#10B981',             // Finova Emerald
  Neutral: '#7B3FE4',              // Finova Violet
  Negative: '#FF7F59',             // Finova Sunset Amber
  'Severely Distressed': '#FF4B72' // Finova Coral
};

export function ExecutiveDashboard({ onNavigateToBenchmark }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-9 h-9 border-2 border-[#7B3FE4] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-mono text-slate-400">Aggregating executive resolution analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#7B3FE4]/15 to-[#FF4B72]/15 text-[#FF4B72] border border-[#7B3FE4]/30 text-xs font-mono font-bold uppercase tracking-wider mb-2 shadow-xs">
            <BarChart3 className="w-3.5 h-3.5" />
            Executive Intelligence & Operational Telemetry
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Autonomous Resolution & Governance Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time compliance monitoring, dual-pipeline mismatch mitigation, and SLA governance analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          {onNavigateToBenchmark && (
            <button
              onClick={onNavigateToBenchmark}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7B3FE4] to-[#4F46E5] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(123,63,228,0.4)] border border-white/10 cursor-pointer"
              title="Launch the 100-Case Automated Evaluation & Comparison Cockpit"
            >
              <FlaskConical className="w-3.5 h-3.5 text-[#FF7F59]" />
              <span>100-Case Audit Cockpit</span>
            </button>
          )}
          <a
            href={getExportUrl('csv')}
            download="supportnova_complaint_report.csv"
            className="px-3.5 py-2.5 rounded-xl bg-[#15192B] hover:bg-[#1C223A] text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-white/[0.08] transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>Export CSV</span>
          </a>
          <a
            href={getExportUrl('excel')}
            download="supportnova_complaint_report.csv"
            className="px-3.5 py-2.5 rounded-xl bg-[#15192B] hover:bg-[#1C223A] text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-white/[0.08] transition-colors shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Export Excel</span>
          </a>
          <button
            onClick={loadData}
            className="px-3.5 py-2.5 rounded-xl bg-[#15192B] hover:bg-[#1C223A] text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-white/[0.08] transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* TechWiz 7 Full Scale Compliance Banner */}
      <div className="p-4.5 rounded-2xl bg-gradient-to-r from-[#7B3FE4]/15 via-[#0F121E] to-[#06B6D4]/15 border border-[#7B3FE4]/30 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[0_0_25px_rgba(123,63,228,0.15)]">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#7B3FE4] to-[#4F46E5] text-white font-mono font-bold text-xs flex-shrink-0 shadow-[0_0_15px_rgba(123,63,228,0.4)]">
            SRS
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Full Scale Enterprise Knowledge Base Online</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/35 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                100% Deterministic Ground-Truth
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Seeded with 500 complaint cases, 20 corporate policies across 8 departments, 100 validation rules matrix, and pure-Python duplicate & repeat escalation scanners.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 font-mono text-[11px] text-slate-300 flex-shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-[#15192B] border border-white/[0.08] font-bold text-white shadow-xs">
            500 Tickets
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#15192B] border border-white/[0.08] font-bold text-[#FF4B72] shadow-xs">
            20 Policies
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#15192B] border border-white/[0.08] font-bold text-[#34D399] shadow-xs">
            100 Rules
          </span>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Volume */}
        <div className="bg-[#111525]/85 p-5 rounded-2xl border border-white/[0.08] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl hover:border-[#7B3FE4]/35 transition-all space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Intake Complaints</span>
            <div className="p-2 rounded-xl bg-[#7B3FE4]/15 text-[#C084FC] border border-[#7B3FE4]/30 shadow-[0_0_12px_rgba(123,63,228,0.25)]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-white">
            {metrics.total_complaints}
          </div>
          <div className="text-[11px] text-[#C084FC] font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7B3FE4]"></span>
            <span>{metrics.verified_count} auto-verified cleanly</span>
          </div>
        </div>

        {/* Card 2: Dispatch Blocked / Review */}
        <div className="bg-[#111525]/85 p-5 rounded-2xl border border-white/[0.08] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl hover:border-[#FF4B72]/35 transition-all space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Dispatch Blocked Rate</span>
            <div className="p-2 rounded-xl bg-[#FF4B72]/15 text-[#FF4B72] border border-[#FF4B72]/30 shadow-[0_0_12px_rgba(255,75,114,0.25)]">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-[#FF4B72]">
            {metrics.total_complaints > 0 ? Math.round((metrics.dispatch_blocked_count / metrics.total_complaints) * 100) : 0}%
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B72]"></span>
            <span>{metrics.dispatch_blocked_count} quarantined by Pipeline 2</span>
          </div>
        </div>

        {/* Card 3: Hallucination / Citation Error Rate */}
        <div className="bg-[#111525]/85 p-5 rounded-2xl border border-white/[0.08] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl hover:border-[#FF7F59]/35 transition-all space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Hallucination / Outdated Rate</span>
            <div className="p-2 rounded-xl bg-[#FF7F59]/15 text-[#FF7F59] border border-[#FF7F59]/30 shadow-[0_0_12px_rgba(255,127,89,0.25)]">
              <FileX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-[#FF7F59]">
            {metrics.hallucination_rate}%
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF7F59]"></span>
            <span>Intercepted before dispatch</span>
          </div>
        </div>

        {/* Card 4: SLA Compliance Rate */}
        <div className="bg-[#111525]/85 p-5 rounded-2xl border border-white/[0.08] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl hover:border-[#10B981]/35 transition-all space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>SLA Performance Score</span>
            <div className="p-2 rounded-xl bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-[#34D399]">
            {metrics.sla_compliance_rate}%
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
            <span>Strict ground-truth SLA adherence</span>
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Sentiment Breakdown Donut */}
        <div className="bg-[#111525]/85 p-6 rounded-2xl border border-white/[0.08] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-[#7B3FE4]" />
                Customer Sentiment Breakdown
              </h3>
              <p className="text-[11px] text-slate-400">Extracted across all intake channels</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.sentiment_breakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {metrics.sentiment_breakdown.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={SENTIMENT_COLORS[entry.name] || '#7B3FE4'} 
                      stroke="#0F121E"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F121E', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(val) => <span className="text-xs text-slate-300 font-mono font-medium">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Department Routing Volume */}
        <div className="bg-[#111525]/85 p-6 rounded-2xl border border-white/[0.08] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#FF4B72]" />
                Department Routing Volume
              </h3>
              <p className="text-[11px] text-slate-400">Validated ground-truth department distribution</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.department_volume} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <defs>
                  <linearGradient id="finovaBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7B3FE4" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="department" 
                  stroke="#64748B" 
                  fontSize={10} 
                  angle={-15} 
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F121E', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar 
                  dataKey="tickets" 
                  fill="url(#finovaBarGrad)" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECONDARY ROW: SLA Priority Distribution & Governance Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SLA Priority Distribution */}
        <div className="bg-[#111525]/85 p-6 rounded-2xl border border-white/[0.08] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F59E0B]" />
              SLA Priority Tiers
            </h3>
            <span className="text-[11px] font-mono text-slate-400">P1 to P4</span>
          </div>

          <div className="space-y-3.5">
            {metrics.priority_breakdown.map((p) => {
              const total = metrics.total_complaints || 1;
              const pct = Math.round((p.count / total) * 100);
              const colorMap = {
                P1: 'bg-gradient-to-r from-[#FF4B72] to-[#FF7F59]',
                P2: 'bg-gradient-to-r from-[#F59E0B] to-[#FF7F59]',
                P3: 'bg-gradient-to-r from-[#06B6D4] to-[#3B82F6]',
                P4: 'bg-gradient-to-r from-[#7B3FE4] to-[#4F46E5]'
              };
              return (
                <div key={p.priority} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="font-bold text-slate-200">{p.priority} Priority</span>
                    <span className="text-slate-400">{p.count} tickets ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-[#08090E] rounded-full overflow-hidden border border-white/[0.06]">
                    <div 
                      className={`h-full ${colorMap[p.priority] || 'bg-[#7B3FE4]'}`} 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dual-Pipeline Accuracy & Coverage */}
        <div className="bg-[#111525]/85 p-6 rounded-2xl border border-white/[0.08] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              Dual-Pipeline Autonomous Governance Metrics
            </h3>
            <span className="text-[11px] font-mono text-[#10B981] font-bold">TechWiz 7 Standards</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#08090E]/60 border border-white/[0.06] text-center hover:border-[#7B3FE4]/35 transition-all">
              <div className="text-2xl font-black font-mono text-[#C084FC]">
                {metrics.average_coverage_score}%
              </div>
              <div className="text-xs font-bold text-white mt-1">Average Requirement Coverage</div>
              <p className="text-[10px] text-slate-400 mt-1">Mandatory policy compliance score</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#08090E]/60 border border-white/[0.06] text-center hover:border-[#10B981]/35 transition-all">
              <div className="text-2xl font-black font-mono text-[#34D399]">
                {metrics.average_traceability_score}%
              </div>
              <div className="text-xs font-bold text-white mt-1">Average Source Traceability</div>
              <p className="text-[10px] text-slate-400 mt-1">Active SQLite citation verification</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#08090E]/60 border border-white/[0.06] text-center hover:border-[#06B6D4]/35 transition-all">
              <div className="text-2xl font-black font-mono text-[#22D3EE]">
                {metrics.average_routing_score}%
              </div>
              <div className="text-xs font-bold text-white mt-1">Average Routing Consistency</div>
              <p className="text-[10px] text-slate-400 mt-1">Organizational rule boundary match</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
