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
  FileSpreadsheet
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
  Positive: '#10B981',      // Emerald
  Neutral: '#64748B',       // Slate
  Negative: '#F59E0B',      // Amber
  'Severely Distressed': '#EF4444' // Red
};

export function ExecutiveDashboard() {
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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-mono text-slate-400">Aggregating executive resolution analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            Executive Intelligence & Operational Telemetry
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Autonomous Resolution & Governance Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time compliance monitoring, dual-pipeline mismatch mitigation, and SLA governance analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <a
            href={getExportUrl('csv')}
            download="supportnova_complaint_report.csv"
            className="px-3.5 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 border border-cyan-500/30 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
          <a
            href={getExportUrl('excel')}
            download="supportnova_complaint_report.csv"
            className="px-3.5 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </a>
          <button
            onClick={loadData}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Volume */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Intake Complaints</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {metrics.total_complaints}
          </div>
          <div className="text-[11px] text-cyan-400/80 font-mono">
            {metrics.verified_count} auto-verified cleanly
          </div>
        </div>

        {/* Card 2: Dispatch Blocked / Review */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Dispatch Blocked Rate</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-red-400">
            {metrics.total_complaints > 0 ? Math.round((metrics.dispatch_blocked_count / metrics.total_complaints) * 100) : 0}%
          </div>
          <div className="text-[11px] text-slate-400">
            {metrics.dispatch_blocked_count} tickets quarantined by Pipeline 2
          </div>
        </div>

        {/* Card 3: Hallucination / Citation Error Rate */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Hallucination / Outdated Rate</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <FileX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-purple-400">
            {metrics.hallucination_rate}%
          </div>
          <div className="text-[11px] text-slate-400">
            Caught and stopped before dispatch
          </div>
        </div>

        {/* Card 4: SLA Compliance Rate */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>SLA Performance Score</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {metrics.sla_compliance_rate}%
          </div>
          <div className="text-[11px] text-slate-400">
            Strict ground-truth SLA adherence
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Sentiment Breakdown Donut */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-cyan-400" />
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
                      fill={SENTIMENT_COLORS[entry.name] || '#64748B'} 
                      stroke="#0B0F19"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(val) => <span className="text-xs text-slate-300 font-medium">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Department Routing Volume */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Department Routing Volume
              </h3>
              <p className="text-[11px] text-slate-400">Validated ground-truth department distribution</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.department_volume} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
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
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Bar 
                  dataKey="tickets" 
                  fill="#06B6D4" 
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
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              SLA Priority Tiers
            </h3>
            <span className="text-[11px] font-mono text-slate-400">P1 to P4</span>
          </div>

          <div className="space-y-3">
            {metrics.priority_breakdown.map((p) => {
              const total = metrics.total_complaints || 1;
              const pct = Math.round((p.count / total) * 100);
              const colorMap = {
                P1: 'bg-red-500',
                P2: 'bg-amber-500',
                P3: 'bg-blue-500',
                P4: 'bg-slate-600'
              };
              return (
                <div key={p.priority} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-mono font-bold text-slate-200">{p.priority} Priority</span>
                    <span className="text-slate-400 font-mono">{p.count} tickets ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-dark-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colorMap[p.priority] || 'bg-cyan-500'}`} 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dual-Pipeline Accuracy & Coverage */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Dual-Pipeline Autonomous Governance Metrics
            </h3>
            <span className="text-[11px] font-mono text-emerald-400">TechWiz 7 Standards</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-dark-900/80 border border-slate-800 text-center">
              <div className="text-2xl font-extrabold text-cyan-400">
                {metrics.average_coverage_score}%
              </div>
              <div className="text-xs font-semibold text-slate-200 mt-1">Average Requirement Coverage</div>
              <p className="text-[10px] text-slate-400 mt-1">Mandatory policy compliance score</p>
            </div>

            <div className="p-4 rounded-xl bg-dark-900/80 border border-slate-800 text-center">
              <div className="text-2xl font-extrabold text-emerald-400">
                {metrics.average_traceability_score}%
              </div>
              <div className="text-xs font-semibold text-slate-200 mt-1">Average Source Traceability</div>
              <p className="text-[10px] text-slate-400 mt-1">Active SQLite citation verification</p>
            </div>

            <div className="p-4 rounded-xl bg-dark-900/80 border border-slate-800 text-center">
              <div className="text-2xl font-extrabold text-indigo-400">
                {metrics.average_routing_score}%
              </div>
              <div className="text-xs font-semibold text-slate-200 mt-1">Average Routing Consistency</div>
              <p className="text-[10px] text-slate-400 mt-1">Organizational rule boundary match</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
