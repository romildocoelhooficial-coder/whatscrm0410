/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AdminMasterView } from './components/views/AdminMasterView';
import { KanbanDealsView } from './components/views/KanbanDealsView';
import { AgentKanbanView } from './components/views/AgentKanbanView';
import { InboxChatView } from './components/views/InboxChatView';
import { AiAgentView } from './components/views/AiAgentView';
import { ReportsView } from './components/views/ReportsView';
import { GoogleCalendarView } from './components/views/GoogleCalendarView';
import { WebGadgetView } from './components/views/WebGadgetView';
import { SuperAdminView } from './components/views/SuperAdminView';
import { SuperAdminLoginPage } from './components/views/SuperAdminLoginPage';
import { CompanyLoginPage } from './components/views/CompanyLoginPage';
import { AgentModal } from './components/modals/AgentModal';
import { DepartmentModal } from './components/modals/DepartmentModal';
import { GatewayModal } from './components/modals/GatewayModal';
import { ScheduleMeetingModal } from './components/modals/ScheduleMeetingModal';
import { LoginModal } from './components/modals/LoginModal';
import { WhatsAppQrModal } from './components/modals/WhatsAppQrModal';
import { NewTenantModal } from './components/modals/NewTenantModal';
import { ChatGadgetWidget } from './components/gadget/ChatGadgetWidget';
import { ExternalWidgetEmbedView } from './components/gadget/ExternalWidgetEmbedView';

const MainContent: React.FC = () => {
  const { activeView } = useCRM();

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-100 overflow-y-auto min-h-screen">
      <Header />
      <main className="flex-1">
        {activeView === 'superadmin' && <SuperAdminView />}
        {activeView === 'admin' && <AdminMasterView />}
        {activeView === 'kanban-deals' && <KanbanDealsView />}
        {activeView === 'kanban-agent' && <AgentKanbanView />}
        {activeView === 'inbox' && <InboxChatView />}
        {activeView === 'gadget' && <WebGadgetView />}
        {activeView === 'ai-agent' && <AiAgentView />}
        {activeView === 'reports' && <ReportsView />}
        {activeView === 'calendar' && <GoogleCalendarView />}
      </main>

      {/* Floating Web Gadget Widget */}
      <ChatGadgetWidget />

      {/* Global Modals */}
      <AgentModal />
      <DepartmentModal />
      <GatewayModal />
      <WhatsAppQrModal />
      <NewTenantModal />
      <ScheduleMeetingModal />
      <LoginModal />
    </div>
  );
};

const RootApp: React.FC = () => {
  const { isAuthenticated, companyLoginTenantId, setCompanyLoginTenantId, tenants } = useCRM();

  if (!isAuthenticated) {
    if (companyLoginTenantId) {
      const targetTenant =
        tenants.find((t) => t.id === companyLoginTenantId || t.slug === companyLoginTenantId) ||
        tenants[0];
      return (
        <CompanyLoginPage
          tenant={targetTenant}
          onBackToGlobalLogin={() => {
            setCompanyLoginTenantId(null);
            if (typeof window !== 'undefined' && window.history) {
              const url = new URL(window.location.href);
              url.searchParams.delete('empresa');
              url.searchParams.delete('tenant');
              window.history.replaceState({}, '', url.toString());
            }
          }}
        />
      );
    }
    return <SuperAdminLoginPage />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 font-sans antialiased text-slate-800">
      <Sidebar />
      <MainContent />
    </div>
  );
};

export default function App() {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const embedMode = params.get('embed');
    const isEmbedPath = window.location.pathname.startsWith('/embed/widget');

    if (embedMode === 'bridge') {
      return <ExternalWidgetEmbedView mode="bridge" />;
    }
    if (embedMode === 'widget' || isEmbedPath) {
      return <ExternalWidgetEmbedView mode="widget" />;
    }
  }

  return (
    <CRMProvider>
      <RootApp />
    </CRMProvider>
  );
}
