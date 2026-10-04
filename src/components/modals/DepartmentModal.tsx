import React, { useState, useEffect } from 'react';
import { Sliders, X } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Department } from '../../types/crm';

export const DepartmentModal: React.FC = () => {
  const {
    isDeptModalOpen,
    setIsDeptModalOpen,
    editingDept,
    addDepartment,
    updateDepartment,
    departments,
  } = useCRM();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [avgWaitTime, setAvgWaitTime] = useState('01m 00s');
  const [transbordoTarget, setTransbordoTarget] = useState('Para: Comercial > 180s');
  const [transbordoSeconds, setTransbordoSeconds] = useState(180);
  const [agentCount, setAgentCount] = useState(5);

  useEffect(() => {
    if (editingDept) {
      setName(editingDept.name);
      setCode(editingDept.code);
      setDescription(editingDept.description);
      setAvgWaitTime(editingDept.avgWaitTime);
      setTransbordoTarget(editingDept.transbordoTarget);
      setTransbordoSeconds(editingDept.transbordoTimeoutSeconds);
      setAgentCount(editingDept.agentCount);
    } else {
      setName('');
      setCode(`DEPT-0${departments.length + 1}`);
      setDescription('');
      setAvgWaitTime('01m 15s');
      setTransbordoTarget('Para: Comercial > 180s');
      setTransbordoSeconds(180);
      setAgentCount(4);
    }
  }, [editingDept, isDeptModalOpen, departments]);

  if (!isDeptModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    if (editingDept) {
      updateDepartment(editingDept.id, {
        name,
        code,
        description,
        avgWaitTime,
        transbordoTarget,
        transbordoTimeoutSeconds: transbordoSeconds,
        agentCount,
      });
    } else {
      addDepartment({
        name,
        code,
        description,
        avgWaitTime,
        transbordoTarget,
        transbordoTimeoutSeconds: transbordoSeconds,
        agentCount,
        color: '#3B82F6',
        active: true,
      });
    }

    setIsDeptModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {editingDept ? 'Editar Departamento' : 'Novo Departamento'}
            </h2>
            <p className="text-slate-500 mt-0.5">
              Defina regras de transbordo e SLA para balanceamento de chamados
            </p>
          </div>
          <button
            onClick={() => setIsDeptModalOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-slate-700 font-semibold mb-1">
                Código *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="DEPT-05"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Nome do Departamento *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Pós-Venda & Sucesso"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Descrição Operacional
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o escopo e objetivos do departamento..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Espera Média Alvo
              </label>
              <input
                type="text"
                value={avgWaitTime}
                onChange={(e) => setAvgWaitTime(e.target.value)}
                placeholder="01m 30s"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Timeout Transbordo (segundos)
              </label>
              <input
                type="number"
                value={transbordoSeconds}
                onChange={(e) => setTransbordoSeconds(parseInt(e.target.value) || 180)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Regra de Transbordo (Destino)
            </label>
            <input
              type="text"
              value={transbordoTarget}
              onChange={(e) => setTransbordoTarget(e.target.value)}
              placeholder="Para: Comercial > 180s"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none"
            />
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsDeptModalOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm"
            >
              Salvar Departamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
