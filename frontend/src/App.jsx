import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { JudgeGuideModal } from './components/JudgeGuideModal';
import { PublicComplaintSubmission } from './views/PublicComplaintSubmission';
import { SupportAgentWorkspace } from './views/SupportAgentWorkspace';
import { ManualReviewQueue } from './views/ManualReviewQueue';
import { ExecutiveDashboard } from './views/ExecutiveDashboard';
import { PolicyRegistryManager } from './views/PolicyRegistryManager';
import { RuleMatrixManager } from './views/RuleMatrixManager';
import { CustomerPortal } from './views/CustomerPortal';
import { BenchmarkAuditCockpit } from './views/BenchmarkAuditCockpit';
import { Toaster } from 'sonner';
import { fetchTickets } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('workspace');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [blockedCount, setBlockedCount] = useState(0);
  const [activeRole, setActiveRole] = useState('support_agent');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const refreshBadgeCount = async () => {
    try {
      const res = await fetchTickets({ only_blocked: true, limit: 100 });
      setBlockedCount(res.total || 0);
    } catch (err) {
      // Quiet fail if backend restarting
    }
  };

  useEffect(() => {
    refreshBadgeCount();
    const interval = setInterval(refreshBadgeCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTicketSubmitted = (newTicketId) => {
    setSelectedTicketId(newTicketId);
    refreshBadgeCount();
    setActiveTab('customer'); // Stay on customer view to see live ticket!
  };

  const handleInspectTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setActiveRole('support_agent');
    setActiveTab('workspace');
  };

  const handleSelectScenario = (scenarioId) => {
    setSelectedTicketId(scenarioId);
    setActiveRole('support_agent');
    setActiveTab('workspace');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-slate-100 flex relative selection:bg-[#7947EA]/35 selection:text-[#FF4D73]">
      {/* Global Toast Notifications (Sonner) */}
      <Toaster position="top-right" richColors closeButton expand={false} />

      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        blockedCount={blockedCount}
        activeRole={activeRole}
        onRoleChange={(role) => {
          setActiveRole(role);
          if (role === 'customer') {
            setActiveTab('customer');
          } else if (role === 'support_agent' || role === 'reviewer') {
            setActiveTab('queue');
          } else if (role === 'system_admin') {
            setActiveTab('workspace');
          }
        }}
      />

      {/* Main Shell Container (Offset by sidebar width: ml-64) */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <TopHeader
          onOpenGuide={() => setIsGuideOpen(true)}
          onSelectScenario={handleSelectScenario}
        />

        {/* Evaluator / Judge Interactive Walkthrough Modal */}
        <JudgeGuideModal 
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
          onSelectScenario={handleSelectScenario}
        />

        {/* Main Content Container: ml-64 p-8 min-h-screen bg-[var(--bg-canvas)] */}
        <main className="flex-1 p-8 bg-[var(--bg-canvas)]">
          {activeTab === 'workspace' && (
            <SupportAgentWorkspace 
              selectedTicketId={selectedTicketId}
              onSelectTicket={(id) => setSelectedTicketId(id)}
              onOpenGuide={() => setIsGuideOpen(true)}
              activeRole={activeRole}
            />
          )}

          {activeTab === 'queue' && (
            <ManualReviewQueue 
              onInspectTicket={handleInspectTicket}
            />
          )}

          {activeTab === 'submit' && (
            <PublicComplaintSubmission 
              onTicketSubmitted={handleTicketSubmitted}
            />
          )}

          {activeTab === 'customer' && (
            <CustomerPortal 
              onTicketSubmitted={handleTicketSubmitted}
              onInspectTicket={handleInspectTicket}
            />
          )}

          {activeTab === 'benchmark' && (
            <BenchmarkAuditCockpit 
              onInspectTicket={handleInspectTicket}
            />
          )}

          {activeTab === 'analytics' && (
            <ExecutiveDashboard 
              onNavigateToBenchmark={() => setActiveTab('benchmark')}
            />
          )}

          {activeTab === 'policies' && (
            <PolicyRegistryManager />
          )}

          {activeTab === 'rules' && (
            <RuleMatrixManager />
          )}
        </main>

        {/* Finova Sleek Minimal Footer */}
        <footer className="border-t border-white/[0.06] bg-[#0B0D18]/90 backdrop-blur-md py-4 px-8 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 w-full mt-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="font-medium text-slate-300">SupportNova Autonomous Governance Engine</span>
            <span className="text-white/20">•</span>
            <span className="font-mono text-[11px] text-slate-400">Finova Fintech Edition</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="text-[#7947EA] font-semibold">Pipeline 1: GenAI Flash</span>
            <span className="text-white/20">•</span>
            <span className="text-[#10B981] font-semibold">Pipeline 2: Zero-AI Python</span>
            <span className="text-white/20">•</span>
            <span className="text-[#06B6D4] font-semibold flex items-center gap-1">
              🍃 MongoDB Atlas + ChromaDB
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
