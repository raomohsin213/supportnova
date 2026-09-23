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
import { fetchTickets } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('workspace');
  const [selectedTicketId, setSelectedTicketId] = useState('TC-ADV-001');
  const [blockedCount, setBlockedCount] = useState(0);
  const [activeRole, setActiveRole] = useState('system_admin');
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
    setActiveTab('workspace'); // Navigate straight to Diff Inspector!
  };

  const handleInspectTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setActiveTab('workspace');
  };

  const handleSelectScenario = (scenarioId) => {
    setSelectedTicketId(scenarioId);
    setActiveTab('workspace');
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background Cyber Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-rose-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

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
          } else if (role === 'reviewer') {
            setActiveTab('queue');
          } else if (role === 'support_agent') {
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

        {activeTab === 'analytics' && (
          <ExecutiveDashboard />
        )}

        {activeTab === 'policies' && (
          <PolicyRegistryManager />
        )}

        {activeTab === 'rules' && (
          <RuleMatrixManager />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-dark-900/90 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div>
          SupportNova Autonomous Governance Engine — Aptech TechWiz 7 (ResponseX Intelligence)
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span className="text-cyan-400">Pipeline 1: GenAI Flash</span>
          <span>•</span>
          <span className="text-emerald-400">Pipeline 2: Zero-AI Python</span>
          <span>•</span>
          <span className="text-slate-400">SQLite + ChromaDB</span>
        </div>
      </footer>
    </div>
  );
}
