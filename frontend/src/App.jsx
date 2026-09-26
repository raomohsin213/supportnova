import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
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
    <div className="min-h-screen bg-[#637394] p-3 sm:p-5 lg:p-7 flex items-center justify-center font-sans antialiased text-[#0F172A] selection:bg-indigo-100 selection:text-indigo-700">
      {/* Global Toast Notifications (Sonner) */}
      <Toaster position="top-right" richColors closeButton expand={false} />

      {/* The Master Floating Application Board (Jobtrain Spec: rounded-[36px], shadow-board, overflow-hidden) */}
      <div className="w-full max-w-[1580px] h-[95vh] bg-white rounded-[32px] sm:rounded-[36px] shadow-[0_30px_70px_-15px_rgba(15,23,42,0.28)] overflow-hidden flex flex-row relative border border-white/20">
        
        {/* Left Edge: Mini-Sidebar Icon Strip (w-20) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          blockedCount={blockedCount}
          activeRole={activeRole}
          onRoleChange={handleRoleChange}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Right Area: TopHeader + Main Content Scrollable Canvas */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F6F8FC] overflow-hidden h-full">
          {/* Master Board Header */}
          <TopHeader
            onSelectScenario={handleSelectScenario}
            activeRole={activeRole}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />

          {/* Glassmorphic Auth & Role Switcher Modal */}
          <AuthLoginModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            activeRole={activeRole}
            onLogin={handleLoginFromModal}
          />

          {/* Main Scrollable Canvas */}
          <main className="flex-1 p-5 sm:p-7 lg:p-8 bg-[#F6F8FC] overflow-y-auto min-w-0 w-full">
            {activeTab === 'workspace' && (
              <SupportAgentWorkspace 
                selectedTicketId={selectedTicketId}
                onSelectTicket={(id) => setSelectedTicketId(id)}
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
        </div>

      </div>
    </div>
  );
}
