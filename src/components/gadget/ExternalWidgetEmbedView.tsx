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

export const STORAGE_KEY = 'omnipulse_external_sessions';
export const CHANNEL_NAME = 'omnipulse_crm_realtime';
export const PUBSUB_HUB_TOPIC = 'omnipulse_live_hub_2026_v4';

export function saveExternalSessionToStorage(session: ExternalRealtimeSession) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: ExternalRealtimeSession[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((s) => s.sessionId === session.sessionId);
    if (idx >= 0) {
      const existingMsgs = list[idx].messages || [];
      const mergedMsgs = [...existingMsgs];
      (session.messages || []).forEach((m) => {
        if (!mergedMsgs.some((em) => em.id === m.id)) {
          mergedMsgs.push(m);
        }
      });
      list[idx] = { ...list[idx], ...session, messages: mergedMsgs, updatedAt: Date.now() };
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

/**
 * Publishes an event to the zero-CORS public real-time relay (ntfy.sh) using text/plain
 * so browsers NEVER trigger an OPTIONS preflight. Works from file://, cross-origin iframes,
 * external domains, Vercel static hosting, and AI Studio preview.
 */
export function publishToRealtimeCloudRelay(payload: any, tenantSlug?: string) {
  try {
    const bodyStr = JSON.stringify(payload);
    fetch(`https://ntfy.sh/${PUBSUB_HUB_TOPIC}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: bodyStr,
    }).catch(() => {});

    if (tenantSlug) {
      const cleanTenant = String(tenantSlug).replace(/[^a-zA-Z0-9_-]/g, '');
      if (cleanTenant) {
        fetch(`https://ntfy.sh/omnipulse_live_2026_${cleanTenant}`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: bodyStr,
        }).catch(() => {});
      }
    }
  } catch {
    // ignore
  }
}

/**
 * When embedded inside a third-party iframe where Chrome partitions localStorage/BroadcastChannel,
 * opens a tiny self-closing top-level window on the CRM's first-party origin during the user click
 * gesture so the session is written directly to unpartitioned first-party storage & BroadcastChannel.
 */
export function triggerFirstPartySyncPulse(apiOrigin: string, payload: any) {
  try {
    const encoded = encodeURIComponent(JSON.stringify(payload));
    const syncUrl = `${apiOrigin}/?embed=sync&data=${encoded}`;
    const win = window.open(
      syncUrl,
      'omnipulse_sync_pulse',
      'width=80,height=60,left=9999,top=9999,menubar=no,toolbar=no,location=no,status=no'
    );
    if (win) {
      setTimeout(() => {
        try {
          win.close();
        } catch {
          // ignore
        }
      }, 450);
    }
  } catch {
    // ignore
  }
}

