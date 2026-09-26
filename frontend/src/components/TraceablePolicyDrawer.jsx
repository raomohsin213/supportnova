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
        className="absolute inset-0 bg-[#08090E]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[#0F121E] border-l border-white/[0.08] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/[0.08] bg-[#15192B]/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#7B3FE4]/15 border border-[#7B3FE4]/35 text-[#C084FC] shadow-[0_0_15px_rgba(123,63,228,0.25)]">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#FF4B72] uppercase tracking-wider">
                    Traceable Ground-Truth Citation
                  </span>
                  {policyMeta && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                      policyMeta.status === 'Active' 
                        ? 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/35 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                        : 'bg-[#FF4B72]/15 text-[#FF7F59] border-[#FF4B72]/35 shadow-[0_0_10px_rgba(255,75,114,0.2)]'
                    }`}>
                      {policyMeta.version} • {policyMeta.status}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-extrabold text-white mt-0.5">
                  {policyId}: {policyMeta?.doc_title || 'Document Specification'}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Metadata Sub-bar */}
          {policyMeta && (
            <div className="px-6 py-3 bg-[#08090E]/60 border-b border-white/[0.06] text-xs text-slate-300 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Tag className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Domain: <strong className="text-white">{policyMeta.category}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-[#FF7F59]" />
                <span>Effective: <strong className="text-white">{policyMeta.effective_date}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Layers className="w-3.5 h-3.5 text-[#7B3FE4]" />
                <span>Indexed Chunks: <strong className="text-white">{chunks.length}</strong></span>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
                <div className="w-8 h-8 border-2 border-[#7B3FE4] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-mono">Retrieving ground-truth chunks from SQLite...</p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-[#FF4B72]/15 border border-[#FF4B72]/30 text-[#FF7F59] text-sm shadow-[0_0_20px_rgba(255,75,114,0.2)]">
                <div className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#FF4B72]" />
                  Citation Lookup Error
                </div>
                <p className="mt-1 text-xs">{error}</p>
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
                  className={`p-5 rounded-2xl border transition-all ${
                    isTarget
                      ? 'bg-[#7B3FE4]/15 border-[#7B3FE4]/45 ring-1 ring-[#7B3FE4]/50 shadow-[0_0_25px_rgba(123,63,228,0.25)]'
                      : 'bg-[#15192B]/70 border-white/[0.07] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#C084FC] bg-[#7B3FE4]/20 px-2.5 py-0.5 rounded-lg border border-[#7B3FE4]/35">
                        {chunk.section_id}
                      </span>
                      {isTarget && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                          Cited by Ticket
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">
                      ID: {chunk.chunk_id}
                    </span>
                  </div>

                  {chunk.heading && (
                    <h4 className="text-sm font-extrabold text-white mb-2">
                      {chunk.heading}
                    </h4>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line bg-[#08090E]/80 p-4 rounded-xl border border-white/[0.06]">
                    {chunk.content}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/[0.08] bg-[#15192B]/80 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">Source of Truth: SQLite policy store</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1C223A] hover:bg-[#252D4D] text-white border border-white/[0.1] font-semibold transition-colors cursor-pointer"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
