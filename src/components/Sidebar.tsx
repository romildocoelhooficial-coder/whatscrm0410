import React from 'react';
import {
  MessageSquare,
  Kanban,
  Users2,
  Bot,
  BarChart3,
  Calendar,
  Radio,
  Sliders,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  Code2,
  KeyRound,
  LogOut,
  QrCode,
} from 'lucide-react';
import { useCRM, AppView } from '../context/CRMContext';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    tickets,
    deals,
    gatewayConfig,
    setIsGatewayModalOpen,
    currentAgent,
    currentUserRole,
    setIsLoginModalOpen,
    logout,
    openQrCodeForActivation,
    whatsappConnectionState,
    canManageSettings,
    currentTenant,
  } = useCRM();

  const totalDealValue = deals.reduce((acc, d) => acc + d.value, 0);
  const formattedDealsValue = `R$ ${Math.round(totalDealValue / 1000)}k`;
  const unreadTicketsCount = tickets.reduce((acc, t) => acc + (t.unreadCount || 0), 0) || 18;

  const isEvo = gatewayConfig.activeEngine === 'evolution';

  const allNavItems: {
    id: AppView;
    label: string;
    icon: React.ElementType;
    badge?: string;
    badgeColor?: string;
    alertDot?: boolean;
    roleRequired?: 'superadmin' | 'admin';
  }[] = [
    {
      id: 'superadmin',
      label: 'Super Admin: Empresas',
      icon: ShieldCheck,
      badge: 'SaaS',
      badgeColor: 'bg-purple-100 text-purple-700 font-bold text-[10px]',
      roleRequired: 'admin',
    },
    {
      id: 'inbox',
      label: currentUserRole === 'atendente' ? 'Meus Atendimentos' : 'Inbox Multiatendimento',
      icon: MessageSquare,
      badge: `${unreadTicketsCount}`,
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'kanban-deals',
      label: 'Kanban de Negócios',
      icon: Kanban,
      badge: formattedDealsValue,
      badgeColor: 'bg-slate-100 text-slate-700 font-mono text-[11px]',
    },
    {
      id: 'kanban-agent',
      label: 'Kanban do Atendente',
      icon: Headphones,
      badge: 'Fases',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'admin',
      label: 'Gestão de Equipe & CRUD',
      icon: Users2,
      alertDot: false,
      roleRequired: 'admin',
    },
    {
      id: 'gadget',
      label: 'Gadget & Formulário Web',
      icon: Code2,
      badge: 'Embed',
      badgeColor: 'bg-emerald-100 text-emerald-800 text-[10px]',
      roleRequired: 'admin',
    },
    {
      id: 'ai-agent',
      label: 'Agente IA & Fallback',
      icon: Bot,
      badge: 'Gemini',
      badgeColor: 'bg-purple-100 text-purple-700 font-mono text-[10px]',
      roleRequired: 'admin',
    },
    {
      id: 'reports',
      label: 'Relatórios de Desempenho',
      icon: BarChart3,
    },
    {
      id: 'calendar',
      label: 'Google Calendar & Demos',
      icon: Calendar,
      badge: 'Workspace',
      badgeColor: 'bg-amber-100 text-amber-700 text-[10px]',
    },
  ];

  // Role-based visibility
  const navItems = allNavItems.filter((item) => {
    if (currentUserRole === 'atendente') {
      return !item.roleRequired;
    }
    return true; // Superadmin and Admin Master see all administrative items
  });

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 z-40 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
            <Radio className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-white text-sm tracking-tight flex items-center gap-1.5">
              OmniPulse
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              CRM OMNICHANNEL
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Origin Instance Pill (As shown in screenshot) */}
      <div className="p-3 space-y-2">
        <div
          onClick={() => {
            if (canManageSettings) setIsGatewayModalOpen(true);
          }}
          className={`${
            canManageSettings ? 'cursor-pointer hover:bg-slate-800' : 'cursor-default'
          } bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 transition-all group`}
          title={canManageSettings ? 'Clique para gerenciar conexões de WhatsApp' : 'Linha WhatsApp conectada da empresa'}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-white uppercase tracking-wider">
                {gatewayConfig.activeEngine === 'meta_cloud'
                  ? 'META CLOUD API'
                  : isEvo
                  ? 'EVOLUTION API V2'
                  : 'UAZAPI CLOUD'}
              </span>
            </div>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                whatsappConnectionState === 'open'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              {whatsappConnectionState === 'open' ? 'Online' : 'Parear'}
            </span>
          </div>

          <div className="mt-1.5 text-xs font-mono text-slate-200 font-bold truncate">
            {gatewayConfig.primaryPhoneNumber}
          </div>

          <div className="text-[10px] text-slate-400 truncate mt-0.5">
            {currentTenant?.name || 'OmniPulse Matriz'}
          </div>

          <div className="mt-1 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Ping: {isEvo ? gatewayConfig.evolution.pingMs : gatewayConfig.uazapi.pingMs}ms</span>
            {canManageSettings && (
              <span className="text-emerald-400 group-hover:underline">Configurar ⚙️</span>
            )}
          </div>
        </div>

        {/* Direct QR Activation Button in Sidebar */}
        {canManageSettings && (
          <button
            onClick={() => openQrCodeForActivation()}
            className="w-full py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
            title="Abrir QR Code para parear WhatsApp de origem"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            Escanear QR Code
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-slate-950' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-slate-900 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {item.alertDot && (
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Central Load / SLA Status Card (Exact widget from screenshot) */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60">
        <div className="bg-slate-800/70 border border-slate-700/50 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
            <span className="uppercase tracking-wider text-[10px] text-slate-400">
              Carga da Central
            </span>
            <span className="text-emerald-400 font-mono">84%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: '84%' }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>12 Online</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>4 Alertas</span>
            </div>
          </div>
        </div>

        {/* Auth Role Badge, Change Password & Direct Logout Button */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-300 font-bold truncate max-w-[130px]">
                {currentUserRole === 'superadmin'
                  ? '👑 Super Admin'
                  : currentUserRole === 'admin'
                  ? '🏢 Admin Master'
                  : '🎧 Atendente'}
              </span>
            </div>

            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold hover:underline shrink-0"
              title="Alternar usuário ou perfil"
            >
              Trocar
            </button>
          </div>

          {/* Dedicated Logout Button for all users */}
          <button
            onClick={logout}
            className="w-full py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
            title="Sair do sistema e voltar à tela inicial de login"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Sistema (Logout)</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
