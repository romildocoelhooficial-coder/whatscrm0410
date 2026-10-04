import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Phone,
  Radio,
  Server,
  Award,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';
import { TenantSystem } from '../../types/crm';
import { useCRM } from '../../context/CRMContext';

interface CompanyLoginPageProps {
  tenant: TenantSystem;
  onBackToGlobalLogin: () => void;
}

export const CompanyLoginPage: React.FC<CompanyLoginPageProps> = ({
  tenant,
  onBackToGlobalLogin,
}) => {
  const { loginWithTenantScope } = useCRM();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const res = loginWithTenantScope(tenant.id, email, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Credenciais inválidas. Verifique seu e-mail e senha de acesso.');
    }
  };

  const getEngineBadge = () => {
    if (tenant.whatsappEngine === 'meta_cloud') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold">
          <Award className="w-3.5 h-3.5 text-blue-400" />
          Meta Cloud API Oficial
        </span>
      );
    }
    if (tenant.whatsappEngine === 'uazapi') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold">
          <Server className="w-3.5 h-3.5 text-indigo-400" />
          Uazapi Cloud Gateway
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
        <Radio className="w-3.5 h-3.5 text-emerald-400" />
        Evolution API v2
      </span>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Accent Gradients */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with back link */}
      <div className="w-full max-w-md flex items-center justify-between mb-6 z-10">
        <button
          type="button"
          onClick={onBackToGlobalLogin}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Acesso Global / Outras Empresas</span>
        </button>

        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
          Portal Exclusivo
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 z-10">
        {/* Company Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 mx-auto flex items-center justify-center shadow-lg text-emerald-400 font-black text-2xl">
            <Building2 className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-xl font-black text-white tracking-tight">
              {tenant.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Portal de Atendimento e Gestão Omnichannel
            </p>
          </div>

          {/* Engine & Phone Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {getEngineBadge()}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono">
              <Phone className="w-3 h-3 text-slate-400" />
              {tenant.primaryPhoneNumber}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Pure Clean Access Form - NO CREDENTIALS PRINTED ON SCREEN */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1.5">
              E-mail de Acesso
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
                className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1.5">
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
                className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-600 transition-all"
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
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'Autenticando...' : `Acessar Sistema ${tenant.name}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Info */}
        <div className="pt-2 text-center">
          <p className="text-[11px] text-slate-500">
            Acesso reservado ao Administrador Master e Atendentes autorizados desta empresa.
          </p>
        </div>
      </div>

      {/* Powered by tag */}
      <div className="mt-8 text-center text-xs text-slate-500 flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>OmniPulse CRM • Autenticação Segura Multi-Tenant</span>
      </div>
    </div>
  );
};
