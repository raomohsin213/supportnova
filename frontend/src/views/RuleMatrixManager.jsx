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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#7B3FE4]/15 to-[#FF4B72]/15 text-[#FF4B72] border border-[#7B3FE4]/30 text-xs font-mono font-bold uppercase tracking-wider mb-2 shadow-xs">
            <Database className="w-3.5 h-3.5" />
            Module 2: The Complaint Resolution Rule Matrix
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ground-Truth Business Rule Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Defines deterministic organizational boundaries, permitted routing, SLA hours, mandatory triggers, and forbidden actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadRules}
            className="px-3.5 py-2.5 rounded-xl bg-[#15192B] hover:bg-[#1C223A] text-slate-300 text-xs font-semibold flex items-center gap-2 border border-white/[0.08] transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C084FC] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Matrix</span>
          </button>

          <button
            onClick={() => openEditModal(null)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7B3FE4] to-[#4F46E5] hover:opacity-95 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(123,63,228,0.4)] border border-white/10 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Rule Entry</span>
          </button>
        </div>
      </div>

      {/* Rules Table / Cards */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-[#0F121E]/90 backdrop-blur-xl p-6 rounded-3xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-4 hover:border-white/[0.15] transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold px-3 py-1 rounded-xl bg-[#7B3FE4]/15 text-[#C084FC] border border-[#7B3FE4]/30 shadow-[0_0_10px_rgba(123,63,228,0.2)]">
                  {rule.category}
                </span>
                <span className="text-white/20">•</span>
                <span className="text-base font-extrabold text-white">
                  {rule.subcategory}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(rule)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#15192B] hover:bg-[#1C223A] text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-white/[0.08] transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#C084FC]" />
                  <span>Edit Rule</span>
                </button>
                <button
                  onClick={() => handleDelete(rule.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#FF4B72]/15 hover:bg-[#FF4B72]/25 text-[#FF4B72] text-xs font-semibold flex items-center gap-1.5 border border-[#FF4B72]/30 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Allowed Departments */}
              <div className="p-4 rounded-2xl bg-[#08090E]/60 border border-white/[0.08] space-y-2">
                <span className="text-slate-400 flex items-center gap-1.5 font-bold text-[11px] uppercase font-mono">
                  <Building2 className="w-3.5 h-3.5 text-[#C084FC]" />
                  Allowed Departments:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(rule.allowed_departments || []).map((d, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-[#15192B] border border-white/[0.08] text-slate-200 font-mono text-[11px]">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* SLA Target Hours */}
              <div className="p-4 rounded-2xl bg-[#08090E]/60 border border-white/[0.08] space-y-2">
                <span className="text-slate-400 flex items-center gap-1.5 font-bold text-[11px] uppercase font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                  SLA Target Hours:
                </span>
                <div className="flex items-center gap-2 font-mono text-xs mt-1">
                  <span className="text-[#FF4B72] font-bold">P1: {rule.sla_hours_by_priority?.P1 || 2}h</span>
                  <span className="text-[#F59E0B] font-bold">P2: {rule.sla_hours_by_priority?.P2 || 8}h</span>
                  <span className="text-[#06B6D4] font-bold">P3: {rule.sla_hours_by_priority?.P3 || 24}h</span>
                  <span className="text-slate-400 font-bold">P4: {rule.sla_hours_by_priority?.P4 || 48}h</span>
                </div>
              </div>

              {/* Active Policy Mapping */}
              <div className="p-4 rounded-2xl bg-[#08090E]/60 border border-white/[0.08] space-y-2">
                <span className="text-slate-400 flex items-center gap-1.5 font-bold text-[11px] uppercase font-mono">
                  <FileText className="w-3.5 h-3.5 text-[#C084FC]" />
                  Active Policy Mapping:
                </span>
                <div className="text-xs font-mono font-bold text-[#C084FC] mt-1">
                  {rule.active_policy_id}
                </div>
                <div className="text-[11px] text-slate-300 truncate">
                  {rule.active_section_id}
                </div>
              </div>

              {/* Mandatory Escalation Triggers */}
              <div className="p-4 rounded-2xl bg-[#08090E]/60 border border-white/[0.08] space-y-2">
                <span className="text-slate-400 flex items-center gap-1.5 font-bold text-[11px] uppercase font-mono">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#FF4B72]" />
                  Escalation Triggers:
                </span>
                <div className="text-[11px] text-[#FF4B72] font-mono flex flex-wrap gap-1 mt-1">
                  {(rule.mandatory_escalation_triggers || []).slice(0, 3).map((trig, idx) => (
                    <span key={idx} className="bg-[#FF4B72]/15 px-2 py-0.5 rounded-md border border-[#FF4B72]/30">
                      {trig}
                    </span>
                  ))}
                  {(rule.mandatory_escalation_triggers || []).length > 3 && (
                    <span className="text-slate-400 text-[10px]">+{rule.mandatory_escalation_triggers.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>

            {/* Prohibited & Mandatory Action lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div className="p-4 rounded-2xl bg-[#FF4B72]/10 border border-[#FF4B72]/30 space-y-1.5">
                <span className="font-bold text-[#FF4B72] flex items-center gap-1.5 text-[11px] uppercase font-mono">
                  Prohibited Automated Actions:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-200 text-[11px]">
                  {(rule.prohibited_actions || []).map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 space-y-1.5">
                <span className="font-bold text-[#10B981] flex items-center gap-1.5 text-[11px] uppercase font-mono">
                  Mandatory Required Resolution Steps:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-200 text-[11px]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08090E]/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#0F121E] border border-white/[0.1] rounded-3xl p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#7B3FE4]/15 border border-[#7B3FE4]/30 text-[#C084FC]">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-white">
                  {editingRule ? `Edit Rule: ${editingRule.category}` : 'Create Rule Matrix Entry'}
                </h3>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3.5 rounded-2xl bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <CheckCircle className="w-4 h-4" />
                <span>{saveSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category <span className="text-[#FF4B72]">*</span></label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Delivery"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-[#7B3FE4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subcategory <span className="text-[#FF4B72]">*</span></label>
                  <input
                    type="text"
                    required
                    value={formSubcategory}
                    onChange={(e) => setFormSubcategory(e.target.value)}
                    placeholder="e.g. Delayed Delivery"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-[#7B3FE4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Allowed Departments (comma-separated)</label>
                <input
                  type="text"
                  value={formDepartments}
                  onChange={(e) => setFormDepartments(e.target.value)}
                  placeholder="e.g. Logistics Support, Operations Escalations"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-[#7B3FE4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">SLA Target Hours (P1, P2, P3, P4)</label>
                <div className="grid grid-cols-4 gap-2.5">
                  <div>
                    <span className="text-[10px] text-[#FF4B72] font-mono font-bold">P1 (Critical)</span>
                    <input
                      type="number"
                      value={formSlaP1}
                      onChange={(e) => setFormSlaP1(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white font-mono focus:ring-2 focus:ring-[#7B3FE4]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#F59E0B] font-mono font-bold">P2 (High)</span>
                    <input
                      type="number"
                      value={formSlaP2}
                      onChange={(e) => setFormSlaP2(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white font-mono focus:ring-2 focus:ring-[#7B3FE4]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#06B6D4] font-mono font-bold">P3 (Medium)</span>
                    <input
                      type="number"
                      value={formSlaP3}
                      onChange={(e) => setFormSlaP3(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white font-mono focus:ring-2 focus:ring-[#7B3FE4]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">P4 (Low)</span>
                    <input
                      type="number"
                      value={formSlaP4}
                      onChange={(e) => setFormSlaP4(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white font-mono focus:ring-2 focus:ring-[#7B3FE4]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Active Policy ID</label>
                  <input
                    type="text"
                    value={formPolicyId}
                    onChange={(e) => setFormPolicyId(e.target.value)}
                    placeholder="e.g. DEL-POL-04"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-[#7B3FE4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Active Section ID</label>
                  <input
                    type="text"
                    value={formSectionId}
                    onChange={(e) => setFormSectionId(e.target.value)}
                    placeholder="e.g. Section 4.1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-[#7B3FE4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mandatory Escalation Triggers (comma-separated keywords)</label>
                <input
                  type="text"
                  value={formTriggers}
                  onChange={(e) => setFormTriggers(e.target.value)}
                  placeholder="e.g. fire, injury, hospital, spark, lawsuit"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-[#7B3FE4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Prohibited Actions (one per line)</label>
                <textarea
                  rows={2}
                  value={formProhibited}
                  onChange={(e) => setFormProhibited(e.target.value)}
                  placeholder="e.g. Admit legal liability&#10;Grant immediate refund > $50 without receipt"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white font-sans focus:outline-hidden focus:ring-2 focus:ring-[#7B3FE4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mandatory Actions (one per line)</label>
                <textarea
                  rows={2}
                  value={formMandatory}
                  onChange={(e) => setFormMandatory(e.target.value)}
                  placeholder="e.g. Verify shipment status with courier tracking API&#10;Confirm expected delivery date"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white font-sans focus:outline-hidden focus:ring-2 focus:ring-[#7B3FE4]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#15192B] hover:bg-[#1C223A] text-slate-300 text-xs font-semibold border border-white/[0.08] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7B3FE4] to-[#4F46E5] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(123,63,228,0.4)] border border-white/10"
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
