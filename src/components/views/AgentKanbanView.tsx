import React, { useState } from 'react';
import {
  Headphones,
  UserCheck,
  Clock,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Filter,
  Shield,
  Bot,
  Zap,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ChatPhase, ChatTicket } from '../../types/crm';

const phases: { id: ChatPhase; label: string; desc: string; color: string; bg: string }[] = [
  { id: 'triagem', label: '1. Triagem & Fila', desc: 'Aguardando atendimento inicial', color: 'border-blue-500 text-blue-700', bg: 'bg-blue-50/50' },
  { id: 'em_atendimento', label: '2. Em Atendimento', desc: 'Conversa ativa no WhatsApp', color: 'border-emerald-500 text-emerald-700', bg: 'bg-emerald-50/50' },
  { id: 'aguardando_cliente', label: '3. Aguardando Cliente', desc: 'Aguardando resposta do lead', color: 'border-amber-500 text-amber-700', bg: 'bg-amber-50/50' },
  { id: 'transbordo', label: '4. Transbordo / Escalação', desc: 'Transferido por tempo limite', color: 'border-purple-500 text-purple-700', bg: 'bg-purple-50/50' },
  { id: 'resolvido', label: '5. Finalizado / Resolvido', desc: 'Atendimento concluído', color: 'border-slate-400 text-slate-600', bg: 'bg-slate-100/50' },
];

export const AgentKanbanView: React.FC = () => {
  const {
    currentAgent,
    tickets,
    visibleTickets,
    currentUserRole,
    updateTicketPhase,
    setSelectedTicket,
    setActiveView,
    toggleAgentStatus,
    departments,
    setIsScheduleModalOpen,
    setScheduleTargetLead,
    triggerAiFallbackForTicket,
  } = useCRM();

  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterScope, setFilterScope] = useState<'my_tickets' | 'all_dept'>('my_tickets');

  // Filter tickets according to current role & attendant
  const agentTickets = visibleTickets.filter((t) => {
    if (currentUserRole === 'atendente') {
      return t.assignedAgentId === currentAgent.id;
    }

    const isAssignedToMe = t.assignedAgentId === currentAgent.id;
    const isInMyDepts = departments
      .filter((d) => currentAgent.departments.includes(d.name))
      .some((d) => d.id === t.departmentId);

    const matchesScope =
      filterScope === 'my_tickets'
        ? isAssignedToMe || (!t.assignedAgentId && isInMyDepts)
        : true;

    const matchesDept = filterDepartment === 'all' || t.departmentId === filterDepartment;

    return matchesScope && matchesDept;
  });

  const activeCount = agentTickets.filter((t) => t.phase !== 'resolvido').length;
  const slaAlertCount = agentTickets.filter((t) => t.slaExceeded && t.phase !== 'resolvido').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Operator Status Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentAgent.avatar}
              alt={currentAgent.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-xs"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-white ${
                currentAgent.status === 'online'
                  ? 'bg-emerald-500'
                  : currentAgent.status === 'busy'
                  ? 'bg-amber-500'
                  : 'bg-blue-500'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{currentAgent.name}</h1>
              <span className="text-[11px] bg-slate-900 text-white font-semibold px-2 py-0.5 rounded-full">
                {currentAgent.role}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{currentAgent.shift}</span>
              <span>•</span>
              <span className="font-mono text-slate-700">{currentAgent.phone}</span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">
                Departamentos: {currentAgent.departments.slice(0, 3).join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Operator Controls & Capacity */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Status Quick Switch */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => toggleAgentStatus(currentAgent.id, 'online')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                currentAgent.status === 'online'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🟢 Disponível
            </button>
            <button
              onClick={() => toggleAgentStatus(currentAgent.id, 'busy')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                currentAgent.status === 'busy'
                  ? 'bg-white text-amber-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🟡 Em Reunião
            </button>
            <button
              onClick={() => toggleAgentStatus(currentAgent.id, 'break')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                currentAgent.status === 'break'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⏸️ Pausa
            </button>
          </div>

          {/* Chat Capacity Pill */}
          <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Minha Carga</div>
            <div className="font-mono font-bold text-slate-800">
              {currentAgent.activeChats} / {currentAgent.maxChats} Chats
            </div>
          </div>
        </div>
      </div>

      {/* Filter Scope Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterScope('my_tickets')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterScope === 'my_tickets'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Meus Atendimentos ({activeCount})
          </button>
          <button
            onClick={() => setFilterScope('all_dept')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterScope === 'all_dept'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todos da Central ({tickets.length})
          </button>

          {slaAlertCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              {slaAlertCount} SLA estourado (&gt; 180s)
            </span>
          )}
        </div>

        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
        >
          <option value="all">Filtrar por Departamento</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Kanban Board of Attendant Phases */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {phases.map((phase) => {
          const phaseTickets = agentTickets.filter((t) => t.phase === phase.id);

          return (
            <div
              key={phase.id}
              className={`rounded-2xl border p-3 flex flex-col justify-between min-h-[560px] shadow-2xs ${phase.bg} ${
                phase.id === 'transbordo' ? 'border-amber-300' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">{phase.label}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">{phase.desc}</p>
                  </div>
                  <span className="text-[10px] bg-white font-bold text-slate-800 px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                    {phaseTickets.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="mt-3 space-y-3">
                  {phaseTickets.map((ticket) => {
                    const dept = departments.find((d) => d.id === ticket.departmentId);

                    return (
                      <div
                        key={ticket.id}
                        className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-md transition-all text-xs"
                      >
                        {/* Protocol & Engine */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            {ticket.protocol}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              ticket.originEngine === 'evolution'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-indigo-50 text-indigo-700'
                            }`}
                          >
                            {ticket.originEngine === 'evolution' ? 'Evolution' : 'Uazapi'}
                          </span>
                        </div>

                        {/* Contact details */}
                        <div className="flex items-center gap-2.5">
                          <img
                            src={ticket.contactAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                            alt={ticket.contactName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">
                              {ticket.contactName}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {ticket.contactPhone}
                            </div>
                          </div>
                        </div>

                        {/* Dept Badge */}
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                            {dept?.name || 'Comercial'}
                          </span>

                          {ticket.slaExceeded && (
                            <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Transbordo
                            </span>
                          )}
                        </div>

                        {/* Last message preview */}
                        <div className="mt-2.5 p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-700 line-clamp-2">
                          {ticket.lastMessage}
                        </div>

                        {ticket.aiHandled && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-purple-700 font-medium">
                            <Bot className="w-3 h-3" />
                            <span>Atendido por IA Fallback</span>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1">
                          <button
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setActiveView('inbox');
                            }}
                            className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-semibold transition-colors flex items-center justify-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Atender
                          </button>

                          <button
                            onClick={() => {
                              setScheduleTargetLead({
                                name: ticket.contactName,
                                phone: ticket.contactPhone,
                              });
                              setIsScheduleModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                            title="Agendar Demo no Google Calendar"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => triggerAiFallbackForTicket(ticket.id)}
                            className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                            title="Disparar IA para Responder Automaticamente"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Move Phase Selector */}
                        <div className="mt-2 pt-2 border-t border-slate-50">
                          <select
                            value={ticket.phase}
                            onChange={(e) =>
                              updateTicketPhase(ticket.id, e.target.value as ChatPhase)
                            }
                            className="w-full text-[10px] font-semibold py-1 px-1.5 rounded bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
                          >
                            {phases.map((p) => (
                              <option key={p.id} value={p.id}>
                                Mover: {p.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 mt-2">
                {phaseTickets.length} atendimentos
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
