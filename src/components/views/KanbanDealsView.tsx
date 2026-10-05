import React, { useState } from 'react';
import {
  Plus,
  DollarSign,
  TrendingUp,
  Filter,
  Calendar,
  Phone,
  Building,
  User,
  MoreVertical,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Deal, DealStage } from '../../types/crm';

const stages: { id: DealStage; label: string; color: string; bg: string }[] = [
  { id: 'lead_inbound', label: '1. Novos Leads (Inbound)', color: 'border-blue-500 text-blue-700', bg: 'bg-blue-50/60' },
  { id: 'qualificacao', label: '2. Qualificação & Triagem', color: 'border-purple-500 text-purple-700', bg: 'bg-purple-50/60' },
  { id: 'demonstracao', label: '3. Demonstração / Meet', color: 'border-amber-500 text-amber-700', bg: 'bg-amber-50/60' },
  { id: 'proposta', label: '4. Proposta & Negociação', color: 'border-indigo-500 text-indigo-700', bg: 'bg-indigo-50/60' },
  { id: 'fechado_ganho', label: '5. Fechado / Ganho 🚀', color: 'border-emerald-500 text-emerald-700', bg: 'bg-emerald-50/60' },
  { id: 'perdido', label: '6. Perdido / Nutrição', color: 'border-slate-400 text-slate-600', bg: 'bg-slate-100/60' },
];

