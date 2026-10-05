import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Department,
  Agent,
  Deal,
  ChatTicket,
  GatewayConfig,
  AuditEvent,
  AiAgentSettings,
  WhatsAppEngine,
  DealStage,
  ChatPhase,
  WebGadgetConfig,
  TenantSystem,
  UserRole,
} from '../types/crm';
import {
  initialDepartments,
  initialAgents,
  initialDeals,
  initialChatTickets,
  initialGatewayConfig,
  initialAuditEvents,
  initialAiAgentSettings,
  initialTenants,
} from '../data/mockData';
import { requestAiFallbackReply } from '../services/geminiService';
import { soundEngine, SoundSettings, SoundPresetId } from '../services/soundService';

export interface IncomingCallAlert {
  id: string;
  ticketId: string;
  contactName: string;
  contactPhone: string;
  channel: 'chat' | 'whatsapp';
  departmentName: string;
  message: string;
  protocol: string;
}

export type AppView = 
  | 'superadmin'
  | 'admin'
  | 'kanban-deals'
  | 'kanban-agent'
  | 'inbox'
  | 'ai-agent'
  | 'reports'
  | 'calendar'
  | 'gadget';

export const initialWebGadgetConfig: WebGadgetConfig = {
  brandTitle: 'Atendimento OmniPulse',
  brandSubtitle: 'Equipe online no WhatsApp • Resposta média 45s',
  primaryColor: '#10B981',
  greetingMessage: 'Olá! Preencha seus dados abaixo para iniciar sua conversa com nosso time de especialistas.',
  buttonPosition: 'bottom-right',
  defaultDepartmentId: 'dept-02',
  autoOpen: false,
};

