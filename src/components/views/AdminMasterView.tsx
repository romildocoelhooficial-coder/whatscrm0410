import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  RefreshCw,
  Download,
  CheckCircle,
  Radio,
  Server,
  Zap,
  Activity,
  QrCode,
  Clock,
  ArrowRight,
  Pencil,
  Pause,
  Play,
  Key,
  Trash2,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Award,
  Check,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Agent, Department } from '../../types/crm';

export const AdminMasterView: React.FC = () => {
  const {
    departments,
    agents,
    gatewayConfig,
    auditEvents,
    switchActiveEngine,
    toggleAgentStatus,
    deleteAgent,
    setIsAgentModalOpen,
    setEditingAgent,
    setIsDeptModalOpen,
    setEditingDept,
    deleteDepartment,
    setIsGatewayModalOpen,
    switchCurrentAgent,
    updatePrimaryPhoneNumber,
    currentUserRole,
    setIsLoginModalOpen,
    setIsQrModalOpen,
    openQrCodeForActivation,
    setActiveView,
    currentTenant,
    updateCurrentTenantCredentials,
  } = useCRM();

  const [agentFilterSearch, setAgentFilterSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'busy' | 'break'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Origin Phone Number Editing
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInputValue, setPhoneInputValue] = useState(gatewayConfig.primaryPhoneNumber);

  // Admin Master Credentials Security Editing
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState(currentTenant?.masterAdminEmail || 'isabella.admin@omnipulse.io');
  const [adminPasswordInput, setAdminPasswordInput] = useState(currentTenant?.masterAdminPassword || 'admin123');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [credsSuccessMsg, setCredsSuccessMsg] = useState<string | null>(null);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmailInput.trim() || !adminPasswordInput.trim()) return;
    updateCurrentTenantCredentials(adminEmailInput.trim(), adminPasswordInput.trim());
    setCredsSuccessMsg('Credenciais do Admin Master atualizadas com sucesso! Utilize este e-mail e senha no próximo login.');
    setIsEditingCredentials(false);
    setTimeout(() => setCredsSuccessMsg(null), 6000);
  };

  const handleSavePhone = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneInputValue.trim()) return;
    updatePrimaryPhoneNumber(phoneInputValue);
    setIsEditingPhone(false);
  };

  const isEvolutionActive = gatewayConfig.activeEngine === 'evolution';

  // Strict RBAC: Only Admin Master can access AdminMasterView
  if (currentUserRole === 'atendente') {
    return (
      <div className="p-8 max-w-xl mx-auto my-16 bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-md">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Acesso Restrito ao Administrador Master
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Você está autenticado no perfil de <strong>Atendente</strong>. Apenas o <strong>Admin Master</strong> possui autorização para configurar conexões do WhatsApp, ativar instâncias por QR Code e administrar departamentos e colaboradores.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => setActiveView('kanban-agent')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            Voltar ao Meu Kanban
          </button>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
          >
            Acessar como Admin (admin123)
          </button>
        </div>
      </div>
    );
  }

  // Filter agents
  const filteredAgents = agents.filter((ag) => {
    const matchesSearch =
      ag.name.toLowerCase().includes(agentFilterSearch.toLowerCase()) ||
      ag.email.toLowerCase().includes(agentFilterSearch.toLowerCase()) ||
      ag.phone.includes(agentFilterSearch);

    const matchesDept =
      selectedDeptFilter === 'all' || ag.departments.includes(selectedDeptFilter);

    const matchesStatus =
      statusFilter === 'all' || ag.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage) || 1;
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportData = () => {
    const data = {
      tenant: 'OmniPulse CRM Corp',
      exportDate: new Date().toISOString(),
      departments,
      agents,
      gatewayConfig,
      auditEvents,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnipulse-crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner and Header with Company Brand Logo & Name */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 shadow-md border border-slate-800 mt-0.5">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300">
                Empresa: {currentTenant?.name}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Failover Automático Ativo
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Slug: /?empresa={currentTenant?.slug || currentTenant?.id}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {currentTenant?.name || 'Gestão Administrativa'} — Equipe & CRUD de Atendentes
            </h1>
          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instância Primária:</span>
              {isEditingPhone ? (
                <form onSubmit={handleSavePhone} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={phoneInputValue}
                    onChange={(e) => setPhoneInputValue(e.target.value)}
                    className="py-0.5 px-2 bg-white border border-emerald-500 rounded text-slate-900 font-mono text-xs focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingPhone(false)}
                    className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]"
                  >
                    Cancelar
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-1.5">
                  <strong className="font-mono text-slate-900">{gatewayConfig.primaryPhoneNumber}</strong>
                  <button
                    onClick={() => {
                      setPhoneInputValue(gatewayConfig.primaryPhoneNumber);
                      setIsEditingPhone(true);
                    }}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 px-1.5 py-0.5 rounded font-medium flex items-center gap-1 transition-colors"
                    title="Editar número WhatsApp de origem"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                    Editar Número
                  </button>
                </div>
              )}
            </div>
            <span>•</span>
            <span>
              SLA Operacional: <strong className="text-slate-800">99.98%</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Latência Média: <strong>21ms</strong>
            </span>
          </div>
          </div>
        </div>

        {/* Master Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveView('gadget')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            title="Abrir Gadget e Formulário Web com código exclusivo desta empresa"
          >
            <Sparkles className="w-4 h-4" />
            Gadget & Formulário Web da Empresa
          </button>

          <button
            onClick={() => openQrCodeForActivation()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all animate-pulse"
            title="Abrir o QR Code para ativar ou reconectar o WhatsApp desta empresa"
          >
            <QrCode className="w-4 h-4" />
            Ativar WhatsApp (QR Code)
          </button>

          <button
            onClick={() => {
              setEditingAgent(null);
              setIsAgentModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            + Novo Atendente
          </button>

          <button
            onClick={() => {
              setEditingDept(null);
              setIsDeptModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            + Novo Departamento
          </button>

          <button
            onClick={() => switchActiveEngine()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-all shadow-2xs"
            title="Comutar entre Evolution API e Uazapi Cloud"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            Alternar Motor
          </button>

          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-all shadow-2xs"
            title="Exportar dados do sistema"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Exportar
          </button>
        </div>
      </div>

      {/* Regra de Governança Master Banner (Matching screenshot) */}
      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                Regra de Governança Master: Alocação Mínima de 3 Departamentos
              </h3>
              <span className="text-[10px] bg-emerald-800 text-white font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Política Obrigatória
              </span>
            </div>
            <p className="text-xs text-emerald-900/80 mt-1 max-w-3xl leading-relaxed">
              Todo operador registrado deve estar formalmente homologado em no mínimo <strong>3 departamentos ativos simultâneos</strong>. Esse protocolo assegura transbordo automático inteligente quando a fila de retenção exceder o limite de 180 segundos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-lg border border-emerald-200/60 text-emerald-800 text-xs font-semibold shrink-0">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Conformidade Global: 100% dos operadores qualificados</span>
        </div>
      </div>

      {/* Triple WhatsApp Gateway Cards (Evolution API vs Uazapi vs Meta Cloud API Oficial) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Evolution API Card */}
        <div
          className={`bg-white rounded-3xl border p-5 shadow-2xs transition-all relative flex flex-col justify-between ${
            gatewayConfig.activeEngine === 'evolution'
              ? 'border-emerald-500/80 ring-2 ring-emerald-500/10'
              : 'border-slate-200 opacity-90'
          }`}
        >
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">Evolution API v2</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        gatewayConfig.activeEngine === 'evolution'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {gatewayConfig.activeEngine === 'evolution' ? 'Ativo' : 'Standby'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-[170px]">
                    {gatewayConfig.evolution.apiUrl}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>18ms</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Sessão WhatsApp</div>
                <div className="font-mono text-slate-800 font-medium mt-0.5 truncate">
                  {gatewayConfig.evolution.instanceName}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Throughput</div>
                <div className="font-semibold text-emerald-600 mt-0.5">
                  {gatewayConfig.evolution.throughput}
                </div>
              </div>
            </div>

            <div className="mt-3 p-2 bg-slate-50 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
              <span>Pareamento QR Code:</span>
              <span className="font-bold text-emerald-700">Pronto</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={() => switchActiveEngine('evolution')}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
                gatewayConfig.activeEngine === 'evolution'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{gatewayConfig.activeEngine === 'evolution' ? 'Motor Ativo no CRM' : 'Ativar Evolution v2'}</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => openQrCodeForActivation()}
                className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1"
              >
                <QrCode className="w-3 h-3 text-slate-500" />
                QR Code
              </button>
              <button
                onClick={() => setIsGatewayModalOpen(true)}
                className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1"
              >
                <Zap className="w-3 h-3 text-slate-500" />
                Configurar
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Uazapi Cloud Gateway Card */}
        <div
          className={`bg-white rounded-3xl border p-5 shadow-2xs transition-all relative flex flex-col justify-between ${
            gatewayConfig.activeEngine === 'uazapi'
              ? 'border-indigo-500/80 ring-2 ring-indigo-500/10'
              : 'border-slate-200 opacity-90'
          }`}
        >
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">Uazapi Cloud</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        gatewayConfig.activeEngine === 'uazapi'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {gatewayConfig.activeEngine === 'uazapi' ? 'Ativo' : 'Contingência'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-[170px]">
                    {gatewayConfig.uazapi.apiUrl}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>24ms</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Estado do Cluster</div>
                <div className="font-medium text-slate-800 mt-0.5 truncate">
                  {gatewayConfig.uazapi.clusterStatus}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">SLA Contratual</div>
                <div className="font-semibold text-indigo-600 mt-0.5">
                  {gatewayConfig.uazapi.slaContract}
                </div>
              </div>
            </div>

            <div className="mt-3 p-2 bg-slate-50 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
              <span>Buffer Sincronizado:</span>
              <span className="font-bold text-indigo-700">10.000 msgs</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={() => switchActiveEngine('uazapi')}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
                gatewayConfig.activeEngine === 'uazapi'
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{gatewayConfig.activeEngine === 'uazapi' ? 'Motor Ativo no CRM' : 'Ativar Uazapi Cloud'}</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setIsGatewayModalOpen(true)}
                className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1"
              >
                <Zap className="w-3 h-3 text-slate-500" />
                Testar Ping
              </button>
              <button
                onClick={() => setIsGatewayModalOpen(true)}
                className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1"
              >
                <Sliders className="w-3 h-3 text-slate-500" />
                Configurar
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Meta Cloud API Oficial (WhatsApp Business Platform) */}
        <div
          className={`bg-white rounded-3xl border p-5 shadow-2xs transition-all relative flex flex-col justify-between ${
            gatewayConfig.activeEngine === 'meta_cloud'
              ? 'border-blue-600 ring-2 ring-blue-600/10'
              : 'border-slate-200 opacity-90'
          }`}
        >
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-sm">Meta Cloud API Oficial</h3>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                      <Award className="w-2.5 h-2.5" /> Selo Verde
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Graph v21.0</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                <span>14ms</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Phone Number ID</div>
                <div className="font-mono text-slate-800 font-bold mt-0.5 truncate text-[11px]">
                  {gatewayConfig.metaCloud?.phoneNumberId || '104829102938472'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Qualidade da Linha</div>
                <div className="font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  GREEN (Tier 2)
                </div>
              </div>
            </div>

            <div className="mt-3 p-2 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-900 flex items-center justify-between">
              <span>SLA Oficial Meta:</span>
              <span className="font-bold">99.99% sem banimento</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={() => switchActiveEngine('meta_cloud')}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
                gatewayConfig.activeEngine === 'meta_cloud'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              <span>{gatewayConfig.activeEngine === 'meta_cloud' ? 'Motor Oficial Ativo' : 'Ativar Meta Cloud API'}</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setIsGatewayModalOpen(true)}
                className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1"
              >
                <Activity className="w-3 h-3 text-slate-500" />
                Handshake
              </button>
              <button
                onClick={() => setIsGatewayModalOpen(true)}
                className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1"
              >
                <Sliders className="w-3 h-3 text-slate-500" />
                WABA & Token
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Credenciais de Acesso & Segurança do Administrador Master */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold shadow-md shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Segurança & Credenciais de Acesso do Administrador Master
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  {currentTenant?.name || 'OmniPulse Matriz'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Altere o e-mail de login e a senha deste Admin Master para acessar este painel e administrar a linha de WhatsApp.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsEditingCredentials(!isEditingCredentials);
              setAdminEmailInput(currentTenant?.masterAdminEmail || 'isabella.admin@omnipulse.io');
              setAdminPasswordInput(currentTenant?.masterAdminPassword || 'admin123');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-600" />
            <span>{isEditingCredentials ? 'Cancelar Edição' : 'Alterar E-mail e Senha'}</span>
          </button>
        </div>

        {credsSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{credsSuccessMsg}</span>
          </div>
        )}

        {!isEditingCredentials ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">E-mail de Login Atual</span>
              <div className="flex items-center gap-2 font-mono font-bold text-slate-900">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate">{currentTenant?.masterAdminEmail || 'isabella.admin@omnipulse.io'}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Senha de Acesso Atual</span>
              <div className="flex items-center justify-between font-mono font-bold text-slate-900">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{showAdminPass ? (currentTenant?.masterAdminPassword || 'admin123') : '••••••••••••'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdminPass(!showAdminPass)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nome do Gestor Master</span>
              <div className="font-bold text-slate-800">
                {currentTenant?.masterAdminName || 'Isabella Rodrigues'}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveCredentials} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">
                  Novo E-mail de Login do Admin Master *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="novo.email@empresa.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">
                  Nova Senha de Acesso *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    required
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Digite a nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
              <span className="text-[11px] text-slate-500">
                A nova credencial será exigida imediatamente na página de login do sistema.
              </span>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsEditingCredentials(false)}
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 rounded-xl text-slate-700 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Novas Credenciais</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Gestão de Departamentos & Regras de Transbordo (Matching screenshot) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-sm">
              Gestão de Departamentos & Regras de Transbordo
            </h2>
          </div>
          <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
            TIMEOUT GLOBAL: 180s para Transbordo Coringa
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Políticas de esgotamento e balanceamento automatizado de conversas WhatsApp
        </p>

        {/* Department Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                    {dept.code}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {dept.agentCount} Atendentes
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{dept.name}</h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {dept.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Espera Média:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {dept.avgWaitTime}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Regra Transbordo:</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200/60 font-mono">
                    {dept.transbordoTarget}
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-1.5 border-t border-slate-50">
                  <button
                    onClick={() => {
                      setEditingDept(dept);
                      setIsDeptModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                    title="Editar Departamento"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteDepartment(dept.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Remover Departamento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quadro de Atendentes & Operadores da Empresa */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">
                Gestão de Equipe & CRUD de Atendentes — {currentTenant?.name}
              </h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                {agents.length} Atendentes da Empresa
              </span>
              <button
                onClick={() => {
                  setEditingAgent(null);
                  setIsAgentModalOpen(true);
                }}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Cadastrar Atendente</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cadastre, edite senhas de acesso, defina departamentos e gerencie exclusivamente os atendentes da empresa <strong>{currentTenant?.name}</strong>
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por nome, e-mail..."
                value={agentFilterSearch}
                onChange={(e) => setAgentFilterSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48"
              />
            </div>

            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">Todos os Departamentos</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Status pills */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('online')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  statusFilter === 'online'
                    ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Online ({agents.filter((a) => a.status === 'online').length})
              </button>
              <button
                onClick={() => setStatusFilter('busy')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  statusFilter === 'busy'
                    ? 'bg-white text-amber-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ocupado ({agents.filter((a) => a.status === 'busy').length})
              </button>
              <button
                onClick={() => setStatusFilter('break')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  statusFilter === 'break'
                    ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pausa ({agents.filter((a) => a.status === 'break').length})
              </button>
            </div>
          </div>
        </div>

        {/* Table of Agents */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="py-3 px-3">Atendente</th>
                <th className="py-3 px-3">Função / Nível</th>
                <th className="py-3 px-3">Departamentos Vinculados (Mín. 3)</th>
                <th className="py-3 px-3">Status & Turno</th>
                <th className="py-3 px-3">Carga de Chats</th>
                <th className="py-3 px-3 text-right">Ações de Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAgents.map((agent) => {
                const loadPercentage = Math.round((agent.activeChats / agent.maxChats) * 100);

                return (
                  <tr key={agent.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Atendente info */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {agent.name}
                            {agent.isMasterAdmin && (
                              <span className="text-[9px] bg-slate-900 text-white px-1.5 py-0.2 rounded font-semibold uppercase">
                                Master
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {agent.email} • {agent.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Função / Nível */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                          agent.role === 'Supervisor Omnichannel'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                            : agent.role === 'Closer Comercial'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : agent.role === 'Administrador Geral'
                            ? 'bg-slate-100 text-slate-800 border border-slate-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                        }`}
                      >
                        {agent.role}
                      </span>
                    </td>

                    {/* Departamentos vinculados (Regra Mín 3) */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {agent.departments.map((deptName, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200"
                          >
                            {deptName}
                          </span>
                        ))}
                        {agent.departments.length >= 3 && (
                          <span
                            className="text-emerald-600 flex items-center"
                            title="Conforme regra de alocação tripla"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status & Turno */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            agent.status === 'online'
                              ? 'bg-emerald-500 animate-pulse'
                              : agent.status === 'busy'
                              ? 'bg-amber-500'
                              : agent.status === 'break'
                              ? 'bg-blue-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span className="font-semibold text-slate-800 capitalize">
                          {agent.status === 'online'
                            ? 'Online'
                            : agent.status === 'busy'
                            ? `Ocupado (${agent.statusDetail || 'Reunião'})`
                            : agent.status === 'break'
                            ? `Intervalo (${agent.statusDetail || 'Pausa'})`
                            : 'Offline'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{agent.shift}</div>
                    </td>

                    {/* Carga de Chats */}
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono font-semibold text-slate-800">
                          {agent.activeChats} / {agent.maxChats} Chats
                        </span>
                        <span
                          className={`font-semibold font-mono ${
                            loadPercentage >= 100
                              ? 'text-rose-600'
                              : loadPercentage >= 70
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {loadPercentage}%
                        </span>
                      </div>
                      <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            loadPercentage >= 100
                              ? 'bg-rose-500'
                              : loadPercentage >= 70
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, loadPercentage)}%` }}
                        />
                      </div>
                    </td>

                    {/* Ações de Gestão */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit Agent */}
                        <button
                          onClick={() => {
                            setEditingAgent(agent);
                            setIsAgentModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Editar permissões e dados"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Status (Pause / Play) */}
                        <button
                          onClick={() =>
                            toggleAgentStatus(
                              agent.id,
                              agent.status === 'online' ? 'break' : 'online'
                            )
                          }
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title={
                            agent.status === 'online'
                              ? 'Colocar em pausa'
                              : 'Reativar para online'
                          }
                        >
                          {agent.status === 'online' ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </button>

                        {/* Switch view to this agent */}
                        <button
                          onClick={() => switchCurrentAgent(agent.id)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Assumir sessão deste atendente"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Agent */}
                        <button
                          onClick={() => deleteAgent(agent.id)}
                          disabled={agent.isMasterAdmin}
                          className={`p-1.5 rounded-md transition-colors ${
                            agent.isMasterAdmin
                              ? 'text-slate-200 cursor-not-allowed'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title={
                            agent.isMasterAdmin
                              ? 'Administrador Master não pode ser removido'
                              : 'Remover atendente'
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer (Matching screenshot) */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Mostrando <strong>{paginatedAgents.length}</strong> de <strong>{filteredAgents.length}</strong> atendentes cadastrados no tenant
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Anterior
            </button>
            <span className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>

      {/* Auditoria Administrativa & Transbordo em Tempo Real (Matching screenshot) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-sm">
              Auditoria Administrativa & Transbordo em Tempo Real
            </h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
            Hash Integridade: #SHA256-OK
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Trilha imutável de eventos de rede, comutações e alterações de vínculo
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {auditEvents.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    event.type === 'transbordo'
                      ? 'bg-amber-50 text-amber-600'
                      : event.type === 'validacao'
                      ? 'bg-emerald-50 text-emerald-600'
                      : event.type === 'failover'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {event.type === 'transbordo' && <ArrowRight className="w-4 h-4" />}
                  {event.type === 'validacao' && <CheckCircle className="w-4 h-4" />}
                  {event.type === 'conectividade' && <Radio className="w-4 h-4" />}
                  {event.type === 'failover' && <RefreshCw className="w-4 h-4" />}
                  {event.type === 'config' && <Sliders className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs truncate">
                    {event.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    {event.description}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{event.timestamp}</span>
                    <span className="font-medium text-slate-600 truncate max-w-[120px]">
                      {event.author}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
