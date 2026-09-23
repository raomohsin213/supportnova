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
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Traceable Ground-Truth Citation
                  </span>
                  {policyMeta && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      policyMeta.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                    }`}>
                      {policyMeta.version} • {policyMeta.status}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {policyId}: {policyMeta?.doc_title || 'Document Specification'}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Metadata Sub-bar */}
          {policyMeta && (
            <div className="px-6 py-3 bg-slate-100/60 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Tag className="w-3.5 h-3.5" />
                <span>Domain: <strong className="text-slate-800 dark:text-slate-200">{policyMeta.category}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Effective: <strong className="text-slate-800 dark:text-slate-200">{policyMeta.effective_date}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Layers className="w-3.5 h-3.5" />
                <span>Indexed Chunks: <strong className="text-slate-800 dark:text-slate-200">{chunks.length}</strong></span>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400 space-y-3">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-mono">Retrieving ground-truth chunks from SQLite...</p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200 text-sm">
                <div className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  Citation Lookup Error
                </div>
                <p className="mt-1 text-xs">{error}</p>
              </div>
            )}

            {!loading && !error && chunks.length === 0 && (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <FileText className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
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
                      ? 'bg-indigo-50/70 border-indigo-300 dark:bg-indigo-950/30 dark:border-indigo-700 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                        {chunk.section_id}
                      </span>
                      {isTarget && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
                          Cited by Ticket
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">
                      ID: {chunk.chunk_id}
                    </span>
                  </div>

                  {chunk.heading && (
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                      {chunk.heading}
                    </h4>
                  )}

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-line bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    {chunk.content}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Source of Truth: SQLite policy store</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
