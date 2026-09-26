import React, { useEffect, useState } from 'react';
import { X, FileText, CheckCircle, AlertTriangle, ShieldCheck, ExternalLink, Calendar, Tag, Layers } from 'lucide-react';
import { fetchPolicyChunks, fetchPolicies } from '../services/api';

export function TraceablePolicyDrawer({ isOpen, onClose, policyId, targetSection = null }) {
  const [loading, setLoading] = useState(false);
  const [chunks, setChunks] = useState([]);
  const [policyMeta, setPolicyMeta] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !policyId) return;

    async function loadPolicy() {
      setLoading(true);
      setError(null);
      try {
        // Fetch chunks
        const chunkList = await fetchPolicyChunks(policyId);
        setChunks(chunkList);

        // Fetch meta
        const allPolicies = await fetchPolicies();
        const found = allPolicies.find(p => p.doc_id === policyId);
        setPolicyMeta(found || null);
      } catch (err) {
        setError(err.message || 'Failed to load policy chunk text from SQLite.');
      } finally {
        setLoading(false);
      }
    }

    loadPolicy();
  }, [isOpen, policyId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Traceable Ground-Truth Citation
                  </span>
                  {policyMeta && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                      policyMeta.status === 'Active' 
                        ? 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]' 
                        : 'bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]'
                    }`}>
                      {policyMeta.version} • {policyMeta.status}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-extrabold text-[#0F172A] mt-0.5">
                  {policyId}: {policyMeta?.doc_title || 'Document Specification'}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Metadata Sub-bar */}
          {policyMeta && (
            <div className="px-6 py-3 bg-[#F6F8FC] border-b border-slate-100 text-xs text-[#64748B] flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                <span>Domain: <strong className="text-[#0F172A]">{policyMeta.category}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#F43F5E]" />
                <span>Effective: <strong className="text-[#0F172A]">{policyMeta.effective_date}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Indexed Chunks: <strong className="text-[#0F172A]">{chunks.length}</strong></span>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#F6F8FC]">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-mono">Retrieving ground-truth chunks from SQLite...</p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] text-sm shadow-xs">
                <div className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#BE123C]" />
                  Citation Lookup Error
                </div>
                <p className="mt-1 text-xs">{error}</p>
              </div>
            )}

            {!loading && !error && chunks.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                <FileText className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-medium text-[#0F172A]">No chunks found for policy ID '{policyId}'.</p>
                <p className="text-xs text-[#64748B] mt-1">This citation may be hallucinated or deleted from the registry.</p>
              </div>
            )}

            {!loading && chunks.map((chunk, idx) => {
              const isTarget = targetSection && chunk.section_id.toLowerCase().includes(targetSection.toLowerCase());
              return (
                <div
                  key={chunk.chunk_id || idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    isTarget
                      ? 'bg-indigo-50/70 border-indigo-200 ring-1 ring-indigo-300 shadow-xs'
                      : 'bg-white border-slate-200/60 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                        {chunk.section_id}
                      </span>
                      {isTarget && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] shadow-xs">
                          Cited by Ticket
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-[#94A3B8]">
                      ID: {chunk.chunk_id}
                    </span>
                  </div>

                  {chunk.heading && (
                    <h4 className="text-sm font-extrabold text-[#0F172A] mb-2">
                      {chunk.heading}
                    </h4>
                  )}

                  <p className="text-xs text-[#334155] leading-relaxed font-sans whitespace-pre-line bg-[#F8FAFD] p-4 rounded-xl border border-slate-200/60">
                    {chunk.content}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-mono text-[11px]">Source of Truth: SQLite policy store</span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-[#0F172A] hover:bg-slate-800 text-white font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
