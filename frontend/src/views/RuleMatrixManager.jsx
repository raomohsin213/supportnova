import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  ShieldAlert, 
  Clock, 
  Building2, 
  Tag, 
  FileText,
  X,
  RefreshCw,
  Save
} from 'lucide-react';
import { fetchRuleMatrix, updateRuleMatrixEntry, createRuleMatrixEntry, deleteRuleMatrixEntry } from '../services/api';

export function RuleMatrixManager() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Form State
  const [formCategory, setFormCategory] = useState('');
  const [formSubcategory, setFormSubcategory] = useState('');
  const [formDepartments, setFormDepartments] = useState('');
  const [formSlaP1, setFormSlaP1] = useState(2);
  const [formSlaP2, setFormSlaP2] = useState(8);
  const [formSlaP3, setFormSlaP3] = useState(24);
  const [formSlaP4, setFormSlaP4] = useState(48);
  const [formTriggers, setFormTriggers] = useState('');
  const [formProhibited, setFormProhibited] = useState('');
  const [formMandatory, setFormMandatory] = useState('');
  const [formPolicyId, setFormPolicyId] = useState('');
  const [formSectionId, setFormSectionId] = useState('');

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await fetchRuleMatrix();
      setRules(data);
    } catch (err) {
      console.error('Failed to load rule matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const openEditModal = (rule = null) => {
    setEditingRule(rule);
    if (rule) {
      setFormCategory(rule.category);
      setFormSubcategory(rule.subcategory);
      setFormDepartments((rule.allowed_departments || []).join(', '));
      setFormSlaP1(rule.sla_hours_by_priority?.P1 || 2);
      setFormSlaP2(rule.sla_hours_by_priority?.P2 || 8);
      setFormSlaP3(rule.sla_hours_by_priority?.P3 || 24);
      setFormSlaP4(rule.sla_hours_by_priority?.P4 || 48);
      setFormTriggers((rule.mandatory_escalation_triggers || []).join(', '));
      setFormProhibited((rule.prohibited_actions || []).join('\n'));
      setFormMandatory((rule.mandatory_actions || []).join('\n'));
      setFormPolicyId(rule.active_policy_id || '');
      setFormSectionId(rule.active_section_id || '');
    } else {
      setFormCategory('');
      setFormSubcategory('');
      setFormDepartments('General Support');
      setFormSlaP1(2);
      setFormSlaP2(8);
      setFormSlaP3(24);
      setFormSlaP4(48);
      setFormTriggers('hazard, emergency, lawsuit');
      setFormProhibited('Admit legal liability\nGrant immediate refund > $50 without receipt');
      setFormMandatory('Verify customer details\nConfirm resolution steps');
      setFormPolicyId('DEL-POL-04');
      setFormSectionId('Section 1.0');
    }
    setEditModalOpen(true);
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      category: formCategory,
      subcategory: formSubcategory,
      allowed_departments: formDepartments.split(',').map(s => s.trim()).filter(Boolean),
      sla_hours_by_priority: {
        P1: parseInt(formSlaP1) || 2,
        P2: parseInt(formSlaP2) || 8,
        P3: parseInt(formSlaP3) || 24,
        P4: parseInt(formSlaP4) || 48,
      },
      mandatory_escalation_triggers: formTriggers.split(',').map(s => s.trim()).filter(Boolean),
      prohibited_actions: formProhibited.split('\n').map(s => s.trim()).filter(Boolean),
      mandatory_actions: formMandatory.split('\n').map(s => s.trim()).filter(Boolean),
      active_policy_id: formPolicyId,
      active_section_id: formSectionId
    };

    try {
      if (editingRule) {
        await updateRuleMatrixEntry(editingRule.id, payload);
        setSaveSuccess('Rule entry updated successfully in SQLite.');
      } else {
        await createRuleMatrixEntry(payload);
        setSaveSuccess('New rule entry provisioned in SQLite.');
      }
      await loadRules();
      setTimeout(() => {
        setSaveSuccess('');
        setEditModalOpen(false);
      }, 1500);
    } catch (err) {
      alert(`Save error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this ground-truth rule matrix entry?')) return;
    try {
      await deleteRuleMatrixEntry(id);
      await loadRules();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-20 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-mono font-bold uppercase tracking-wider mb-2 shadow-xs">
            <Database className="w-3.5 h-3.5" />
            Module 2: The Complaint Resolution Rule Matrix
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Ground-Truth Business Rule Matrix
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Defines deterministic organizational boundaries, permitted routing, SLA hours, mandatory triggers, and forbidden actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadRules}
            className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-[#475569] text-xs font-semibold flex items-center gap-2 border border-slate-200 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Matrix</span>
          </button>

          <button
            onClick={() => openEditModal(null)}
            className="px-5 py-2.5 rounded-full bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Rule Entry</span>
          </button>
        </div>
      </div>

      {/* Rules Table / Cards */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-card space-y-4 hover:shadow-lg transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {rule.category}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-base font-bold text-[#0F172A]">
                  {rule.subcategory}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(rule)}
                  className="px-4 py-1.5 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-xs font-semibold flex items-center gap-1.5 border border-slate-200/50 transition-colors cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Edit Rule</span>
                </button>
                <button
                  onClick={() => handleDelete(rule.id)}
                  className="px-4 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-1.5 border border-rose-200 transition-colors cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Allowed Departments */}
              <div className="p-4 rounded-2xl bg-[#F6F8FC] border border-slate-200/50 space-y-2">
                <span className="text-[#94A3B8] flex items-center gap-1.5 font-bold text-[10px] uppercase font-mono tracking-wider">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  Allowed Departments:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(rule.allowed_departments || []).map((d, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[#0F172A] font-mono text-[11px] shadow-xs">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* SLA Target Hours */}
              <div className="p-4 rounded-2xl bg-[#F6F8FC] border border-slate-200/50 space-y-2">
                <span className="text-[#94A3B8] flex items-center gap-1.5 font-bold text-[10px] uppercase font-mono tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  SLA Target Hours:
                </span>
                <div className="flex items-center gap-2 font-mono text-xs mt-1">
                  <span className="text-rose-600 font-bold">P1: {rule.sla_hours_by_priority?.P1 || 2}h</span>
                  <span className="text-amber-600 font-bold">P2: {rule.sla_hours_by_priority?.P2 || 8}h</span>
                  <span className="text-indigo-600 font-bold">P3: {rule.sla_hours_by_priority?.P3 || 24}h</span>
                  <span className="text-slate-500 font-bold">P4: {rule.sla_hours_by_priority?.P4 || 48}h</span>
                </div>
              </div>

              {/* Active Policy Mapping */}
              <div className="p-4 rounded-2xl bg-[#F6F8FC] border border-slate-200/50 space-y-2">
                <span className="text-[#94A3B8] flex items-center gap-1.5 font-bold text-[10px] uppercase font-mono tracking-wider">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  Active Policy Mapping:
                </span>
                <div className="text-xs font-mono font-bold text-indigo-600 mt-1">
                  {rule.active_policy_id}
                </div>
                <div className="text-[11px] text-[#475569] truncate">
                  {rule.active_section_id}
                </div>
              </div>

              {/* Mandatory Escalation Triggers */}
              <div className="p-4 rounded-2xl bg-[#F6F8FC] border border-slate-200/50 space-y-2">
                <span className="text-[#94A3B8] flex items-center gap-1.5 font-bold text-[10px] uppercase font-mono tracking-wider">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  Escalation Triggers:
                </span>
                <div className="text-[11px] text-rose-600 font-mono flex flex-wrap gap-1 mt-1">
                  {(rule.mandatory_escalation_triggers || []).slice(0, 3).map((trig, idx) => (
                    <span key={idx} className="bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      {trig}
                    </span>
                  ))}
                  {(rule.mandatory_escalation_triggers || []).length > 3 && (
                    <span className="text-[#64748B] text-[10px]">+{rule.mandatory_escalation_triggers.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>

            {/* Prohibited & Mandatory Action lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/60 space-y-1.5">
                <span className="font-bold text-rose-700 flex items-center gap-1.5 text-[11px] uppercase font-mono">
                  Prohibited Automated Actions:
                </span>
                <ul className="list-disc list-inside space-y-1 text-[#334155] text-[11px]">
                  {(rule.prohibited_actions || []).map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-1.5">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5 text-[11px] uppercase font-mono">
                  Mandatory Required Resolution Steps:
                </span>
                <ul className="list-disc list-inside space-y-1 text-[#334155] text-[11px]">
                  {(rule.mandatory_actions || []).map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT / CREATE RULE MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-[32px] p-6 shadow-board space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  {editingRule ? `Edit Rule: ${editingRule.category}` : 'Create Rule Matrix Entry'}
                </h3>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-2 shadow-xs">
                <CheckCircle className="w-4 h-4" />
                <span>{saveSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">Category <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Delivery"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F8FC] border border-slate-200 text-xs text-[#0F172A] focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">Subcategory <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formSubcategory}
                    onChange={(e) => setFormSubcategory(e.target.value)}
                    placeholder="e.g. Delayed Delivery"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F8FC] border border-slate-200 text-xs text-[#0F172A] focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">Allowed Departments (comma-separated)</label>
                <input
                  type="text"
                  value={formDepartments}
                  onChange={(e) => setFormDepartments(e.target.value)}
                  placeholder="e.g. Logistics Support, Operations Escalations"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F8FC] border border-slate-200 text-xs text-[#0F172A] focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">SLA Target Hours (P1, P2, P3, P4)</label>
                <div className="grid grid-cols-4 gap-2.5">
                  <div>
                    <span className="text-[10px] text-rose-600 font-mono font-bold">P1 (Critical)</span>
                    <input
                      type="number"
                      value={formSlaP1}
                      onChange={(e) => setFormSlaP1(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F6F8FC] border border-slate-200 text-xs text-[#0F172A] font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-600 font-mono font-bold">P2 (High)</span>
                    <input
                      type="number"
                      value={formSlaP2}
                      onChange={(e) => setFormSlaP2(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F6F8FC] border border-slate-200 text-xs text-[#0F172A] font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-600 font-mono font-bold">P3 (Medium)</span>
                    <input
                      type="number"
                      value={formSlaP3}
                      onChange={(e) => setFormSlaP3(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F6F8FC] border border-slate-200 text-xs text-[#0F172A] font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">P4 (Low)</span>
                    <input
                      type="number"
                      value={formSlaP4}
                      onChange={(e) => setFormSlaP4(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F6F8FC] border border-slate-200 text-xs text-[#0F172A] font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">Active Policy ID</label>
                  <input
                    type="text"
                    value={formPolicyId}
                    onChange={(e) => setFormPolicyId(e.target.value)}
                    placeholder="e.g. DEL-POL-04"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F8FC] border border-slate-200 text-xs text-[#0F172A] font-mono focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">Active Section ID</label>
                  <input
                    type="text"
                    value={formSectionId}
                    onChange={(e) => setFormSectionId(e.target.value)}
                    placeholder="e.g. Section 4.1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F8FC] border border-slate-200 text-xs text-[#0F172A] font-mono focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">Mandatory Escalation Triggers (comma-separated keywords)</label>
                <input
                  type="text"
                  value={formTriggers}
                  onChange={(e) => setFormTriggers(e.target.value)}
                  placeholder="e.g. fire, injury, hospital, spark, lawsuit"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F8FC] border border-slate-200 text-xs text-[#0F172A] focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">Prohibited Actions (one per line)</label>
                <textarea
                  rows={2}
                  value={formProhibited}
                  onChange={(e) => setFormProhibited(e.target.value)}
                  placeholder="e.g. Admit legal liability&#10;Grant immediate refund > $50 without receipt"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F8FC] border border-slate-200 text-xs text-[#0F172A] font-sans focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">Mandatory Actions (one per line)</label>
                <textarea
                  rows={2}
                  value={formMandatory}
                  onChange={(e) => setFormMandatory(e.target.value)}
                  placeholder="e.g. Verify shipment status with courier tracking API&#10;Confirm expected delivery date"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F8FC] border border-slate-200 text-xs text-[#0F172A] font-sans focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Rule Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
