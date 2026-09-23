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
        className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-dark-800 border-l border-slate-700/80 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/80 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Traceable Ground-Truth Citation
                  </span>
                  {policyMeta && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      policyMeta.status === 'Active' 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}>
                      {policyMeta.version} • {policyMeta.status}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {policyId}: {policyMeta?.doc_title || 'Document Specification'}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Metadata Sub-bar */}
          {policyMeta && (
            <div className="px-6 py-3 bg-dark-900/80 border-b border-slate-800 text-xs text-slate-300 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span>Domain: <strong className="text-slate-200">{policyMeta.category}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Effective: <strong className="text-slate-200">{policyMeta.effective_date}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Indexed Chunks: <strong className="text-slate-200">{chunks.length}</strong></span>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-mono">Retrieving ground-truth chunks from SQLite...</p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <div className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Citation Lookup Error
                </div>
                <p className="mt-1 text-xs text-red-300/80">{error}</p>
              </div>
            )}

            {!loading && !error && chunks.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                <FileText className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-medium">No chunks found for policy ID '{policyId}'.</p>
                <p className="text-xs text-slate-500 mt-1">This citation may be hallucinated or deleted from the registry.</p>
              </div>
            )}

            {!loading && chunks.map((chunk, idx) => {
              const isTarget = targetSection && chunk.section_id.toLowerCase().includes(targetSection.toLowerCase());
              return (
                <div
                  key={chunk.chunk_id || idx}
                  className={`p-5 rounded-xl border transition-all ${
                    isTarget
                      ? 'bg-cyan-950/30 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {chunk.section_id}
                      </span>
                      {isTarget && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                          Cited by Ticket
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">
                      ID: {chunk.chunk_id}
                    </span>
                  </div>

                  {chunk.heading && (
                    <h4 className="text-sm font-bold text-slate-100 mb-2">
                      {chunk.heading}
                    </h4>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line bg-dark-900/50 p-3.5 rounded-lg border border-slate-800">
                    {chunk.content}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
            <span>Source of Truth: SQLite policy store</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
