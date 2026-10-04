import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Agent, AgentRole } from '../../types/crm';

const roles: AgentRole[] = [
  'Supervisor Omnichannel',
  'Operador Sênior',
  'Closer Comercial',
  'Atendente N1',
  'Administrador Geral',
];

export const AgentModal: React.FC = () => {
  const {
    isAgentModalOpen,
    setIsAgentModalOpen,
    editingAgent,
    addAgent,
    updateAgent,
    departments,
  } = useCRM();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+55 11 ');
  const [role, setRole] = useState<AgentRole>('Operador Sênior');
  const [shift, setShift] = useState('Turno 09:00 - 18:00');
  const [maxChats, setMaxChats] = useState('5');
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingAgent) {
      setName(editingAgent.name);
      setEmail(editingAgent.email);
      setPhone(editingAgent.phone);
      setRole(editingAgent.role);
      setShift(editingAgent.shift);
      setMaxChats(String(editingAgent.maxChats));
      setSelectedDepts(editingAgent.departments);
    } else {
      setName('');
      setEmail('');
      setPhone('+55 11 9');
      setRole('Operador Sênior');
      setShift('Turno 09:00 - 18:00');
      setMaxChats('5');
      // Default to 3 depts to satisfy master rule immediately
      setSelectedDepts(departments.slice(0, 3).map((d) => d.name));
    }
    setErrorMsg(null);
  }, [editingAgent, isAgentModalOpen, departments]);

  if (!isAgentModalOpen) return null;

  const toggleDept = (deptName: string) => {
    if (selectedDepts.includes(deptName)) {
      setSelectedDepts(selectedDepts.filter((d) => d !== deptName));
    } else {
      setSelectedDepts([...selectedDepts, deptName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedDepts.length < 3) {
      setErrorMsg(
        'Regra de Governança Obrigatória: O atendente deve estar formalmente homologado em no mínimo 3 departamentos simultâneos!'
      );
      return;
    }

    if (editingAgent) {
      const res = updateAgent(editingAgent.id, {
        name,
        email,
        phone,
        role,
        shift,
        maxChats: parseInt(maxChats) || 5,
        departments: selectedDepts,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Erro ao atualizar atendente');
        return;
      }
    } else {
      const res = addAgent({
        name,
        email,
        phone,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
        role,
        shift,
        maxChats: parseInt(maxChats) || 5,
        departments: selectedDepts,
        status: 'online',
        activeChats: 0,
        rating: 5.0,
        totalResolved: 0,
        conversionRate: 0,
        avgResponseTimeSeconds: 40,
        avgResolutionTimeMinutes: 12,
        revenueGenerated: 0,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Erro ao registrar atendente');
        return;
      }
    }

    setIsAgentModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {editingAgent ? 'Editar Atendente / Operador' : 'Novo Atendente & Permissões'}
            </h2>
            <p className="text-slate-500 mt-0.5">
              Alocação master e parametrização de concorrência de atendimento
            </p>
          </div>
          <button
            onClick={() => setIsAgentModalOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Rule Alert Box */}
        <div className="mt-3.5 p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-950 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-[11px] uppercase tracking-wider">
              Regra de Governança Master Ativa
            </div>
            <p className="text-[11px] text-emerald-900/80 mt-0.5">
              Selecione no mínimo <strong>3 departamentos simultâneos</strong> para habilitar transbordo coringa e resiliência de fila.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Mariana Silva"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                E-mail Corporativo *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@omnipulse.io"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                WhatsApp / Telefone *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Função / Nível
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as AgentRole)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Limite de Chats Simultâneos
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={maxChats}
                onChange={(e) => setMaxChats(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Turno & Horário de Atendimento
            </label>
            <input
              type="text"
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              placeholder="Turno 08:00 - 17:00"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
            />
          </div>

          {/* Department Selection (Min 3 rule) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-700 font-semibold">
                Departamentos Vinculados * (Mínimo 3)
              </label>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedDepts.length >= 3
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {selectedDepts.length}/3 Selecionados
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {departments.map((dept) => {
                const isChecked = selectedDepts.includes(dept.name);
                return (
                  <div
                    key={dept.id}
                    onClick={() => toggleDept(dept.name)}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                      isChecked
                        ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{dept.name}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      className="accent-emerald-600"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAgentModalOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
            >
              {editingAgent ? 'Salvar Alterações' : 'Cadastrar Atendente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
