import React, { useState } from 'react';
import {
  Search,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Radio,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Zap,
  KeyRound,
  QrCode,
  Building2,
  MessageSquare,
  Phone,
  X,
  Play,
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { SOUND_PRESETS } from '../services/soundService';

export const Header: React.FC = () => {
  const {
    gatewayConfig,
    switchActiveEngine,
    tickets,
    visibleTickets,
    canViewAllDepartmentsAndTickets,
    searchQuery,
    setSearchQuery,
    currentAgent,
    agents,
    switchCurrentAgent,
    setIsGatewayModalOpen,
    setActiveView,
    setSelectedTicket,
    currentUserRole,
    setIsLoginModalOpen,
    openQrCodeForActivation,
    whatsappConnectionState,
    canManageSettings,
    tenants,
    currentTenantId,
    switchTenant,
    soundSettings,
    updateSoundSettings,
    playAttendanceChime,
    isBellRinging,
    incomingCallAlert,
    dismissIncomingCallAlert,
    simulateIncomingAttendanceCall,
  } = useCRM();

  const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false);
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [isSoundPanelOpen, setIsSoundPanelOpen] = useState(false);

  const activeChatsCount = visibleTickets.filter((t) => t.phase !== 'resolvido').length;
  const isEvo = gatewayConfig.activeEngine === 'evolution';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Engine Selector & Live Queue Pill */}
      <div className="flex items-center gap-4">
        {/* WhatsApp Gateway Engine: Read-only for Attendants, Configurable for Admins */}
        {!canManageSettings ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">{gatewayConfig.primaryPhoneNumber}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({gatewayConfig.activeEngine === 'meta_cloud' ? 'Meta Oficial' : gatewayConfig.activeEngine === 'uazapi' ? 'Uazapi' : 'Evolution v2'})
            </span>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setIsEngineDropdownOpen(!isEngineDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 text-xs font-medium text-slate-800 transition-colors shadow-2xs"
              title="Clique para alternar ou configurar o motor WhatsApp"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  gatewayConfig.activeEngine === 'meta_cloud'
                    ? 'bg-blue-500 animate-pulse'
                    : isEvo
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-indigo-500 animate-pulse'
                }`}
              />
              <span className="font-semibold">
                {gatewayConfig.activeEngine === 'meta_cloud'
                  ? 'Meta Cloud API Oficial'
                  : isEvo
                  ? 'Evolution API - Produção SP'
                  : 'Uazapi Cloud Gateway'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isEngineDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 px-2.5 py-1">
                  Motor Omnichannel Ativo
                </div>
                <button
                  onClick={() => {
                    switchActiveEngine('evolution');
                    setIsEngineDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors ${
                    gatewayConfig.activeEngine === 'evolution'
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Evolution API v2</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-mono">
                    18ms
                  </span>
                </button>

                <button
                  onClick={() => {
                    switchActiveEngine('uazapi');
                    setIsEngineDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors mt-1 ${
                    gatewayConfig.activeEngine === 'uazapi'
                      ? 'bg-indigo-50 text-indigo-900 font-semibold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>Uazapi Cloud Gateway</span>
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono">
                    24ms
                  </span>
                </button>

                <button
                  onClick={() => {
                    switchActiveEngine('meta_cloud');
                    setIsEngineDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors mt-1 ${
                    gatewayConfig.activeEngine === 'meta_cloud'
                      ? 'bg-blue-50 text-blue-900 font-semibold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Meta Cloud API Oficial</span>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">
                    14ms
                  </span>
                </button>

                <div className="border-t border-slate-100 my-1 pt-1">
                  <button
                    onClick={() => {
                      setIsEngineDropdownOpen(false);
                      setIsGatewayModalOpen(true);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 rounded-md"
                  >
                    ⚙️ Gerenciar Conexões & QR Code
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Queue Active Counter */}
        <div
          onClick={() => setActiveView('inbox')}
          className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-800 hover:bg-emerald-100/60 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-medium">
            {canViewAllDepartmentsAndTickets ? 'Fila Geral:' : 'Meus Chats:'}{' '}
            <strong>{activeChatsCount} chats</strong> ativos
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar contato, protocolo, telefone... Ctrl+K"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-14 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-2xs"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded border border-slate-300 font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Notifications & Attendant User Switcher */}
      <div className="flex items-center gap-2.5">
        {/* Super Admin Tenant Switcher */}
        {currentUserRole === 'superadmin' && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-950 font-bold">
            <Building2 className="w-3.5 h-3.5 text-purple-700" />
            <select
              value={currentTenantId}
              onChange={(e) => switchTenant(e.target.value)}
              className="bg-transparent text-purple-950 font-bold focus:outline-none cursor-pointer text-xs"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.primaryPhoneNumber})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* QR Code Direct Activation Button (For Admin Master & Super Admin) */}
        {canManageSettings && (
          <button
            onClick={() => openQrCodeForActivation()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              whatsappConnectionState === 'open'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
            }`}
            title="Clique para abrir e escanear o QR Code de ativação do WhatsApp de origem"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {whatsappConnectionState === 'open' ? 'WhatsApp Conectado' : '📱 Ativar WhatsApp (QR Code)'}
            </span>
          </button>
        )}

        {/* Failover Shield Status */}
        <div
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
          title="Failover Automático ativo entre Evolution e Uazapi"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Failover Automático</span>
        </div>

        {/* CAMPAINHA SONORA DE ATENDIMENTO (SOUND CHIME & MIXER PANEL) */}
        <div className="relative">
          <button
            onClick={() => {
              setIsSoundPanelOpen(!isSoundPanelOpen);
              setShowNotificationToast(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-2xs ${
              isBellRinging
                ? 'bg-amber-500 text-white border-amber-600 ring-4 ring-amber-400/30 animate-bounce'
                : soundSettings.enabled
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-200'
            }`}
            title="Configurar Campainha Sonora de Atendimento (Chat & WhatsApp)"
          >
            {isBellRinging ? (
              <BellRing className="w-4 h-4 text-white animate-spin" />
            ) : soundSettings.enabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
            <span className="hidden md:inline">
              {isBellRinging
                ? '🔔 Chamando!'
                : soundSettings.enabled
                ? 'Campainha Ativa'
                : 'Campainha Muda'}
            </span>
          </button>

          {isSoundPanelOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-xs space-y-3.5 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs">
                      Campainha Sonora de Atendimento
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Sinal sonoro para chamadas via Chat e WhatsApp
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => updateSoundSettings({ enabled: !soundSettings.enabled })}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-colors ${
                    soundSettings.enabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {soundSettings.enabled ? '🔊 ATIVA' : '🔇 MUDO'}
                </button>
              </div>

              {/* Volume Control */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">Volume do Sinal Sonoro</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {Math.round(soundSettings.volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={soundSettings.volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    updateSoundSettings({ volume: v });
                  }}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Preset Selection */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 text-[11px]">
                  Escolha o Timbre da Campainha:
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                  {SOUND_PRESETS.map((preset) => {
                    const isSelected = soundSettings.preset === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => {
                          updateSoundSettings({ preset: preset.id, enabled: true });
                          playAttendanceChime('chat', 'new_ticket', preset.id);
                        }}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-emerald-50/90 border-emerald-500 ring-1 ring-emerald-500/30'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs truncate">
                              {preset.name}
                            </span>
                            <span className="text-[9px] font-bold bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                              {preset.badge}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">
                            {preset.description}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playAttendanceChime('chat', 'new_ticket', preset.id);
                          }}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0"
                          title="Ouvir este timbre agora"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          Ouvir
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trigger Rules */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-[11px]">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-700 font-medium">
                    Tocar em novo pedido (Chat ou WhatsApp)
                  </span>
                  <input
                    type="checkbox"
                    checked={soundSettings.playOnNewTicket}
                    onChange={(e) => updateSoundSettings({ playOnNewTicket: e.target.checked })}
                    className="rounded accent-emerald-600"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-700 font-medium">
                    Toque duplo de chamada (garantir audição)
                  </span>
                  <input
                    type="checkbox"
                    checked={soundSettings.doubleRingOnNewTicket}
                    onChange={(e) =>
                      updateSoundSettings({ doubleRingOnNewTicket: e.target.checked })
                    }
                    className="rounded accent-emerald-600"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-700 font-medium">
                    Sinal curto a cada nova mensagem no chat
                  </span>
                  <input
                    type="checkbox"
                    checked={soundSettings.playOnIncomingMessage}
                    onChange={(e) =>
                      updateSoundSettings({ playOnIncomingMessage: e.target.checked })
                    }
                    className="rounded accent-emerald-600"
                  />
                </label>
              </div>

              {/* Simulate Real Call Buttons */}
              <div className="pt-1 border-t border-slate-100 space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  Simular Pedido de Atendimento com Campainha:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      simulateIncomingAttendanceCall('chat');
                      setIsSoundPanelOpen(false);
                    }}
                    className="py-2 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Simular Chat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      simulateIncomingAttendanceCall('whatsapp');
                      setIsSoundPanelOpen(false);
                    }}
                    className="py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Simular WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LIVE INCOMING ATTENDANCE CALL FLOATING BANNER */}
        {incomingCallAlert && (
          <div className="fixed top-20 right-6 z-50 w-96 max-w-[calc(100vw-32px)] bg-slate-900 text-white rounded-2xl shadow-2xl border-2 border-emerald-400 p-4 animate-in fade-in slide-in-from-top-5 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 animate-bounce ${
                    incomingCallAlert.channel === 'whatsapp'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                      🔔 Novo Pedido de Atendimento
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        incomingCallAlert.channel === 'whatsapp'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {incomingCallAlert.channel === 'whatsapp'
                        ? '📱 Origem: WhatsApp'
                        : '💬 Origem: Chat'}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-white mt-1">
                    {incomingCallAlert.contactName}
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    {incomingCallAlert.contactPhone} • {incomingCallAlert.departmentName}
                  </div>
                </div>
              </div>
              <button
                onClick={dismissIncomingCallAlert}
                className="text-slate-400 hover:text-white p-1"
                title="Fechar alerta"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-2.5 p-2.5 bg-slate-800/90 rounded-xl border border-slate-700 text-xs text-slate-200 italic line-clamp-2">
              "{incomingCallAlert.message}"
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => playAttendanceChime(incomingCallAlert.channel, 'new_ticket')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Tocar Novamente</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const found = tickets.find((t) => t.id === incomingCallAlert.ticketId);
                  if (found) setSelectedTicket(found);
                  setActiveView('inbox');
                  dismissIncomingCallAlert();
                }}
                className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition-colors"
              >
                <span>Atender Agora no Inbox</span>
              </button>
            </div>
          </div>
        )}

        {/* Notifications Icon with simulated toast */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationToast(!showNotificationToast)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-colors"
            title="Notificações do Sistema"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
          </button>

          {showNotificationToast && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs">
              <div className="font-semibold text-slate-800 mb-2 flex items-center justify-between">
                <span>Notificações Recentes</span>
                <span className="text-[10px] text-emerald-600 font-normal">Tudo lido</span>
              </div>
              <div className="space-y-2">
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="font-medium text-emerald-900">Transbordo Inteligente</div>
                  <div className="text-slate-600 text-[11px]">
                    Ticket #99401 transferido para fila Comercial (&gt; 180s).
                  </div>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="font-medium text-blue-900">Google Calendar Sincronizado</div>
                  <div className="text-slate-600 text-[11px]">
                    Reunião agendada com Carlos Mendonça às 15:30.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current Logged User Profile & Role Switcher */}
        <div className="relative border-l border-slate-200 pl-3">
          <button
            onClick={() => setIsAgentMenuOpen(!isAgentMenuOpen)}
            className="flex items-center gap-3 p-1 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="relative">
              <img
                src={currentAgent.avatar}
                alt={currentAgent.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200"
              />
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                  currentAgent.status === 'online'
                    ? 'bg-emerald-500'
                    : currentAgent.status === 'busy'
                    ? 'bg-amber-500'
                    : currentAgent.status === 'break'
                    ? 'bg-blue-500'
                    : 'bg-slate-400'
                }`}
              />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                {currentUserRole === 'superadmin' ? 'Super Admin' : currentAgent.name}
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider ${
                    currentUserRole === 'superadmin'
                      ? 'bg-purple-900 text-purple-200'
                      : currentUserRole === 'admin'
                      ? 'bg-emerald-900 text-emerald-200'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {currentUserRole === 'superadmin'
                    ? 'Super Admin'
                    : currentUserRole === 'admin'
                    ? 'Admin Master'
                    : 'Atendente'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {currentUserRole === 'superadmin' ? 'Infraestrutura SaaS' : currentAgent.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isAgentMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">
                  Alternar Modo de Visualização
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Teste o CRM como <strong>Master Admin</strong> ou como <strong>Atendente</strong> em fase Kanban:
                </p>
              </div>

              <div className="max-h-64 overflow-y-auto p-1 space-y-1">
                {agents.map((ag) => (
                  <button
                    key={ag.id}
                    onClick={() => {
                      switchCurrentAgent(ag.id);
                      setIsAgentMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-xs transition-colors ${
                      ag.id === currentAgent.id
                        ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <img
                      src={ag.avatar}
                      alt={ag.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium flex items-center justify-between gap-1">
                        <span className="truncate">{ag.name}</span>
                        {ag.isMasterAdmin || ag.role === 'Administrador Geral' ? (
                          <span className="text-[9px] bg-slate-800 text-white px-1.5 py-0.5 rounded shrink-0">
                            Admin
                          </span>
                        ) : ag.role === 'Operador Sênior' ? (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-bold shrink-0">
                            Sênior • Visão Total
                          </span>
                        ) : (
                          <span className="text-[9px] bg-blue-100 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded font-bold shrink-0">
                            {ag.role} • Só Próprios
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {ag.role === 'Operador Sênior' || ag.isMasterAdmin || ag.role === 'Administrador Geral'
                          ? `${ag.role} • Todos os Departamentos`
                          : `${ag.role} • Somente Atendimentos Próprios`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-2 px-2 mt-1 space-y-1.5">
                <button
                  onClick={() => {
                    setActiveView('kanban-agent');
                    setIsAgentMenuOpen(false);
                  }}
                  className="w-full py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Abrir Minha Página de Atendente
                </button>

                <button
                  onClick={() => {
                    setIsLoginModalOpen(true);
                    setIsAgentMenuOpen(false);
                  }}
                  className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-emerald-200"
                >
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  Trocar Senha (admin123 / atendente123)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