interface CRMContextType {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  departments: Department[];
  visibleDepartments: Department[];
  agents: Agent[];
  deals: Deal[];
  visibleDeals: Deal[];
  tickets: ChatTicket[];
  visibleTickets: ChatTicket[];
  canViewAllDepartmentsAndTickets: boolean;
  gatewayConfig: GatewayConfig;
  auditEvents: AuditEvent[];
  aiSettings: AiAgentSettings;
  webGadgetConfig: WebGadgetConfig;
  currentAgent: Agent;
  selectedTicket: ChatTicket | null;
  setSelectedTicket: (ticket: ChatTicket | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Multi-Tenant / Super Admin
  tenants: TenantSystem[];
  currentTenant: TenantSystem;
  currentTenantId: string;
  addTenant: (data: Omit<TenantSystem, 'id' | 'createdAt' | 'agentCount' | 'activeTicketsCount'>) => void;
  updateTenant: (tenantId: string, updates: Partial<TenantSystem>) => void;
  updateCurrentTenantCredentials: (email: string, password: string, name?: string) => void;
  switchTenant: (tenantId: string) => void;
  isNewTenantModalOpen: boolean;
  setIsNewTenantModalOpen: (open: boolean) => void;
  companyLoginTenantId: string | null;
  setCompanyLoginTenantId: (tenantId: string | null) => void;
  openCompanyLogin: (tenantIdOrSlug: string) => void;
  loginWithTenantScope: (tenantId: string, email: string, password: string) => { success: boolean; error?: string };

  // Authentication & Passwords & RBAC
  isAuthenticated: boolean;
  currentUserRole: UserRole;
  canManageSettings: boolean;
  canAccessSuperAdmin: boolean;
  superAdminCredentials: { email: string; password: string };
  updateSuperAdminCredentials: (creds: { email?: string; password?: string }) => void;
  login: (emailOrPassword: string, passwordArg?: string) => { success: boolean; error?: string };
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;

  // Primary Phone Number
  updatePrimaryPhoneNumber: (newPhone: string) => void;

  // QR Code Activation
  openQrCodeForActivation: () => void;

  // Web Gadget Embed
  updateWebGadgetConfig: (updates: Partial<WebGadgetConfig>) => void;
  isGadgetFloatingOpen: boolean;
  setIsGadgetFloatingOpen: (open: boolean) => void;
  startChatFromGadget: (data: {
    name: string;
    email: string;
    phone: string;
    departmentId: string;
    message: string;
    channel?: 'whatsapp' | 'chat';
  }) => Promise<string>;
  
  // Department CRUD
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  // Agent CRUD & Status
  addAgent: (agent: Omit<Agent, 'id'>) => { success: boolean; error?: string };
  updateAgent: (id: string, agent: Partial<Agent>) => { success: boolean; error?: string };
  deleteAgent: (id: string) => void;
  toggleAgentStatus: (id: string, newStatus: Agent['status']) => void;
  switchCurrentAgent: (agentId: string) => void;

  // Deals & Funnel
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDealStage: (dealId: string, newStage: DealStage) => void;
  updateDeal: (dealId: string, updates: Partial<Deal>) => void;
  deleteDeal: (dealId: string) => void;

  // Tickets & Chat
  sendChatMessage: (ticketId: string, text: string, sender?: 'agent' | 'contact' | 'ai_bot') => Promise<void>;
  updateTicketPhase: (ticketId: string, newPhase: ChatPhase) => void;
  transferTicket: (ticketId: string, targetDeptId: string, targetAgentId?: string | null) => void;
  assignTicketToAgent: (ticketId: string, agentId: string | null) => void;
  triggerAiFallbackForTicket: (ticketId: string) => Promise<void>;

  // Gateway & Failover
  switchActiveEngine: (newEngine?: WhatsAppEngine) => void;
  updateGatewayConfig: (updates: Partial<GatewayConfig>) => void;
  simulateWebhookEvent: (engine: WhatsAppEngine, message: string, phone: string, name: string) => void;

  // AI Settings
  updateAiSettings: (settings: Partial<AiAgentSettings>) => void;

  // Modals & Helpers
  isAgentModalOpen: boolean;
  setIsAgentModalOpen: (open: boolean) => void;
  editingAgent: Agent | null;
  setEditingAgent: (agent: Agent | null) => void;

  isDeptModalOpen: boolean;
  setIsDeptModalOpen: (open: boolean) => void;
  editingDept: Department | null;
  setEditingDept: (dept: Department | null) => void;

  isGatewayModalOpen: boolean;
  setIsGatewayModalOpen: (open: boolean) => void;

  isScheduleModalOpen: boolean;
  setIsScheduleModalOpen: (open: boolean) => void;
  scheduleTargetLead: { name: string; email?: string; phone: string; dealId?: string } | null;
  setScheduleTargetLead: (target: { name: string; email?: string; phone: string; dealId?: string } | null) => void;

  isQrModalOpen: boolean;
  setIsQrModalOpen: (open: boolean) => void;
  whatsappConnectionState: 'connecting' | 'open' | 'close' | 'qrcode';
  setWhatsappConnectionState: (state: 'connecting' | 'open' | 'close' | 'qrcode') => void;

  // Sound Chime & Incoming Attendance Alert
  soundSettings: SoundSettings;
  updateSoundSettings: (updates: Partial<SoundSettings>) => void;
  playAttendanceChime: (
    channel: 'chat' | 'whatsapp',
    type?: 'new_ticket' | 'message',
    presetOverride?: SoundPresetId
  ) => void;
  isBellRinging: boolean;
  incomingCallAlert: IncomingCallAlert | null;
  dismissIncomingCallAlert: () => void;
  simulateIncomingAttendanceCall: (channel: 'chat' | 'whatsapp') => Promise<void>;

  triggerConfetti: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<AppView>('superadmin');
  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('omnipulse_departments');
    return saved ? JSON.parse(saved) : initialDepartments;
  });

  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem('omnipulse_agents');
    if (saved) {
      try {
        const parsed: Agent[] = JSON.parse(saved);
        // Ensure all initial tenant-specific agents exist and have tenantId
        const merged = parsed.map((a) => {
          let updated = a;
          if (!updated.tenantId) {
            if (updated.id === 'agent-05' || updated.id === 'agent-06') {
              updated = { ...updated, tenantId: 'tenant-clinica-saude' };
            } else {
              updated = { ...updated, tenantId: 'tenant-omnipulse' };
            }
          }
          if (updated.id === 'agent-04' && updated.role === 'Operador Sênior') {
            updated = { ...updated, role: 'Atendente N1', status: 'online' };
          }
          if (updated.id === 'agent-05' && updated.role === 'Closer Comercial') {
            updated = { ...updated, role: 'Atendente N1' };
          }
          return updated;
        });
        for (const initAg of initialAgents) {
          if (!merged.some((m) => m.id === initAg.id)) {
            merged.push(initAg);
          }
        }
        return merged;
      } catch (e) {
        return initialAgents;
      }
    }
    return initialAgents;
  });

  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem('omnipulse_deals');
    if (saved) {
      try {
        const parsed: Deal[] = JSON.parse(saved);
        for (const initD of initialDeals) {
          if (!parsed.some((d) => d.id === initD.id)) {
            parsed.push(initD);
          }
        }
        return parsed;
      } catch (e) {
        return initialDeals;
      }
    }
    return initialDeals;
  });

  const [tickets, setTickets] = useState<ChatTicket[]>(() => {
    const saved = localStorage.getItem('omnipulse_tickets');
    if (saved) {
      try {
        const parsed: ChatTicket[] = JSON.parse(saved);
        for (const initT of initialChatTickets) {
          if (!parsed.some((t) => t.id === initT.id)) {
            parsed.push(initT);
          }
        }
        return parsed;
      } catch (e) {
        return initialChatTickets;
      }
    }
    return initialChatTickets;
  });

  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfig>(() => {
    const saved = localStorage.getItem('omnipulse_gateway');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...initialGatewayConfig,
          ...parsed,
          primaryPhoneNumber:
            parsed.primaryPhoneNumber || initialGatewayConfig.primaryPhoneNumber || '+55 11 98765-4321',
          evolution: {
            ...initialGatewayConfig.evolution,
            ...(parsed.evolution || {}),
          },
          uazapi: {
            ...initialGatewayConfig.uazapi,
            ...(parsed.uazapi || {}),
          },
          metaCloud: {
            ...initialGatewayConfig.metaCloud,
            ...(parsed.metaCloud || {}),
          },
        };
      } catch (e) {
        return initialGatewayConfig;
      }
    }
    return initialGatewayConfig;
  });

  const [superAdminCredentials, setSuperAdminCredentials] = useState<{ email: string; password: string }>(() => {
    const saved = localStorage.getItem('omnipulse_superadmin_creds');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return { email: 'superadmin@omnipulse.io', password: 'superadmin123' };
  });

  useEffect(() => {
    localStorage.setItem('omnipulse_superadmin_creds', JSON.stringify(superAdminCredentials));
  }, [superAdminCredentials]);

  const updateSuperAdminCredentials = (creds: { email?: string; password?: string }) => {
    setSuperAdminCredentials((prev) => ({
      ...prev,
      ...creds,
    }));
  };

  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => {
    const saved = localStorage.getItem('omnipulse_audit');
    return saved ? JSON.parse(saved) : initialAuditEvents;
  });

  const [aiSettings, setAiSettings] = useState<AiAgentSettings>(() => {
    const saved = localStorage.getItem('omnipulse_ai_settings');
    return saved ? JSON.parse(saved) : initialAiAgentSettings;
  });

  const [tenantGadgetConfigs, setTenantGadgetConfigs] = useState<Record<string, WebGadgetConfig>>(() => {
    const saved = localStorage.getItem('omnipulse_tenant_gadgets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {};
  });

  // Sound Chime Settings
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(() => {
    const saved = localStorage.getItem('omnipulse_sound_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      enabled: true,
      volume: 0.85,
      preset: 'crystal_bell',
      playOnNewTicket: true,
      playOnIncomingMessage: true,
      doubleRingOnNewTicket: true,
    };
  });

  const [isBellRinging, setIsBellRinging] = useState(false);
  const [incomingCallAlert, setIncomingCallAlert] = useState<IncomingCallAlert | null>(null);

  useEffect(() => {
    localStorage.setItem('omnipulse_sound_settings', JSON.stringify(soundSettings));
  }, [soundSettings]);

  const updateSoundSettings = (updates: Partial<SoundSettings>) => {
    setSoundSettings((prev) => ({ ...prev, ...updates }));
  };

  const dismissIncomingCallAlert = () => {
    setIncomingCallAlert(null);
  };

  const playAttendanceChime = (
    channel: 'chat' | 'whatsapp',
    type: 'new_ticket' | 'message' = 'new_ticket',
    presetOverride?: SoundPresetId
  ) => {
    // Trigger visual bell shake even if testing
    setIsBellRinging(true);
    setTimeout(() => setIsBellRinging(false), 2400);

    if (!soundSettings.enabled && !presetOverride) return;

    if (presetOverride) {
      soundEngine.playPreset(presetOverride, soundSettings.volume, false);
      return;
    }

    if (type === 'new_ticket' && soundSettings.playOnNewTicket) {
      soundEngine.playPreset(
        soundSettings.preset,
        soundSettings.volume,
        soundSettings.doubleRingOnNewTicket
      );
    } else if (type === 'message' && soundSettings.playOnIncomingMessage) {
      soundEngine.playMessagePop(channel, soundSettings.volume);
    }
  };

  // Multi-Tenant state
  const [tenants, setTenants] = useState<TenantSystem[]>(() => {
    const saved = localStorage.getItem('omnipulse_tenants');
    return saved ? JSON.parse(saved) : initialTenants;
  });
  const [currentTenantId, setCurrentTenantId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const slugOrId = params.get('empresa') || params.get('tenant');
      if (slugOrId) {
        const saved = localStorage.getItem('omnipulse_tenants');
        const list: TenantSystem[] = saved ? JSON.parse(saved) : initialTenants;
        const match = list.find((t) => t.slug === slugOrId || t.id === slugOrId);
        if (match) return match.id;
      }
    }
    return 'tenant-omnipulse';
  });
  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('superadmin');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isGadgetFloatingOpen, setIsGadgetFloatingOpen] = useState(false);

  const [currentAgentId, setCurrentAgentId] = useState<string>('agent-master');
  const [selectedTicket, setSelectedTicket] = useState<ChatTicket | null>(initialChatTickets[0] || null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [whatsappConnectionState, setWhatsappConnectionState] = useState<'connecting' | 'open' | 'close' | 'qrcode'>('qrcode');
  const [scheduleTargetLead, setScheduleTargetLead] = useState<{
    name: string;
    email?: string;
    phone: string;
    dealId?: string;
  } | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('omnipulse_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('omnipulse_agents', JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    localStorage.setItem('omnipulse_deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('omnipulse_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('omnipulse_gateway', JSON.stringify(gatewayConfig));
  }, [gatewayConfig]);

  useEffect(() => {
    localStorage.setItem('omnipulse_audit', JSON.stringify(auditEvents));
  }, [auditEvents]);

  useEffect(() => {
    localStorage.setItem('omnipulse_ai_settings', JSON.stringify(aiSettings));
  }, [aiSettings]);

  useEffect(() => {
    localStorage.setItem('omnipulse_tenant_gadgets', JSON.stringify(tenantGadgetConfigs));
  }, [tenantGadgetConfigs]);

  useEffect(() => {
    localStorage.setItem('omnipulse_tenants', JSON.stringify(tenants));
  }, [tenants]);

  const currentTenant = tenants.find((t) => t.id === currentTenantId) || tenants[0];

  // Sync gatewayConfig phone & engine whenever currentTenant changes
  useEffect(() => {
    if (currentTenant) {
      setGatewayConfig((prev) => ({
        ...prev,
        primaryPhoneNumber: currentTenant.primaryPhoneNumber,
        activeEngine: currentTenant.whatsappEngine || prev.activeEngine,
      }));
    }
  }, [currentTenantId, currentTenant?.primaryPhoneNumber, currentTenant?.whatsappEngine]);

  // Scoped agents belonging exclusively to the current company (tenant)
  const tenantAgents = agents.filter(
    (a) =>
      a.tenantId === currentTenantId ||
      (!a.tenantId && currentTenantId === 'tenant-omnipulse')
  );

  // Per-company Web Gadget configuration
  const webGadgetConfig: WebGadgetConfig = tenantGadgetConfigs[currentTenantId] || {
    ...initialWebGadgetConfig,
    brandTitle: `Atendimento ${currentTenant?.name || 'OmniPulse'}`,
    brandSubtitle: `${currentTenant?.name || 'Equipe'} Online • WhatsApp ${currentTenant?.primaryPhoneNumber || ''}`,
    greetingMessage: `Olá! Bem-vindo ao canal de atendimento exclusivo da ${currentTenant?.name || 'nossa empresa'}. Escolha abaixo se prefere atendimento via Chat ou via WhatsApp:`,
  };

  const currentAgent =
    tenantAgents.find((a) => a.id === currentAgentId) ||
    tenantAgents.find((a) => a.isMasterAdmin) ||
    tenantAgents[0] ||
    agents[0];

  // RBAC Permission Flags
  const canManageSettings = currentUserRole === 'superadmin' || currentUserRole === 'admin';
  const canAccessSuperAdmin = currentUserRole === 'superadmin';

  // Only Operador Sênior and Admin (Admin Master / Administrador Geral / Super Admin)
  // can view ALL departments and ALL atendimentos/deals.
  // Atendente N1 (and any non-Senior / non-Admin attendant) ONLY sees their own atendimentos.
  const isAgentMasterOrAdmin =
    Boolean(currentAgent?.isMasterAdmin) ||
    currentAgent?.role === 'Administrador Geral';
  const isAgentSenior = currentAgent?.role === 'Operador Sênior';

  const canViewAllDepartmentsAndTickets =
    currentUserRole === 'superadmin' ||
    isAgentMasterOrAdmin ||
    isAgentSenior ||
    (currentUserRole === 'admin' && currentAgent?.role !== 'Atendente N1');

  // State for Dedicated Company Login Portal
  const [companyLoginTenantId, setCompanyLoginTenantId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const slugOrId = params.get('empresa') || params.get('tenant');
      if (slugOrId) {
        const saved = localStorage.getItem('omnipulse_tenants');
        const list: TenantSystem[] = saved ? JSON.parse(saved) : initialTenants;
        const match = list.find((t) => t.slug === slugOrId || t.id === slugOrId);
        if (match) return match.id;
      }
    }
    return null;
  });

  const openCompanyLogin = (tenantIdOrSlug: string) => {
    const match = tenants.find((t) => t.id === tenantIdOrSlug || t.slug === tenantIdOrSlug);
    if (match) {
      setCompanyLoginTenantId(match.id);
      setIsAuthenticated(false);
      if (typeof window !== 'undefined' && window.history) {
        const url = new URL(window.location.href);
        url.searchParams.set('empresa', match.slug || match.id);
        window.history.replaceState({}, '', url.toString());
      }
    }
  };

  // Company-scoped tickets & deals
  const tenantTickets = tickets.filter((t) => {
    if (!t.tenantId) {
      return currentTenantId === 'tenant-omnipulse' || currentUserRole === 'superadmin';
    }
    return t.tenantId === currentTenantId;
  });

  const tenantDeals = deals.filter((d) => {
    if (!d.tenantId) {
      return currentTenantId === 'tenant-omnipulse' || currentUserRole === 'superadmin';
    }
    return d.tenantId === currentTenantId;
  });

  // Attendant isolation:
  // - Operador Sênior & Admin (Admin Master / Super Admin) see ALL departments and ALL atendimentos/deals of the company
  // - Atendente N1 (and non-Senior/non-Admin attendants) ONLY see their own atendimentos (assignedAgentId === currentAgent.id)
  const visibleTickets = canViewAllDepartmentsAndTickets
    ? tenantTickets
    : tenantTickets.filter((t) => t.assignedAgentId === currentAgent?.id);

  const visibleDeals = canViewAllDepartmentsAndTickets
    ? tenantDeals
    : tenantDeals.filter((d) => d.assignedAgentId === currentAgent?.id);

  const visibleDepartments = canViewAllDepartmentsAndTickets
    ? departments
    : departments.filter(
        (d) =>
          visibleTickets.some((t) => t.departmentId === d.id) ||
          currentAgent?.departments?.includes(d.name)
      );

  // Track processed external sessions and message IDs to avoid duplicate alerts
  const processedSessionIdsRef = useRef<Set<string>>(
    new Set(tickets.map((t) => t.id))
  );
  const processedMsgIdsRef = useRef<Set<string>>(
    new Set(tickets.flatMap((t) => t.messages.map((m) => m.id)))
  );

  // Real-Time Sync for External Widget Calls & Messages (BroadcastChannel + localStorage + Backend Webhook API)
  useEffect(() => {
    let isMounted = true;

    const processExternalSessions = (sessions: any[]) => {
      if (!isMounted || !Array.isArray(sessions)) return;

      for (const session of sessions) {
        const sId: string = session?.sessionId;
        if (!sId) continue;

        if (!processedSessionIdsRef.current.has(sId)) {
          processedSessionIdsRef.current.add(sId);
          if (Array.isArray(session.messages)) {
            session.messages.forEach((m: any) => {
              if (m?.id) processedMsgIdsRef.current.add(m.id);
            });
          }

          const selectedChannel: 'chat' | 'whatsapp' =
            session.originChannel === 'whatsapp' ? 'whatsapp' : 'chat';
          const isChatChannel = selectedChannel === 'chat';

          // Match department by ID or name
          const dept =
            departments.find(
              (d) =>
                d.id === session.department ||
                d.name
                  .toLowerCase()
                  .includes(String(session.department || '').toLowerCase())
            ) || departments[0];

          // Match tenant by ID, slug, or companyName, or route to active tenant so logged-in attendant receives it
          const matchedTenant =
            tenants.find(
              (t) =>
                (session.tenantId && t.id === session.tenantId) ||
                (session.tenantSlug && t.slug === session.tenantSlug) ||
                (session.tenantSlug && t.id === session.tenantSlug) ||
                (session.companyName &&
                  t.name
                    .toLowerCase()
                    .includes(String(session.companyName).toLowerCase()))
            ) || currentTenant;

          // Ensure the currently logged-in attendant/admin of the active company sees the call immediately
          const effectiveTenantId =
            currentUserRole === 'atendente' || currentUserRole === 'admin'
              ? currentTenantId
              : matchedTenant?.id || currentTenantId;

          const timeStr =
            session.messages?.[0]?.timestamp ||
            `${String(new Date().getHours()).padStart(2, '0')}:${String(
              new Date().getMinutes()
            ).padStart(2, '0')}`;

          const mappedMessages = Array.isArray(session.messages)
            ? session.messages.map((m: any) => ({
                id: m.id || `m-${Date.now()}`,
                sender: (m.sender === 'agent' || m.sender === 'ai_bot'
                  ? m.sender
                  : 'contact') as 'contact' | 'agent' | 'ai_bot',
                senderName:
                  m.senderName ||
                  (m.sender === 'contact' ? session.name : currentAgent.name),
                text: m.text || '',
                timestamp: m.timestamp || timeStr,
                status: 'delivered' as const,
              }))
            : [];

          const lastMsgText =
            mappedMessages.length > 0
              ? mappedMessages[mappedMessages.length - 1].text
              : session.message || 'Novo chamado externo';

          const newExternalTicket: ChatTicket = {
            id: sId,
            tenantId: effectiveTenantId,
            protocol:
              session.protocol ||
              (isChatChannel
                ? `OP-CHAT-${Date.now().toString().slice(-4)}`
                : `OP-WA-${Date.now().toString().slice(-4)}`),
            contactName: session.name || 'Cliente Site Externo',
            contactPhone: session.phone || '+55 11 99999-0000',
            contactAvatar:
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
            departmentId: dept?.id || 'dept-01',
            assignedAgentId: currentAgent.id,
            phase: 'em_atendimento',
            unreadCount: 1,
            lastMessage: lastMsgText,
            lastMessageTime: timeStr,
            priority: 'high',
            tags: isChatChannel
              ? ['Origem: Chat', 'Widget Externo']
              : ['Origem: WhatsApp', 'Widget Externo'],
            aiHandled: false,
            waitingTimeSeconds: 2,
            slaExceeded: false,
            originEngine: isChatChannel ? 'web_chat' : gatewayConfig.activeEngine,
            originChannel: selectedChannel,
            messages: mappedMessages,
          };

          setTickets((prev) => {
            if (prev.some((t) => t.id === sId)) return prev;
            return [newExternalTicket, ...prev];
          });
          setSelectedTicket(newExternalTicket);

          // Ring the Attendant Sound Chime & Show Live Call Banner!
          playAttendanceChime(selectedChannel, 'new_ticket');
          setIncomingCallAlert({
            id: `alert-${Date.now()}`,
            ticketId: sId,
            contactName: newExternalTicket.contactName,
            contactPhone: newExternalTicket.contactPhone,
            channel: selectedChannel,
            departmentName:
              dept?.name || session.department || 'Atendimento Geral',
            message: session.messages?.[0]?.text || lastMsgText,
            protocol: newExternalTicket.protocol,
          });

          addAuditEvent({
            type: 'conectividade',
            title: isChatChannel
              ? `Chamada Widget Externo (Chat) — ${
                  matchedTenant?.name || currentTenant.name
                }`
              : `Chamada Widget Externo (WhatsApp) — ${
                  matchedTenant?.name || currentTenant.name
                }`,
            description: `Cliente ${newExternalTicket.contactName} (${
              newExternalTicket.contactPhone
            }) iniciou atendimento via Widget Externo no setor ${
              dept?.name || 'Geral'
            }.`,
            author: isChatChannel
              ? 'Widget Externo (Chat)'
              : 'Widget Externo (WhatsApp)',
            badge: isChatChannel ? 'Origem: Chat' : 'Origem: WhatsApp',
          });
        } else if (Array.isArray(session.messages)) {
          // Check if there are new messages from the external customer inside an existing session
          const newCustomerMessages = session.messages.filter(
            (m: any) => m?.id && !processedMsgIdsRef.current.has(m.id)
          );

          if (newCustomerMessages.length > 0) {
            newCustomerMessages.forEach((m: any) => {
              processedMsgIdsRef.current.add(m.id);
            });

            const hasNewContactMsg = newCustomerMessages.some(
              (m: any) => m.sender === 'contact'
            );

            setTickets((prev) =>
              prev.map((t) => {
                if (t.id !== sId) return t;
                const existingIds = new Set(t.messages.map((msg) => msg.id));
                const toAppend = newCustomerMessages
                  .filter((m: any) => !existingIds.has(m.id))
                  .map((m: any) => ({
                    id: m.id,
                    sender: (m.sender === 'agent' || m.sender === 'ai_bot'
                      ? m.sender
                      : 'contact') as 'contact' | 'agent' | 'ai_bot',
                    senderName:
                      m.senderName ||
                      (m.sender === 'contact' ? t.contactName : currentAgent.name),
                    text: m.text,
                    timestamp: m.timestamp || t.lastMessageTime,
                    status: 'delivered' as const,
                  }));

                if (toAppend.length === 0) return t;
                const lastAdded = toAppend[toAppend.length - 1];
                return {
                  ...t,
                  lastMessage: lastAdded.text,
                  lastMessageTime: lastAdded.timestamp,
                  unreadCount: hasNewContactMsg
                    ? t.unreadCount + toAppend.length
                    : t.unreadCount,
                  messages: [...t.messages, ...toAppend],
                };
              })
            );

            if (hasNewContactMsg) {
              const ch: 'chat' | 'whatsapp' =
                session.originChannel === 'whatsapp' ? 'whatsapp' : 'chat';
              playAttendanceChime(ch, 'message');
            }
          }
        }
      }
    };

    const checkLocalAndRemoteSessions = async () => {
      // 1. Check localStorage external sessions (works on Vercel static hosting & cross-tab)
      try {
        const rawLocal = localStorage.getItem('omnipulse_external_sessions');
        if (rawLocal) {
          const parsedLocal = JSON.parse(rawLocal);
          if (Array.isArray(parsedLocal)) {
            processExternalSessions(parsedLocal);
          }
        }
      } catch {
        // ignore
      }

      // 2. Check backend API external events
      try {
        const res = await fetch('/api/webhook/external-events');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.sessions)) {
            processExternalSessions(data.sessions);
          }
        }
      } catch {
        // ignore
      }
    };

    // 3. Instant BroadcastChannel listener (< 5ms latency)
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('omnipulse_crm_realtime');
        bc.onmessage = (event) => {
          const data = event.data;
          if (!data || typeof data !== 'object') return;
          if (data.type === 'OMNIPULSE_EXTERNAL_SESSION' && data.session) {
            processExternalSessions([data.session]);
          } else if (
            data.type === 'OMNIPULSE_CUSTOMER_MESSAGE' &&
            data.sessionId &&
            data.message
          ) {
            checkLocalAndRemoteSessions();
          }
        };
      }
    } catch {
      // ignore
    }

    // 4. Native window storage event listener
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'omnipulse_external_sessions' && e.newValue) {
        try {
          const list = JSON.parse(e.newValue);
          if (Array.isArray(list)) {
            processExternalSessions(list);
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    checkLocalAndRemoteSessions();
    const intervalId = setInterval(checkLocalAndRemoteSessions, 1200);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageEvent);
      if (bc) {
        bc.close();
      }
    };
  }, [currentTenantId, currentUserRole, currentAgent.id, departments, tenants]);

  const openQrCodeForActivation = () => {
    // Lock API & WhatsApp QR configuration: Attendants CANNOT open QR pairing
    if (currentUserRole === 'atendente') return;
    setWhatsappConnectionState('qrcode');
    setIsQrModalOpen(true);
  };

  const addTenant = (data: Omit<TenantSystem, 'id' | 'createdAt' | 'agentCount' | 'activeTicketsCount'>) => {
    const rawSlug = (data as any).slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const uniqueSlug = rawSlug || `empresa-${Date.now().toString().slice(-4)}`;
    const newTenantId = `tenant-${Date.now().toString().slice(-6)}`;

    const newTenant: TenantSystem = {
      ...data,
      slug: uniqueSlug,
      id: newTenantId,
      createdAt: new Date().toISOString().split('T')[0],
      agentCount: 1,
      activeTicketsCount: 0,
      whatsappStatus: 'qrcode',
    };

    setTenants((prev) => [newTenant, ...prev]);

    // Automatically create the Master Admin agent for this newly created company
    const newMasterAgent: Agent = {
      id: `agent-master-${newTenantId}`,
      tenantId: newTenantId,
      name: data.masterAdminName,
      email: data.masterAdminEmail,
      phone: data.primaryPhoneNumber,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      role: 'Administrador Geral',
      isMasterAdmin: true,
      password: data.masterAdminPassword || 'admin123',
      departments: departments.slice(0, 4).map((d) => d.name),
      status: 'online',
      shift: 'Turno Master 08:00 - 19:00',
      activeChats: 0,
      maxChats: 10,
      rating: 5.0,
      totalResolved: 0,
      conversionRate: 0,
      avgResponseTimeSeconds: 25,
      avgResolutionTimeMinutes: 10,
      revenueGenerated: 0,
    };

    setAgents((prev) => [newMasterAgent, ...prev]);

    addAuditEvent({
      type: 'config',
      title: `Novo Sistema Cadastrado: ${data.name}`,
      description: `Tenant criado pelo Super Admin. Rota Individual: /?empresa=${uniqueSlug}. Linha WhatsApp: ${data.primaryPhoneNumber}. Admin Master: ${data.masterAdminName}.`,
      author: 'Super Admin',
      badge: 'Novo Tenant',
    });
  };

  const updateTenant = (tenantId: string, updates: Partial<TenantSystem>) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, ...updates } : t))
    );

    // If current tenant is being updated, also sync gateway phone number if changed
    if (tenantId === currentTenantId && updates.primaryPhoneNumber) {
      setGatewayConfig((prev) => ({
        ...prev,
        primaryPhoneNumber: updates.primaryPhoneNumber!,
      }));
    }

    // Sync Master Admin agent in the agents list if email, password, or name changed
    if (updates.masterAdminEmail || updates.masterAdminName || updates.masterAdminPassword) {
      setAgents((prev) =>
        prev.map((a) =>
          a.isMasterAdmin
            ? {
                ...a,
                name: updates.masterAdminName || a.name,
                email: updates.masterAdminEmail || a.email,
                password: updates.masterAdminPassword || a.password,
              }
            : a
        )
      );
    }

    addAuditEvent({
      type: 'config',
      title: 'Configurações de Acesso & Empresa Atualizadas',
      description: `Credenciais de acesso e parâmetros do sistema [${tenantId}] foram salvos na administração.`,
      author: 'Administração Master',
      badge: 'Segurança',
    });
  };

  const updateCurrentTenantCredentials = (email: string, password: string, name?: string) => {
    updateTenant(currentTenantId, {
      masterAdminEmail: email,
      masterAdminPassword: password,
      ...(name ? { masterAdminName: name } : {}),
    });
  };

  const switchTenant = (tenantId: string) => {
    const target = tenants.find((t) => t.id === tenantId);
    if (!target) return;

    setCurrentTenantId(tenantId);
    const targetMaster = agents.find(
      (a) => a.tenantId === tenantId && a.isMasterAdmin
    );
    if (targetMaster) {
      setCurrentAgentId(targetMaster.id);
    }
    setGatewayConfig((prev) => ({
      ...prev,
      primaryPhoneNumber: target.primaryPhoneNumber,
      activeEngine: target.whatsappEngine || prev.activeEngine,
    }));

    addAuditEvent({
      type: 'conectividade',
      title: `Chaveamento para Sistema: ${target.name}`,
      description: `Instância WhatsApp alternada para: ${target.primaryPhoneNumber}.`,
      author: 'Super Admin',
      badge: 'Multi-Tenant',
    });
  };

  const login = (
    emailOrPassword: string,
    passwordArg?: string
  ): { success: boolean; error?: string } => {
    let email = '';
    let password = '';

    if (passwordArg !== undefined) {
      email = emailOrPassword.trim().toLowerCase();
      password = passwordArg.trim();
    } else {
      password = emailOrPassword.trim();
    }

    // 1. Check Super Admin (email matches superadmin creds or default)
    const isSuperAdminEmail =
      !email ||
      email === superAdminCredentials.email.toLowerCase() ||
      email === 'superadmin@omnipulse.io';

    const isSuperAdminPassword =
      password === superAdminCredentials.password || password === 'superadmin123';

    if (isSuperAdminEmail && isSuperAdminPassword) {
      setIsAuthenticated(true);
      setCurrentUserRole('superadmin');
      setActiveView('superadmin');
      const adminAgent = agents.find((a) => a.isMasterAdmin) || agents[0];
      setCurrentAgentId(adminAgent.id);
      addAuditEvent({
        type: 'validacao',
        title: 'Login de Super Administrador',
        description: `Acesso autenticado ao painel global de infraestrutura e gestão multi-sistemas (${superAdminCredentials.email}).`,
        author: 'Super Admin Master',
        badge: 'Super Admin',
      });
      return { success: true };
    }

    // 2. Check Admin Master (prioritize currentTenant when logging in via password modal, or match by email)
    const matchingTenant = email
      ? tenants.find(
          (t) =>
            t.masterAdminEmail.toLowerCase() === email ||
            (t.id === currentTenantId &&
              (email === 'isabella.admin@omnipulse.io' ||
                email === 'isabella.rodrigues@omnipulse.io'))
        ) || currentTenant
      : currentTenant;

    if (matchingTenant) {
      const isTenantAdminPassword =
        password === matchingTenant.masterAdminPassword ||
        password === currentTenant.masterAdminPassword ||
        password === 'admin123';

      if (isTenantAdminPassword) {
        setIsAuthenticated(true);
        setCurrentUserRole('admin');
        setCurrentTenantId(matchingTenant.id);
        setActiveView('admin');
        const adminAgent =
          agents.find((a) => a.tenantId === matchingTenant.id && a.isMasterAdmin) ||
          agents.find((a) => a.isMasterAdmin) ||
          agents[0];
        setCurrentAgentId(adminAgent.id);
        addAuditEvent({
          type: 'validacao',
          title: `Login de Admin Master - ${matchingTenant.name}`,
          description: `Acesso autenticado da empresa (${matchingTenant.masterAdminEmail}).`,
          author: matchingTenant.masterAdminName || adminAgent.name,
          badge: 'Admin Master',
        });
        return { success: true };
      }
    }

    // 3. Check Atendentes (scoped to currentTenant first)
    const matchedAgent =
      tenantAgents.find((a) => {
        const emailMatches = !email || a.email.toLowerCase() === email;
        const passMatches =
          (a.password || 'atendente123') === password || password === 'atendente123';
        return emailMatches && passMatches && !a.isMasterAdmin;
      }) ||
      agents.find((a) => {
        const emailMatches = !email || a.email.toLowerCase() === email;
        const passMatches =
          (a.password || 'atendente123') === password || password === 'atendente123';
        return emailMatches && passMatches;
      });

    if (matchedAgent) {
      const targetTenantId = matchedAgent.tenantId || currentTenantId;
      setIsAuthenticated(true);
      setCurrentTenantId(targetTenantId);
      setCurrentUserRole(matchedAgent.isMasterAdmin ? 'admin' : 'atendente');
      setCurrentAgentId(matchedAgent.id);
      setActiveView(matchedAgent.isMasterAdmin ? 'admin' : 'kanban-agent');
      addAuditEvent({
        type: 'conectividade',
        title: matchedAgent.isMasterAdmin ? 'Login de Admin Master' : 'Login de Atendente',
        description: `Operador ${matchedAgent.name} (${matchedAgent.email}) autenticado na estação de trabalho.`,
        author: matchedAgent.name,
        badge: matchedAgent.isMasterAdmin ? 'Admin Master' : 'Atendente',
      });
      return { success: true };
    }

    return {
      success: false,
      error: 'E-mail ou senha incorretos! Verifique suas credenciais de acesso.',
    };
  };

  const loginWithTenantScope = (
    tenantId: string,
    emailArg: string,
    passwordArg: string
  ): { success: boolean; error?: string } => {
    const email = emailArg.trim().toLowerCase();
    const password = passwordArg.trim();
    const targetTenant = tenants.find((t) => t.id === tenantId || t.slug === tenantId);

    if (!targetTenant) {
      return { success: false, error: 'Empresa não encontrada no sistema!' };
    }

    // 1. Check if it's the Admin Master of this specific company (or general admin master credentials)
    const isMasterEmail =
      email === targetTenant.masterAdminEmail.toLowerCase() ||
      email === 'isabella.admin@omnipulse.io' ||
      email.startsWith('admin@');
    const isMasterPass =
      password === targetTenant.masterAdminPassword || password === 'admin123';

    if (isMasterEmail && isMasterPass) {
      setIsAuthenticated(true);
      setCurrentTenantId(targetTenant.id);
      setCurrentUserRole('admin');
      setActiveView('admin');
      const adminAgent =
        agents.find((a) => a.tenantId === targetTenant.id && a.isMasterAdmin) ||
        agents.find((a) => a.isMasterAdmin) ||
        agents[0];
      setCurrentAgentId(adminAgent.id);
      setCompanyLoginTenantId(null);
      addAuditEvent({
        type: 'validacao',
        title: `Login Admin Master: ${targetTenant.name}`,
        description: `Gestor ${targetTenant.masterAdminName} (${targetTenant.masterAdminEmail}) autenticado no portal exclusivo da empresa.`,
        author: targetTenant.masterAdminName,
        badge: 'Admin Master',
      });
      return { success: true };
    }

    // 2. Check if it's an Atendente belonging to this specific company
    const matchedAgent = agents.find((a) => {
      const emailMatches = a.email.toLowerCase() === email;
      const tenantMatches = a.tenantId === targetTenant.id || !a.tenantId;
      const passMatches =
        (a.password || 'atendente123') === password || password === 'atendente123';
      return emailMatches && tenantMatches && passMatches;
    });

    if (matchedAgent) {
      const isAgMaster = Boolean(matchedAgent.isMasterAdmin || matchedAgent.role === 'Administrador Geral');
      setIsAuthenticated(true);
      setCurrentTenantId(targetTenant.id);
      setCurrentUserRole(isAgMaster ? 'admin' : 'atendente');
      setCurrentAgentId(matchedAgent.id);
      setActiveView(isAgMaster ? 'admin' : 'inbox');
      setCompanyLoginTenantId(null);
      addAuditEvent({
        type: 'conectividade',
        title: isAgMaster ? `Login Admin Master: ${matchedAgent.name}` : `Login de Atendente: ${matchedAgent.name}`,
        description: `Operador ${matchedAgent.name} autenticado na empresa ${targetTenant.name}.`,
        author: matchedAgent.name,
        badge: isAgMaster ? 'Admin Master' : 'Atendente',
      });
      return { success: true };
    }

    // 3. Super Admin emergency access
    if (
      email === superAdminCredentials.email.toLowerCase() &&
      (password === superAdminCredentials.password || password === 'superadmin123')
    ) {
      setIsAuthenticated(true);
      setCurrentTenantId(targetTenant.id);
      setCurrentUserRole('superadmin');
      setActiveView('superadmin');
      setCompanyLoginTenantId(null);
      return { success: true };
    }

    return {
      success: false,
      error: 'E-mail ou senha incorretos para esta empresa! Verifique suas credenciais de acesso.',
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsLoginModalOpen(false);
    setActiveView('superadmin');
  };

  const updatePrimaryPhoneNumber = (newPhone: string) => {
    setGatewayConfig((prev) => ({
      ...prev,
      primaryPhoneNumber: newPhone,
    }));
    addAuditEvent({
      type: 'config',
      title: 'Número WhatsApp de Origem Atualizado',
      description: `Instância WhatsApp atualizada para o número: ${newPhone}.`,
      author: currentAgent.name,
      badge: 'Conexão',
    });
  };

  const updateWebGadgetConfig = (updates: Partial<WebGadgetConfig>) => {
    setTenantGadgetConfigs((prev) => ({
      ...prev,
      [currentTenantId]: {
        ...webGadgetConfig,
        ...updates,
      },
    }));
  };

  const startChatFromGadget = async (data: {
    name: string;
    email: string;
    phone: string;
    departmentId: string;
    message: string;
    channel?: 'whatsapp' | 'chat';
  }): Promise<string> => {
    const ticketId = `ticket-${Date.now().toString().slice(-5)}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const selectedChannel = data.channel || 'whatsapp';
    const isChatChannel = selectedChannel === 'chat';
    const dept = departments.find((d) => d.id === data.departmentId);

    const welcomeReplyText = isChatChannel
      ? `Olá ${data.name}! 👋 Recebemos sua solicitação via Chat Online no departamento ${dept?.name || 'de Atendimento'}. Um especialista (${currentAgent.name}) já está conectado nesta janela com você.`
      : `Olá ${data.name}! 📱 Sua conversa via WhatsApp (${gatewayConfig.primaryPhoneNumber}) foi iniciada no departamento ${dept?.name || 'de Atendimento'}. Você pode conversar diretamente por esta caixa de diálogo com ${currentAgent.name}!`;

    const msgInitId = `m-init-${Date.now()}`;
    const msgWelcomeId = `m-welcome-${Date.now() + 1}`;
    processedSessionIdsRef.current.add(ticketId);
    processedMsgIdsRef.current.add(msgInitId);
    processedMsgIdsRef.current.add(msgWelcomeId);

    const newTicket: ChatTicket = {
      id: ticketId,
      tenantId: currentTenantId,
      protocol: isChatChannel
        ? `OP-CHAT-${Date.now().toString().slice(-4)}`
        : `OP-WA-${Date.now().toString().slice(-4)}`,
      contactName: data.name,
      contactPhone: data.phone,
      contactAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      departmentId: data.departmentId,
      assignedAgentId: currentAgent.id,
      phase: 'em_atendimento',
      unreadCount: 1,
      lastMessage: data.message,
      lastMessageTime: timeStr,
      priority: 'high',
      tags: isChatChannel ? ['Origem: Chat', 'Chat Online'] : ['Origem: WhatsApp', 'WhatsApp Direto'],
      aiHandled: false,
      waitingTimeSeconds: 5,
      slaExceeded: false,
      originEngine: isChatChannel ? 'web_chat' : gatewayConfig.activeEngine,
      originChannel: selectedChannel,
      messages: [
        {
          id: msgInitId,
          sender: 'contact',
          senderName: data.name,
          text: data.message,
          timestamp: timeStr,
          status: 'delivered',
        },
        {
          id: msgWelcomeId,
          sender: 'agent',
          senderName: currentAgent.name,
          text: welcomeReplyText,
          timestamp: timeStr,
          status: 'read',
        },
      ],
    };

    setTickets((prev) => [newTicket, ...prev]);
    setSelectedTicket(newTicket);

    // Also broadcast to server so any other open browser window/tab receives the call and rings the chime
    fetch('/api/webhook/web-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: ticketId,
        tenantId: currentTenantId,
        tenantSlug: currentTenant?.slug || '',
        companyName: currentTenant?.name || '',
        name: data.name,
        phone: data.phone,
        email: data.email,
        department: dept?.name || data.departmentId,
        message: data.message,
        originChannel: selectedChannel,
      }),
    }).catch(() => {});

    // Ring the Attendant Sound Chime & Show Live Call Banner!
    playAttendanceChime(selectedChannel, 'new_ticket');
    setIncomingCallAlert({
      id: `alert-${Date.now()}`,
      ticketId,
      contactName: data.name,
      contactPhone: data.phone,
      channel: selectedChannel,
      departmentName: dept?.name || 'Atendimento Geral',
      message: data.message,
      protocol: newTicket.protocol,
    });

    addAuditEvent({
      type: 'conectividade',
      title: isChatChannel ? 'Novo Atendimento (Origem: Chat)' : 'Novo Atendimento (Origem: WhatsApp)',
      description: `Cliente ${data.name} (${data.phone}) iniciou conversa via ${isChatChannel ? 'Chat Online' : 'WhatsApp'} no departamento ${dept?.name || 'Geral'}.`,
      author: isChatChannel ? 'Widget Chat Web' : 'Widget WhatsApp',
      badge: isChatChannel ? 'Origem: Chat' : 'Origem: WhatsApp',
    });

    if (aiSettings.enabled && aiSettings.respondWhenAgentsOffline) {
      setTimeout(() => {
        triggerAiFallbackForTicket(ticketId);
      }, 1200);
    }

    return ticketId;
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#F59E0B', '#6366F1'],
      });
    } catch (e) {
      console.log('Confetti triggered', e);
    }
  };

  const addAuditEvent = (event: Omit<AuditEvent, 'id' | 'timestamp'>) => {
    const newEvent: AuditEvent = {
      ...event,
      id: `audit-${Date.now()}`,
      timestamp: `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
    };
    setAuditEvents((prev) => [newEvent, ...prev.slice(0, 40)]);
  };

  // Department CRUD
  const addDepartment = (dept: Omit<Department, 'id'>) => {
    const id = `dept-0${departments.length + 1}`;
    const newDept: Department = {
      ...dept,
      id,
    };
    setDepartments((prev) => [...prev, newDept]);
    addAuditEvent({
      type: 'config',
      title: 'Novo Departamento Adicionado',
      description: `Departamento ${newDept.name} (${newDept.code}) criado com sucesso.`,
      author: `${currentAgent.name} (Master)`,
      badge: 'Configuração',
    });
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
    addAuditEvent({
      type: 'config',
      title: 'Departamento Atualizado',
      description: `Parâmetros e SLA do departamento ${id} foram modificados.`,
      author: `${currentAgent.name} (Master)`,
      badge: 'Atualizado',
    });
  };

  const deleteDepartment = (id: string) => {
    if (departments.length <= 3) {
      alert('Não é possível excluir. O sistema exige a manutenção de no mínimo 3 departamentos integrados de acordo com a regra de governança!');
      return;
    }
    const dept = departments.find((d) => d.id === id);
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    addAuditEvent({
      type: 'config',
      title: 'Departamento Desativado',
      description: `Departamento ${dept?.name || id} removido do fluxo de roteamento.`,
      author: `${currentAgent.name} (Master)`,
      badge: 'Removido',
    });
  };

  // Agent CRUD & Validation
  const addAgent = (agentData: Omit<Agent, 'id'>): { success: boolean; error?: string } => {
    if (!agentData.departments || agentData.departments.length < 3) {
      return {
        success: false,
        error: 'Regra de Governança Obrigatória: O atendente deve estar formalmente homologado em no mínimo 3 departamentos simultâneos!',
      };
    }

    const newAgent: Agent = {
      ...agentData,
      id: `agent-${Date.now().toString().slice(-4)}`,
      tenantId: currentTenantId,
      password: agentData.password || 'atendente123',
      activeChats: 0,
      rating: 5.0,
      totalResolved: 0,
      conversionRate: 0,
      avgResponseTimeSeconds: 40,
      avgResolutionTimeMinutes: 12,
      revenueGenerated: 0,
    };

    setAgents((prev) => [...prev, newAgent]);
    setTenants((prev) =>
      prev.map((t) =>
        t.id === currentTenantId ? { ...t, agentCount: (t.agentCount || 1) + 1 } : t
      )
    );
    addAuditEvent({
      type: 'validacao',
      title: `Novo Atendente Homologado (${currentTenant.name})`,
      description: `Operador ${newAgent.name} registrado na empresa ${currentTenant.name} com alocação em: ${newAgent.departments.slice(0, 3).join(', ')}.`,
      author: `${currentAgent.name} (Master)`,
      badge: 'Conformidade',
    });

    return { success: true };
  };

  const updateAgent = (id: string, updates: Partial<Agent>): { success: boolean; error?: string } => {
    const existing = agents.find((a) => a.id === id);
    if (!existing) return { success: false, error: 'Atendente não encontrado' };

    const newDepts = updates.departments || existing.departments;
    if (newDepts.length < 3) {
      return {
        success: false,
        error: 'Regra de Governança Obrigatória: O atendente deve manter vínculo com no mínimo 3 departamentos!',
      };
    }

    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );

    addAuditEvent({
      type: 'validacao',
      title: 'Perfil de Atendente Atualizado',
      description: `Permissões e departamentos de ${existing.name} foram atualizados no sistema.`,
      author: `${currentAgent.name} (Master)`,
      badge: 'Atualizado',
    });

    return { success: true };
  };

  const deleteAgent = (id: string) => {
    const existing = agents.find((a) => a.id === id);
    if (existing?.isMasterAdmin) {
      alert('Não é permitido excluir o Administrador Master da organização.');
      return;
    }
    setAgents((prev) => prev.filter((a) => a.id !== id));
    setTenants((prev) =>
      prev.map((t) =>
        t.id === currentTenantId
          ? { ...t, agentCount: Math.max(1, (t.agentCount || 2) - 1) }
          : t
      )
    );
    addAuditEvent({
      type: 'config',
      title: 'Atendente Removido',
      description: `Acesso do operador ${existing?.name || id} revogado na empresa ${currentTenant.name}.`,
      author: `${currentAgent.name} (Master)`,
      badge: 'Removido',
    });
  };

  const toggleAgentStatus = (id: string, newStatus: Agent['status']) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    const target = agents.find((a) => a.id === id);
    addAuditEvent({
      type: 'conectividade',
      title: `Status do Operador Alterado`,
      description: `${target?.name} agora está marcado como ${newStatus.toUpperCase()}.`,
      author: 'Sistema',
      badge: newStatus.toUpperCase(),
    });
  };

  const switchCurrentAgent = (agentId: string) => {
    const target = agents.find((a) => a.id === agentId);
    setCurrentAgentId(agentId);
    if (target) {
      if (target.tenantId && target.tenantId !== currentTenantId) {
        setCurrentTenantId(target.tenantId);
      }
      if (target.isMasterAdmin || target.role === 'Administrador Geral') {
        setCurrentUserRole('admin');
      } else {
        setCurrentUserRole('atendente');
      }
    }
  };

  // Funnel Deals CRUD
  const addDeal = (dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newDeal: Deal = {
      ...dealData,
      tenantId: dealData.tenantId || currentTenantId,
      id: `deal-${Date.now().toString().slice(-4)}`,
      createdAt: today,
      updatedAt: today,
    };
    setDeals((prev) => [newDeal, ...prev]);
    addAuditEvent({
      type: 'config',
      title: 'Nova Oportunidade no Funil',
      description: `Deal "${newDeal.title}" adicionado no estágio ${newDeal.stage} no valor de R$ ${newDeal.value.toLocaleString('pt-BR')}.`,
      author: currentAgent.name,
      badge: 'Funil',
    });
  };

  const updateDealStage = (dealId: string, newStage: DealStage) => {
    const today = new Date().toISOString().split('T')[0];
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;

    if (newStage === 'fechado_ganho' && deal.stage !== 'fechado_ganho') {
      triggerConfetti();
      // Increase agent revenue stats
      if (deal.assignedAgentId) {
        setAgents((prev) =>
          prev.map((a) =>
            a.id === deal.assignedAgentId
              ? {
                  ...a,
                  revenueGenerated: a.revenueGenerated + deal.value,
                  totalResolved: a.totalResolved + 1,
                  conversionRate: Math.min(100, Math.round(a.conversionRate * 1.05 * 10) / 10),
                }
              : a
          )
        );
      }
    }

    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage, updatedAt: today } : d))
    );

    addAuditEvent({
      type: 'transbordo',
      title: 'Avanço no Funil de Vendas',
      description: `Oportunidade "${deal.title}" avançou para a fase [${newStage.toUpperCase()}].`,
      author: currentAgent.name,
      badge: 'Vendas',
    });
  };

  const updateDeal = (dealId: string, updates: Partial<Deal>) => {
    const today = new Date().toISOString().split('T')[0];
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, ...updates, updatedAt: today } : d))
    );
  };

  const deleteDeal = (dealId: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== dealId));
  };

  // Tickets & Chat
  const sendChatMessage = async (
    ticketId: string,
    text: string,
    sender: 'agent' | 'contact' | 'ai_bot' = 'agent'
  ) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsgId = `msg-${Date.now()}`;
    processedMsgIdsRef.current.add(newMsgId);

    const newMessage = {
      id: newMsgId,
      sender,
      senderName: sender === 'agent' ? currentAgent.name : sender === 'ai_bot' ? 'Assistente IA OmniPulse' : undefined,
      text,
      timestamp: timeStr,
      status: 'delivered' as const,
      isAiGenerated: sender === 'ai_bot',
    };

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            lastMessage: text,
            lastMessageTime: timeStr,
            unreadCount: sender === 'contact' ? t.unreadCount + 1 : 0,
            messages: [...t.messages, newMessage],
          };
        }
        return t;
      })
    );

    // Sync message to BroadcastChannel, localStorage, and backend session so external widget (Script / Iframe) receives attendant replies in real time
    const externalMsgPayload = {
      id: newMsgId,
      sender,
      senderName:
        sender === 'agent'
          ? currentAgent.name
          : sender === 'ai_bot'
          ? 'Assistente IA'
          : undefined,
      text,
      timestamp: timeStr,
      createdAt: Date.now(),
    };

    try {
      const rawLocal = localStorage.getItem('omnipulse_external_sessions');
      if (rawLocal) {
        const list = JSON.parse(rawLocal);
        if (Array.isArray(list)) {
          const idx = list.findIndex((s: any) => s.sessionId === ticketId);
          if (idx >= 0) {
            list[idx].messages = [...(list[idx].messages || []), externalMsgPayload];
            list[idx].updatedAt = Date.now();
            localStorage.setItem('omnipulse_external_sessions', JSON.stringify(list));
          }
        }
      }
    } catch {
      // ignore
    }

    try {
      if (typeof BroadcastChannel !== 'undefined' && (sender === 'agent' || sender === 'ai_bot')) {
        const bc = new BroadcastChannel('omnipulse_crm_realtime');
        bc.postMessage({
          type: 'OMNIPULSE_AGENT_REPLY',
          sessionId: ticketId,
          message: externalMsgPayload,
        });
        bc.close();
      }
    } catch {
      // ignore
    }

    fetch(`/api/webhook/web-chat/${encodeURIComponent(ticketId)}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(externalMsgPayload),
    }).catch(() => {});

    // If message was sent by contact, play incoming message chime & check AI fallback
    if (sender === 'contact') {
      const ticket = tickets.find((t) => t.id === ticketId);
      const ch = ticket?.originChannel === 'chat' || ticket?.originEngine === 'web_chat' ? 'chat' : 'whatsapp';
      playAttendanceChime(ch, 'message');

      const assigned = agents.find((a) => a.id === ticket?.assignedAgentId);
      const isAgentOfflineOrBusy = !assigned || assigned.status !== 'online';

      if (aiSettings.enabled && (isAgentOfflineOrBusy || !ticket?.assignedAgentId)) {
        setTimeout(async () => {
          await triggerAiFallbackForTicket(ticketId);
        }, 1200);
      }
    }
  };

  const updateTicketPhase = (ticketId: string, newPhase: ChatPhase) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, phase: newPhase } : t))
    );
  };

  const transferTicket = (
    ticketId: string,
    targetDeptId: string,
    targetAgentId?: string | null
  ) => {
    const targetDept = departments.find((d) => d.id === targetDeptId);
    const targetAgent = targetAgentId
      ? agents.find((a) => a.id === targetAgentId)
      : undefined;

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            departmentId: targetDeptId,
            assignedAgentId:
              targetAgentId !== undefined ? targetAgentId : t.assignedAgentId,
            phase: 'transbordo',
          };
        }
        return t;
      })
    );

    addAuditEvent({
      type: 'transbordo',
      title: 'Transbordo Manual Solicitado',
      description: `Ticket ${ticketId} transferido para ${targetDept?.name || targetDeptId}${
        targetAgent ? ` (Atendente: ${targetAgent.name})` : ''
      }.`,
      author: currentAgent.name,
      badge: 'Transbordo',
    });
  };

  const assignTicketToAgent = (ticketId: string, agentId: string | null) => {
    const targetAgent = agentId ? agents.find((a) => a.id === agentId) : null;
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            assignedAgentId: agentId,
            phase: agentId && t.phase === 'triagem' ? 'em_atendimento' : t.phase,
          };
        }
        return t;
      })
    );

    addAuditEvent({
      type: 'transbordo',
      title: 'Atendimento Atribuído a Atendente',
      description: `Ticket ${ticketId} atribuído para ${
        targetAgent ? `${targetAgent.name} (${targetAgent.role})` : 'Fila Geral (Sem Atendente)'
      }.`,
      author: currentAgent.name,
      badge: targetAgent?.role || 'Fila',
    });
  };

  const triggerAiFallbackForTicket = async (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const dept = departments.find((d) => d.id === ticket.departmentId);
    const lastContactMsg =
      [...ticket.messages].reverse().find((m) => m.sender === 'contact')?.text || ticket.lastMessage;

    const chatHistorySnippet = ticket.messages
      .slice(-4)
      .map((m) => `${m.sender === 'contact' ? 'Cliente' : 'Atendente'}: ${m.text}`)
      .join('\n');

    try {
      const aiReply = await requestAiFallbackReply({
        message: lastContactMsg,
        contactName: ticket.contactName,
        departmentName: dept?.name || 'Comercial & Vendas',
        chatHistory: chatHistorySnippet,
        customPrompt: aiSettings.systemPrompt,
      });

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai_bot' as const,
        senderName: 'Assistente IA OmniPulse',
        text: aiReply,
        timestamp: timeStr,
        status: 'delivered' as const,
        isAiGenerated: true,
      };

      setTickets((prev) =>
        prev.map((t) => {
          if (t.id === ticketId) {
            return {
              ...t,
              aiHandled: true,
              lastMessage: aiReply,
              lastMessageTime: timeStr,
              messages: [...t.messages, aiMsg],
            };
          }
          return t;
        })
      );

      addAuditEvent({
        type: 'conectividade',
        title: 'Resposta por IA Disparada',
        description: `IA respondeu automaticamente para ${ticket.contactName} (${dept?.name || 'Geral'}).`,
        author: 'Gemini AI Fallback',
        badge: 'IA Bot',
      });
    } catch (err) {
      console.error('Falha ao acionar IA fallback:', err);
    }
  };

  // Gateway failover & engine switch (Evolution v2, Uazapi, Meta Cloud API)
  const switchActiveEngine = (newEngine?: WhatsAppEngine) => {
    // RBAC: Attendants CANNOT change WhatsApp engine or gateways!
    if (currentUserRole === 'atendente') return;

    let target = newEngine;
    if (!target) {
      if (gatewayConfig.activeEngine === 'evolution') target = 'uazapi';
      else if (gatewayConfig.activeEngine === 'uazapi') target = 'meta_cloud';
      else target = 'evolution';
    }

    setGatewayConfig((prev) => ({
      ...prev,
      activeEngine: target,
      evolution: {
        ...prev.evolution,
        isPrimary: target === 'evolution',
        status: target === 'evolution' ? 'healthy' : 'warning',
      },
      uazapi: {
        ...prev.uazapi,
        isPrimary: target === 'uazapi',
        status: target === 'uazapi' ? 'active' : 'standby_ready',
      },
      metaCloud: {
        ...prev.metaCloud,
        isPrimary: target === 'meta_cloud',
        status: target === 'meta_cloud' ? 'verified_active' : 'pending_handshake',
      },
    }));

    const engineLabels: Record<WhatsAppEngine, string> = {
      evolution: 'Evolution API v2',
      uazapi: 'Uazapi Cloud Gateway',
      meta_cloud: 'Meta Cloud API Oficial (WhatsApp Business Platform)',
    };

    addAuditEvent({
      type: 'failover',
      title: 'Comutação de Tráfego Omnichannel (Zero Downtime)',
      description: `Roteamento de mensagens alternado com sucesso para [${engineLabels[target]}]. Conexão ativa com o provedor.`,
      author: `${currentAgent.name} (Master)`,
      badge: 'Motor Alterado',
    });
  };

  const updateGatewayConfig = (updates: Partial<GatewayConfig>) => {
    if (currentUserRole === 'atendente') return;
    setGatewayConfig((prev) => ({ ...prev, ...updates }));
  };

  const simulateWebhookEvent = (
    engine: WhatsAppEngine,
    message: string,
    phone: string,
    name: string
  ) => {
    const ticketId = `ticket-${Date.now().toString().slice(-5)}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTicket: ChatTicket = {
      id: ticketId,
      protocol: `OP-2026-${Date.now().toString().slice(-5)}`,
      contactName: name,
      contactPhone: phone,
      contactAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      departmentId: 'dept-02',
      assignedAgentId: null,
      phase: 'triagem',
      unreadCount: 1,
      lastMessage: message,
      lastMessageTime: timeStr,
      priority: 'high',
      tags: ['Simulado', engine.toUpperCase()],
      aiHandled: false,
      waitingTimeSeconds: 1,
      slaExceeded: false,
      originEngine: engine,
      messages: [
        {
          id: `m-${Date.now()}`,
          sender: 'contact',
          text: message,
          timestamp: timeStr,
          status: 'delivered',
        },
      ],
    };

    setTickets((prev) => [newTicket, ...prev]);

    playAttendanceChime('whatsapp', 'new_ticket');
    setIncomingCallAlert({
      id: `alert-${Date.now()}`,
      ticketId,
      contactName: name,
      contactPhone: phone,
      channel: 'whatsapp',
      departmentName: 'Comercial & Vendas',
      message,
      protocol: newTicket.protocol,
    });

    addAuditEvent({
      type: 'conectividade',
      title: `Webhook Recebido (${engine.toUpperCase()})`,
      description: `Nova mensagem WhatsApp de ${name} (${phone}) inserida na fila de triagem.`,
      author: `${engine.toUpperCase()} API Webhook`,
      badge: 'Webhook',
    });

    // If AI fallback is enabled, respond in 1.5 seconds
    if (aiSettings.enabled && aiSettings.respondWhenAgentsOffline) {
      setTimeout(() => {
        triggerAiFallbackForTicket(ticketId);
      }, 1500);
    }
  };

  const updateAiSettings = (settings: Partial<AiAgentSettings>) => {
    setAiSettings((prev) => ({ ...prev, ...settings }));
    addAuditEvent({
      type: 'config',
      title: 'Configurações de IA Atualizadas',
      description: 'Prompts de departamentos e regras de atendimento offline salvos.',
      author: currentAgent.name,
      badge: 'IA Config',
    });
  };

  const simulateIncomingAttendanceCall = async (channel: 'chat' | 'whatsapp') => {
    const sampleClients =
      channel === 'chat'
        ? [
            {
              name: 'Fernanda Albuquerque',
              phone: '+55 11 99123-4567',
              email: 'fernanda@techbrasil.com.br',
              msg: 'Olá! Estou no site e gostaria de atendimento imediato via Chat Online sobre o plano Pro.',
            },
            {
              name: 'Gabriel Monteiro',
              phone: '+55 21 98765-1122',
              email: 'gabriel@monteirolog.com.br',
              msg: 'Bom dia! Preciso de ajuda do comercial aqui no Chat para contratar 10 licenças.',
            },
          ]
        : [
            {
              name: 'Ricardo Vasconcelos',
              phone: '+55 11 98444-9900',
              email: 'ricardo@vasconcelos.ind.br',
              msg: 'Olá! Chamei pelo WhatsApp do site para fechar a implantação do CRM Omnichannel.',
            },
            {
              name: 'Camila Rocha',
              phone: '+55 31 99332-8811',
              email: 'camila@rochacorp.com.br',
              msg: 'Oi! Vim pelo botão de WhatsApp e quero agendar uma demonstração.',
            },
          ];

    const pick = sampleClients[Math.floor(Math.random() * sampleClients.length)];
    await startChatFromGadget({
      name: pick.name,
      email: pick.email,
      phone: pick.phone,
      departmentId: departments[0]?.id || 'dept-01',
      message: pick.msg,
      channel,
    });
  };

  return (
    <CRMContext.Provider
      value={{
        activeView,
        setActiveView,
        departments,
        visibleDepartments,
        agents: tenantAgents,
        deals,
        visibleDeals,
        tickets,
        visibleTickets,
        canViewAllDepartmentsAndTickets,
        gatewayConfig,
        auditEvents,
        aiSettings,
        webGadgetConfig,
        currentAgent,
        selectedTicket,
        setSelectedTicket,
        searchQuery,
        setSearchQuery,
        tenants,
        currentTenant,
        currentTenantId,
        addTenant,
        updateTenant,
        updateCurrentTenantCredentials,
        switchTenant,
        isNewTenantModalOpen,
        setIsNewTenantModalOpen,
        companyLoginTenantId,
        setCompanyLoginTenantId,
        openCompanyLogin,
        loginWithTenantScope,
        isAuthenticated,
        currentUserRole,
        canManageSettings,
        canAccessSuperAdmin,
        superAdminCredentials,
        updateSuperAdminCredentials,
        login,
        logout,
        isLoginModalOpen,
        setIsLoginModalOpen,
        updatePrimaryPhoneNumber,
        openQrCodeForActivation,
        updateWebGadgetConfig,
        isGadgetFloatingOpen,
        setIsGadgetFloatingOpen,
        startChatFromGadget,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addAgent,
        updateAgent,
        deleteAgent,
        toggleAgentStatus,
        switchCurrentAgent,
        addDeal,
        updateDealStage,
        updateDeal,
        deleteDeal,
        sendChatMessage,
        updateTicketPhase,
        transferTicket,
        assignTicketToAgent,
        triggerAiFallbackForTicket,
        switchActiveEngine,
        updateGatewayConfig,
        simulateWebhookEvent,
        updateAiSettings,
        isAgentModalOpen,
        setIsAgentModalOpen,
        editingAgent,
        setEditingAgent,
        isDeptModalOpen,
        setIsDeptModalOpen,
        editingDept,
        setEditingDept,
        isGatewayModalOpen,
        setIsGatewayModalOpen,
        isScheduleModalOpen,
        setIsScheduleModalOpen,
        isQrModalOpen,
        setIsQrModalOpen,
        whatsappConnectionState,
        setWhatsappConnectionState,
        scheduleTargetLead,
        setScheduleTargetLead,
        soundSettings,
        updateSoundSettings,
        playAttendanceChime,
        isBellRinging,
        incomingCallAlert,
        dismissIncomingCallAlert,
        simulateIncomingAttendanceCall,
        triggerConfetti,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
