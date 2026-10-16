import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Phone,
  QrCode,
  Users2,
  Server,
  Radio,
  Plus,
  ExternalLink,
  Activity,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  Zap,
  Terminal,
  Cpu,
  Layers,
  Lock,
  Mail,
  Pencil,
  Award,
  Check,
  X,
  Globe,
  Copy,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { TenantSystem } from '../../types/crm';

export const SuperAdminView: React.FC = () => {
  const {
    tenants,
    currentTenant,
    switchTenant,
    setIsNewTenantModalOpen,
    openQrCodeForActivation,
    openCompanyLogin,
    setActiveView,
    agents,
    superAdminCredentials,
    updateSuperAdminCredentials,
    updateTenant,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'tenants' | 'users' | 'backend'>('tenants');
  const [copiedTenantSlug, setCopiedTenantSlug] = useState<string | null>(null);

  // Super Admin security credentials editing
  const [isEditingSuperCreds, setIsEditingSuperCreds] = useState(false);
  const [superEmail, setSuperEmail] = useState(superAdminCredentials.email || 'superadmin@omnipulse.io');
  const [superPass, setSuperPass] = useState(superAdminCredentials.password || 'superadmin123');
  const [showSuperPass, setShowSuperPass] = useState(false);
  const [superSuccessMsg, setSuperSuccessMsg] = useState<string | null>(null);

  // Tenant Admin Master & Company Phone/Info modal
  const [editingTenant, setEditingTenant] = useState<TenantSystem | null>(null);
  const [tenantCompanyName, setTenantCompanyName] = useState('');
  const [tenantCnpj, setTenantCnpj] = useState('');
  const [tenantPrimaryPhone, setTenantPrimaryPhone] = useState('');
  const [tenantInstanceName, setTenantInstanceName] = useState('');
  const [tenantWhatsappEngine, setTenantWhatsappEngine] = useState<'evolution' | 'uazapi' | 'meta_cloud'>('evolution');
  const [tenantAdminEmail, setTenantAdminEmail] = useState('');
  const [tenantAdminPass, setTenantAdminPass] = useState('');
  const [tenantAdminName, setTenantAdminName] = useState('');
  const [showTenantPass, setShowTenantPass] = useState(false);

  // Inline quick phone editing directly on company card
  const [inlinePhoneTenantId, setInlinePhoneTenantId] = useState<string | null>(null);
  const [inlinePhoneValue, setInlinePhoneValue] = useState<string>('');
  const [savedPhoneToastId, setSavedPhoneToastId] = useState<string | null>(null);

  const totalConnectedWhatsApps = tenants.filter((t) => t.whatsappStatus === 'open').length;
  const totalAgentsCount = tenants.reduce((acc, t) => acc + (t.agentCount || 2), 0) + agents.length;

  const handleSaveSuperCreds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!superEmail.trim() || !superPass.trim()) return;
    updateSuperAdminCredentials({ email: superEmail.trim(), password: superPass.trim() });
    setSuperSuccessMsg('Credenciais do Super Admin atualizadas com sucesso! Use este novo e-mail e senha no próximo login.');
    setIsEditingSuperCreds(false);
    setTimeout(() => setSuperSuccessMsg(null), 6000);
  };

  const handleOpenEditTenant = (t: TenantSystem) => {
    setEditingTenant(t);
    setTenantCompanyName(t.name);
    setTenantCnpj(t.cnpjOrId);
    setTenantPrimaryPhone(t.primaryPhoneNumber);
    setTenantInstanceName(t.instanceName);
    setTenantWhatsappEngine(t.whatsappEngine || 'evolution');
    setTenantAdminEmail(t.masterAdminEmail);
    setTenantAdminPass(t.masterAdminPassword);
    setTenantAdminName(t.masterAdminName);
  };

  const handleSaveInlinePhone = (tenantId: string) => {
    if (!inlinePhoneValue.trim()) return;
    updateTenant(tenantId, { primaryPhoneNumber: inlinePhoneValue.trim() });
    setInlinePhoneTenantId(null);
    setSavedPhoneToastId(tenantId);
    setTimeout(() => setSavedPhoneToastId(null), 3500);
  };

  const handleSaveTenantCreds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant || !tenantAdminEmail.trim() || !tenantAdminPass.trim() || !tenantPrimaryPhone.trim()) return;
    updateTenant(editingTenant.id, {
      name: tenantCompanyName.trim() || editingTenant.name,
      cnpjOrId: tenantCnpj.trim() || editingTenant.cnpjOrId,
      primaryPhoneNumber: tenantPrimaryPhone.trim(),
      instanceName: tenantInstanceName.trim() || editingTenant.instanceName,
      whatsappEngine: tenantWhatsappEngine,
      masterAdminEmail: tenantAdminEmail.trim(),
      masterAdminPassword: tenantAdminPass.trim(),
      masterAdminName: tenantAdminName.trim() || editingTenant.masterAdminName,
    });
    setSavedPhoneToastId(editingTenant.id);
    setTimeout(() => setSavedPhoneToastId(null), 4000);
    setEditingTenant(null);
  };

  const handleImpersonateTenant = (tenant: TenantSystem) => {
    switchTenant(tenant.id);
    setActiveView('admin');
  };

  const handleCopyLink = (tenant: TenantSystem) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://crm.omnipulse.io';
    const url = `${origin}/?empresa=${tenant.slug || tenant.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedTenantSlug(tenant.id);
      setTimeout(() => setCopiedTenantSlug(null), 3000);
    }
  };

  const handleOpenTenantQrCode = (tenant: TenantSystem) => {
    switchTenant(tenant.id);
    openQrCodeForActivation();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-slate-900 text-emerald-400 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              SaaS Super Admin Master
            </span>
            <span className="text-xs text-slate-500">
              Painel Global Multi-Sistemas & Backend
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestão Global de Sistemas, Linhas WhatsApp & Infraestrutura
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Crie novos sistemas com seus próprios Admin Masters, linhas de WhatsApp dedicadas e controle todo o backend
          </p>
        </div>

        <button
          onClick={() => setIsNewTenantModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          + Cadastrar Novo Sistema / Empresa
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold">Sistemas / Empresas</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{tenants.length}</span>
            <span className="text-[10px] text-emerald-600 font-bold">100% Operacionais</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Multi-inquilinos provisionados</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold">WhatsApp Conectados</span>
            <Phone className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalConnectedWhatsApps}</span>
            <span className="text-[10px] text-slate-400 font-mono">de {tenants.length} linhas</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Instâncias Evolution & Uazapi ativas</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold">Total de Atendentes</span>
            <Users2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalAgentsCount}</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Online & em Atendimento</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Operadores em todos os sistemas</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold">Saúde do Backend</span>
            <Server className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">99.98%</span>
            <span className="text-[10px] text-slate-500 font-mono">Ping: 19ms</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Cluster SP com failover automático</p>
        </div>
      </div>

      {/* Security & Access Credentials of Super Admin */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-950 text-purple-300 flex items-center justify-center font-bold shadow-md shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Segurança & Credenciais de Acesso do Super Administrador
                </h3>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                  Acesso Raiz ao SaaS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Altere o e-mail e senha mestres do Super Admin utilizados para login no sistema.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsEditingSuperCreds(!isEditingSuperCreds);
              setSuperEmail(superAdminCredentials.email || 'superadmin@omnipulse.io');
              setSuperPass(superAdminCredentials.password || 'superadmin123');
            }}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-600" />
            <span>{isEditingSuperCreds ? 'Cancelar' : 'Alterar Credenciais do Super Admin'}</span>
          </button>
        </div>

        {superSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{superSuccessMsg}</span>
          </div>
        )}

        {!isEditingSuperCreds ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">E-mail Super Admin Atual</span>
              <div className="flex items-center gap-2 font-mono font-bold text-slate-900">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate">{superAdminCredentials.email}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Senha Super Admin Atual</span>
              <div className="flex items-center justify-between font-mono font-bold text-slate-900">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{showSuperPass ? superAdminCredentials.password : '••••••••••••'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSuperPass(!showSuperPass)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  {showSuperPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveSuperCreds} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">Novo E-mail Super Admin *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={superEmail}
                    onChange={(e) => setSuperEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">Nova Senha Super Admin *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSuperPass ? 'text' : 'password'}
                    required
                    value={superPass}
                    onChange={(e) => setSuperPass(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSuperPass(!showSuperPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSuperPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-[11px] text-slate-500">
                Esta nova credencial será necessária imediatamente no formulário de login.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingSuperCreds(false)}
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 rounded-xl text-slate-700 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Credenciais</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold gap-6">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`pb-3 transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'tenants'
              ? 'border-emerald-600 text-emerald-950 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Sistemas Cadastrados & Linhas WhatsApp ({tenants.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'users'
              ? 'border-emerald-600 text-emerald-950 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users2 className="w-4 h-4" />
          Todos os Usuários do Sistema
        </button>

        <button
          onClick={() => setActiveTab('backend')}
          className={`pb-3 transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'backend'
              ? 'border-emerald-600 text-emerald-950 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Visão Geral de Todo o Backend & Clusters
        </button>
      </div>

      {/* TAB 1: TENANTS & WHATSAPP INSTANCES */}
      {activeTab === 'tenants' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tenants.map((t) => (
              <div
                key={t.id}
                className={`bg-white rounded-3xl p-5 border shadow-2xs transition-all relative flex flex-col justify-between ${
                  t.id === currentTenant.id
                    ? 'border-emerald-500 ring-2 ring-emerald-500/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {t.cnpjOrId}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {t.name}
                      </h3>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                        t.plan === 'Enterprise'
                          ? 'bg-purple-100 text-purple-800'
                          : t.plan === 'Pro'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      Plano {t.plan}
                    </span>
                  </div>

                  {/* WhatsApp Line Status Card with Direct Inline Phone Editor */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 mb-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        Telefone Principal / WhatsApp
                      </span>
                      <div className="flex items-center gap-1.5">
                        {savedPhoneToastId === t.id && (
                          <span className="text-[9px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Salvo!
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            switchTenant(t.id);
                            openQrCodeForActivation();
                          }}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 transition-all cursor-pointer ${
                            t.whatsappStatus === 'open'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200 animate-pulse'
                          }`}
                          title="Clique para abrir e conectar o QR Code de WhatsApp desta empresa"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              t.whatsappStatus === 'open' ? 'bg-emerald-600' : 'bg-amber-600'
                            }`}
                          />
                          {t.whatsappStatus === 'open' ? 'Online' : '📱 Ativar QR'}
                        </button>
                      </div>
                    </div>

                    {inlinePhoneTenantId === t.id ? (
                      <div className="space-y-1.5 pt-0.5">
                        <input
                          type="text"
                          value={inlinePhoneValue}
                          onChange={(e) => setInlinePhoneValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveInlinePhone(t.id);
                            } else if (e.key === 'Escape') {
                              setInlinePhoneTenantId(null);
                            }
                          }}
                          placeholder="+55 11 98765-4321"
                          autoFocus
                          className="w-full px-2.5 py-1.5 bg-white border-2 border-emerald-500 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-none"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInlinePhoneTenantId(null)}
                            className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveInlinePhone(t.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Check className="w-3 h-3" />
                            Salvar Telefone
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="font-mono font-bold text-slate-900 text-xs flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80">
                        <span className="truncate">{t.primaryPhoneNumber}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setInlinePhoneTenantId(t.id);
                            setInlinePhoneValue(t.primaryPhoneNumber);
                          }}
                          className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-sans font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                          title="Editar número de telefone principal / WhatsApp desta empresa"
                        >
                          <Pencil className="w-2.5 h-2.5 text-emerald-600" />
                          Editar Telefone
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span className="truncate">
                        Instância: <code className="text-slate-600 font-bold">{t.instanceName}</code>
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 shrink-0">
                        {t.whatsappEngine === 'evolution' ? (
                          <>
                            <Radio className="w-3 h-3 text-emerald-600" /> Evolution v2
                          </>
                        ) : t.whatsappEngine === 'uazapi' ? (
                          <>
                            <Server className="w-3 h-3 text-indigo-600" /> Uazapi Cloud
                          </>
                        ) : (
                          <>
                            <Award className="w-3 h-3 text-blue-600" /> Meta Cloud Oficial
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Admin Master Credentials */}
                  <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100 text-xs space-y-1">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center justify-between">
                      <span>Admin Master Responsável</span>
                      <button
                        type="button"
                        onClick={() => handleOpenEditTenant(t)}
                        className="text-purple-600 hover:text-purple-800 text-[10px] font-bold flex items-center gap-0.5"
                      >
                        <Pencil className="w-2.5 h-2.5" /> Editar
                      </button>
                    </div>
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      <span>{t.masterAdminName}</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">
                        Senha: {t.masterAdminPassword}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {t.masterAdminEmail}
                    </div>
                  </div>

                  {/* Dedicated Individual Login URL Box */}
                  <div className="mt-3 p-2.5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                        <Globe className="w-3 h-3 text-emerald-400" />
                        Página de Login Individual
                      </span>
                      <span className="text-[9px] text-emerald-400 font-medium">
                        Sem credenciais na tela
                      </span>
                    </div>

                    <div className="bg-slate-950 px-2 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300 truncate flex items-center justify-between">
                      <span>/?empresa={t.slug || t.id}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(t)}
                        className="text-[9px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold pl-2"
                        title="Copiar link individual da empresa"
                      >
                        {copiedTenantSlug === t.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => openCompanyLogin(t.id)}
                      className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                      title="Abrir a página de login individual desta empresa"
                    >
                      <Building2 className="w-3 h-3" />
                      <span>Abrir Portal de Login da Empresa</span>
                    </button>
                  </div>
                  {/* Exclusive Company Features: Team CRUD & Company Gadget/Web Form */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        switchTenant(t.id);
                        setActiveView('admin');
                      }}
                      className="py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-colors"
                      title="Abrir Gestão de Equipe & CRUD dos Atendentes exclusivos desta empresa"
                    >
                      <Users2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Equipe & CRUD Atendentes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        switchTenant(t.id);
                        setActiveView('gadget');
                      }}
                      className="py-2 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-200 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-colors"
                      title="Abrir Gadget e Formulário Web com código habilitado somente para esta empresa"
                    >
                      <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">Gadget & Form (Empresa)</span>
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleImpersonateTenant(t)}
                    className="flex-1 py-2 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    title="Acessar o painel completo deste Admin Master"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Painel Admin da Empresa
                  </button>

                  <button
                    onClick={() => handleOpenEditTenant(t)}
                    className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Editar telefone WhatsApp, dados da empresa e credenciais do Admin Master"
                  >
                    <Pencil className="w-3.5 h-3.5 text-emerald-600" />
                    Editar Empresa
                  </button>

                  <button
                    onClick={() => handleOpenTenantQrCode(t)}
                    className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                    title="Exibir o QR Code para ativar o WhatsApp deste sistema"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                    QR Code
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ALL USERS IN THE SYSTEM */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Diretório Global de Usuários
              </h2>
              <p className="text-xs text-slate-500">
                Visão consolidada de todos os administradores e operadores cadastrados nos sistemas
              </p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl font-bold">
              {agents.length + tenants.length} Usuários Ativos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Usuário</th>
                  <th className="py-2.5 px-3">Sistema / Empresa</th>
                  <th className="py-2.5 px-3">Perfil / Nível</th>
                  <th className="py-2.5 px-3">Linha WhatsApp</th>
                  <th className="py-2.5 px-3">Senha de Acesso</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Super Admin entry */}
                <tr className="bg-emerald-50/40">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">Super Admin Master</div>
                    <div className="text-[10px] text-slate-400">{superAdminCredentials.email}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-emerald-900">Plataforma Global SaaS</td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-900 text-emerald-400 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                      Super Admin
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">Todas as Linhas</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{superAdminCredentials.password}</td>
                  <td className="py-3 px-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5"></span>
                    Online
                  </td>
                </tr>

                {/* Tenants Master Admins */}
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{t.masterAdminName}</div>
                      <div className="text-[10px] text-slate-400">{t.masterAdminEmail}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">{t.name}</td>
                    <td className="py-3 px-3">
                      <span className="bg-emerald-100 text-emerald-800 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                        Admin Master
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleOpenEditTenant(t)}
                        className="font-mono font-bold text-slate-800 hover:text-emerald-700 flex items-center gap-1.5 group cursor-pointer"
                        title="Clique para editar o telefone principal / WhatsApp desta empresa"
                      >
                        <span>{t.primaryPhoneNumber}</span>
                        <Pencil className="w-3 h-3 text-emerald-600 opacity-75 group-hover:opacity-100" />
                      </button>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-700">{t.masterAdminPassword}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-between gap-2">
                        <span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5"></span>
                          Ativo
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEditTenant(t)}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Pencil className="w-2.5 h-2.5" /> Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Attendants */}
                {agents.map((ag) => (
                  <tr key={ag.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{ag.name}</div>
                      <div className="text-[10px] text-slate-400">{ag.email}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{currentTenant.name}</td>
                    <td className="py-3 px-3">
                      <span className="bg-blue-100 text-blue-800 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                        Atendente Operador
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">{currentTenant.primaryPhoneNumber}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{ag.password || 'atendente123'}</td>
                    <td className="py-3 px-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5"></span>
                      {ag.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BACKEND INFRASTRUCTURE OVERVIEW */}
      {activeTab === 'backend' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Evolution API Cluster Box */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Cluster Evolution API v2</h3>
                    <p className="text-[11px] text-slate-400">Node.js WebSocket • Docker Swarm</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  100% Saudável
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Endpoint Primário:</span>
                  <span className="font-mono text-slate-800">https://api.omnipulse.evolution-v2.cloud</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Instâncias Alocadas:</span>
                  <span className="font-bold text-slate-900">{tenants.length} Ativas</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Uptime Contínuo:</span>
                  <span className="font-mono font-bold text-emerald-600">99.98%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Consumo de Memória:</span>
                  <span className="font-mono text-slate-800">1.4 GB / 8.0 GB</span>
                </div>
              </div>
            </div>

            {/* Uazapi Cloud Gateway Box */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Cluster Uazapi Cloud</h3>
                    <p className="text-[11px] text-slate-400">Failover em Nuvem com Buffer</p>
                  </div>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  Standby Pronto
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Endpoint Failover:</span>
                  <span className="font-mono text-slate-800">https://gw-cloud.uazapi.com.br/v1</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Buffer Retido:</span>
                  <span className="font-bold text-slate-900">0 msgs (Fluído)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">SLA Contratual:</span>
                  <span className="font-bold text-slate-900">99.99% Enterprise</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Latência Handshake:</span>
                  <span className="font-mono text-emerald-600 font-bold">21ms</span>
                </div>
              </div>
            </div>

            {/* Meta Cloud API Official Cluster Box */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Cluster Meta Cloud API</h3>
                    <p className="text-[11px] text-slate-400">WhatsApp Business Platform • WABA Graph v21.0</p>
                  </div>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-0.5">
                  <Award className="w-2.5 h-2.5 text-blue-600" /> Selo Verde
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Endpoint Graph API:</span>
                  <span className="font-mono text-slate-800">https://graph.facebook.com/v21.0</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Capacidade de Envio:</span>
                  <span className="font-bold text-slate-900">Tier 2 (100.000 msgs/dia)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">SLA Oficial Meta:</span>
                  <span className="font-mono font-bold text-emerald-600">99.99% Sem Banimento</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Handshake Latência:</span>
                  <span className="font-mono text-emerald-600 font-bold">14ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Global Logs */}
          <div className="bg-slate-950 text-emerald-400 p-5 rounded-3xl border border-slate-800 font-mono text-[11px] space-y-1.5 leading-relaxed">
            <div className="text-slate-400 font-bold text-xs pb-2 border-b border-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Live Log Stream de Todos os Webhooks & Instâncias
              </span>
              <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Socket Conectado
              </span>
            </div>
            <div className="text-slate-400">[21:40:02] [SUPERADMIN] Monitoramento de saúde de todas as instâncias ativo.</div>
            <div className="text-emerald-400">[21:40:05] [TENANT-OMNIPULSE] Webhook recebido: +55 (11) 98765-4321 (ACK 200)</div>
            <div className="text-emerald-400">[21:40:12] [TENANT-SAUDE] Instância 'inst_saudemais_rj' heartbeat OK (Latência: 17ms)</div>
            <div className="text-blue-400">[21:40:15] [META-CLOUD] Handshake oficial Graph API v21.0 WABA verificado com sucesso (ACK 200)</div>
            <div className="text-amber-400">[21:40:18] [TENANT-LOGSUL] QR Code ativo aguardando pareamento do operador (+55 41 99118-4422)</div>
          </div>
        </div>
      )}

      {/* Modal for Editing Company Info, WhatsApp Phone & Master Admin Credentials */}
      {editingTenant && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Editar Empresa, Telefone WhatsApp & Credenciais
                  </h3>
                  <p className="text-[11px] text-slate-500">{editingTenant.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTenant(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTenantCreds} className="space-y-3.5 text-xs">
              {/* Highlighted Primary Phone & WhatsApp Field */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                <label className="block text-emerald-950 font-extrabold text-xs flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  Telefone Principal / Linha WhatsApp da Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={tenantPrimaryPhone}
                  onChange={(e) => setTenantPrimaryPhone(e.target.value)}
                  placeholder="+55 11 98765-4321"
                  className="w-full p-2.5 bg-white border-2 border-emerald-400 rounded-xl font-mono font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-emerald-800">
                  Este número é sincronizado automaticamente com a instância de WhatsApp, painel Admin e códigos do Gadget Web da empresa.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nome da Empresa *</label>
                  <input
                    type="text"
                    required
                    value={tenantCompanyName}
                    onChange={(e) => setTenantCompanyName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">CNPJ ou Identificador</label>
                  <input
                    type="text"
                    value={tenantCnpj}
                    onChange={(e) => setTenantCnpj(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Instância WhatsApp</label>
                  <input
                    type="text"
                    value={tenantInstanceName}
                    onChange={(e) => setTenantInstanceName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Motor WhatsApp</label>
                  <select
                    value={tenantWhatsappEngine}
                    onChange={(e) =>
                      setTenantWhatsappEngine(e.target.value as 'evolution' | 'uazapi' | 'meta_cloud')
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="evolution">Evolution API v2</option>
                    <option value="uazapi">Uazapi Cloud</option>
                    <option value="meta_cloud">Meta Cloud API Oficial</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 block mb-2">
                  Credenciais do Administrador Master da Empresa
                </span>
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Nome do Gestor Master *</label>
                    <input
                      type="text"
                      required
                      value={tenantAdminName}
                      onChange={(e) => setTenantAdminName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">E-mail de Login *</label>
                      <input
                        type="email"
                        required
                        value={tenantAdminEmail}
                        onChange={(e) => setTenantAdminEmail(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Senha de Acesso *</label>
                      <div className="relative">
                        <input
                          type={showTenantPass ? 'text' : 'password'}
                          required
                          value={tenantAdminPass}
                          onChange={(e) => setTenantAdminPass(e.target.value)}
                          className="w-full p-2.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowTenantPass(!showTenantPass)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showTenantPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Salvar Telefone & Dados da Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
