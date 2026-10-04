import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  Headphones,
  CheckCircle2,
  AlertCircle,
  Radio,
  Server,
  Sparkles,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const SuperAdminLoginPage: React.FC = () => {
  const { login, superAdminCredentials, currentTenant, agents, tenants, openCompanyLogin } = useCRM();

  const [selectedRole, setSelectedRole] = useState<'superadmin' | 'admin' | 'atendente'>('superadmin');
  const [email, setEmail] = useState(superAdminCredentials?.email || 'superadmin@omnipulse.io');
  const [password, setPassword] = useState(superAdminCredentials?.password || 'superadmin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleSelect = (role: 'superadmin' | 'admin' | 'atendente') => {
    setSelectedRole(role);
    setErrorMessage(null);

    if (role === 'superadmin') {
      setEmail(superAdminCredentials?.email || 'superadmin@omnipulse.io');
      setPassword(superAdminCredentials?.password || 'superadmin123');
    } else if (role === 'admin') {
      setEmail(currentTenant?.masterAdminEmail || 'isabella.admin@omnipulse.io');
      setPassword(currentTenant?.masterAdminPassword || 'admin123');
    } else {
      const defaultAgent = agents.find((a) => !a.isMasterAdmin) || agents[1] || agents[0];
      setEmail(defaultAgent?.email || 'mariana.silva@omnipulse.io');
      setPassword(defaultAgent?.password || 'atendente123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = login(email, password);
    if (!result.success) {
      setErrorMessage(result.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    }
  };

  const handleQuickLogin = (role: 'superadmin' | 'admin' | 'atendente', qEmail: string, qPass: string) => {
    setSelectedRole(role);
    setEmail(qEmail);
    setPassword(qPass);
    setErrorMessage(null);

    const result = login(qEmail, qPass);
    if (!result.success) {
      setErrorMessage(result.error || 'Credenciais inválidas.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Brand & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700/80 shadow-2xl text-emerald-400 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-mono font-bold tracking-widest uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
              SaaS Multi-Sistemas
            </span>
            <span className="text-xs font-mono font-bold tracking-widest uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              WhatsApp BSP Oficial
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            OmniPulse Enterprise
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Plataforma Global de Gestão de Empresas, Linhas de WhatsApp e Atendimento Omnichannel
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-7 shadow-2xl space-y-5">
          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => handleRoleSelect('superadmin')}
              className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
                selectedRole === 'superadmin'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Super Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
                selectedRole === 'admin'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Admin Master</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('atendente')}
              className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
                selectedRole === 'atendente'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Atendente</span>
            </button>
          </div>

          {/* Description & Suggested Credentials Pill */}
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Credencial Padrão Sugerida
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">
                Pode ser alterada no painel
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase block font-sans">E-mail Login:</span>
                <span className="text-white font-bold truncate block">{email}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase block font-sans">Senha de Acesso:</span>
                <span className="text-emerald-400 font-bold block">{password}</span>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form with Email and Password */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Campo E-mail */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1">
                E-mail de Login
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@empresa.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-600 transition-all"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>Acessar Painel do Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Fast Login Shortcuts */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 block text-center">
              Preenchimento Rápido com 1 Clique (Demonstração)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin(
                    'superadmin',
                    superAdminCredentials?.email || 'superadmin@omnipulse.io',
                    superAdminCredentials?.password || 'superadmin123'
                  )
                }
                className="py-2 px-1 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/50 text-purple-200 text-[10px] font-bold rounded-xl transition-all text-center flex flex-col items-center justify-center gap-0.5"
              >
                <span>👑 Super Admin</span>
                <span className="text-[8px] text-purple-400 font-mono">Empresas & SaaS</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickLogin(
                    'admin',
                    currentTenant?.masterAdminEmail || 'isabella.admin@omnipulse.io',
                    currentTenant?.masterAdminPassword || 'admin123'
                  )
                }
                className="py-2 px-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/50 text-emerald-200 text-[10px] font-bold rounded-xl transition-all text-center flex flex-col items-center justify-center gap-0.5"
              >
                <span>🏢 Admin Master</span>
                <span className="text-[8px] text-emerald-400 font-mono">WhatsApp & Equipe</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickLogin(
                    'atendente',
                    agents.find((a) => !a.isMasterAdmin)?.email || 'mariana.silva@omnipulse.io',
                    'atendente123'
                  )
                }
                className="py-2 px-1 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/50 text-blue-200 text-[10px] font-bold rounded-xl transition-all text-center flex flex-col items-center justify-center gap-0.5"
              >
                <span>🎧 Atendente</span>
                <span className="text-[8px] text-blue-400 font-mono">Meus Chats</span>
              </button>
            </div>
          </div>

          {/* Individual Company Dedicated Login Portals */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                Páginas de Login Individuais por Empresa
              </span>
              <span className="text-[9px] text-slate-500 font-mono">
                Sem credenciais na tela
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {tenants.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => openCompanyLogin(t.id)}
                  className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
                >
                  <div className="font-bold text-white text-[11px] truncate group-hover:text-emerald-300">
                    {t.name}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">
                    /?empresa={t.slug || t.id}
                  </div>
                  <div className="text-[9px] text-emerald-400 mt-1 flex items-center gap-1">
                    <span>Acessar Portal</span>
                    <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* System Badges */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-500" /> Evolution v2
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Server className="w-3 h-3 text-indigo-500" /> Uazapi Cloud
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-400" /> Meta Cloud API
          </span>
        </div>
      </div>
    </div>
  );
};
