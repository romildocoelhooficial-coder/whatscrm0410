import React, { useState } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  Calendar,
  Bot,
  User,
  Phone,
  Building,
  Tag,
  CheckCheck,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  MoreVertical,
  Sliders,
  BellRing,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ChatPhase, ChatTicket } from '../../types/crm';
import { requestAiFallbackReply } from '../../services/geminiService';

export const InboxChatView: React.FC = () => {
  const {
    visibleTickets,
    canViewAllDepartmentsAndTickets,
    selectedTicket,
    setSelectedTicket,
    sendChatMessage,
    updateTicketPhase,
    transferTicket,
    assignTicketToAgent,
    triggerAiFallbackForTicket,
    departments,
    agents,
    currentAgent,
    setIsScheduleModalOpen,
    setScheduleTargetLead,
    addDeal,
    soundSettings,
    updateSoundSettings,
    playAttendanceChime,
    simulateIncomingAttendanceCall,
  } = useCRM();

  const [messageInput, setMessageInput] = useState('');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Strict RBAC Filtering:
  // - Atendente N1 (and non-Senior/non-Admin): ONLY sees their own assigned atendimentos (t.assignedAgentId === currentAgent.id)
  // - Operador Sênior & Admin: see ALL departments and ALL atendimentos
  const scopedTickets = canViewAllDepartmentsAndTickets
    ? visibleTickets
    : visibleTickets.filter((t) => t.assignedAgentId === currentAgent.id);

  const filteredTickets = scopedTickets.filter((t) => {
    const matchesPhase = filterPhase === 'all' || t.phase === filterPhase;
    const matchesDept =
      !canViewAllDepartmentsAndTickets ||
      filterDepartment === 'all' ||
      t.departmentId === filterDepartment;
    return matchesPhase && matchesDept;
  });

  // Active ticket always resolves from the attendant's allowed tickets
  const activeTicket =
    (selectedTicket && filteredTickets.find((t) => t.id === selectedTicket.id)) ||
    (selectedTicket && scopedTickets.find((t) => t.id === selectedTicket.id)) ||
    filteredTickets[0] ||
    scopedTickets[0];

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeTicket) return;

    const text = messageInput;
    setMessageInput('');
    await sendChatMessage(activeTicket.id, text, 'agent');
  };

  const handleQuickReply = async (replyText: string) => {
    if (!activeTicket) return;
    await sendChatMessage(activeTicket.id, replyText, 'agent');
  };

  const handleAiAssistedReply = async () => {
    if (!activeTicket) return;
    setIsAiGenerating(true);
    await triggerAiFallbackForTicket(activeTicket.id);
    setIsAiGenerating(false);
  };

  const handleCreateDealFromChat = () => {
    if (!activeTicket) return;
    addDeal({
      title: `Oportunidade WhatsApp - ${activeTicket.contactName}`,
      contactName: activeTicket.contactName,
      contactPhone: activeTicket.contactPhone,
      companyName: 'Lead WhatsApp Inbound',
      value: 35000,
      stage: 'qualificacao',
      departmentId: activeTicket.departmentId,
      assignedAgentId: currentAgent.id,
      priority: 'high',
      lastInteraction: 'Originado via Inbox WhatsApp',
      tags: ['WhatsApp Inbound', 'Omnichannel'],
    });
    alert(`Oportunidade criada com sucesso no Funil de Vendas para ${activeTicket.contactName}!`);
  };

  const currentDept = departments.find((d) => d.id === activeTicket?.departmentId);

  return (
    <div className="h-[calc(100vh-64px)] flex bg-slate-100 overflow-hidden">
      {/* Column 1: Conversations List */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-slate-900 text-sm">
              {canViewAllDepartmentsAndTickets ? 'Inbox Multiatendimento' : 'Meus Atendimentos'}
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              {filteredTickets.length} Ativos
            </span>
          </div>

          {!canViewAllDepartmentsAndTickets ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-2.5 py-1.5 text-[10px] text-blue-900 font-bold mb-2">
              🔒 Visão Exclusiva ({currentAgent.role}): Somente seus próprios atendimentos ({scopedTickets.length}).
            </div>
          ) : (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl px-2.5 py-1.5 text-[10px] text-emerald-950 font-bold mb-2 space-y-1.5">
              <div>
                🌐 Visão Completa ({currentAgent.role}): Todos os departamentos e atendimentos ({scopedTickets.length}).
              </div>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full py-1 px-2 bg-white border border-emerald-200 rounded-lg text-[10px] text-slate-800 font-semibold focus:outline-none"
              >
                <option value="all">Todos os Departamentos ({departments.length})</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Campainha Sonora Quick Bar for the Attendant */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2 mb-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-950">
                <BellRing className="w-3.5 h-3.5 text-emerald-600" />
                <span>Campainha Sonora</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => playAttendanceChime('chat', 'new_ticket')}
                  className="px-2 py-0.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold transition-colors"
                  title="Testar toque da campainha agora"
                >
                  🔊 Testar Som
                </button>
                <button
                  type="button"
                  onClick={() => updateSoundSettings({ enabled: !soundSettings.enabled })}
                  className={`p-1 rounded border transition-colors ${
                    soundSettings.enabled
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-200 text-slate-600 border-slate-300'
                  }`}
                  title={soundSettings.enabled ? 'Campainha Ativa (Clique p/ silenciar)' : 'Campainha Silenciada'}
                >
                  {soundSettings.enabled ? (
                    <Volume2 className="w-3 h-3" />
                  ) : (
                    <VolumeX className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 pt-0.5">
              <button
                type="button"
                onClick={() => simulateIncomingAttendanceCall('chat')}
                className="py-1 px-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-colors"
              >
                💬 + Pedido Chat
              </button>
              <button
                type="button"
                onClick={() => simulateIncomingAttendanceCall('whatsapp')}
                className="py-1 px-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors"
              >
                📱 + Pedido Whats
              </button>
            </div>
          </div>

          {/* Phase Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto text-[11px] pb-1">
            <button
              onClick={() => setFilterPhase('all')}
              className={`px-2 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
                filterPhase === 'all'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterPhase('triagem')}
              className={`px-2 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
                filterPhase === 'triagem'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Triagem
            </button>
            <button
              onClick={() => setFilterPhase('em_atendimento')}
              className={`px-2 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
                filterPhase === 'em_atendimento'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Em Atendimento
            </button>
            <button
              onClick={() => setFilterPhase('transbordo')}
              className={`px-2 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
                filterPhase === 'transbordo'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Transbordo
            </button>
          </div>
        </div>

        {/* Tickets Scroll List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredTickets.map((ticket) => {
            const isSelected = activeTicket?.id === ticket.id;
            const dept = departments.find((d) => d.id === ticket.departmentId);

            return (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 relative ${
                  isSelected
                    ? 'bg-emerald-50/70 border-l-4 border-emerald-500'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={
                      ticket.contactAvatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                    }
                    alt={ticket.contactName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                      ticket.originChannel === 'chat' || ticket.originEngine === 'web_chat'
                        ? 'bg-blue-500'
                        : ticket.originEngine === 'evolution'
                        ? 'bg-emerald-500'
                        : 'bg-indigo-500'
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs truncate">
                      {ticket.contactName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {ticket.lastMessageTime}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {ticket.lastMessage}
                  </div>

                  <div className="mt-1.5 flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {dept?.name || 'Geral'}
                      </span>
                      {ticket.originChannel === 'chat' || ticket.originEngine === 'web_chat' ? (
                        <span className="text-[9px] font-bold bg-blue-100 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
                          💬 Origem: Chat
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                          📱 Origem: WhatsApp
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {ticket.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {ticket.unreadCount}
                        </span>
                      )}

                      {ticket.aiHandled && (
                        <span className="text-[9px] bg-purple-100 text-purple-700 px-1 rounded font-medium">
                          🤖 IA
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Column 2: Chat Main Workspace */}
      <div className="flex-1 flex flex-col bg-slate-50/50">
        {activeTicket ? (
          <>
            {/* Chat Top Header */}
            <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <img
                  src={
                    activeTicket.contactAvatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                  }
                  alt={activeTicket.contactName}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">
                      {activeTicket.contactName}
                    </h3>
                    <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {activeTicket.protocol}
                    </span>
                    {activeTicket.originChannel === 'chat' || activeTicket.originEngine === 'web_chat' ? (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full">
                        💬 Origem: Chat
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                        📱 Origem: WhatsApp
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="font-mono text-emerald-600 font-medium">
                      {activeTicket.contactPhone}
                    </span>
                    <span>•</span>
                    <span className="capitalize text-slate-600 font-medium">
                      Fase: {(activeTicket?.phase || '').replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Actions */}
              <div className="flex items-center gap-2">
                {/* Schedule Demo Google Calendar */}
                <button
                  onClick={() => {
                    setScheduleTargetLead({
                      name: activeTicket.contactName,
                      phone: activeTicket.contactPhone,
                    });
                    setIsScheduleModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  Agendar no Google Calendar
                </button>

                {/* AI Fallback Responder */}
                <button
                  onClick={handleAiAssistedReply}
                  disabled={isAiGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-semibold transition-colors"
                  title="Gerar resposta inteligente via Gemini AI"
                >
                  <Bot className="w-3.5 h-3.5 text-purple-600" />
                  {isAiGenerating ? 'IA Gerando...' : 'Resposta IA'}
                </button>
              </div>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#f0f2f5]/50">
              {activeTicket.messages.map((msg) => {
                const isMe = msg.sender === 'agent';
                const isAi = msg.sender === 'ai_bot';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isMe ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-lg rounded-2xl p-3.5 text-xs shadow-2xs leading-relaxed relative ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-br-xs'
                          : isAi
                          ? 'bg-purple-50 text-purple-950 border border-purple-200/80 rounded-bl-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                      }`}
                    >
                      {/* Sender label */}
                      {msg.senderName && (
                        <div
                          className={`text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${
                            isMe
                              ? 'text-emerald-100'
                              : isAi
                              ? 'text-purple-700'
                              : 'text-slate-500'
                          }`}
                        >
                          {isAi && <Bot className="w-3 h-3" />}
                          {msg.senderName}
                        </div>
                      )}

                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      <div
                        className={`mt-1.5 text-[9px] flex items-center justify-end gap-1 font-mono ${
                          isMe ? 'text-emerald-100' : 'text-slate-400'
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Canned Replies */}
            <div className="px-6 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">
                Respostas Rápidas:
              </span>
              <button
                onClick={() =>
                  handleQuickReply(
                    'Olá! Como posso ajudar você hoje no OmniPulse CRM?'
                  )
                }
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-700 whitespace-nowrap"
              >
                👋 Boas-vindas
              </button>
              <button
                onClick={() =>
                  handleQuickReply(
                    'Vou preparar sua proposta comercial com tabela de planos e failover redundante!'
                  )
                }
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-700 whitespace-nowrap"
              >
                📄 Enviar Proposta
              </button>
              <button
                onClick={() =>
                  handleQuickReply(
                    'Gostaria de agendar uma demonstração rápida de 15 minutos pelo Google Meet?'
                  )
                }
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-700 whitespace-nowrap"
              >
                📅 Convite Google Meet
              </button>
            </div>

            {/* Input Box */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-white border-t border-slate-200 flex items-center gap-2.5"
            >
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                title="Anexar arquivo"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder="Digite sua mensagem WhatsApp ou use respostas rápidas..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 py-2 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />

              <button
                type="submit"
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors"
                title="Enviar mensagem"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
            Selecione uma conversa para iniciar o atendimento.
          </div>
        )}
      </div>

      {/* Column 3: Lead & Omnichannel Details Panel */}
      {activeTicket && (
        <div className="w-72 bg-white border-l border-slate-200 p-5 overflow-y-auto space-y-5 shrink-0 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
              Detalhes do Lead
            </h3>
            <div className="space-y-2 text-slate-600">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Contato</span>
                <div className="font-bold text-slate-900">{activeTicket.contactName}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Telefone</span>
                <div className="font-mono text-slate-800">{activeTicket.contactPhone}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Canal de Origem</span>
                <div className="mt-0.5">
                  {activeTicket.originChannel === 'chat' || activeTicket.originEngine === 'web_chat' ? (
                    <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md text-[11px]">
                      💬 Origem: Chat (Web Chat)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                      📱 Origem: WhatsApp
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Motor Origem</span>
                <div className="font-semibold text-emerald-700 uppercase">
                  {activeTicket.originEngine === 'web_chat'
                    ? 'Web Chat Ao Vivo'
                    : activeTicket.originEngine === 'meta_cloud'
                    ? 'Meta Cloud API Oficial'
                    : activeTicket.originEngine === 'evolution'
                    ? 'Evolution API v2'
                    : 'Uazapi Cloud'}
                </div>
              </div>
            </div>
          </div>

          {/* Department and Assigned Attendant */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-slate-400 text-[10px] uppercase font-semibold mb-1">
                Departamento do Atendimento
              </label>
              {canViewAllDepartmentsAndTickets ? (
                <select
                  value={activeTicket.departmentId}
                  onChange={(e) => transferTicket(activeTicket.id, e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold">
                  {currentDept?.name || 'Atendimento'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] uppercase font-semibold mb-1">
                Atendente Responsável
              </label>
              {canViewAllDepartmentsAndTickets ? (
                <select
                  value={activeTicket.assignedAgentId || ''}
                  onChange={(e) =>
                    assignTicketToAgent(
                      activeTicket.id,
                      e.target.value ? e.target.value : null
                    )
                  }
                  className="w-full p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-950 font-semibold focus:outline-none"
                >
                  <option value="">⏳ Fila Geral (Sem Atendente)</option>
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.role})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-bold">
                  {currentAgent.name} ({currentAgent.role})
                </div>
              )}
            </div>
          </div>

          {/* Ticket Phase */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-slate-400 text-[10px] uppercase font-semibold mb-1">
              Fase do Atendimento
            </label>
            <select
              value={activeTicket.phase}
              onChange={(e) =>
                updateTicketPhase(activeTicket.id, e.target.value as ChatPhase)
              }
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
            >
              <option value="triagem">1. Triagem & Fila</option>
              <option value="em_atendimento">2. Em Atendimento</option>
              <option value="aguardando_cliente">3. Aguardando Cliente</option>
              <option value="transbordo">4. Transbordo</option>
              <option value="resolvido">5. Resolvido / Finalizado</option>
            </select>
          </div>

          {/* Quick Actions */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={handleCreateDealFromChat}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Building className="w-3.5 h-3.5" />
              Converter em Oportunidade
            </button>

            <button
              onClick={() => {
                setScheduleTargetLead({
                  name: activeTicket.contactName,
                  phone: activeTicket.contactPhone,
                });
                setIsScheduleModalOpen(true);
              }}
              className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              Agendar no Google Calendar
            </button>

            <button
              onClick={() => updateTicketPhase(activeTicket.id, 'resolvido')}
              className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-semibold transition-colors"
            >
              ✓ Concluir Atendimento
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
