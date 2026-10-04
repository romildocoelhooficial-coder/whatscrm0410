import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Phone,
  Mail,
  User,
  Building,
  CheckCircle2,
  Sparkles,
  Bot,
  Radio,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const ChatGadgetWidget: React.FC = () => {
  const {
    webGadgetConfig,
    departments,
    startChatFromGadget,
    gatewayConfig,
    setActiveView,
    isGadgetFloatingOpen,
    setIsGadgetFloatingOpen,
  } = useCRM();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+55 ');
  const [deptId, setDeptId] = useState(webGadgetConfig.defaultDepartmentId || 'dept-02');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;

    setIsSubmitting(true);
    try {
      const ticketId = await startChatFromGadget({
        name,
        email,
        phone,
        departmentId: deptId,
        message,
      });

      setCreatedTicketId(ticketId);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenConversationInApp = () => {
    setIsGadgetFloatingOpen(false);
    setIsSuccess(false);
    setName('');
    setEmail('');
    setPhone('+55 ');
    setMessage('');
    setActiveView('inbox');
  };

  return (
    <div
      className={`fixed z-50 transition-all ${
        webGadgetConfig.buttonPosition === 'bottom-left' ? 'left-6 bottom-6' : 'right-6 bottom-6'
      }`}
    >
      {/* Floating Trigger Button */}
      {!isGadgetFloatingOpen && (
        <button
          onClick={() => setIsGadgetFloatingOpen(true)}
          className="relative group p-4 rounded-full text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: webGadgetConfig.primaryColor || '#10B981' }}
          title="Falar no WhatsApp com Atendente ou IA"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
          </span>
          <MessageSquare className="w-7 h-7 text-white" />
          <span className="hidden sm:inline ml-2.5 font-bold text-xs pr-1">
            Fale Conosco
          </span>
        </button>
      )}

      {/* Expanded Gadget Card */}
      {isGadgetFloatingOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-96 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 flex flex-col text-xs">
          {/* Header */}
          <div
            className="p-4 text-white relative flex items-center justify-between"
            style={{ backgroundColor: webGadgetConfig.primaryColor || '#10B981' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
                <Radio className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-tight">
                  {webGadgetConfig.brandTitle}
                </h3>
                <p className="text-[11px] text-white/90">
                  {webGadgetConfig.brandSubtitle}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsGadgetFloatingOpen(false);
                setIsSuccess(false);
              }}
              className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 max-h-[460px] overflow-y-auto">
            {isSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Atendimento Iniciado com Sucesso!
                </h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Seus dados foram vinculados à fila de atendimento e encaminhados ao WhatsApp corporativo <strong>{gatewayConfig.primaryPhoneNumber}</strong>.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleOpenConversationInApp}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    Abrir no Inbox Multiatendimento
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {webGadgetConfig.greetingMessage}
                </p>

                {/* 1. Nome */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Amanda Vasconcelos"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* 2. E-mail */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    E-mail Corporativo *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="amanda@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* 3. WhatsApp com DDD */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    WhatsApp (com DDD) *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="+55 11 98888-7777"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* 4. Departamentos */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Departamento de Atendimento *
                  </label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={deptId}
                      onChange={(e) => setDeptId(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.avgWaitTime})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 5. Campo de Mensagem */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Como podemos ajudar você hoje? *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Descreva brevemente sua dúvida ou solicitação..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                {/* 6. Iniciar Conversa */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:opacity-95 active:scale-98"
                  style={{ backgroundColor: webGadgetConfig.primaryColor || '#10B981' }}
                >
                  <Send className="w-4 h-4 text-white" />
                  {isSubmitting ? 'Iniciando Conversa...' : 'Iniciar Conversa'}
                </button>
              </form>
            )}
          </div>

          <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Canal Seguro Omnichannel</span>
            <span className="font-mono">Origem: {gatewayConfig.primaryPhoneNumber}</span>
          </div>
        </div>
      )}
    </div>
  );
};