export const KanbanDealsView: React.FC = () => {
  const {
    visibleDeals,
    departments,
    agents,
    currentAgent,
    canViewAllDepartmentsAndTickets,
    updateDealStage,
    addDeal,
    deleteDeal,
    setIsScheduleModalOpen,
    setScheduleTargetLead,
    setActiveView,
    searchQuery,
  } = useCRM();

  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);

  // New Deal Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('+55 ');
  const [newCompany, setNewCompany] = useState('');
  const [newValue, setNewValue] = useState('25000');
  const [newStage, setNewStage] = useState<DealStage>('lead_inbound');
  const [newDeptId, setNewDeptId] = useState('dept-02');
  const [newAgentId, setNewAgentId] = useState(currentAgent?.id || agents[0]?.id || '');

  // Filter deals according to RBAC:
  // - Atendente N1: ONLY sees their own assigned deals/atendimentos
  // - Operador Sênior & Admin: see all departments and all deals
  const filteredDeals = visibleDeals.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.contactPhone.includes(searchQuery);

    if (!canViewAllDepartmentsAndTickets) {
      return d.assignedAgentId === currentAgent.id && matchesSearch;
    }

    const matchesDept = selectedDept === 'all' || d.departmentId === selectedDept;
    const matchesAgent = selectedAgent === 'all' || d.assignedAgentId === selectedAgent;

    return matchesSearch && matchesDept && matchesAgent;
  });

  const totalValue = filteredDeals.reduce((sum, d) => sum + d.value, 0);
  const wonValue = filteredDeals
    .filter((d) => d.stage === 'fechado_ganho')
    .reduce((sum, d) => sum + d.value, 0);

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContact) return;

    addDeal({
      title: newTitle,
      contactName: newContact,
      contactPhone: newPhone,
      companyName: newCompany || 'Empresa Parceira',
      value: parseFloat(newValue) || 10000,
      stage: newStage,
      departmentId: newDeptId,
      assignedAgentId: canViewAllDepartmentsAndTickets ? newAgentId : currentAgent.id,
      priority: 'high',
      lastInteraction: 'Oportunidade inserida manualmente no funil',
      tags: ['Comercial', 'Inbound'],
    });

    setIsNewDealModalOpen(false);
    setNewTitle('');
    setNewContact('');
    setNewCompany('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Pipeline Comercial
            </span>
            <span className="text-xs text-slate-500">
              Automação e Progressão de Oportunidades
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Funil de Vendas Omnichannel
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mova os cards entre as fases para atualizar métricas e disparar agendamentos no Google Calendar
          </p>
        </div>

        {/* Global Pipeline Metrics & CTA */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs">
            <span className="text-slate-400">Total em Pipeline:</span>{' '}
            <strong className="text-slate-900 font-mono text-sm">
              R$ {totalValue.toLocaleString('pt-BR')}
            </strong>
          </div>

          <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl shadow-2xs text-xs">
            <span className="text-emerald-700">Fechados & Ganhos:</span>{' '}
            <strong className="text-emerald-900 font-mono text-sm">
              R$ {wonValue.toLocaleString('pt-BR')}
            </strong>
          </div>

          <button
            onClick={() => setIsNewDealModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            + Nova Oportunidade
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs text-xs">
        {canViewAllDepartmentsAndTickets ? (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <Filter className="w-3.5 h-3.5" />
              <span>🌐 Visão Completa ({currentAgent.role}): Todos os Departamentos e Atendimentos</span>
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">Todos os Departamentos ({departments.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">Todos os Atendentes ({agents.length})</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.role})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-blue-900 font-bold bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
            <span>
              🔒 Visão Exclusiva ({currentAgent.role} — {currentAgent.name}): Exibindo somente seus próprios atendimentos e negócios
            </span>
          </div>
        )}

        <div className="text-slate-500 font-medium">
          Exibindo <strong>{filteredDeals.length}</strong> negociações ativas
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
          const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div
              key={stage.id}
              className={`rounded-2xl border p-3 flex flex-col justify-between min-h-[550px] shadow-2xs ${stage.bg} ${
                stage.id === 'fechado_ganho'
                  ? 'border-emerald-300'
                  : 'border-slate-200/90'
              }`}
            >
              <div>
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <h3 className="font-bold text-slate-800 text-xs truncate" title={stage.label}>
                    {stage.label}
                  </h3>
                  <span className="text-[10px] bg-white font-bold text-slate-700 px-1.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                    {stageDeals.length}
                  </span>
                </div>

                <div className="mt-1.5 mb-3 text-[11px] font-mono text-slate-500 font-medium">
                  R$ {stageValue.toLocaleString('pt-BR')}
                </div>

                {/* Deal Cards Container */}
                <div className="space-y-3">
                  {stageDeals.map((deal) => {
                    const assignedAgent = agents.find((a) => a.id === deal.assignedAgentId);

                    return (
                      <div
                        key={deal.id}
                        className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-md transition-all group relative"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                            {deal.title}
                          </h4>
                          <span className="text-xs font-black text-emerald-600 font-mono whitespace-nowrap">
                            R$ {(deal.value / 1000).toFixed(0)}k
                          </span>
                        </div>

                        <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <Building className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{deal.companyName}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{deal.contactName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>{deal.contactPhone}</span>
                          </div>
                        </div>

                        {deal.meetingTime && (
                          <div className="mt-2.5 p-1.5 bg-amber-50 border border-amber-200/60 rounded-md text-[10px] text-amber-800 flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">{deal.meetingTime}</span>
                          </div>
                        )}

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5">
                            {assignedAgent && (
                              <img
                                src={assignedAgent.avatar}
                                alt={assignedAgent.name}
                                className="w-5 h-5 rounded-full object-cover"
                                title={`Atendente: ${assignedAgent.name}`}
                              />
                            )}
                            <span className="text-slate-500 truncate max-w-[80px]">
                              {assignedAgent?.name.split(' ')[0]}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Schedule in Google Calendar */}
                            <button
                              onClick={() => {
                                setScheduleTargetLead({
                                  name: deal.contactName,
                                  phone: deal.contactPhone,
                                  dealId: deal.id,
                                });
                                setIsScheduleModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                              title="Agendar Demonstração no Google Calendar"
                            >
                              <Calendar className="w-3 h-3" />
                            </button>

                            {/* Open in Chat */}
                            <button
                              onClick={() => setActiveView('inbox')}
                              className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Conversar no WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Stage Mover Selector */}
                        <div className="mt-2 pt-2 border-t border-slate-50">
                          <select
                            value={deal.stage}
                            onChange={(e) => updateDealStage(deal.id, e.target.value as DealStage)}
                            className="w-full text-[10px] font-semibold py-1 px-1.5 rounded bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
                          >
                            {stages.map((s) => (
                              <option key={s.id} value={s.id}>
                                Mover para: {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Quick Add for column */}
              <button
                onClick={() => {
                  setNewStage(stage.id);
                  setIsNewDealModalOpen(true);
                }}
                className="mt-3 w-full py-1.5 border border-dashed border-slate-300 hover:border-slate-400 bg-white/70 hover:bg-white rounded-xl text-[11px] text-slate-600 font-medium transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Card
              </button>
            </div>
          );
        })}
      </div>

      {/* New Deal Modal */}
      {isNewDealModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold text-slate-900">Nova Oportunidade Comercial</h2>
            <p className="text-xs text-slate-500 mt-1">
              Cadastre o lead no funil de vendas integrado aos canais WhatsApp
            </p>

            <form onSubmit={handleCreateDeal} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Título da Negociação *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Contrato Anual 20 Ramais WhatsApp"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Nome do Contato *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Empresa
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Varejo Brasil S/A"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    WhatsApp (com DDD) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Valor Estimado (R$) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Fase Inicial do Funil
                  </label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as DealStage)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Atendente Responsável
                  </label>
                  {canViewAllDepartmentsAndTickets ? (
                    <select
                      value={newAgentId}
                      onChange={(e) => setNewAgentId(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                    >
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.role})
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

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewDealModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Salvar Oportunidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
