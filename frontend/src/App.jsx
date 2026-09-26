import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { JudgeGuideModal } from './components/JudgeGuideModal';
import { AuthLoginModal, SYSTEM_PERSONAS } from './components/AuthLoginModal';
import { PublicComplaintSubmission } from './views/PublicComplaintSubmission';
import { SupportAgentWorkspace } from './views/SupportAgentWorkspace';
import { ManualReviewQueue } from './views/ManualReviewQueue';
import { ExecutiveDashboard } from './views/ExecutiveDashboard';
import { PolicyRegistryManager } from './views/PolicyRegistryManager';
import { RuleMatrixManager } from './views/RuleMatrixManager';
import { CustomerPortal } from './views/CustomerPortal';
import { BenchmarkAuditCockpit } from './views/BenchmarkAuditCockpit';
import { Toaster, toast } from 'sonner';
import { fetchTickets } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('queue');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [blockedCount, setBlockedCount] = useState(0);
  const [activeRole, setActiveRole] = useState('support_agent');
  const [currentUser, setCurrentUser] = useState(SYSTEM_PERSONAS.support_agent);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
    if (activeRole === 'customer') {
      setActiveRole('support_agent');
      setCurrentUser(SYSTEM_PERSONAS.support_agent);
    }
    setActiveTab('workspace');
  };

  const handleSelectScenario = (scenarioId) => {
    setSelectedTicketId(scenarioId);
    if (activeRole === 'customer') {
      setActiveRole('support_agent');
      setCurrentUser(SYSTEM_PERSONAS.support_agent);
    }
    setActiveTab('workspace');
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    const persona = SYSTEM_PERSONAS[role];
    if (persona) {
      setCurrentUser(persona);
    }
    if (role === 'customer') {
      setActiveTab('customer');
      toast.info('Switched to Customer persona (NovaStore & Orders)');
    } else if (role === 'support_agent') {
      setActiveTab('queue');
      toast.info('Switched to Support Specialist persona (Review Queue)');
    } else if (role === 'system_admin') {
      setActiveTab('workspace');
      toast.info('Switched to Executive System Admin persona (Full Authority)');
    }
  };

  const handleLoginFromModal = (userPayload) => {
    setActiveRole(userPayload.role);
    setCurrentUser(userPayload);
    if (userPayload.role === 'customer') {
      setActiveTab('customer');
    } else if (userPayload.role === 'support_agent') {
      setActiveTab('queue');
    } else if (userPayload.role === 'system_admin') {
      setActiveTab('workspace');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-slate-100 flex relative selection:bg-[#7947EA]/35 selection:text-[#FF4D73] overflow-x-hidden w-full max-w-full">
      {/* Global Toast Notifications (Sonner) */}
      <Toaster position="top-right" richColors closeButton expand={false} />

      {/* Left Navigation Sidebar (Strict RBAC, Finova styling) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        blockedCount={blockedCount}
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Shell Container: strictly constrained with min-w-0 max-w-[calc(100vw-16rem)] to prevent flex blowout */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen min-w-0 max-w-[calc(100vw-16rem)] overflow-x-hidden">
        {/* Top Header Bar */}
        <TopHeader
          onOpenGuide={() => setIsGuideOpen(true)}
          onSelectScenario={handleSelectScenario}
          activeRole={activeRole}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Glassmorphic Auth & Role Switcher Modal (Reference Image 2) */}
        <AuthLoginModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          activeRole={activeRole}
          onLogin={handleLoginFromModal}
        />

        {/* Evaluator / Judge Interactive Walkthrough Modal */}
        <JudgeGuideModal 
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
          onSelectScenario={handleSelectScenario}
        />

        {/* Main Content Container: fully responsive with min-w-0 and w-full */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[var(--bg-canvas)] min-w-0 w-full overflow-x-hidden">
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
        <footer className="border-t border-white/[0.06] bg-[#0B0D18]/90 backdrop-blur-md py-4 px-6 sm:px-8 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 w-full min-w-0 mt-auto">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0"></span>
            <span className="font-medium text-slate-300 truncate">SupportNova Autonomous Governance Engine</span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">Finova Fintech Edition</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 font-mono text-[11px] shrink-0">
            <span className="text-[#7947EA] font-semibold">Pipeline 1: GenAI Flash</span>
            <span className="text-white/20">•</span>
            <span className="text-[#10B981] font-semibold">Pipeline 2: Zero-AI Python</span>
            <span className="text-white/20 hidden md:inline">•</span>
            <span className="text-[#06B6D4] font-semibold hidden md:flex items-center gap-1">
              🍃 MongoDB Atlas
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
