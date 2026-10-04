import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Sliders,
  CheckCircle,
  Clock,
  Shield,
  Send,
  Zap,
  BookOpen,
  MessageSquare,
  Building,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { requestAiFallbackReply } from '../../services/geminiService';

export const AiAgentView: React.FC = () => {
  const { aiSettings, updateAiSettings, departments } = useCRM();

  // Settings form
  const [enabled, setEnabled] = useState(aiSettings.enabled);
  const [respondOffline, setRespondOffline] = useState(aiSettings.respondWhenAgentsOffline);
  const [respondWait, setRespondWait] = useState(aiSettings.respondOnHighQueueWait);
  const [threshold, setThreshold] = useState(aiSettings.maxWaitThresholdSeconds);
  const [personality, setPersonality] = useState(aiSettings.personality);
  const [systemPrompt, setSystemPrompt] = useState(aiSettings.systemPrompt);
  const [knowledgeVendas, setKnowledgeVendas] = useState(aiSettings.departmentKnowledge.vendas);
  const [knowledgeSuporte, setKnowledgeSuporte] = useState(aiSettings.departmentKnowledge.suporte);

  // Simulator
  const [simContactName, setSimContactName] = useState('Eduardo Brandão');
  const [simMessage, setSimMessage] = useState('Boa tarde, quanto custa o plano para 20 atendentes com Uazapi?');
  const [simDept, setSimDept] = useState('Comercial & Vendas');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResponses, setSimResponses] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([
    {
      sender: 'user',
      text: 'Olá, tem alguém disponível no Comercial agora?',
      time: '14:20',
    },
    {
      sender: 'ai',
      text: 'Olá Eduardo! 🤖 Nossos atendentes estão em demonstrações no momento, mas já estou aqui para adiantar suas dúvidas. Você precisa de integração com WhatsApp via Evolution API ou Uazapi?',
      time: '14:21',
    },
  ]);

  const handleSaveSettings = () => {
    updateAiSettings({
      enabled,
      respondWhenAgentsOffline: respondOffline,
      respondOnHighQueueWait: respondWait,
      maxWaitThresholdSeconds: threshold,
      personality,
      systemPrompt,
      departmentKnowledge: {
        ...aiSettings.departmentKnowledge,
        vendas: knowledgeVendas,
        suporte: knowledgeSuporte,
      },
    });
    alert('Configurações do Agente IA salvas com sucesso!');
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simMessage.trim()) return;

    const userText = simMessage;
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setSimResponses((prev) => [...prev, { sender: 'user', text: userText, time: now }]);
    setSimMessage('');
    setIsSimulating(true);

    try {
      const reply = await requestAiFallbackReply({
        message: userText,
        contactName: simContactName,
        departmentName: simDept,
        chatHistory: simResponses.map((r) => `${r.sender === 'user' ? 'Cliente' : 'IA'}: ${r.text}`).join('\n'),
        customPrompt: systemPrompt,
      });

      const replyTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setSimResponses((prev) => [...prev, { sender: 'ai', text: reply, time: replyTime }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
              Inteligência Artificial Fallback
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Modelo: gemini-3.8-flash
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Agente IA & Atendimento Automático
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configuração de respostas automatizadas inteligentes na ausência de atendentes online ou em picos de fila
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <CheckCircle className="w-4 h-4" />
          Salvar Diretrizes da IA
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Parameters & Triggers (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Triggers Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Zap className="w-4 h-4 text-purple-600" />
              Gatilhos de Acionamento da IA
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <div className="font-bold text-slate-900">
                    Ativação Geral do Agente IA
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Habilitar IA para responder clientes no WhatsApp
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="w-4 h-4 accent-purple-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <div className="font-bold text-slate-900">
                    Responder quando Atendentes Estiverem Offline ou em Pausa
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Aciona imediatamente se nenhum operador do departamento estiver com status "Online"
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={respondOffline}
                  onChange={(e) => setRespondOffline(e.target.checked)}
                  className="w-4 h-4 accent-purple-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <div className="font-bold text-slate-900">
                    Transbordo Inteligente para IA por Tempo de Espera
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Se o cliente aguardar mais de {threshold}s sem resposta humana na fila
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={respondWait}
                  onChange={(e) => setRespondWait(e.target.checked)}
                  className="w-4 h-4 accent-purple-600"
                />
              </label>
            </div>
          </div>

          {/* Personality and System Prompt */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Bot className="w-4 h-4 text-purple-600" />
              Personalidade & Instruções do Sistema (System Prompt)
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Tom de Voz e Perfil
              </label>
              <input
                type="text"
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Prompt do Sistema Principal
              </label>
              <textarea
                rows={5}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono text-[11px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Base de Conhecimento: Vendas
                </label>
                <textarea
                  rows={3}
                  value={knowledgeVendas}
                  onChange={(e) => setKnowledgeVendas(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Base de Conhecimento: Suporte
                </label>
                <textarea
                  rows={3}
                  value={knowledgeSuporte}
                  onChange={(e) => setKnowledgeSuporte(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Live WhatsApp AI Simulator (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Simulador de Atendimento IA
                </h3>
              </div>
              <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full border border-purple-200">
                Ao Vivo
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Envie mensagens simulando um cliente no WhatsApp para validar as respostas do modelo.
            </p>

            {/* Simulated Chat Feed */}
            <div className="mt-4 p-3 bg-[#f0f2f5] rounded-xl h-80 overflow-y-auto space-y-3 text-xs">
              {simResponses.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl shadow-2xs text-[11px] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="text-[9px] font-bold text-purple-700 uppercase mb-1 flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        IA Gemini OmniPulse
                      </div>
                    )}
                    <p>{msg.text}</p>
                    <div
                      className={`text-[9px] mt-1 text-right ${
                        msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}

              {isSimulating && (
                <div className="flex items-center gap-2 text-xs text-purple-700 bg-purple-50 p-2.5 rounded-xl border border-purple-200 animate-pulse">
                  <Bot className="w-4 h-4 animate-spin" />
                  <span>IA gerando resposta inteligente...</span>
                </div>
              )}
            </div>
          </div>

          {/* Simulator Input Box */}
          <form onSubmit={handleRunSimulation} className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Simular mensagem do cliente..."
                value={simMessage}
                onChange={(e) => setSimMessage(e.target.value)}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={isSimulating}
                className="px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
