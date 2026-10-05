import React, { useState } from 'react';
import {
  X,
  Building2,
  ShieldCheck,
  Phone,
  User,
  Mail,
  KeyRound,
  Radio,
  Server,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { WhatsAppEngine } from '../../types/crm';

export const NewTenantModal: React.FC = () => {
  const { isNewTenantModalOpen, setIsNewTenantModalOpen, addTenant } = useCRM();

  const [name, setName] = useState('');
  const [cnpjOrId, setCnpjOrId] = useState('');
  const [plan, setPlan] = useState<'Starter' | 'Pro' | 'Enterprise'>('Pro');
  const [primaryPhoneNumber, setPrimaryPhoneNumber] = useState('+55 (11) 9');
  const [whatsappEngine, setWhatsappEngine] = useState<WhatsAppEngine>('evolution');
  const [instanceName, setInstanceName] = useState('inst_corp_');
  const [masterAdminName, setMasterAdminName] = useState('');
  const [masterAdminEmail, setMasterAdminEmail] = useState('');
  const [masterAdminPassword, setMasterAdminPassword] = useState('admin123');
  const [maxAgents, setMaxAgents] = useState(10);

  if (!isNewTenantModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !primaryPhoneNumber || !masterAdminName) return;

    const generatedSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    addTenant({
      slug: generatedSlug || `empresa-${Date.now().toString().slice(-4)}`,
      name,
      cnpjOrId: cnpjOrId || '42.991.000/0001-20',
      plan,
      active: true,
      primaryPhoneNumber,
      whatsappStatus: 'qrcode',
      whatsappEngine,
      instanceName: instanceName || `inst_${name.toLowerCase().replace(/\s+/g, '_').slice(0, 10)}`,
      masterAdminName,
      masterAdminEmail: masterAdminEmail || `admin@${name.toLowerCase().replace(/\s+/g, '')}.com.br`,
      masterAdminPassword: masterAdminPassword || 'admin123',
      maxAgents,
    });

    setIsNewTenantModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-xs max-h-[92vh] overflow-y-auto relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Cadastrar Novo Sistema / Empresa
              </h2>
              <p className="text-slate-500 text-[11px]">
                Provisione uma nova empresa com sua própria linha de WhatsApp e Admin Master
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNewTenantModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Dados da Empresa */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              1. Identificação da Empresa / Tenant
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nome da Empresa / Sistema *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Prime Odonto Brasil"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!instanceName || instanceName === 'inst_corp_') {
                      setInstanceName(`inst_${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 10)}`);
                    }
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  CNPJ ou Identificador Fiscal
                </label>
                <input
                  type="text"
                  placeholder="00.000.000/0001-00"
                  value={cnpjOrId}
                  onChange={(e) => setCnpjOrId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Plano Contratado
                </label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as 'Starter' | 'Pro' | 'Enterprise')}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                >
                  <option value="Starter">Starter (Até 5 Atendentes)</option>
                  <option value="Pro">Pro (Até 15 Atendentes)</option>
                  <option value="Enterprise">Enterprise (Ilimitado)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Limite Máximo de Atendentes
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={maxAgents}
                  onChange={(e) => setMaxAgents(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Linha Dedicada WhatsApp */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              2. Conexão & Linha Própria de WhatsApp
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Número de Origem WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="+55 (11) 98888-7777"
                    value={primaryPhoneNumber}
                    onChange={(e) => setPrimaryPhoneNumber(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Motor de Conexão WhatsApp
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setWhatsappEngine('evolution')}
                    className={`py-2 px-1.5 rounded-xl border text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      whatsappEngine === 'evolution'
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-400 ring-1 ring-emerald-400/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Evolution v2</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWhatsappEngine('uazapi')}
                    className={`py-2 px-1.5 rounded-xl border text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      whatsappEngine === 'uazapi'
                        ? 'bg-indigo-50 text-indigo-950 border-indigo-400 ring-1 ring-indigo-400/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Server className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Uazapi Cloud</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWhatsappEngine('meta_cloud')}
                    className={`py-2 px-1.5 rounded-xl border text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      whatsappEngine === 'meta_cloud'
                        ? 'bg-blue-50 text-blue-950 border-blue-400 ring-1 ring-blue-400/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    <span>Meta Oficial</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Nome Único da Instância
              </label>
              <input
                type="text"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                placeholder="inst_prime_odonto"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-[11px] focus:outline-none"
              />
            </div>
          </div>

          {/* Admin Master da Empresa */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              3. Usuário Administrador Master da Empresa
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nome do Admin Master *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo"
                    value={masterAdminName}
                    onChange={(e) => setMasterAdminName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  E-mail de Login do Admin
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="carlos@empresa.com"
                    value={masterAdminEmail}
                    onChange={(e) => setMasterAdminEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Senha Inicial de Acesso do Admin Master
              </label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={masterAdminPassword}
                  onChange={(e) => setMasterAdminPassword(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                O Admin Master utilizará esta senha para gerenciar seus departamentos, atendentes e escanear o QR Code de sua linha.
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsNewTenantModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Provisionar Sistema & Gerar Painel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
