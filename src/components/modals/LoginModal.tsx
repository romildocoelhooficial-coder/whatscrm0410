import React, { useState } from 'react';
import { ShieldCheck, Lock, UserCheck, AlertCircle, Eye, EyeOff, X, KeyRound, Building2 } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, login, currentUserRole } = useCRM();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = login(password);
    if (result.success) {
      setPassword('');
      setIsLoginModalOpen(false);
    } else {
      setErrorMessage(result.error || 'Senha incorreta!');
    }
  };

  const handleQuickLogin = (pass: string) => {
    setPassword(pass);
    const result = login(pass);
    if (result.success) {
      setPassword('');
      setIsLoginModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-xs relative">
        <button
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-md">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Autenticação & Controle de Acesso
            </h2>
            <p className="text-slate-500 text-[11px]">
              Alterne entre o perfil Super Admin, Admin Master e Atendente
            </p>
          </div>
        </div>

        {/* Quick Credentials Info Box (3 Columns) */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4 space-y-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
            Níveis de Permissão do Sistema
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] text-purple-600 font-bold uppercase block">
                Super Admin
              </span>
              <span className="font-mono font-bold text-slate-900 text-xs block mt-0.5">
                superadmin123
              </span>
              <div className="text-[9px] text-slate-500 mt-1">
                Cadastra novos sistemas
              </div>
            </div>

            <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] text-emerald-600 font-bold uppercase block">
                Admin Master
              </span>
              <span className="font-mono font-bold text-slate-900 text-xs block mt-0.5">
                admin123
              </span>
              <div className="text-[9px] text-slate-500 mt-1">
                WhatsApp e equipe
              </div>
            </div>

            <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] text-blue-600 font-bold uppercase block">
                Atendente
              </span>
              <span className="font-mono font-bold text-slate-900 text-xs block mt-0.5">
                atendente123
              </span>
              <div className="text-[9px] text-slate-500 mt-1">
                Atendimentos próprios
              </div>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Digite a Senha de Acesso
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="superadmin123, admin123 ou atendente123"
                className="w-full py-2.5 pl-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Validar Senha & Entrar
          </button>
        </form>

        {/* 1-Click Fast Buttons for convenience */}
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
          <div className="text-[10px] text-slate-400 uppercase font-semibold text-center">
            Atalho Rápido de 1 Clique
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('superadmin123')}
              className="py-2 px-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-bold rounded-xl text-[10px] transition-colors flex items-center justify-center gap-1"
            >
              👑 Super Admin
            </button>
            <button
              onClick={() => handleQuickLogin('admin123')}
              className="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold rounded-xl text-[10px] transition-colors flex items-center justify-center gap-1"
            >
              🏢 Admin Master
            </button>
            <button
              onClick={() => handleQuickLogin('atendente123')}
              className="py-2 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold rounded-xl text-[10px] transition-colors flex items-center justify-center gap-1"
            >
              🎧 Atendente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
