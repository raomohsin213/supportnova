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
    <div className="max-w-7xl mx-auto space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-[28px] border border-slate-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-mono font-bold uppercase tracking-wider mb-2 shadow-xs">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
            Executive Intelligence & Operational Telemetry
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Autonomous Resolution & Governance Dashboard
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Real-time compliance monitoring, dual-pipeline mismatch mitigation, and SLA governance analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          {onNavigateToBenchmark && (
            <button
              onClick={onNavigateToBenchmark}
              className="px-5 py-2.5 rounded-full bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Launch the 100-Case Automated Evaluation & Comparison Cockpit"
            >
              <FlaskConical className="w-3.5 h-3.5 text-[#FB923C]" />
              <span>100-Case Audit Cockpit</span>
            </button>
          )}
          <a
            href={getExportUrl('csv')}
            download="supportnova_complaint_report.csv"
            className="px-4 py-2.5 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-xs font-semibold flex items-center gap-1.5 border border-slate-200/80 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export CSV</span>
          </a>
          <a
            href={getExportUrl('excel')}
            download="supportnova_complaint_report.csv"
            className="px-4 py-2.5 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-xs font-semibold flex items-center gap-1.5 border border-slate-200/80 transition-colors shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#047857]" />
            <span>Export Excel</span>
          </a>
          <button
            onClick={loadData}
            className="p-2.5 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-600 border border-slate-200/80 transition-colors shadow-xs cursor-pointer"
            title="Reload metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Full Scale Compliance Banner */}
      <div className="p-5 rounded-[28px] bg-white border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono font-bold text-xs flex-shrink-0 shadow-xs">
            SRS
          </div>
          <div>
            <div className="text-xs font-bold text-[#0F172A] flex items-center gap-2">
              <span>Full Scale Enterprise Knowledge Base Online</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] font-bold">
                100% Deterministic Ground-Truth
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
              Seeded with 500 complaint cases, 20 corporate policies across 8 departments, 100 validation rules matrix, and pure-Python duplicate & repeat escalation scanners.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#334155] flex-shrink-0">
          <span className="px-3.5 py-1.5 rounded-full bg-[#F6F8FC] border border-slate-200/60 font-bold text-[#0F172A] shadow-xs">
            500 Tickets
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-[#F6F8FC] border border-slate-200/60 font-bold text-[#F43F5E] shadow-xs">
            20 Policies
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-[#F6F8FC] border border-slate-200/60 font-bold text-[#047857] shadow-xs">
            100 Rules
          </span>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Volume */}
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04)] hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Total Intake Complaints</span>
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-[#0F172A]">
            {metrics.total_complaints}
          </div>
          <div className="text-[11px] text-indigo-700 font-mono flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            <span>{metrics.verified_count} auto-verified cleanly</span>
          </div>
        </div>

        {/* Card 2: Dispatch Blocked / Review */}
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04)] hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Dispatch Blocked Rate</span>
            <div className="p-2.5 rounded-2xl bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3] shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-[#BE123C]">
            {metrics.total_complaints > 0 ? Math.round((metrics.dispatch_blocked_count / metrics.total_complaints) * 100) : 0}%
          </div>
          <div className="text-[11px] text-[#64748B] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BE123C]"></span>
            <span>{metrics.dispatch_blocked_count} quarantined by Pipeline 2</span>
          </div>
        </div>

        {/* Card 3: Hallucination / Citation Error Rate */}
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04)] hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Hallucination / Outdated Rate</span>
            <div className="p-2.5 rounded-2xl bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] shadow-xs">
              <FileX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-[#B45309]">
            {metrics.hallucination_rate}%
          </div>
          <div className="text-[11px] text-[#64748B] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]"></span>
            <span>Intercepted before dispatch</span>
          </div>
        </div>

        {/* Card 4: SLA Compliance Rate */}
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04)] hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">SLA Performance Score</span>
            <div className="p-2.5 rounded-2xl bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-[#047857]">
            {metrics.sla_compliance_rate}%
          </div>
          <div className="text-[11px] text-[#64748B] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#047857]"></span>
            <span>Strict ground-truth SLA adherence</span>
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Sentiment Breakdown Donut */}
        <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-slate-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-indigo-600" />
                Customer Sentiment Breakdown
              </h3>
              <p className="text-[11px] text-[#64748B]">Extracted across all intake channels</p>
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
                      fill={SENTIMENT_COLORS[entry.name] || '#4F46E5'} 
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '16px', fontSize: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)', color: '#0F172A' }}
                  itemStyle={{ color: '#0F172A' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(val) => <span className="text-xs text-[#475569] font-mono font-medium">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Department Routing Volume */}
        <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-slate-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Department Routing Volume
              </h3>
              <p className="text-[11px] text-[#64748B]">Validated ground-truth department distribution</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.department_volume} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <defs>
                  <linearGradient id="finovaBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={1} />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="department" 
                  stroke="#94A3B8" 
                  fontSize={10} 
                  angle={-15} 
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '16px', fontSize: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)', color: '#0F172A' }}
                  itemStyle={{ color: '#0F172A' }}
                />
                <Bar 
                  dataKey="tickets" 
                  fill="url(#finovaBarGrad)" 
                  radius={[8, 8, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECONDARY ROW: SLA Priority Distribution & Governance Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SLA Priority Distribution */}
        <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-slate-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FB923C]" />
              SLA Priority Tiers
            </h3>
            <span className="text-[11px] font-mono text-[#64748B]">P1 to P4</span>
          </div>

          <div className="space-y-3.5">
            {metrics.priority_breakdown.map((p) => {
              const total = metrics.total_complaints || 1;
              const pct = Math.round((p.count / total) * 100);
              const colorMap = {
                P1: 'bg-[#F43F5E]',
                P2: 'bg-[#FB923C]',
                P3: 'bg-[#2563EB]',
                P4: 'bg-[#7C3AED]'
              };
              return (
                <div key={p.priority} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="font-bold text-[#0F172A]">{p.priority} Priority</span>
                    <span className="text-[#64748B]">{p.count} tickets ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden border border-slate-200/50">
                    <div 
                      className={`h-full rounded-full ${colorMap[p.priority] || 'bg-indigo-600'}`} 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dual-Pipeline Accuracy & Coverage */}
        <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-slate-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04)] space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#047857]" />
              Dual-Pipeline Autonomous Governance Metrics
            </h3>
            <span className="text-[11px] font-mono text-[#047857] font-bold">TechWiz 7 Standards</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-[#F6F8FC] border border-slate-200/50 text-center">
              <div className="text-3xl font-black font-mono text-indigo-600">
                {metrics.average_coverage_score}%
              </div>
              <div className="text-xs font-bold text-[#0F172A] mt-1.5">Average Requirement Coverage</div>
              <p className="text-[10px] text-[#64748B] mt-1">Mandatory policy compliance score</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F6F8FC] border border-slate-200/50 text-center">
              <div className="text-3xl font-black font-mono text-[#047857]">
                {metrics.average_traceability_score}%
              </div>
              <div className="text-xs font-bold text-[#0F172A] mt-1.5">Average Source Traceability</div>
              <p className="text-[10px] text-[#64748B] mt-1">Active SQLite citation verification</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F6F8FC] border border-slate-200/50 text-center">
              <div className="text-3xl font-black font-mono text-[#2563EB]">
                {metrics.average_routing_score}%
              </div>
              <div className="text-xs font-bold text-[#0F172A] mt-1.5">Average Routing Consistency</div>
              <p className="text-[10px] text-[#64748B] mt-1">Organizational rule boundary match</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