export const ExternalWidgetEmbedView: React.FC<{
  mode: 'bridge' | 'widget' | 'sync';
}> = ({ mode }) => {
  const params =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const tenantSlug = params.get('tenant') || params.get('tenantSlug') || params.get('empresa') || '';
  const tenantId = params.get('tenantId') || '';
  const companyName = params.get('company') || params.get('companyName') || '';
  const brand =
    params.get('brand') ||
    (companyName ? `Atendimento ${companyName}` : 'Atendimento Online');
  const primaryColor = params.get('color') || '#10B981';
  const initialSessionId = params.get('sessionId') || '';
  const rawChannel = params.get('originChannel') || params.get('channel') || 'chat';
  const initialChannel: 'chat' | 'whatsapp' =
    rawChannel === 'whatsapp' ? 'whatsapp' : 'chat';

  const [channel, setChannel] = useState<'chat' | 'whatsapp'>(initialChannel);
  const [name, setName] = useState(params.get('name') || '');
  const [phone, setPhone] = useState(params.get('whatsapp') || params.get('phone') || '');
  const [email, setEmail] = useState(params.get('email') || '');
  const [department, setDepartment] = useState(
    params.get('departmentId') || params.get('department') || 'Comercial & Vendas'
  );
  const [messageInput, setMessageInput] = useState(params.get('message') || '');

  const [activeSessionId, setActiveSessionId] = useState<string>(initialSessionId);
  const [messages, setMessages] = useState<ExternalRealtimeMessage[]>([]);
  const [replyInput, setReplyInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const autoStartedRef = useRef(false);

  // ============================================================================
  // 1. FIRST-PARTY UNPARTITIONED SYNC PULSE MODE (/?embed=sync&data=...)
  // ============================================================================
  useEffect(() => {
    if (mode !== 'sync') return;
    const rawData = params.get('data');
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        let bc: BroadcastChannel | null = null;
        try {
          if (typeof BroadcastChannel !== 'undefined') {
            bc = new BroadcastChannel(CHANNEL_NAME);
          }
        } catch {
          // ignore
        }

        if (parsed.type === 'OMNIPULSE_EXTERNAL_SESSION' && parsed.session) {
          const session: ExternalRealtimeSession = parsed.session;
          saveExternalSessionToStorage(session);
          try {
            bc?.postMessage({ type: 'OMNIPULSE_EXTERNAL_SESSION', session });
          } catch {
            // ignore
          }
          publishToRealtimeCloudRelay(
            { type: 'OMNIPULSE_EXTERNAL_SESSION', session },
            session.tenantSlug
          );
          fetch('/api/webhook/web-lead', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            body: JSON.stringify({
              sessionId: session.sessionId,
              protocol: session.protocol,
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
          parsed.type === 'OMNIPULSE_CUSTOMER_MESSAGE' &&
          parsed.sessionId &&
          parsed.message
        ) {
          appendExternalMessageToStorage(parsed.sessionId, parsed.message);
          try {
            bc?.postMessage({
              type: 'OMNIPULSE_CUSTOMER_MESSAGE',
              sessionId: parsed.sessionId,
              message: parsed.message,
            });
          } catch {
            // ignore
          }
          publishToRealtimeCloudRelay({
            type: 'OMNIPULSE_CUSTOMER_MESSAGE',
            sessionId: parsed.sessionId,
            message: parsed.message,
          });
          fetch(
            `/api/webhook/web-chat/${encodeURIComponent(parsed.sessionId)}/message`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
              body: JSON.stringify(parsed.message),
            }
          ).catch(() => {});
        }

        setTimeout(() => {
          try {
            bc?.close();
            window.close();
          } catch {
            // ignore
          }
        }, 180);
      } catch {
        // ignore parse errors
      }
    }
  }, [mode]);

  // ============================================================================
  // 2. AUTO-START FROM PURE HTML FORM SUBMISSION (/?embed=widget&autoStart=1&...)
  // ============================================================================
  useEffect(() => {
    if (mode !== 'widget' || autoStartedRef.current) return;
    const autoStart = params.get('autoStart');
    const urlName = (params.get('name') || '').trim();
    const urlPhone = (params.get('whatsapp') || params.get('phone') || '').trim();
    const urlMsg = (params.get('message') || '').trim();

    if (autoStart === '1' && urlName && (urlPhone || urlMsg)) {
      autoStartedRef.current = true;
      dispatchNewExternalSession({
        customName: urlName,
        customPhone: urlPhone || '+55 11 99999-0000',
        customEmail: (params.get('email') || '').trim(),
        customDept:
          (params.get('departmentId') || params.get('department') || 'Comercial & Vendas').trim(),
        customMsg: urlMsg || 'Olá! Gostaria de iniciar um atendimento.',
        customChannel: initialChannel,
        skipPopupSync: true, // Already in a top-level window!
      });
    } else if (initialSessionId) {
      autoStartedRef.current = true;
      // Load existing session from localStorage if available
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const list: ExternalRealtimeSession[] = JSON.parse(raw);
          const found = list.find((s) => s.sessionId === initialSessionId);
          if (found && Array.isArray(found.messages)) {
            setMessages(found.messages);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [mode]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // ============================================================================
  // 3. REAL-TIME LISTENERS (BroadcastChannel + localStorage + postMessage + Cloud SSE)
  // ============================================================================
  useEffect(() => {
    if (mode === 'sync') return;

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel(CHANNEL_NAME);
      }
    } catch {
      // ignore
    }

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
        publishToRealtimeCloudRelay(
          { type: 'OMNIPULSE_EXTERNAL_SESSION', session },
          session.tenantSlug
        );
        fetch('/api/webhook/web-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: JSON.stringify({
            sessionId: session.sessionId,
            protocol: session.protocol,
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
        publishToRealtimeCloudRelay({
          type: 'OMNIPULSE_CUSTOMER_MESSAGE',
          sessionId: data.sessionId,
          message: data.message,
        });
        fetch(
          `/api/webhook/web-chat/${encodeURIComponent(data.sessionId)}/message`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            body: JSON.stringify({
              id: data.message.id,
              sender: 'contact',
              senderName: data.message.senderName,
              text: data.message.text,
            }),
          }
        ).catch(() => {});
      } else if (data.type === 'OMNIPULSE_VISITOR_HEARTBEAT' && data.visitor) {
        try {
          bc?.postMessage({
            type: 'OMNIPULSE_VISITOR_HEARTBEAT',
            visitor: data.visitor,
          });
        } catch {
          // ignore
        }
        publishToRealtimeCloudRelay(
          { type: 'OMNIPULSE_VISITOR_HEARTBEAT', visitor: data.visitor },
          data.visitor.tenantSlug
        );
        fetch('/api/webhook/visitor-heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: JSON.stringify(data.visitor),
        }).catch(() => {});
      }
    };

    // If mode === 'widget' (Iframe Embed), automatically emit live visitor heartbeat for the host page
    if (mode === 'widget') {
      const visId = `vis-iframe-${Math.random().toString(36).slice(2, 9)}`;
      const hostPageUrl =
        params.get('pageUrl') ||
        (typeof document !== 'undefined' && document.referrer
          ? document.referrer
          : `https://${tenantSlug || 'site-externo'}.com.br/contato-iframe`);
      const hostPageTitle =
        params.get('pageTitle') ||
        `Página com Iframe Embedado (${companyName || tenantSlug || 'Empresa'})`;

      const sendIframeHeartbeat = (status: 'online' | 'left' = 'online') => {
        const visitorPayload = {
          visitorId: visId,
          tenantId,
          tenantSlug,
          companyName,
          pageUrl: hostPageUrl,
          pageTitle: hostPageTitle,
          embedType: 'Iframe Embed' as const,
          isWidgetOpen: true,
          startedAt: Date.now(),
          lastSeenAt: Date.now(),
          status,
        };
        try {
          bc?.postMessage({
            type: 'OMNIPULSE_VISITOR_HEARTBEAT',
            visitor: visitorPayload,
          });
        } catch {
          // ignore
        }
        publishToRealtimeCloudRelay(
          { type: 'OMNIPULSE_VISITOR_HEARTBEAT', visitor: visitorPayload },
          tenantSlug
        );
        fetch('/api/webhook/visitor-heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: JSON.stringify(visitorPayload),
        }).catch(() => {});
      };

      sendIframeHeartbeat('online');
      setInterval(() => sendIframeHeartbeat('online'), 12000);
      window.addEventListener('beforeunload', () => sendIframeHeartbeat('left'));
    }

    const handleIncomingAgentReply = (sessionId: string, message: ExternalRealtimeMessage) => {
      if (!sessionId || !message) return;
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(
            {
              type: 'OMNIPULSE_AGENT_REPLY',
              sessionId,
              message,
            },
            '*'
          );
        }
      } catch {
        // ignore
      }

      if (sessionId === activeSessionId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    };

    const handleBroadcastMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'OMNIPULSE_AGENT_REPLY' && data.sessionId && data.message) {
        handleIncomingAgentReply(data.sessionId, data.message);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const list: ExternalRealtimeSession[] = JSON.parse(e.newValue);
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

    // Cloud SSE Listener for Agent Replies (works across any domain or file://)
    let eventSource: EventSource | null = null;
    try {
      if (typeof EventSource !== 'undefined') {
        eventSource = new EventSource(`https://ntfy.sh/${PUBSUB_HUB_TOPIC}/sse`);
        eventSource.onmessage = (ev) => {
          try {
            const outer = JSON.parse(ev.data);
            if (outer && outer.event === 'message' && outer.message) {
              const inner = JSON.parse(outer.message);
              if (
                inner &&
                inner.type === 'OMNIPULSE_AGENT_REPLY' &&
                inner.sessionId &&
                inner.message
              ) {
                handleIncomingAgentReply(inner.sessionId, inner.message);
              }
            }
          } catch {
            // ignore
          }
        };
      }
    } catch {
      // ignore
    }

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
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [activeSessionId, mode]);

  // Poll backend API + Cloud Relay if activeSessionId is set
  useEffect(() => {
    if (!activeSessionId || mode !== 'widget') return;
    const poll = async () => {
      try {
        const res = await fetch(
          `/api/webhook/web-chat/${encodeURIComponent(activeSessionId)}/messages`
        );
        if (res.ok) {
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
        }
      } catch {
        // ignore
      }
    };
    poll();
    const id = setInterval(poll, 1500);
    return () => clearInterval(id);
  }, [activeSessionId, mode]);

  if (mode === 'bridge') {
    return <div style={{ display: 'none' }} aria-hidden="true" />;
  }

  if (mode === 'sync') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans text-xs">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto" />
          <p className="font-bold text-emerald-400">Sincronizando chamado com a central...</p>
        </div>
      </div>
    );
  }

  const dispatchNewExternalSession = (opts?: {
    customName?: string;
    customPhone?: string;
    customEmail?: string;
    customDept?: string;
    customMsg?: string;
    customChannel?: 'chat' | 'whatsapp';
    skipPopupSync?: boolean;
  }) => {
    const finalName = (opts?.customName ?? name).trim();
    const finalPhone = (opts?.customPhone ?? phone).trim();
    const finalEmail = (opts?.customEmail ?? email).trim();
    const finalDept = (opts?.customDept ?? department).trim();
    const finalMsg = (opts?.customMsg ?? messageInput).trim();
    const finalChannel = opts?.customChannel ?? channel;

    if (!finalName || !finalPhone || !finalMsg) return;

    const nowMs = Date.now();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const sId = `ext-${nowMs}-${Math.random().toString(36).slice(2, 6)}`;
    const protocol =
      finalChannel === 'chat'
        ? `OP-CHAT-${nowMs.toString().slice(-4)}`
        : `OP-WA-${nowMs.toString().slice(-4)}`;

    const welcomeText =
      finalChannel === 'whatsapp'
        ? `Olá ${finalName}! 📱 Sua conversa via WhatsApp para ${
            companyName || brand
          } foi iniciada no setor ${finalDept}. Um atendente já foi acionado e responderá aqui mesmo!`
        : `Olá ${finalName}! 💬 Seu atendimento via Chat Online para ${
            companyName || brand
          } foi iniciado no setor ${finalDept}. Um atendente já recebeu o alerta sonoro e responderá por aqui!`;

    const initialMessages: ExternalRealtimeMessage[] = [
      {
        id: `m-ext-init-${nowMs}`,
        sender: 'contact',
        senderName: finalName,
        text: finalMsg,
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
      name: finalName,
      phone: finalPhone,
      email: finalEmail,
      department: finalDept,
      originChannel: finalChannel,
      createdAt: nowMs,
      updatedAt: nowMs,
      messages: initialMessages,
    };

    setActiveSessionId(sId);
    setMessages(initialMessages);

    // Layer 1: LocalStorage (works when same-origin or top-level window)
    saveExternalSessionToStorage(session);

    // Layer 2: BroadcastChannel (instant same-origin sync)
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel(CHANNEL_NAME);
        bc.postMessage({ type: 'OMNIPULSE_EXTERNAL_SESSION', session });
        bc.close();
      }
    } catch {
      // ignore
    }

    // Layer 3: Cloud Real-Time Pub/Sub Relay (ntfy.sh - works across any external domain, file://, Vercel, AI Studio)
    publishToRealtimeCloudRelay(
      { type: 'OMNIPULSE_EXTERNAL_SESSION', session },
      tenantSlug
    );

    // Layer 4: Backend Webhook POST (text/plain CORS-simple) + GET Image Beacon
    const leadPayload = {
      sessionId: sId,
      protocol,
      tenantId,
      tenantSlug,
      companyName,
      name: session.name,
      phone: session.phone,
      email: session.email,
      department: session.department,
      message: finalMsg,
      originChannel: finalChannel,
    };

    fetch('/api/webhook/web-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(leadPayload),
    }).catch(() => {});

    try {
      const beacon = new Image();
      beacon.src = `/api/webhook/web-lead-beacon?d=${encodeURIComponent(
        JSON.stringify(leadPayload)
      )}&_t=${nowMs}`;
    } catch {
      // ignore
    }

    // Layer 5: If running inside a third-party iframe (window.self !== window.top),
    // trigger a First-Party Unpartitioned Sync Pulse so Chrome's storage partitioning is bypassed 100%
    if (!opts?.skipPopupSync && typeof window !== 'undefined' && window.self !== window.top) {
      triggerFirstPartySyncPulse(window.location.origin, {
        type: 'OMNIPULSE_EXTERNAL_SESSION',
        session,
      });
    }
  };

  const handleStartCall = (e: React.FormEvent) => {
    e.preventDefault();
    dispatchNewExternalSession();
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

    publishToRealtimeCloudRelay(
      {
        type: 'OMNIPULSE_CUSTOMER_MESSAGE',
        sessionId: activeSessionId,
        message: newMsg,
      },
      tenantSlug
    );

    fetch(
      `/api/webhook/web-chat/${encodeURIComponent(activeSessionId)}/message`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
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
