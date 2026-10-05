import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Phone, Send, CheckCheck, Headphones } from 'lucide-react';

export interface ExternalRealtimeMessage {
  id: string;
  sender: 'contact' | 'agent' | 'ai_bot';
  senderName?: string;
  text: string;
  timestamp: string;
  createdAt: number;
}

export interface ExternalRealtimeSession {
  sessionId: string;
  protocol: string;
  tenantId: string;
  tenantSlug: string;
  companyName: string;
  name: string;
  phone: string;
  email: string;
  department: string;
  originChannel: 'chat' | 'whatsapp';
  createdAt: number;
  updatedAt: number;
  messages: ExternalRealtimeMessage[];
}

const STORAGE_KEY = 'omnipulse_external_sessions';
const CHANNEL_NAME = 'omnipulse_crm_realtime';

export function saveExternalSessionToStorage(session: ExternalRealtimeSession) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: ExternalRealtimeSession[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((s) => s.sessionId === session.sessionId);
    if (idx >= 0) {
      list[idx] = session;
    } else {
      list.unshift(session);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    // ignore storage errors
  }
}

export function appendExternalMessageToStorage(
  sessionId: string,
  message: ExternalRealtimeMessage
): ExternalRealtimeSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: ExternalRealtimeSession[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((s) => s.sessionId === sessionId);
    if (idx >= 0) {
      const exists = list[idx].messages.some((m) => m.id === message.id);
      if (!exists) {
        list[idx].messages.push(message);
        list[idx].updatedAt = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      }
      return list[idx];
    }
  } catch {
    // ignore
  }
  return null;
}

