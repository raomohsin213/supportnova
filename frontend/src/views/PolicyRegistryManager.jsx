import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  AlertOctagon, 
  Layers, 
  Calendar, 
  Tag, 
  Plus, 
  ExternalLink,
  RefreshCw,
  X,
  Edit2,
  Trash2,
  PlusCircle,
  Save,
  Database,
  Sparkles,
  FilePlus,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { 
  fetchPolicies, 
  uploadPolicy, 
  updatePolicyStatus, 
  fetchPolicyDetail, 
  createPolicy, 
  updatePolicy, 
  deletePolicy 
} from '../services/api';
import { TraceablePolicyDrawer } from '../components/TraceablePolicyDrawer';
import { toast } from 'sonner';

export function PolicyRegistryManager() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  
  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePolicyId, setActivePolicyId] = useState('');

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadDocId, setUploadDocId] = useState('');
  const [uploadDocTitle, setUploadDocTitle] = useState('');
  const [uploadVersion, setUploadVersion] = useState('v1.0-Active');
  const [uploadCategory, setUploadCategory] = useState('Hardware & Warranty');
  const [uploadEffectiveDate, setUploadEffectiveDate] = useState('2026-03-01');

  // Create Policy Form State
  const [createDocId, setCreateDocId] = useState('');
  const [createTitle, setCreateTitle] = useState('');
  const [createCategory, setCreateCategory] = useState('Hardware & Warranty');
  const [createVersion, setCreateVersion] = useState('v1.0-Active');
  const [createEffectiveDate, setCreateEffectiveDate] = useState('2026-03-01');
  const [createStatus, setCreateStatus] = useState('Active');
  const [createContent, setCreateContent] = useState('');

  // Edit Policy Form State
  const [editDocId, setEditDocId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Hardware & Warranty');
  const [editVersion, setEditVersion] = useState('v1.0-Active');
  const [editEffectiveDate, setEditEffectiveDate] = useState('');
  const [editStatus, setEditStatus] = useState('Active');
  const [editContent, setEditContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const data = await fetchPolicies();
      setPolicies(data);
    } catch (err) {
      console.error('Failed to load policies:', err);
      toast.error('Failed to load policies', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleStatusToggle = async (policyId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Superseded' : 'Active';
    try {
      await updatePolicyStatus(policyId, newStatus);
      toast.success(`Policy ${policyId} is now ${newStatus}`);
      await loadPolicies();
    } catch (err) {
      toast.error(`Status update failed: ${err.message}`);
    }
  };

  // Open Edit Modal with pre-loaded details
  const handleOpenEdit = async (p) => {
    setEditDocId(p.doc_id);
    setEditTitle(p.doc_title);
    setEditCategory(p.category || 'General');
    setEditVersion(p.version || 'v1.0-Active');
    setEditEffectiveDate(p.effective_date || '2026-01-01');
    setEditStatus(p.status || 'Active');
    setEditContent('');
    setEditModalOpen(true);
    setEditLoading(true);

    try {
      const detail = await fetchPolicyDetail(p.doc_id);
      setEditContent(detail.content || '');
    } catch (err) {
      console.warn('Failed to load full policy content:', err);
    } finally {
      setEditLoading(false);
    }
  };

  // Save Edit Policy Submit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    setSubmitting(true);
    try {
      await updatePolicy(editDocId, {
        doc_title: editTitle.trim(),
        category: editCategory,
        version: editVersion,
        effective_date: editEffectiveDate,
        status: editStatus,
        content: editContent.trim()
      });
      toast.success(`Policy ${editDocId} updated!`, {
        description: 'Changes synchronized to Vector Store and MongoDB Atlas.'
      });
      setEditModalOpen(false);
      await loadPolicies();
    } catch (err) {
      toast.error('Failed to update policy', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Policy Action
  const handleDeletePolicy = async (docId) => {
    setSubmitting(true);
    try {
      await deletePolicy(docId);
      toast.success(`Policy ${docId} deleted permanently`, {
        description: 'Removed from SQLite, Vector Store, MongoDB Atlas, and disk.'
      });
      setDeleteConfirmId(null);
      await loadPolicies();
    } catch (err) {
      toast.error('Failed to delete policy', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Create Policy Submit
  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    if (!createDocId.trim() || !createTitle.trim()) {
      toast.error('Document ID and Title are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await createPolicy({
        doc_id: createDocId.trim().toUpperCase(),
        doc_title: createTitle.trim(),
        category: createCategory,
        version: createVersion,
        effective_date: createEffectiveDate,
        status: createStatus,
        content: createContent.trim() || `## Section 1.0 — General Provisions\nAll claims under ${createTitle} must adhere to standard corporate governance.`
      });
      toast.success(`Policy ${res.doc_id} created!`, {
        description: `Parsed into ${res.chunks_created} logical sections and indexed in vector store.`
      });
      setCreateModalOpen(false);
      setCreateDocId('');
      setCreateTitle('');
      setCreateContent('');
      await loadPolicies();
    } catch (err) {
      toast.error('Failed to create policy', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Template Generator for New Policy
  const handleInsertTemplate = () => {
    const templateDocId = createDocId.trim().toUpperCase() || 'WRN-POL-25';
    setCreateDocId(templateDocId);
    if (!createTitle) setCreateTitle('Autonomous Extended Warranty & Accidental Damage Protection Policy');
    setCreateCategory('Hardware & Warranty');
    setCreateContent(
`## Section 1.0 — Zero Dead Pixel Guarantee & Display Replacement
Any monitor, laptop display, or smartphone OLED panel displaying 1 or more persistent vertical or horizontal dead pixel lines qualifies for an immediate zero-deductible replacement unit under our corporate hardware guarantee.

## Section 2.0 — Verified Liquid Ingress & Water Resistance Claims
For devices advertised with IP68 or 100m water resistance, if internal condensation occurs following normal recreational water usage (e.g. pool swimming), customer is entitled to comprehensive warranty repair or immediate device exchange upon photo verification.

## Section 3.0 — Accidental Glass Shatter & Courier Transit Protection
If an unboxed device arrives with shattered camera glass or cracked exterior housing within 14 days of delivery, automated straight-through courier exchange dispatch is authorized with photographic proof.

## Section 4.0 — Rapid Dispatch Authorization Thresholds
Claims under $1,500 with photographic evidence are automatically authorized for 24-hour advance shipment prior to returning the defective unit.`
    );
  };

  // Upload File Submit
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file (.pdf, .docx, .md, or .txt)');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    if (uploadDocId) formData.append('doc_id', uploadDocId);
    if (uploadDocTitle) formData.append('doc_title', uploadDocTitle);
    formData.append('version', uploadVersion);
    formData.append('category', uploadCategory);
    formData.append('effective_date', uploadEffectiveDate);

    try {
      const res = await uploadPolicy(formData);
      toast.success(`Parsed & Indexed ${res.doc_id}!`, {
        description: `Created ${res.chunks_created} traceable citations in Vector Store & MongoDB.`
      });
      setUploadModalOpen(false);
      setSelectedFile(null);
      setUploadDocId('');
      setUploadDocTitle('');
      await loadPolicies();
    } catch (err) {
      toast.error('Upload error', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter policies
  const filteredPolicies = policies.filter((p) => {
    const matchesSearch = 
      p.doc_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.doc_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || p.category.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', ...new Set(policies.map(p => p.category))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#7B3FE4]/15 to-[#FF4B72]/15 text-[#FF4B72] border border-[#7B3FE4]/30 text-xs font-mono font-bold uppercase tracking-wider mb-2 shadow-xs">
            <FileText className="w-3.5 h-3.5" />
            Module 1: Traceable Chunking & Policy Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Corporate Policy Document Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Documents parsed into traceable citations stored in SQLite, indexed in Vector Store, and synced to MongoDB Atlas.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={loadPolicies}
            className="px-3.5 py-2.5 rounded-xl bg-[#15192B] hover:bg-[#1C223A] text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-white/[0.08] transition-colors cursor-pointer shadow-xs"
            title="Reload policies from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setCreateDocId('');
              setCreateTitle('');
              setCreateContent('');
              setCreateModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#059669] to-[#10B981] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.35)] border border-white/10 transition-all cursor-pointer"
          >
            <FilePlus className="w-4 h-4" />
            <span>Create New Policy</span>
          </button>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7B3FE4] to-[#4F46E5] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_20px_rgba(123,63,228,0.35)] border border-white/10 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#111525]/85 border border-white/[0.08] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by ID, title, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-[#7B3FE4] font-sans"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">Filter:</span>
          {categories.slice(0, 6).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-gradient-to-r from-[#7B3FE4] to-[#4F46E5] text-white shadow-[0_0_15px_rgba(123,63,228,0.35)] border border-white/15'
                  : 'bg-[#15192B] hover:bg-[#1C223A] text-slate-300 border border-white/[0.06]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Policies Grid */}
      {loading ? (
        <div className="p-20 text-center text-xs text-slate-400 space-y-3 bg-[#111525]/85 rounded-2xl border border-white/[0.08] shadow-2xl">
          <div className="w-8 h-8 border-2 border-[#7B3FE4] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-mono">Querying Corporate Policy Registry & Vector Store...</p>
        </div>
      ) : filteredPolicies.length === 0 ? (
        <div className="p-20 text-center text-xs text-slate-400 space-y-3 bg-[#111525]/85 rounded-2xl border border-dashed border-white/[0.1]">
          <FileText className="w-8 h-8 text-slate-600 mx-auto" />
          <p>No policy documents matched your search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPolicies.map((p) => {
            const isActive = p.status === 'Active';
            return (
              <div
                key={p.doc_id}
                className={`p-6 rounded-2xl border transition-all space-y-4 flex flex-col justify-between backdrop-blur-xl ${
                  isActive 
                    ? 'bg-[#111525]/85 border-white/[0.08] hover:border-[#7B3FE4]/40 hover:shadow-[0_12px_35px_-10px_rgba(123,63,228,0.25)] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]' 
                    : 'bg-[#FF4B72]/5 border-[#FF4B72]/20'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#7B3FE4]/15 text-[#C084FC] border border-[#7B3FE4]/35 shadow-[0_0_12px_rgba(123,63,228,0.2)]">
                      {p.doc_id}
                    </span>
                    <button
                      onClick={() => handleStatusToggle(p.doc_id, p.status)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase transition-colors cursor-pointer border ${
                        isActive
                          ? 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/35 shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:bg-[#10B981]/25'
                          : 'bg-[#FF4B72]/15 text-[#FF7F59] border-[#FF4B72]/35 shadow-[0_0_10px_rgba(255,75,114,0.2)] hover:bg-[#FF4B72]/25'
                      }`}
                      title="Click to toggle policy status"
                    >
                      {p.status} (Toggle)
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-white leading-snug">
                      {p.doc_title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2 font-mono text-[11px]">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-[#06B6D4]" />
                        {p.category}
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#FF7F59]" />
                        {p.effective_date}
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="text-[#C084FC] font-bold">
                        {p.version}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#08090E]/70 border border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#7B3FE4]" />
                      Logical Sections / Chunks:
                    </span>
                    <span className="font-mono font-bold text-white">{p.chunk_count} Sections</span>
                  </div>
                </div>

                {/* Card Actions: Browse Drawer, Edit, Delete */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActivePolicyId(p.doc_id);
                      setDrawerOpen(true);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#15192B] hover:bg-[#1C223A] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/[0.08]"
                    title="Open citation drawer"
                  >
                    <span>Browse</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#06B6D4]" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-2 rounded-xl bg-[#7B3FE4]/15 hover:bg-[#7B3FE4]/25 text-[#C084FC] border border-[#7B3FE4]/35 transition-colors cursor-pointer shadow-[0_0_10px_rgba(123,63,228,0.2)]"
                    title="Edit policy metadata & clauses"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(p.doc_id)}
                    className="p-2 rounded-xl bg-[#FF4B72]/15 hover:bg-[#FF4B72]/25 text-[#FF7F59] border border-[#FF4B72]/35 transition-colors cursor-pointer shadow-[0_0_10px_rgba(255,75,114,0.2)]"
                    title="Delete policy"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE NEW POLICY MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08090E]/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0F121E] border border-white/[0.1] rounded-3xl p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <FilePlus className="w-5 h-5 text-[#10B981]" />
                <h3 className="text-base font-extrabold text-white">Create New Corporate Policy Document</h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Document ID <span className="text-[#FF4B72]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WRN-POL-25, BAT-SOP-22"
                    value={createDocId}
                    onChange={(e) => setCreateDocId(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white font-mono focus:ring-2 focus:ring-[#7B3FE4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    value={createVersion}
                    onChange={(e) => setCreateVersion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white font-mono focus:ring-2 focus:ring-[#7B3FE4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Policy Title <span className="text-[#FF4B72]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autonomous Extended Warranty & Screen Defect Protocol"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white focus:ring-2 focus:ring-[#7B3FE4]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={createCategory}
                    onChange={(e) => setCreateCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white focus:ring-2 focus:ring-[#7B3FE4]"
                  >
                    <option value="Hardware & Warranty">Hardware & Warranty</option>
                    <option value="Delivery & Logistics">Delivery & Logistics</option>
                    <option value="Billing & Refunds">Billing & Refunds</option>
                    <option value="Safety & Hazard">Safety & Hazard</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Legal & Privacy">Legal & Privacy</option>
                    <option value="VIP Priority Handling">VIP Priority Handling</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={createEffectiveDate}
                    onChange={(e) => setCreateEffectiveDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white focus:ring-2 focus:ring-[#7B3FE4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Status</label>
                  <select
                    value={createStatus}
                    onChange={(e) => setCreateStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white focus:ring-2 focus:ring-[#7B3FE4]"
                  >
                    <option value="Active">Active</option>
                    <option value="Superseded">Superseded</option>
                    <option value="Deprecated">Deprecated</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Policy Markdown Content & Section Headings
                  </label>
                  <button
                    type="button"
                    onClick={handleInsertTemplate}
                    className="text-[11px] text-[#34D399] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Fill Sample Warranty Policy</span>
                  </button>
                </div>
                <textarea
                  rows={8}
                  placeholder={`## Section 1.0 — Overview & Eligibility\nDefine the basic rules and qualification criteria here...\n\n## Section 2.0 — Authorized Remedy & SLA\nSpecify the resolution remedies (repair, exchange, refund)...`}
                  value={createContent}
                  onChange={(e) => setCreateContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white font-mono focus:ring-2 focus:ring-[#7B3FE4] leading-relaxed resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#15192B] hover:bg-[#1C223A] text-slate-300 text-xs font-semibold border border-white/[0.08] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#059669] to-[#10B981] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.35)] border border-white/10 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Ingesting & Indexing...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save & Ingest Policy</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT POLICY MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08090E]/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0F121E] border border-white/[0.1] rounded-3xl p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#C084FC]" />
                <h3 className="text-base font-extrabold text-white">
                  Edit Policy: <span className="font-mono text-[#FF4B72]">{editDocId}</span>
                </h3>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editLoading ? (
              <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                <div className="w-6 h-6 border-2 border-[#7B3FE4] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p>Loading policy clauses from registry...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white focus:ring-2 focus:ring-[#7B3FE4]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white focus:ring-2 focus:ring-[#7B3FE4]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Version</label>
                    <input
                      type="text"
                      value={editVersion}
                      onChange={(e) => setEditVersion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white font-mono focus:ring-2 focus:ring-[#7B3FE4]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Effective Date</label>
                    <input
                      type="text"
                      value={editEffectiveDate}
                      onChange={(e) => setEditEffectiveDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white font-mono focus:ring-2 focus:ring-[#7B3FE4]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white focus:ring-2 focus:ring-[#7B3FE4]"
                    >
                      <option value="Active">Active</option>
                      <option value="Superseded">Superseded</option>
                      <option value="Deprecated">Deprecated</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Policy Content & Sections (Updates re-chunk & re-index automatically)
                  </label>
                  <textarea
                    rows={8}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white font-mono focus:ring-2 focus:ring-[#7B3FE4] leading-relaxed resize-y"
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
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7B3FE4] to-[#4F46E5] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_20px_rgba(123,63,228,0.4)] border border-white/10 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Updates</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08090E]/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0F121E] border border-white/[0.1] rounded-3xl p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] space-y-4">
            <div className="flex items-center gap-3 text-[#FF4B72]">
              <div className="p-2.5 rounded-2xl bg-[#FF4B72]/15 border border-[#FF4B72]/30 shadow-[0_0_15px_rgba(255,75,114,0.3)]">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Delete Policy Document?</h3>
                <span className="font-mono text-xs font-bold text-[#FF4B72]">{deleteConfirmId}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">{deleteConfirmId}</strong>? This action will remove all traceable sections from SQLite, purge embeddings from the Vector Store, and remove documents from MongoDB Atlas.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-[#15192B] hover:bg-[#1C223A] text-slate-300 text-xs font-semibold border border-white/[0.08] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeletePolicy(deleteConfirmId)}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF4B72] to-[#E11D48] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_20px_rgba(255,75,114,0.4)] border border-white/10 cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD FILE MODAL */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08090E]/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0F121E] border border-white/[0.1] rounded-3xl p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#C084FC]" />
                <h3 className="text-sm font-extrabold text-white">Upload Policy Document File</h3>
              </div>
              <button onClick={() => setUploadModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document File (.pdf, .docx, .md, .txt) <span className="text-[#FF4B72]">*</span>
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.doc,.txt,.md"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#7B3FE4]/20 file:text-[#C084FC] hover:file:bg-[#7B3FE4]/30 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Document ID</label>
                  <input
                    type="text"
                    placeholder="e.g. SEC-POL-08"
                    value={uploadDocId}
                    onChange={(e) => setUploadDocId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white font-mono focus:ring-2 focus:ring-[#7B3FE4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Version</label>
                  <input
                    type="text"
                    placeholder="e.g. v1.0-Active"
                    value={uploadVersion}
                    onChange={(e) => setUploadVersion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white font-mono focus:ring-2 focus:ring-[#7B3FE4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Data Security & Incident Protocol"
                  value={uploadDocTitle}
                  onChange={(e) => setUploadDocTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white focus:ring-2 focus:ring-[#7B3FE4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category / Domain</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white focus:ring-2 focus:ring-[#7B3FE4]"
                  >
                    <option value="Hardware & Warranty">Hardware & Warranty</option>
                    <option value="Delivery & Logistics">Delivery & Logistics</option>
                    <option value="Billing & Refunds">Billing & Refunds</option>
                    <option value="Safety & Hazard">Safety & Hazard</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Legal & Privacy">Legal & Privacy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={uploadEffectiveDate}
                    onChange={(e) => setUploadEffectiveDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#08090E] border border-white/[0.1] text-xs text-white focus:ring-2 focus:ring-[#7B3FE4]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#15192B] hover:bg-[#1C223A] text-slate-300 text-xs font-semibold border border-white/[0.08] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7B3FE4] to-[#4F46E5] hover:opacity-95 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(123,63,228,0.4)] border border-white/10"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Parsing & Indexing...</span>
                    </>
                  ) : (
                    <span>Upload & Ingest</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRACEABLE CITATION DRAWER */}
      <TraceablePolicyDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        policyId={activePolicyId}
      />
    </div>
  );
}
