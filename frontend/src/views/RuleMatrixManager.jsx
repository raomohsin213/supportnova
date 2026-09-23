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
        setSaveSuccess(`Rule matrix entry for '${formCategory}' updated!`);
      } else {
        await createRuleMatrixEntry(payload);
        setSaveSuccess(`New rule matrix entry created!`);
      }
      await loadRules();
      setTimeout(() => {
        setEditModalOpen(false);
        setSaveSuccess('');
      }, 1200);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Database className="w-3.5 h-3.5" />
            Module 2: The Complaint Resolution Rule Matrix
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ground-Truth Business Rule Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Defines deterministic organizational boundaries, permitted routing, SLA hours, mandatory triggers, and forbidden actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadRules}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Matrix</span>
          </button>

          <button
            onClick={() => openEditModal(null)}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Rule Entry</span>
          </button>
        </div>
      </div>

      {/* Rules Table / Cards */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {rule.category}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-sm font-bold text-white">
                  {rule.subcategory}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(rule)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Edit Rule</span>
                </button>
                <button
                  onClick={() => handleDelete(rule.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 border border-red-500/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Allowed Departments */}
              <div className="p-3.5 rounded-xl bg-dark-900/60 border border-slate-800 space-y-1.5">
                <span className="text-slate-400 flex items-center gap-1 font-semibold text-[11px]">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  Allowed Departments:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(rule.allowed_departments || []).map((d, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-dark-800 border border-slate-700 text-slate-200 font-mono text-[11px]">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* SLA Target Hours */}
              <div className="p-3.5 rounded-xl bg-dark-900/60 border border-slate-800 space-y-1.5">
                <span className="text-slate-400 flex items-center gap-1 font-semibold text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  SLA Target Hours:
                </span>
                <div className="flex items-center gap-2 font-mono text-xs mt-1">
                  <span className="text-red-400 font-bold">P1: {rule.sla_hours_by_priority?.P1 || 2}h</span>
                  <span className="text-amber-400 font-bold">P2: {rule.sla_hours_by_priority?.P2 || 8}h</span>
                  <span className="text-blue-400 font-bold">P3: {rule.sla_hours_by_priority?.P3 || 24}h</span>
                  <span className="text-slate-400 font-bold">P4: {rule.sla_hours_by_priority?.P4 || 48}h</span>
                </div>
              </div>

              {/* Active Policy Mapping */}
              <div className="p-3.5 rounded-xl bg-dark-900/60 border border-slate-800 space-y-1.5">
                <span className="text-slate-400 flex items-center gap-1 font-semibold text-[11px]">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  Active Policy Mapping:
                </span>
                <div className="text-xs font-mono font-bold text-white mt-1">
                  {rule.active_policy_id}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {rule.active_section_id}
                </div>
              </div>

              {/* Mandatory Escalation Triggers */}
              <div className="p-3.5 rounded-xl bg-dark-900/60 border border-slate-800 space-y-1.5">
                <span className="text-slate-400 flex items-center gap-1 font-semibold text-[11px]">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  Escalation Triggers:
                </span>
                <div className="text-[11px] text-red-300 font-mono flex flex-wrap gap-1 mt-1">
                  {(rule.mandatory_escalation_triggers || []).slice(0, 3).map((trig, idx) => (
                    <span key={idx} className="bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                      {trig}
                    </span>
                  ))}
                  {(rule.mandatory_escalation_triggers || []).length > 3 && (
                    <span className="text-slate-500 text-[10px]">+{rule.mandatory_escalation_triggers.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>

            {/* Prohibited & Mandatory Action lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 space-y-1">
                <span className="font-bold text-red-400 flex items-center gap-1 text-[11px]">
                  Prohibited Automated Actions:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                  {(rule.prohibited_actions || []).map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                <span className="font-bold text-emerald-400 flex items-center gap-1 text-[11px]">
                  Mandatory Required Resolution Steps:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-dark-800 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  {editingRule ? `Edit Rule: ${editingRule.category}` : 'Create Rule Matrix Entry'}
                </h3>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{saveSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Delivery"
                    className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subcategory <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    value={formSubcategory}
                    onChange={(e) => setFormSubcategory(e.target.value)}
                    placeholder="e.g. Delayed Delivery"
                    className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Allowed Departments (comma-separated)</label>
                <input
                  type="text"
                  value={formDepartments}
                  onChange={(e) => setFormDepartments(e.target.value)}
                  placeholder="e.g. Logistics Support, Operations Escalations"
                  className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">SLA Target Hours (P1, P2, P3, P4)</label>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <span className="text-[10px] text-red-400 font-mono">P1 (Critical)</span>
                    <input
                      type="number"
                      value={formSlaP1}
                      onChange={(e) => setFormSlaP1(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-dark-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400 font-mono">P2 (High)</span>
                    <input
                      type="number"
                      value={formSlaP2}
                      onChange={(e) => setFormSlaP2(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-dark-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-400 font-mono">P3 (Medium)</span>
                    <input
                      type="number"
                      value={formSlaP3}
                      onChange={(e) => setFormSlaP3(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-dark-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono">P4 (Low)</span>
                    <input
                      type="number"
                      value={formSlaP4}
                      onChange={(e) => setFormSlaP4(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-dark-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Active Policy ID</label>
                  <input
                    type="text"
                    value={formPolicyId}
                    onChange={(e) => setFormPolicyId(e.target.value)}
                    placeholder="e.g. DEL-POL-04"
                    className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Active Section ID</label>
                  <input
                    type="text"
                    value={formSectionId}
                    onChange={(e) => setFormSectionId(e.target.value)}
                    placeholder="e.g. Section 4.1"
                    className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mandatory Escalation Triggers (comma-separated keywords)</label>
                <input
                  type="text"
                  value={formTriggers}
                  onChange={(e) => setFormTriggers(e.target.value)}
                  placeholder="e.g. fire, injury, hospital, spark, lawsuit"
                  className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Prohibited Actions (one per line)</label>
                <textarea
                  rows={2}
                  value={formProhibited}
                  onChange={(e) => setFormProhibited(e.target.value)}
                  placeholder="e.g. Admit legal liability&#10;Grant immediate refund > $50 without receipt"
                  className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-slate-700 text-xs text-white font-sans focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mandatory Actions (one per line)</label>
                <textarea
                  rows={2}
                  value={formMandatory}
                  onChange={(e) => setFormMandatory(e.target.value)}
                  placeholder="e.g. Verify shipment status with courier tracking API&#10;Confirm expected delivery date"
                  className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-slate-700 text-xs text-white font-sans focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5"
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