export const ExternalWidgetEmbedView: React.FC<{ mode: 'bridge' | 'widget' }> = ({
  mode,
}) => {
  const params =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const tenantSlug = params.get('tenant') || params.get('empresa') || '';
  const tenantId = params.get('tenantId') || '';
  const companyName = params.get('company') || '';
  const brand =
    params.get('brand') ||
    (companyName ? `Atendimento ${companyName}` : 'Atendimento Online');
  const primaryColor = params.get('color') || '#10B981';
  const initialSessionId = params.get('sessionId') || '';
  const initialChannel =
    params.get('channel') === 'whatsapp' ? 'whatsapp' : 'chat';

  const [channel, setChannel] = useState<'chat' | 'whatsapp'>(initialChannel);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Comercial & Vendas');
  const [messageInput, setMessageInput] = useState('');

  const [activeSessionId, setActiveSessionId] = useState<string>(initialSessionId);
  const [messages, setMessages] = useState<ExternalRealtimeMessage[]>([]);
  const [replyInput, setReplyInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Bridge Mode & Widget Mode: Listen for postMessage (from parent external site script), BroadcastChannel, and localStorage
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel(CHANNEL_NAME);
      }
    } catch {
      // ignore
    }

    // 1. Handle messages from Parent External Website (<script> tag postMessage)
    const handleWindowMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'OMNIPULSE_EXTERNAL_SESSION' && data.session) {
        const session: ExternalRealtimeSession = data.session;
        saveExternalSessionToStorage(session);
        try {
          bc?.postMessage({ type: 'OMNIPULSE_EXTERNAL_SESSION', session });
        } catch {
          // ignore
        }
        // Also forward to backend API if available
        fetch('/api/webhook/web-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: session.sessionId,
            tenantId: session.tenantId,
            tenantSlug: session.tenantSlug,
            companyName: session.companyName,
            name: session.name,
            phone: session.phone,
            email: session.email,
            department: session.department,
            message: session.messages?.[0]?.text || '',
            originChannel: session.originChannel,
          }),
        }).catch(() => {});
      } else if (
        data.type === 'OMNIPULSE_CUSTOMER_MESSAGE' &&
        data.sessionId &&
        data.message
      ) {
        appendExternalMessageToStorage(data.sessionId, data.message);
        try {
          bc?.postMessage({
            type: 'OMNIPULSE_CUSTOMER_MESSAGE',
            sessionId: data.sessionId,
            message: data.message,
          });
        } catch {
          // ignore
        }
        fetch(
          `/api/webhook/web-chat/${encodeURIComponent(data.sessionId)}/message`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: data.message.id,
              sender: 'contact',
              senderName: data.message.senderName,
              text: data.message.text,
            }),
          }
        ).catch(() => {});
      }
    };

    // 2. Handle replies from the CRM Attendant via BroadcastChannel
    const handleBroadcastMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'OMNIPULSE_AGENT_REPLY' && data.sessionId && data.message) {
        // Forward to parent window (in case we are inside the <script>'s hidden bridge iframe)
        try {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage(
              {
                type: 'OMNIPULSE_AGENT_REPLY',
                sessionId: data.sessionId,
                message: data.message,
              },
              '*'
            );
          }
        } catch {
          // ignore
        }

        // If we are in visual widget mode for this session, append the message
        if (data.sessionId === activeSessionId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
        }
      }
    };

    // 3. Handle localStorage changes (fallback across tabs/iframes)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const list: ExternalRealtimeSession[] = JSON.parse(e.newValue);
          // Forward any agent messages to parent window in bridge mode
          if (mode === 'bridge' && window.parent && window.parent !== window) {
            list.forEach((sess) => {
              sess.messages
                .filter((m) => m.sender === 'agent' || m.sender === 'ai_bot')
                .forEach((m) => {
                  window.parent.postMessage(
                    {
                      type: 'OMNIPULSE_AGENT_REPLY',
                      sessionId: sess.sessionId,
                      message: m,
                    },
                    '*'
                  );
                });
            });
          }
          if (activeSessionId) {
            const match = list.find((s) => s.sessionId === activeSessionId);
            if (match) {
              setMessages(match.messages);
            }
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('message', handleWindowMessage);
    window.addEventListener('storage', handleStorageChange);
    if (bc) {
      bc.addEventListener('message', handleBroadcastMessage);
    }

    return () => {
      window.removeEventListener('message', handleWindowMessage);
      window.removeEventListener('storage', handleStorageChange);
      if (bc) {
        bc.removeEventListener('message', handleBroadcastMessage);
        bc.close();
      }
    };
  }, [activeSessionId, mode]);

  // Also poll backend API if activeSessionId is set (for cross-device sync)
  useEffect(() => {
    if (!activeSessionId || mode === 'bridge') return;
    const poll = async () => {
      try {
        const res = await fetch(
          `/api/webhook/web-chat/${encodeURIComponent(activeSessionId)}/messages`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newOnes = data.messages.filter(
              (m: ExternalRealtimeMessage) => !existingIds.has(m.id)
            );
            return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
          });
        }
      } catch {
        // ignore
      }
    };
    poll();
    const id = setInterval(poll, 1500);
    return () => clearInterval(id);
  }, [activeSessionId, mode]);

  // Invisible Bridge Mode for External <script> embeds
  if (mode === 'bridge') {
    return <div style={{ display: 'none' }} aria-hidden="true" />;
  }

  const handleStartCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !messageInput.trim()) return;

    const nowMs = Date.now();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const sId = `ext-${nowMs}-${Math.random().toString(36).slice(2, 6)}`;
    const protocol =
      channel === 'chat'
        ? `OP-CHAT-${nowMs.toString().slice(-4)}`
        : `OP-WA-${nowMs.toString().slice(-4)}`;

    const welcomeText =
      channel === 'whatsapp'
        ? `Olá ${name.trim()}! 📱 Sua conversa via WhatsApp para ${
            companyName || brand
          } foi iniciada no setor ${department}. Um atendente já foi acionado e responderá aqui mesmo!`
        : `Olá ${name.trim()}! 💬 Seu atendimento via Chat Online para ${
            companyName || brand
          } foi iniciado no setor ${department}. Um atendente já recebeu o alerta sonoro e responderá por aqui!`;

    const initialMessages: ExternalRealtimeMessage[] = [
      {
        id: `m-ext-init-${nowMs}`,
        sender: 'contact',
        senderName: name.trim(),
        text: messageInput.trim(),
        timestamp: timeStr,
        createdAt: nowMs,
      },
      {
        id: `m-ext-welcome-${nowMs + 1}`,
        sender: 'agent',
        senderName: companyName ? `Atendimento ${companyName}` : brand,
        text: welcomeText,
        timestamp: timeStr,
        createdAt: nowMs + 1,
      },
    ];

    const session: ExternalRealtimeSession = {
      sessionId: sId,
      protocol,
      tenantId,
      tenantSlug,
      companyName,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      department,
      originChannel: channel,
      createdAt: nowMs,
      updatedAt: nowMs,
      messages: initialMessages,
    };

    setActiveSessionId(sId);
    setMessages(initialMessages);

    // 1. Save to localStorage (fires storage event in Attendant's CRM tab immediately)
    saveExternalSessionToStorage(session);

    // 2. Broadcast on BroadcastChannel (fires instantaneously in Attendant's CRM tab)
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel(CHANNEL_NAME);
        bc.postMessage({ type: 'OMNIPULSE_EXTERNAL_SESSION', session });
        bc.close();
      }
    } catch {
      // ignore
    }

    // 3. Also send to backend webhook API
    fetch('/api/webhook/web-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sId,
        tenantId,
        tenantSlug,
        companyName,
        name: session.name,
        phone: session.phone,
        email: session.email,
        department: session.department,
        message: messageInput.trim(),
        originChannel: channel,
      }),
    }).catch(() => {});
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !activeSessionId) return;

    const text = replyInput.trim();
    setReplyInput('');

    const nowMs = Date.now();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newMsg: ExternalRealtimeMessage = {
      id: `m-ext-${nowMs}-${Math.random().toString(36).slice(2, 6)}`,
      sender: 'contact',
      senderName: name.trim() || 'Cliente',
      text,
      timestamp: timeStr,
      createdAt: nowMs,
    };

    setMessages((prev) => [...prev, newMsg]);
    appendExternalMessageToStorage(activeSessionId, newMsg);

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel(CHANNEL_NAME);
        bc.postMessage({
          type: 'OMNIPULSE_CUSTOMER_MESSAGE',
          sessionId: activeSessionId,
          message: newMsg,
        });
        bc.close();
      }
    } catch {
      // ignore
    }

    fetch(
      `/api/webhook/web-chat/${encodeURIComponent(activeSessionId)}/message`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newMsg.id,
          sender: 'contact',
          senderName: newMsg.senderName,
          text: newMsg.text,
        }),
      }
    ).catch(() => {});
  };

  const isWhatsApp = channel === 'whatsapp';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-3 font-sans">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div
          className="p-4 text-white flex items-center justify-between transition-colors"
          style={{
            backgroundColor:
              activeSessionId && isWhatsApp ? '#075E54' : primaryColor,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              {isWhatsApp ? (
                <Phone className="w-5 h-5 text-white" />
              ) : (
                <Headphones className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-sm leading-tight">{brand}</h3>
              <p className="text-[11px] text-white/90 mt-0.5">
                {activeSessionId
                  ? isWhatsApp
                    ? 'Diálogo WhatsApp Ao Vivo • Origem: WhatsApp'
                    : 'Chat Online Ao Vivo • Origem: Chat'
                  : 'Escolha: Chamada via Chat ou via WhatsApp'}
              </p>
            </div>
          </div>
        </div>

        {!activeSessionId ? (
          <form onSubmit={handleStartCall} className="p-4 space-y-3 text-xs">
            {/* Channel Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">
                Escolha como deseja ser atendido *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('chat')}
                  className={`p-2.5 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    channel === 'chat'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Via Chat Online</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('whatsapp')}
                  className={`p-2.5 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    channel === 'whatsapp'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Via WhatsApp</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Seu Nome Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos Mendes"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  WhatsApp com DDD *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+55 41 99999-8888"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Departamento
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
              >
                <option value="Comercial & Vendas">Comercial & Vendas</option>
                <option value="Suporte Técnico N1/N2">Suporte Técnico N1/N2</option>
                <option value="Financeiro & Cobrança">Financeiro & Cobrança</option>
                <option value="Sucesso do Cliente (CS)">Sucesso do Cliente (CS)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Mensagem Inicial *
              </label>
              <textarea
                rows={2}
                required
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Como podemos ajudar você agora?"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              style={{
                backgroundColor:
                  channel === 'chat' ? '#2563EB' : primaryColor,
              }}
            >
              <Send className="w-4 h-4" />
              <span>
                {channel === 'chat'
                  ? 'Iniciar Chamada via Chat Online'
                  : 'Iniciar Diálogo via WhatsApp'}
              </span>
            </button>
          </form>
        ) : (
          <div className="flex flex-col h-[410px]">
            {/* Messages Feed */}
            <div
              className={`flex-1 p-3.5 overflow-y-auto space-y-2.5 ${
                isWhatsApp ? 'bg-[#efeae2]' : 'bg-slate-100'
              }`}
            >
              {messages.map((m) => {
                const isMe = m.sender === 'contact';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      isMe ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-2xs ${
                        isMe
                          ? isWhatsApp
                            ? 'bg-[#d9fdd3] text-slate-900 rounded-br-xs'
                            : 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                      }`}
                    >
                      {!isMe && m.senderName && (
                        <div className="text-[10px] font-extrabold text-emerald-700 mb-0.5">
                          {m.senderName}
                        </div>
                      )}
                      <p className="leading-relaxed">{m.text}</p>
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                          isMe && !isWhatsApp
                            ? 'text-blue-100'
                            : 'text-slate-400'
                        }`}
                      >
                        <span>{m.timestamp}</span>
                        {isMe && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Form */}
            <form
              onSubmit={handleSendReply}
              className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                placeholder={
                  isWhatsApp
                    ? 'Responder no diálogo WhatsApp...'
                    : 'Responder no Chat Online...'
                }
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                style={{
                  backgroundColor: isWhatsApp ? '#075E54' : '#2563EB',
                }}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
