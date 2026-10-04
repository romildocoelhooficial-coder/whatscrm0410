import React, { createContext, useContext, useState, useEffect } from 'react';
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
  agents: Agent[];
  deals: Deal[];
  tickets: ChatTicket[];
  visibleTickets: ChatTicket[];
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
    return saved ? JSON.parse(saved) : initialAgents;
  });

  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem('omnipulse_deals');
    return saved ? JSON.parse(saved) : initialDeals;
  });

  const [tickets, setTickets] = useState<ChatTicket[]>(() => {
    const saved = localStorage.getItem('omnipulse_tickets');
    return saved ? JSON.parse(saved) : initialChatTickets;
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

  const [webGadgetConfig, setWebGadgetConfig] = useState<WebGadgetConfig>(() => {
    const saved = localStorage.getItem('omnipulse_web_gadget');
    return saved ? JSON.parse(saved) : initialWebGadgetConfig;
  });

  // Multi-Tenant state
  const [tenants, setTenants] = useState<TenantSystem[]>(() => {
    const saved = localStorage.getItem('omnipulse_tenants');
    return saved ? JSON.parse(saved) : initialTenants;
  });
  const [currentTenantId, setCurrentTenantId] = useState<string>('tenant-omnipulse');
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
    localStorage.setItem('omnipulse_web_gadget', JSON.stringify(webGadgetConfig));
  }, [webGadgetConfig]);

  useEffect(() => {
    localStorage.setItem('omnipulse_tenants', JSON.stringify(tenants));
  }, [tenants]);

  const currentTenant = tenants.find((t) => t.id === currentTenantId) || tenants[0];

  const currentAgent = agents.find((a) => a.id === currentAgentId) || agents[0];

  // RBAC Permission Flags
  const canManageSettings = currentUserRole === 'superadmin' || currentUserRole === 'admin';
  const canAccessSuperAdmin = currentUserRole === 'superadmin';

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

  // Attendant isolation:
  // - Attendants ONLY see their own assigned conversations (t.assignedAgentId === currentAgent.id)
  // - Admin Master has complete visibility over all conversations of their own company/tenant
  // - Super Admin can view all or currently selected tenant's conversations
  const visibleTickets = currentUserRole === 'atendente'
    ? tickets.filter((t) => t.assignedAgentId === currentAgent.id)
    : currentUserRole === 'admin'
    ? tickets.filter((t) => !t.tenantId || t.tenantId === currentTenantId)
    : tickets;

  const openQrCodeForActivation = () => {
    // Lock API & WhatsApp QR configuration: Attendants CANNOT open QR pairing
    if (currentUserRole === 'atendente') return;
    setWhatsappConnectionState('qrcode');
    setIsQrModalOpen(true);
  };

  const addTenant = (data: Omit<TenantSystem, 'id' | 'createdAt' | 'agentCount' | 'activeTicketsCount'>) => {
    const rawSlug = (data as any).slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const uniqueSlug = rawSlug || `empresa-${Date.now().toString().slice(-4)}`;

    const newTenant: TenantSystem = {
      ...data,
      slug: uniqueSlug,
      id: `tenant-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString().split('T')[0],
      agentCount: 1,
      activeTicketsCount: 0,
      whatsappStatus: 'qrcode',
    };

    setTenants((prev) => [newTenant, ...prev]);

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
    setGatewayConfig((prev) => ({
      ...prev,
      primaryPhoneNumber: target.primaryPhoneNumber,
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

    // 2. Check Admin Master across any tenant registered in system
    const matchingTenant = tenants.find((t) => {
      const emailMatches =
        !email ||
        t.masterAdminEmail.toLowerCase() === email ||
        (t.id === currentTenantId &&
          (email === 'isabella.admin@omnipulse.io' || email === 'isabella.rodrigues@omnipulse.io'));
      return emailMatches;
    });

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
        const adminAgent = agents.find((a) => a.isMasterAdmin) || agents[0];
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

    // 3. Check Atendentes
    const matchedAgent = agents.find((a) => {
      const emailMatches = !email || a.email.toLowerCase() === email;
      const passMatches =
        (a.password || 'atendente123') === password || password === 'atendente123';
      return emailMatches && passMatches;
    });

    if (matchedAgent) {
      setIsAuthenticated(true);
      setCurrentUserRole('atendente');
      setCurrentAgentId(matchedAgent.id);
      setActiveView('kanban-agent');
      addAuditEvent({
        type: 'conectividade',
        title: 'Login de Atendente',
        description: `Operador ${matchedAgent.name} (${matchedAgent.email}) autenticado na estação de trabalho com visão restrita.`,
        author: matchedAgent.name,
        badge: 'Atendente',
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

    // 1. Check if it's the Admin Master of this specific company
    const isMasterEmail = email === targetTenant.masterAdminEmail.toLowerCase();
    const isMasterPass =
      password === targetTenant.masterAdminPassword || password === 'admin123';

    if (isMasterEmail && isMasterPass) {
      setIsAuthenticated(true);
      setCurrentTenantId(targetTenant.id);
      setCurrentUserRole('admin');
      setActiveView('admin');
      const adminAgent =
        agents.find(
          (a) => (a.tenantId === targetTenant.id || !a.tenantId) && a.isMasterAdmin
        ) || agents[0];
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
      const tenantMatches = !a.tenantId || a.tenantId === targetTenant.id;
      const passMatches =
        (a.password || 'atendente123') === password || password === 'atendente123';
      return emailMatches && tenantMatches && passMatches;
    });

    if (matchedAgent) {
      setIsAuthenticated(true);
      setCurrentTenantId(targetTenant.id);
      setCurrentUserRole('atendente');
      setCurrentAgentId(matchedAgent.id);
      setActiveView('inbox');
      setCompanyLoginTenantId(null);
      addAuditEvent({
        type: 'conectividade',
        title: `Login de Atendente: ${matchedAgent.name}`,
        description: `Operador ${matchedAgent.name} autenticado na empresa ${targetTenant.name}. Acesso restrito somente às suas conversas.`,
        author: matchedAgent.name,
        badge: 'Atendente',
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
    setWebGadgetConfig((prev) => ({ ...prev, ...updates }));
  };

  const startChatFromGadget = async (data: {
    name: string;
    email: string;
    phone: string;
    departmentId: string;
    message: string;
  }): Promise<string> => {
    const ticketId = `ticket-${Date.now().toString().slice(-5)}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTicket: ChatTicket = {
      id: ticketId,
      protocol: `OP-WEB-${Date.now().toString().slice(-4)}`,
      contactName: data.name,
      contactPhone: data.phone,
      contactAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      departmentId: data.departmentId,
      assignedAgentId: null,
      phase: 'triagem',
      unreadCount: 1,
      lastMessage: data.message,
      lastMessageTime: timeStr,
      priority: 'high',
      tags: ['Gadget Web', 'Inbound'],
      aiHandled: false,
      waitingTimeSeconds: 5,
      slaExceeded: false,
      originEngine: gatewayConfig.activeEngine,
      messages: [
        {
          id: `m-init-${Date.now()}`,
          sender: 'contact',
          text: data.message,
          timestamp: timeStr,
          status: 'delivered',
        },
      ],
    };

    setTickets((prev) => [newTicket, ...prev]);
    setSelectedTicket(newTicket);

    addAuditEvent({
      type: 'conectividade',
      title: 'Novo Atendimento via Gadget Web',
      description: `Cliente ${data.name} (${data.phone}) iniciou conversa pelo formulário do site.`,
      author: 'Gadget Web Form',
      badge: 'Novo Lead',
    });

    if (aiSettings.enabled && aiSettings.respondWhenAgentsOffline) {
      setTimeout(() => {
        triggerAiFallbackForTicket(ticketId);
      }, 1000);
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
      id: `agent-0${agents.length + 1}`,
      activeChats: 0,
      rating: 5.0,
      totalResolved: 0,
      conversionRate: 0,
      avgResponseTimeSeconds: 40,
      avgResolutionTimeMinutes: 12,
      revenueGenerated: 0,
    };

    setAgents((prev) => [...prev, newAgent]);
    addAuditEvent({
      type: 'validacao',
      title: 'Novo Atendente Homologado',
      description: `Operador ${newAgent.name} registrado com alocação tripla em: ${newAgent.departments.slice(0, 3).join(', ')}.`,
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
    addAuditEvent({
      type: 'config',
      title: 'Atendente Removido',
      description: `Acesso do operador ${existing?.name || id} revogado.`,
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
    setCurrentAgentId(agentId);
  };

  // Funnel Deals CRUD
  const addDeal = (dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newDeal: Deal = {
      ...dealData,
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

    const newMessage = {
      id: `msg-${Date.now()}`,
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

    // If message was sent by contact, check if AI fallback is triggered
    if (sender === 'contact') {
      const ticket = tickets.find((t) => t.id === ticketId);
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

  const transferTicket = (ticketId: string, targetDeptId: string, targetAgentId: string | null = null) => {
    const targetDept = departments.find((d) => d.id === targetDeptId);
    const targetAgent = agents.find((a) => a.id === targetAgentId);

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            departmentId: targetDeptId,
            assignedAgentId: targetAgentId,
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

  return (
    <CRMContext.Provider
      value={{
        activeView,
        setActiveView,
        departments,
        agents,
        deals,
        tickets,
        visibleTickets,
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
