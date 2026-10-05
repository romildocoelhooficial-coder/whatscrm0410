import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Phone,
  Mail,
  User,
  Building,
  CheckCheck,
  Bot,
  Radio,
  ExternalLink,
  RefreshCw,
  Headphones,
  Sparkles,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const ChatGadgetWidget: React.FC = () => {
  const {
    webGadgetConfig,
    departments,
    startChatFromGadget,
    sendChatMessage,
    tickets,
    currentAgent,
    gatewayConfig,
    setActiveView,
    setSelectedTicket,
    isGadgetFloatingOpen,
    setIsGadgetFloatingOpen,
  } = useCRM();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+55 11 9');
  const [deptId, setDeptId] = useState(webGadgetConfig.defaultDepartmentId || 'dept-02');
  const [message, setMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'chat' | 'whatsapp'>('chat');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  // Live conversation state inside the widget dialog box
  const [customerMessageInput, setCustomerMessageInput] = useState('');
  const [agentQuickReplyInput, setAgentQuickReplyInput] = useState('');
  const [showAgentReplyBar, setShowAgentReplyBar] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const liveTicket = activeTicketId
    ? tickets.find((t) => t.id === activeTicketId) || null
    : null;

  useEffect(() => {
    if (liveTicket && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveTicket?.messages.length, isGadgetFloatingOpen]);

  const handleStartConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const ticketId = await startChatFromGadget({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        departmentId: deptId,
        message: message.trim(),
        channel: selectedChannel,
      });

      setActiveTicketId(ticketId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendCustomerMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerMessageInput.trim() || !liveTicket) return;
    const text = customerMessageInput.trim();
    setCustomerMessageInput('');
    await sendChatMessage(liveTicket.id, text, 'contact');
  };

  const handleSendAgentReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentQuickReplyInput.trim() || !liveTicket) return;
    const text = agentQuickReplyInput.trim();
    setAgentQuickReplyInput('');
    await sendChatMessage(liveTicket.id, text, 'agent');
  };

  const handleResetConversation = () => {
    setActiveTicketId(null);
    setMessage('');
    setCustomerMessageInput('');
    setAgentQuickReplyInput('');
  };

  const handleOpenInCrmInbox = () => {
    if (liveTicket) {
      setSelectedTicket(liveTicket);
    }
    setActiveView('inbox');
  };

  const cleanDestPhone =
    (gatewayConfig.primaryPhoneNumber || '+55 11 98765-4321').replace(/\D/g, '') ||
    '5511987654321';

  const isWhatsAppMode =
    (liveTicket ? liveTicket.originChannel === 'whatsapp' : selectedChannel === 'whatsapp');

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
          title="Iniciar Atendimento via Chat ou WhatsApp"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
          </span>
          <MessageSquare className="w-6 h-6 text-white" />
          <span className="hidden sm:inline ml-2.5 font-bold text-xs pr-1">
            Iniciar Atendimento (Chat / WhatsApp)
          </span>
        </button>
      )}

      {/* Expanded Gadget Card */}
      {isGadgetFloatingOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-[390px] max-w-[calc(100vw-24px)] overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 flex flex-col text-xs">
          {/* Header */}
          <div
            className="p-4 text-white relative flex items-center justify-between"
            style={{
              backgroundColor: isWhatsAppMode
                ? '#075E54'
                : webGadgetConfig.primaryColor || '#2563EB',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold shrink-0">
                {isWhatsAppMode ? (
                  <Phone className="w-5 h-5 text-white animate-pulse" />
                ) : (
                  <MessageSquare className="w-5 h-5 text-white animate-pulse" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm tracking-tight truncate">
                    {webGadgetConfig.brandTitle}
                  </h3>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/20 text-white shrink-0">
                    {isWhatsAppMode ? 'WhatsApp' : 'Chat Web'}
                  </span>
                </div>
                <p className="text-[11px] text-white/90 truncate">
                  {liveTicket
                    ? `Conectado com ${currentAgent.name} • ${liveTicket.protocol}`
                    : webGadgetConfig.brandSubtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {liveTicket && (
                <button
                  onClick={handleResetConversation}
                  className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition-colors"
                  title="Novo Atendimento"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsGadgetFloatingOpen(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition-colors"
                title="Minimizar janela"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* LIVE DIALOG BOX WHEN CONVERSATION IS ACTIVE (Supports BOTH Chat & WhatsApp!) */}
          {liveTicket ? (
            <div className="flex flex-col h-[470px]">
              {/* Top Status Bar inside Dialog */}
              <div className="px-3.5 py-2 bg-slate-900 text-white flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    Origem no Painel:{' '}
                    <strong className={isWhatsAppMode ? 'text-emerald-400' : 'text-blue-400'}>
                      {isWhatsAppMode ? 'WhatsApp' : 'Chat'}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isWhatsAppMode && (
                    <a
                      href={`https://wa.me/${cleanDestPhone}?text=${encodeURIComponent(
                        `Olá! Estou em atendimento no protocolo ${liveTicket.protocol}.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-300 hover:text-emerald-200 underline flex items-center gap-0.5"
                      title="Abrir também no aplicativo externo do WhatsApp"
                    >
                      <span>App Externo</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleOpenInCrmInbox}
                    className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-white font-semibold transition-colors"
                  >
                    Ver no Inbox CRM
                  </button>
                </div>
              </div>

              {/* Messages Feed */}
              <div
                className={`flex-1 p-3.5 overflow-y-auto space-y-2.5 ${
                  isWhatsAppMode ? 'bg-[#e5ddd5]/80' : 'bg-slate-50'
                }`}
              >
                <div className="text-center my-1">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-amber-100/90 text-amber-900 text-[10px] font-medium shadow-2xs">
                    {isWhatsAppMode
                      ? `🔒 Diálogo WhatsApp em tempo real (${gatewayConfig.primaryPhoneNumber})`
                      : `💬 Sessão de Chat Online iniciada (${liveTicket.protocol})`}
                  </span>
                </div>

                {liveTicket.messages.map((msg) => {
                  // In the widget, the visitor is 'contact' (right side), and 'agent'/'ai_bot' is the company (left side)
                  const isCustomer = msg.sender === 'contact';
                  const isAi = msg.sender === 'ai_bot';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs shadow-2xs leading-relaxed ${
                          isCustomer
                            ? isWhatsAppMode
                              ? 'bg-[#dcf8c6] text-slate-900 rounded-br-xs border border-emerald-200'
                              : 'bg-blue-600 text-white rounded-br-xs'
                            : isAi
                            ? 'bg-purple-50 text-purple-950 border border-purple-200 rounded-bl-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                        }`}
                      >
                        <div
                          className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1 ${
                            isCustomer
                              ? isWhatsAppMode
                                ? 'text-emerald-800'
                                : 'text-blue-100'
                              : isAi
                              ? 'text-purple-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {isAi && <Bot className="w-2.5 h-2.5" />}
                          <span>
                            {isCustomer
                              ? `${liveTicket.contactName} (Você)`
                              : msg.senderName || `${currentAgent.name} (Atendente)`}
                          </span>
                        </div>

                        <p className="whitespace-pre-wrap text-[11px]">{msg.text}</p>

                        <div
                          className={`mt-1 text-[9px] flex items-center justify-end gap-1 font-mono ${
                            isCustomer && !isWhatsAppMode ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {isCustomer && (
                            <CheckCheck
                              className={`w-3 h-3 ${
                                isWhatsAppMode ? 'text-sky-500' : 'text-blue-200'
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Optional Quick Attendant Reply Simulator inside the Widget */}
              <div className="bg-slate-100 border-t border-slate-200 px-3 py-1.5">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowAgentReplyBar(!showAgentReplyBar)}
                    className="text-[10px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <Headphones className="w-3 h-3 text-emerald-600" />
                    <span>
                      {showAgentReplyBar
                        ? 'Ocultar resposta rápida do atendente'
                        : 'Testar resposta como Atendente aqui mesmo'}
                    </span>
                  </button>
                  <span className="text-[9px] text-slate-400">Sincronizado com o Inbox</span>
                </div>

                {showAgentReplyBar && (
                  <form onSubmit={handleSendAgentReply} className="mt-1.5 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={agentQuickReplyInput}
                      onChange={(e) => setAgentQuickReplyInput(e.target.value)}
                      placeholder={`Responder como ${currentAgent.name}...`}
                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold shrink-0"
                    >
                      Enviar (Atendente)
                    </button>
                  </form>
                )}
              </div>

              {/* Customer Message Input Box */}
              <form
                onSubmit={handleSendCustomerMessage}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={customerMessageInput}
                  onChange={(e) => setCustomerMessageInput(e.target.value)}
                  placeholder={
                    isWhatsAppMode
                      ? 'Digite sua mensagem no WhatsApp...'
                      : 'Digite sua mensagem no Chat...'
                  }
                  className="flex-1 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="p-2.5 text-white rounded-xl shadow-xs transition-colors"
                  style={{
                    backgroundColor: isWhatsAppMode
                      ? '#075E54'
                      : webGadgetConfig.primaryColor || '#2563EB',
                  }}
                  title="Enviar mensagem como Cliente"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            /* STEP 1: INITIATION FORM WITH CHANNEL CHOICE (CHAT vs WHATSAPP) */
            <div className="p-4 max-h-[480px] overflow-y-auto">
              <form onSubmit={handleStartConversation} className="space-y-3">
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {webGadgetConfig.greetingMessage}
                </p>

                {/* CHANNEL SELECTOR: CHAMADA VIA CHAT OU CHAMADA VIA WHATSAPP */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Escolha como deseja ser atendido *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedChannel('chat')}
                      className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                        selectedChannel === 'chat'
                          ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 text-blue-950'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </span>
                        {selectedChannel === 'chat' && (
                          <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                            Ativo
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs mt-0.5">Chamada via Chat</div>
                      <div className="text-[10px] opacity-80 leading-tight">
                        Chat ao vivo aqui na janela (Origem: Chat)
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedChannel('whatsapp')}
                      className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                        selectedChannel === 'whatsapp'
                          ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                          <Phone className="w-3.5 h-3.5" />
                        </span>
                        {selectedChannel === 'whatsapp' && (
                          <span className="text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded-full">
                            Ativo
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs mt-0.5">Via WhatsApp</div>
                      <div className="text-[10px] opacity-80 leading-tight">
                        Diálogo WhatsApp direto nesta caixa
                      </div>
                    </button>
                  </div>
                </div>

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

                {/* 2. Telefone / WhatsApp & E-mail */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      WhatsApp / Tel *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="+55 11 98888-7777"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-7 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      E-mail
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="voce@empresa.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-7 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Departamentos */}
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

                {/* 4. Campo de Mensagem */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Mensagem Inicial *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Olá! Gostaria de falar com um especialista..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                {/* 5. Iniciar Conversa */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:opacity-95 active:scale-98"
                  style={{
                    backgroundColor:
                      selectedChannel === 'whatsapp'
                        ? '#075E54'
                        : webGadgetConfig.primaryColor || '#2563EB',
                  }}
                >
                  {selectedChannel === 'whatsapp' ? (
                    <>
                      <Phone className="w-4 h-4 text-white" />
                      <span>
                        {isSubmitting
                          ? 'Conectando WhatsApp...'
                          : 'Iniciar Diálogo via WhatsApp Aqui'}
                      </span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 text-white" />
                      <span>
                        {isSubmitting
                          ? 'Iniciando Chat...'
                          : 'Iniciar Chamada via Chat Online'}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>
              {isWhatsAppMode ? '📱 Canal WhatsApp Integrado' : '💬 Canal Web Chat Ao Vivo'}
            </span>
            <span className="font-mono">Linha: {gatewayConfig.primaryPhoneNumber}</span>
          </div>
        </div>
      )}
    </div>
  );
};
