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
  GripVertical,
  Move,
  Sparkles,
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
    visibleTickets,
    canViewAllDepartmentsAndTickets,
    updateTicketPhase,
    repositionTicket,
    assignTicketToAgent,
    setSelectedTicket,
    setActiveView,
    toggleAgentStatus,
    departments,
    visibleDepartments,
    agents,
    setIsScheduleModalOpen,
    setScheduleTargetLead,
    triggerAiFallbackForTicket,
  } = useCRM();

  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterAgentId, setFilterAgentId] = useState<string>('all');
  const [filterScope, setFilterScope] = useState<'my_tickets' | 'all_dept'>('all_dept');

  // Drag and Drop States
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);
  const [dragOverPhase, setDragOverPhase] = useState<ChatPhase | null>(null);
  const [dragOverTargetTicketId, setDragOverTargetTicketId] = useState<string | null>(null);
  const [dropInsertPosition, setDropInsertPosition] = useState<'before' | 'after'>('after');

  // Strict RBAC Filtering:
  // - Atendente N1 (and non-Senior/non-Admin): ONLY sees their own assigned atendimentos (t.assignedAgentId === currentAgent.id)
  // - Operador Sênior & Admin: can see ALL departments and ALL atendimentos
  const agentTickets = visibleTickets.filter((t) => {
    if (!canViewAllDepartmentsAndTickets) {
      return t.assignedAgentId === currentAgent.id;
    }

    const isAssignedToMe = t.assignedAgentId === currentAgent.id;
    const matchesScope = filterScope === 'my_tickets' ? isAssignedToMe : true;
    const matchesDept = filterDepartment === 'all' || t.departmentId === filterDepartment;
    const matchesAgent = filterAgentId === 'all' || t.assignedAgentId === filterAgentId;

    return matchesScope && matchesDept && matchesAgent;
  });

  const myOwnTicketsCount = visibleTickets.filter(
    (t) => t.assignedAgentId === currentAgent.id
  ).length;
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
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">{currentAgent.name}</h1>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  canViewAllDepartmentsAndTickets
                    ? 'bg-emerald-700 text-white'
                    : 'bg-blue-700 text-white'
                }`}
              >
                {currentAgent.role}
              </span>
              {canViewAllDepartmentsAndTickets ? (
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  🌐 Acesso Total: Todos os Departamentos e Atendimentos
                </span>
              ) : (
                <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                  🔒 Acesso Restrito: Somente Meus Próprios Atendimentos
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{currentAgent.shift}</span>
              <span>•</span>
              <span className="font-mono text-slate-700">{currentAgent.phone}</span>
              <span>•</span>
              {canViewAllDepartmentsAndTickets ? (
                <span className="text-emerald-700 font-medium">
                  Todos os Departamentos Liberados ({departments.map((d) => d.name).join(', ')})
                </span>
              ) : (
                <span className="text-blue-700 font-medium">
                  Escopo Individual: Apenas Atendimentos Atribuídos a {currentAgent.name}
                </span>
              )}
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
              {myOwnTicketsCount} / {currentAgent.maxChats} Chats
            </div>
          </div>
        </div>
      </div>

      {/* Filter Scope Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {canViewAllDepartmentsAndTickets ? (
            <>
              <button
                onClick={() => setFilterScope('all_dept')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterScope === 'all_dept'
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                🌐 Todos os Atendimentos & Departamentos ({visibleTickets.length})
              </button>
              <button
                onClick={() => setFilterScope('my_tickets')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterScope === 'my_tickets'
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                👤 Meus Atendimentos ({myOwnTicketsCount})
              </button>
            </>
          ) : (
            <div className="px-3.5 py-2 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl font-bold flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>
                🔒 Visão Exclusiva ({currentAgent.role}): Exibindo somente seus próprios atendimentos ({agentTickets.length})
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold shadow-2xs">
            <Move className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>🖐️ Segure com o mouse e arraste para reposicionar</span>
          </div>

          {slaAlertCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              {slaAlertCount} SLA estourado (&gt; 180s)
            </span>
          )}
        </div>

        {/* Department & Agent Filters: ONLY visible to Operador Sênior and Admin */}
        {canViewAllDepartmentsAndTickets && (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">Todos os Departamentos ({departments.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={filterAgentId}
              onChange={(e) => setFilterAgentId(e.target.value)}
              className="py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">Todos os Atendentes ({agents.length})</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} ({ag.role})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Kanban Board of Attendant Phases with Drag & Drop */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {phases.map((phase) => {
          const phaseTickets = agentTickets.filter((t) => t.phase === phase.id);
          const isColumnHovered = dragOverPhase === phase.id && draggedTicketId !== null;

          return (
            <div
              key={phase.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dragOverPhase !== phase.id) {
                  setDragOverPhase(phase.id);
                }
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragOverPhase(phase.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  if (dragOverPhase === phase.id) setDragOverPhase(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedTicketId) {
                  repositionTicket(draggedTicketId, phase.id, null);
                  setDraggedTicketId(null);
                  setDragOverPhase(null);
                  setDragOverTargetTicketId(null);
                }
              }}
              className={`rounded-2xl border p-3 flex flex-col justify-between min-h-[560px] shadow-2xs transition-all duration-200 ${phase.bg} ${
                isColumnHovered
                  ? 'ring-2 ring-emerald-500 ring-offset-2 border-emerald-400 bg-emerald-50/70 shadow-md scale-[1.01]'
                  : phase.id === 'transbordo'
                  ? 'border-amber-300'
                  : 'border-slate-200'
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

                {/* Dropzone Hint when dragging over this column */}
                {isColumnHovered && (
                  <div className="mt-2 mb-2 p-2.5 border-2 border-dashed border-emerald-500 bg-emerald-100/60 rounded-xl text-center text-[11px] font-bold text-emerald-800 animate-pulse flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Solte para mover para {phase.label.split('.')[1] || phase.label}</span>
                  </div>
                )}

                {/* Cards Container */}
                <div className="mt-3 space-y-3">
                  {phaseTickets.map((ticket) => {
                    const dept = departments.find((d) => d.id === ticket.departmentId);
                    const isBeingDragged = draggedTicketId === ticket.id;
                    const isTargetOfHover =
                      dragOverTargetTicketId === ticket.id && draggedTicketId !== ticket.id;

                    return (
                      <div key={ticket.id} className="relative">
                        {/* Insertion line indicator above */}
                        {isTargetOfHover && dropInsertPosition === 'before' && (
                          <div className="h-1.5 bg-emerald-500 rounded-full mb-2 shadow-xs animate-pulse ring-2 ring-emerald-300" />
                        )}

                        <div
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', ticket.id);
                            e.dataTransfer.effectAllowed = 'move';
                            setDraggedTicketId(ticket.id);
                          }}
                          onDragEnd={() => {
                            setDraggedTicketId(null);
                            setDragOverPhase(null);
                            setDragOverTargetTicketId(null);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            const isBefore = e.clientY - rect.top < rect.height / 2;
                            setDragOverPhase(phase.id);
                            setDragOverTargetTicketId(ticket.id);
                            setDropInsertPosition(isBefore ? 'before' : 'after');
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (draggedTicketId) {
                              repositionTicket(
                                draggedTicketId,
                                phase.id,
                                ticket.id,
                                dropInsertPosition
                              );
                              setDraggedTicketId(null);
                              setDragOverPhase(null);
                              setDragOverTargetTicketId(null);
                            }
                          }}
                          className={`bg-white rounded-xl border p-3.5 shadow-2xs hover:shadow-md transition-all text-xs cursor-grab active:cursor-grabbing select-none group relative ${
                            isBeingDragged
                              ? 'opacity-30 border-dashed border-emerald-500 bg-emerald-50/40 scale-[0.98]'
                              : isTargetOfHover
                              ? 'border-emerald-400 shadow-sm ring-1 ring-emerald-300'
                              : 'border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          {/* Protocol & Engine & Drag Handle */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                              <span
                                className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 text-slate-300 hover:text-slate-600 rounded shrink-0 transition-colors"
                                title="Segure com o mouse e arraste para reposicionar no Kanban"
                              >
                                <GripVertical className="w-3.5 h-3.5" />
                              </span>
                              <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                                {ticket.protocol}
                              </span>
                            </div>
                            {ticket.originChannel === 'chat' || ticket.originEngine === 'web_chat' ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
                                💬 Origem: Chat
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                📱 Origem: WhatsApp
                              </span>
                            )}
                          </div>

                          {/* Contact details */}
                          <div className="flex items-center gap-2.5">
                            <img
                              src={
                                ticket.contactAvatar ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                              }
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
                          <div className="mt-2 flex items-center justify-between gap-1">
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium truncate">
                              {dept?.name || 'Comercial'}
                            </span>

                            {ticket.slaExceeded && (
                              <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 shrink-0">
                                <AlertTriangle className="w-3 h-3" />
                                Transbordo
                              </span>
                            )}
                          </div>

                          {/* Assigned Attendant */}
                          <div className="mt-2">
                            {canViewAllDepartmentsAndTickets ? (
                              <select
                                value={ticket.assignedAgentId || ''}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  assignTicketToAgent(
                                    ticket.id,
                                    e.target.value ? e.target.value : null
                                  );
                                }}
                                className="w-full text-[10px] font-semibold py-1 px-1.5 rounded bg-emerald-50/70 border border-emerald-200 text-emerald-950 focus:outline-none"
                                title="Atribuir atendimento para um atendente"
                              >
                                <option value="">⏳ Fila Geral (Sem Atendente)</option>
                                {agents.map((ag) => (
                                  <option key={ag.id} value={ag.id}>
                                    🎧 {ag.name} ({ag.role})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="text-[10px] font-semibold py-1 px-2 rounded bg-blue-50 border border-blue-200 text-blue-900 truncate">
                                🎧 Atendente: {currentAgent.name} ({currentAgent.role})
                              </div>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTicket(ticket);
                                setActiveView('inbox');
                              }}
                              className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-semibold transition-colors flex items-center justify-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              Atender
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
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
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerAiFallbackForTicket(ticket.id);
                              }}
                              className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                              title="Disparar IA para Responder Automaticamente"
                            >
                              <Zap className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Move Phase Selector (Fallback / Quick Selection) */}
                          <div className="mt-2 pt-2 border-t border-slate-50">
                            <select
                              value={ticket.phase}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateTicketPhase(ticket.id, e.target.value as ChatPhase);
                              }}
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

                        {/* Insertion line indicator below */}
                        {isTargetOfHover && dropInsertPosition === 'after' && (
                          <div className="h-1.5 bg-emerald-500 rounded-full mt-2 shadow-xs animate-pulse ring-2 ring-emerald-300" />
                        )}
                      </div>
                    );
                  })}

                  {phaseTickets.length === 0 && (
                    <div className="p-6 border-2 border-dashed border-slate-200/80 rounded-xl text-center text-slate-400 text-[11px]">
                      Nenhum atendimento nesta fase. Arraste um card aqui para mover.
                    </div>
                  )}
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
