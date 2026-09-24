import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
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
  const [activeTab, setActiveTab] = useState('customer');
  const [selectedTicketId, setSelectedTicketId] = useState('TC-ADV-001');
  const [blockedCount, setBlockedCount] = useState(0);
  const [activeRole, setActiveRole] = useState('customer');
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col relative transition-colors duration-200">
      {/* Global Toast Notifications (Sonner) */}
      <Toaster position="top-right" richColors closeButton expand={false} />

      {/* Main Top Navigation */}
      <Navbar 
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
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Evaluator / Judge Interactive Walkthrough Modal */}
      <JudgeGuideModal 
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onSelectScenario={handleSelectScenario}
      />

      {/* View Container */}
      <main className="flex-1 pb-16">
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
          <CustomerPortal />
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

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs py-4 px-6 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full mt-auto">
        <div>
          SupportNova Autonomous Governance Engine — Aptech TechWiz 7 (ResponseX Intelligence)
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Pipeline 1: GenAI Flash</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Pipeline 2: Zero-AI Python</span>
          <span>•</span>
          <span className="text-slate-500 dark:text-slate-400">SQLite + ChromaDB</span>
        </div>
      </footer>
    </div>
  );
}
