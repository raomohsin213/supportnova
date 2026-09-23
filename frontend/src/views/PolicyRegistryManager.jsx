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
  X
} from 'lucide-react';
import { fetchPolicies, uploadPolicy, updatePolicyStatus } from '../services/api';
import { TraceablePolicyDrawer } from '../components/TraceablePolicyDrawer';

export function PolicyRegistryManager() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  
  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePolicyId, setActivePolicyId] = useState('');

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [docId, setDocId] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [version, setVersion] = useState('v1.0-Active');
  const [category, setCategory] = useState('Delivery');
  const [effectiveDate, setEffectiveDate] = useState('2026-01-01');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const data = await fetchPolicies();
      setPolicies(data);
    } catch (err) {
      console.error('Failed to load policies:', err);
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
      await loadPolicies();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a .pdf or .docx file');
      return;
    }

    setUploading(true);
    setUploadSuccess('');
    const formData = new FormData();
    formData.append('file', selectedFile);
    if (docId) formData.append('doc_id', docId);
    if (docTitle) formData.append('doc_title', docTitle);
    formData.append('version', version);
    formData.append('category', category);
    formData.append('effective_date', effectiveDate);

    try {
      const res = await uploadPolicy(formData);
      setUploadSuccess(`Successfully parsed & indexed ${res.doc_id} into ${res.chunks_created} traceable chunks!`);
      await loadPolicies();
      setTimeout(() => {
        setUploadModalOpen(false);
        setUploadSuccess('');
        setSelectedFile(null);
        setDocId('');
        setDocTitle('');
      }, 1500);
    } catch (err) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" />
            Module 1: Traceable Chunking & Policy Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Corporate Policy Document Manager
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Documents parsed by logical section headings into traceable citations stored in SQLite and indexed in the vector store.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadPolicies}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Policy</span>
          </button>
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {policies.map((p) => {
          const isActive = p.status === 'Active';
          return (
            <div
              key={p.doc_id}
              className={`p-6 rounded-2xl border transition-all space-y-4 flex flex-col justify-between shadow-xs ${
                isActive 
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700' 
                  : 'bg-rose-50/40 dark:bg-rose-950/15 border-rose-200 dark:border-rose-900/50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {p.doc_id}
                  </span>
                  <button
                    onClick={() => handleStatusToggle(p.doc_id, p.status)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 hover:bg-rose-100'
                    }`}
                  >
                    {p.status} (Toggle)
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {p.doc_title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      {p.category}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {p.effective_date}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Logical Traceable Chunks:
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{p.chunk_count} Sections</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setActivePolicyId(p.doc_id);
                  setDrawerOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 text-xs font-semibold flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer shadow-2xs"
              >
                <span>Browse Chunks in Drawer</span>
                <ExternalLink className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </button>
            </div>
          );
        })}
      </div>

      {/* UPLOAD POLICY MODAL */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upload New Corporate Policy</h3>
              </div>
              <button onClick={() => setUploadModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* File selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document File (.pdf or .docx) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full text-xs text-slate-700 dark:text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950/60 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Document ID</label>
                  <input
                    type="text"
                    placeholder="e.g. SEC-POL-08"
                    value={docId}
                    onChange={(e) => setDocId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Version</label>
                  <input
                    type="text"
                    placeholder="e.g. v1.0-Active"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Data Security & Incident Protocol"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category / Domain</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Delivery">Delivery</option>
                    <option value="Billing & Refunds">Billing & Refunds</option>
                    <option value="Hardware Warranty">Hardware Warranty</option>
                    <option value="Safety / Hazard">Safety / Hazard</option>
                    <option value="Technical Support">Technical Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {uploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Parsing & Indexing...</span>
                    </>
                  ) : (
                    <span>Upload & Chunk</span>
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
