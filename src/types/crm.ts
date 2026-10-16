export type DepartmentId = 'dept-01' | 'dept-02' | 'dept-03' | 'dept-04' | string;

export interface Department {
  id: DepartmentId;
  tenantId?: string;
  code: string; // e.g. DEPT-01
  name: string; // e.g. Suporte Técnico N1/N2
  description: string;
  agentCount: number;
  avgWaitTime: string; // e.g. 01m 24s
  transbordoTarget: string; // e.g. Comercial > 180s
  transbordoTimeoutSeconds: number; // e.g. 180
  color: string;
  active: boolean;
}

export type AgentRole = 'Administrador Geral' | 'Supervisor Omnichannel' | 'Operador Sênior' | 'Closer Comercial' | 'Atendente N1';

export type AgentStatus = 'online' | 'busy' | 'break' | 'offline';

export interface Agent {
  id: string;
  tenantId?: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: AgentRole;
  isMasterAdmin?: boolean;
  password?: string; // Customizable access password
  departments: string[]; // At least 3 departments rule
  status: AgentStatus;
  statusDetail?: string; // e.g. "Reunião", "Almoço", "Retorno às 14:30"
  shift: string; // e.g. "Turno 08:00 - 17:00"
  activeChats: number;
  maxChats: number;
  rating: number; // 1-5
  totalResolved: number;
  conversionRate: number; // e.g. 28.5%
  avgResponseTimeSeconds: number; // e.g. 45
  avgResolutionTimeMinutes: number; // e.g. 12
  revenueGenerated: number; // in BRL
}

export type DealStage = 
  | 'lead_inbound'
  | 'qualificacao'
  | 'demonstracao'
  | 'proposta'
  | 'fechado_ganho'
  | 'perdido';

export interface Deal {
  id: string;
  tenantId?: string;
  title: string;
  contactName: string;
  contactPhone: string;
  companyName: string;
  value: number; // In BRL
  stage: DealStage;
  departmentId: string;
  assignedAgentId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  lastInteraction: string;
  tags: string[];
  notes?: string;
  calendarEventId?: string;
  meetingTime?: string;
}

export type ChatPhase = 
  | 'triagem'
  | 'em_atendimento'
  | 'aguardando_cliente'
  | 'transbordo'
  | 'resolvido';

export interface ChatMessage {
  id: string;
  sender: 'contact' | 'agent' | 'ai_bot' | 'system';
  senderName?: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isAiGenerated?: boolean;
}

export interface ChatTicket {
  id: string;
  tenantId?: string;
  protocol: string;
  contactName: string;
  contactPhone: string;
  contactAvatar?: string;
  departmentId: string;
  assignedAgentId: string | null;
  phase: ChatPhase;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  messages: ChatMessage[];
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  aiHandled: boolean;
  waitingTimeSeconds: number;
  slaExceeded: boolean;
  originEngine: 'evolution' | 'uazapi' | 'meta_cloud' | 'web_chat';
  originChannel?: 'whatsapp' | 'chat';
}

export type WhatsAppEngine = 'evolution' | 'uazapi' | 'meta_cloud';

export type UserRole = 'superadmin' | 'admin' | 'atendente';

export interface TenantSystem {
  id: string;
  slug: string;
  name: string;
  cnpjOrId: string;
  plan: 'Starter' | 'Pro' | 'Enterprise';
  active: boolean;
  createdAt: string;
  primaryPhoneNumber: string;
  whatsappStatus: 'open' | 'connecting' | 'qrcode' | 'disconnected';
  whatsappEngine: WhatsAppEngine;
  instanceName: string;
  masterAdminName: string;
  masterAdminEmail: string;
  masterAdminPassword: string;
  maxAgents: number;
  agentCount: number;
  activeTicketsCount: number;
}

export interface GatewayConfig {
  primaryPhoneNumber: string;
  evolution: {
    name: string;
    apiUrl: string;
    apiKey: string;
    instanceName: string;
    webhookUrl: string;
    status: 'healthy' | 'warning' | 'down';
    pingMs: number;
    uptime: string;
    throughput: string;
    isPrimary: boolean;
  };
  uazapi: {
    name: string;
    apiUrl: string;
    apiKey: string;
    clusterStatus: string;
    webhookUrl: string;
    status: 'standby_ready' | 'active' | 'down';
    pingMs: number;
    slaContract: string;
    isPrimary: boolean;
  };
  metaCloud: {
    name: string;
    wabaId: string; // WhatsApp Business Account ID
    phoneNumberId: string;
    accessToken: string;
    webhookVerifyToken: string;
    appSecret: string;
    apiVersion: string; // e.g. "v21.0"
    status: 'verified_active' | 'pending_handshake' | 'down';
    pingMs: number;
    qualityRating: 'GREEN' | 'YELLOW' | 'RED';
    tier: string; // e.g. "Tier 2 (100.000 msgs/dia)"
    verifiedName: string;
    isPrimary: boolean;
  };
  activeEngine: WhatsAppEngine;
  failoverAuto: boolean;
  globalTransbordoSeconds: number;
}

export interface WebGadgetConfig {
  brandTitle: string;
  brandSubtitle: string;
  primaryColor: string;
  greetingMessage: string;
  buttonPosition: 'bottom-right' | 'bottom-left';
  defaultDepartmentId: string;
  autoOpen: boolean;
}

export interface AuditEvent {
  id: string;
  type: 'transbordo' | 'validacao' | 'conectividade' | 'failover' | 'config';
  title: string;
  description: string;
  timestamp: string;
  author: string;
  worker?: string;
  badge?: string;
}

export interface AiAgentSettings {
  enabled: boolean;
  respondWhenAgentsOffline: boolean;
  respondOnHighQueueWait: boolean;
  maxWaitThresholdSeconds: number;
  personality: string;
  systemPrompt: string;
  businessHoursStart: string;
  businessHoursEnd: string;
  activeDays: string[];
  departmentKnowledge: {
    vendas: string;
    suporte: string;
    marketing: string;
    financeiro: string;
  };
  modelName: string;
}

export interface GoogleCalendarMeeting {
  id: string;
  summary: string;
  description: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  attendees?: { email: string; displayName?: string }[];
  location?: string;
  dealId?: string;
  meetLink?: string;
}

export interface LivePageVisitor {
  visitorId: string;
  tenantId: string;
  tenantSlug: string;
  companyName: string;
  pageUrl: string;
  pageTitle: string;
  referrer?: string;
  embedType: 'Widget JS Flutuante' | 'Formulário HTML Puro' | 'Iframe Embed';
  isWidgetOpen?: boolean;
  startedAt: number;
  lastSeenAt: number;
  status: 'online' | 'left';
}

export interface PageVisitSummary {
  pageUrl: string;
  pageTitle: string;
  tenantId: string;
  tenantSlug: string;
  embedType: 'Widget JS Flutuante' | 'Formulário HTML Puro' | 'Iframe Embed';
  onlineNow: number;
  totalVisits: number;
  lastVisitTime: string;
  lastSeenAt: number;
}

