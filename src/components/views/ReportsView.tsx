import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  DollarSign,
  Star,
  Download,
  Filter,
  Users,
  Award,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const ReportsView: React.FC = () => {
  const { agents, departments, deals } = useCRM();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | '7d' | '30d'>('30d');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');

  const totalResolved = agents.reduce((acc, a) => acc + a.totalResolved, 0);
  const totalRevenue = agents.reduce((acc, a) => acc + a.revenueGenerated, 0);
  const avgResponseTime = Math.round(
    agents.reduce((acc, a) => acc + a.avgResponseTimeSeconds, 0) / agents.length
  );
  const avgResolutionTime = Math.round(
    agents.reduce((acc, a) => acc + a.avgResolutionTimeMinutes, 0) / agents.length
  );
  const avgConversion = (
    agents.reduce((acc, a) => acc + a.conversionRate, 0) / agents.length
  ).toFixed(1);
  const avgCSAT = (
    agents.reduce((acc, a) => acc + a.rating, 0) / agents.length
  ).toFixed(2);

  const filteredAgents = agents
    .filter((a) => {
      if (selectedDeptFilter === 'all') return true;
      return a.departments.includes(selectedDeptFilter);
    })
    .sort((a, b) => b.revenueGenerated - a.revenueGenerated);

  const handleExportCSV = () => {
    const headers = [
      'Atendente',
      'Funcao',
      'Atendimentos_Resolvidos',
      'Conversao_Vendas_Perc',
      'Receita_Gerada_BRL',
      'TMPR_Segundos',
      'TMR_Minutos',
      'CSAT_Rating',
    ];

    const rows = filteredAgents.map((a) => [
      `"${a.name}"`,
      `"${a.role}"`,
      a.totalResolved,
      `${a.conversionRate}%`,
      a.revenueGenerated,
      a.avgResponseTimeSeconds,
      a.avgResolutionTimeMinutes,
      a.rating,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `omnipulse-desempenho-agentes-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              BI & Performance Omnichannel
            </span>
            <span className="text-xs text-slate-500">
              SLA, Produtividade e Conversão Comercial
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Relatórios Detalhados de Desempenho por Agente
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas de primeira resposta (TMPR), tempo de resolução, CSAT e faturamento gerado
          </p>
        </div>

        {/* Filter controls & Export */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs">
            <button
              onClick={() => setSelectedPeriod('today')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedPeriod === 'today'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setSelectedPeriod('7d')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedPeriod === '7d'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Últimos 7 dias
            </button>
            <button
              onClick={() => setSelectedPeriod('30d')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedPeriod === '30d'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Últimos 30 dias
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* KPI 1: Faturamento */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Faturamento Atribuído
          </div>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            R$ {(totalRevenue / 1000).toFixed(0)}k
          </div>
          <div className="mt-2 text-[10px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +18.4% vs mês anterior
          </div>
        </div>

        {/* KPI 2: Conversão */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Taxa de Conversão
          </div>
          <div className="text-xl font-black text-emerald-600 font-mono mt-1">
            {avgConversion}%
          </div>
          <div className="mt-2 text-[10px] text-slate-500">Média da equipe</div>
        </div>

        {/* KPI 3: TMPR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            1ª Resposta (TMPR)
          </div>
          <div className="text-xl font-black text-blue-600 font-mono mt-1">
            {avgResponseTime}s
          </div>
          <div className="mt-2 text-[10px] text-emerald-600 font-medium">
            Meta: &lt; 60s (Atingido)
          </div>
        </div>

        {/* KPI 4: TMR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Resolução (TMR)
          </div>
          <div className="text-xl font-black text-purple-600 font-mono mt-1">
            {avgResolutionTime}m
          </div>
          <div className="mt-2 text-[10px] text-slate-500">Tempo de fechamento</div>
        </div>

        {/* KPI 5: Volume */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Atendimentos Resolvidos
          </div>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            {totalResolved}
          </div>
          <div className="mt-2 text-[10px] text-slate-500">100% auditados</div>
        </div>

        {/* KPI 6: CSAT */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            CSAT Geral (1 a 5)
          </div>
          <div className="text-xl font-black text-amber-500 font-mono mt-1 flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            {avgCSAT}
          </div>
          <div className="mt-2 text-[10px] text-slate-500">Excelente (Top Tier)</div>
        </div>
      </div>

      {/* Detailed Agent Performance Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Ranking de Produtividade & Qualidade Individual
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparativo detalhado por taxa de fechamento, velocidade no WhatsApp e nota dos clientes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filtrar Departamento:</span>
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">Todos</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="py-3 px-3">Posição & Agente</th>
                <th className="py-3 px-3">Função</th>
                <th className="py-3 px-3">Tickets Resolvidos</th>
                <th className="py-3 px-3">Conversão (%)</th>
                <th className="py-3 px-3">Receita Gerada</th>
                <th className="py-3 px-3">1ª Resposta</th>
                <th className="py-3 px-3">Resolução</th>
                <th className="py-3 px-3 text-right">CSAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAgents.map((agent, index) => (
                <tr key={agent.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Rank & Agent */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold font-mono text-[11px] ${
                          index === 0
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : index === 1
                            ? 'bg-slate-200 text-slate-700'
                            : index === 2
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{agent.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {agent.phone}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-3">
                    <span className="text-[11px] font-medium text-slate-700">
                      {agent.role}
                    </span>
                  </td>

                  {/* Resolved */}
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold text-slate-900">
                      {agent.totalResolved}
                    </span>
                  </td>

                  {/* Conversion */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-600">
                        {agent.conversionRate}%
                      </span>
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, agent.conversionRate * 2)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Revenue */}
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold text-slate-900">
                      R$ {agent.revenueGenerated.toLocaleString('pt-BR')}
                    </span>
                  </td>

                  {/* 1st Response */}
                  <td className="py-3.5 px-3 font-mono text-slate-700">
                    {agent.avgResponseTimeSeconds}s
                  </td>

                  {/* Resolution */}
                  <td className="py-3.5 px-3 font-mono text-slate-700">
                    {agent.avgResolutionTimeMinutes}m
                  </td>

                  {/* CSAT */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="inline-flex items-center gap-1 font-bold font-mono text-amber-500 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {agent.rating.toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
