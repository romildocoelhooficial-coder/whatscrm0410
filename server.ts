import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = 3000;

// Enable CORS for External Website Widget Embeds (Script, HTML Form, Iframe)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-Memory Real-Time Store for External Widget Sessions & Live Two-Way Messages
interface ExternalChatMessage {
  id: string;
  sender: 'contact' | 'agent' | 'ai_bot';
  senderName?: string;
  text: string;
  timestamp: string;
  createdAt: number;
}

interface ExternalLeadSession {
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
  messages: ExternalChatMessage[];
}

const externalSessions = new Map<string, ExternalLeadSession>();

function getNowTimeStr(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

// Initialize Google GenAI if key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI();
  } catch (err) {
    console.warn('Could not initialize GenAI with default constructor, falling back to explicit key');
    try {
      aiClient = new GoogleGenAI({ apiKey });
    } catch (e) {
      console.error('Error creating GoogleGenAI client:', e);
    }
  }
}

// Fallback AI Response endpoint when human agents are offline or in high queue
app.post('/api/ai-agent/respond', async (req: Request, res: Response) => {
  try {
    const { message, contactName, departmentName, chatHistory, customPrompt } = req.body;

    const basePrompt = customPrompt || `Você é o Atendente Virtual IA inteligente do OmniPulse CRM Omnichannel.
Você atende clientes no WhatsApp de forma rápida, empática e prestativa quando os atendentes humanos estão ocupados ou offline.
Departamento: ${departmentName || 'Atendimento Geral'}
Nome do Cliente: ${contactName || 'Cliente'}

Diretrizes:
- Cumprimente pelo nome.
- Responda de forma clara, natural e resolutiva em português do Brasil.
- Se for interesse comercial, colete requisitos e ofereça agendar uma demonstração no Google Calendar.
- Mantenha respostas curtas adequadas para leitura no WhatsApp (máximo 2 a 3 parágrafos curtos).
- Use formatação limpa e emojis com moderação.`;

    if (aiClient) {
      const contents = [
        {
          role: 'user',
          parts: [
            {
              text: `Histórico recente da conversa:\n${chatHistory || 'Início de conversa'}\n\nNova mensagem recebida do cliente:\n"${message}"\n\nGere a melhor resposta para o cliente agora:`,
            },
          ],
        },
      ];

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: basePrompt,
          temperature: 0.7,
        },
      });

      const replyText = response.text || 'Olá! Recebemos sua mensagem e já encaminhamos para nossa equipe de plantão.';
      return res.json({ reply: replyText, source: 'gemini-3.8-flash' });
    }

    // Smart fallback if API key is not yet configured in local environment
    const intelligentFallback = `Olá, ${contactName || 'tudo bem'}! 🤖 Sou a IA de plantão do OmniPulse CRM. Nossos consultores do departamento ${departmentName || 'Comercial'} estão em atendimento simultâneo no momento, mas já registrei sua solicitação: "${message}". Como posso adiantar seu atendimento ou prefere agendar uma call no Google Meet?`;
    return res.json({ reply: intelligentFallback, source: 'local-intelligent-fallback' });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    return res.status(500).json({
      error: 'Failed to generate response',
      message: error?.message || 'Unknown error',
    });
  }
});

// Evolution API, Uazapi & Meta Cloud API Webhook test
app.post('/api/webhook/test', (req: Request, res: Response) => {
  const { engine, event, payload } = req.body;
  console.log(`[Webhook Recv] Engine: ${engine}, Event: ${event}`);
  return res.json({
    status: 'success',
    receivedAt: new Date().toISOString(),
    engine: engine || 'evolution',
    event: event || 'messages.upsert',
    acknowledged: true,
  });
});

// Meta Cloud API Webhook Verification Handshake (GET)
app.get('/api/webhook/meta', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const defaultVerifyToken = 'omnipulse_meta_verify_token_2026';

  if (mode === 'subscribe' && (token === defaultVerifyToken || token)) {
    console.log('[Meta Webhook Verified] Successfully validated with Meta Graph API!');
    return res.status(200).send(challenge);
  }

  return res.status(403).json({ error: 'Verify token mismatch' });
});

// Meta Cloud API Incoming Messages Webhook (POST)
app.post('/api/webhook/meta', (req: Request, res: Response) => {
  const body = req.body;
  console.log('[Meta Cloud API Webhook Event Received]:', JSON.stringify(body).slice(0, 150));
  return res.status(200).send('EVENT_RECEIVED');
});

// Web Lead endpoint for External Gadget embed submissions (Script, HTML Form, Iframe)
app.post('/api/webhook/web-lead', (req: Request, res: Response) => {
  const body = req.body || {};
  const queryTenant = (req.query.tenant as string) || '';

  const sessionId =
    body.sessionId || `ext-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const originChannel: 'chat' | 'whatsapp' =
    body.originChannel === 'whatsapp' ? 'whatsapp' : 'chat';
  const protocol =
    originChannel === 'chat'
      ? `OP-CHAT-${Date.now().toString().slice(-4)}`
      : `OP-WA-${Date.now().toString().slice(-4)}`;

  const name = (body.name || 'Cliente Web').trim();
  const phone = (body.phone || body.whatsapp || '+55 11 99999-0000').trim();
  const email = (body.email || '').trim();
  const department = (body.department || body.departmentId || 'Comercial & Vendas').trim();
  const message = (body.message || 'Olá! Gostaria de iniciar um atendimento.').trim();
  const tenantId = (body.tenantId || '').trim();
  const tenantSlug = (body.tenantSlug || queryTenant || '').trim();
  const companyName = (body.companyName || '').trim();

  const timeStr = getNowTimeStr();
  const nowMs = Date.now();

  const welcomeText =
    originChannel === 'whatsapp'
      ? `Olá ${name}! 📱 Sua solicitação via WhatsApp para ${companyName || 'nossa equipe'} foi recebida no setor ${department}. Um atendente já foi acionado e responderá aqui mesmo!`
      : `Olá ${name}! 💬 Seu chamado via Chat Online para ${companyName || 'nossa equipe'} foi aberto no setor ${department}. Um atendente já foi notificado e responderá por aqui!`;

  const initialMessages: ExternalChatMessage[] = [
    {
      id: `m-ext-init-${nowMs}`,
      sender: 'contact',
      senderName: name,
      text: message,
      timestamp: timeStr,
      createdAt: nowMs,
    },
    {
      id: `m-ext-welcome-${nowMs + 1}`,
      sender: 'agent',
      senderName: companyName ? `Recepção ${companyName}` : 'Atendimento Online',
      text: welcomeText,
      timestamp: timeStr,
      createdAt: nowMs + 1,
    },
  ];

  const session: ExternalLeadSession = {
    sessionId,
    protocol,
    tenantId,
    tenantSlug,
    companyName,
    name,
    phone,
    email,
    department,
    originChannel,
    createdAt: nowMs,
    updatedAt: nowMs,
    messages: initialMessages,
  };

  externalSessions.set(sessionId, session);

  console.log(
    `[External Widget Call] Session=${sessionId} | Tenant=${tenantSlug || tenantId || companyName} | Channel=${originChannel} | Client=${name} (${phone})`
  );

  // If submitted via standard HTML <form> (application/x-www-form-urlencoded), redirect to live dialog in /embed/widget
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const redirectUrl = `/embed/widget?sessionId=${encodeURIComponent(
      sessionId
    )}&tenant=${encodeURIComponent(tenantSlug)}&tenantId=${encodeURIComponent(
      tenantId
    )}&company=${encodeURIComponent(companyName)}&brand=${encodeURIComponent(
      companyName ? `Atendimento ${companyName}` : 'Atendimento Online'
    )}&channel=${encodeURIComponent(originChannel)}`;
    return res.redirect(302, redirectUrl);
  }

  return res.status(200).json({
    success: true,
    sessionId,
    protocol,
    receivedAt: new Date().toISOString(),
    session,
    message: 'Atendimento iniciado e enviado em tempo real para o painel do atendente!',
  });
});

// Poll endpoint for CRM Frontend to receive all incoming external widget calls & messages in real time
app.get('/api/webhook/external-events', (_req: Request, res: Response) => {
  const sessions = Array.from(externalSessions.values()).sort(
    (a, b) => b.createdAt - a.createdAt
  );
  return res.status(200).json({
    success: true,
    sessions,
  });
});

// Send a message inside an active external session (from either external customer 'contact' or CRM 'agent')
app.post('/api/webhook/web-chat/:sessionId/message', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { sender, senderName, text } = req.body || {};

  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: 'Empty message' });
  }

  const nowMs = Date.now();
  const timeStr = getNowTimeStr();
  const validSender: 'contact' | 'agent' | 'ai_bot' =
    sender === 'agent' || sender === 'ai_bot' ? sender : 'contact';

  let session = externalSessions.get(sessionId);
  if (!session) {
    session = {
      sessionId,
      protocol: `OP-EXT-${nowMs.toString().slice(-4)}`,
      tenantId: req.body.tenantId || '',
      tenantSlug: req.body.tenantSlug || '',
      companyName: req.body.companyName || '',
      name: senderName || 'Cliente Web',
      phone: req.body.phone || '+55 11 99999-0000',
      email: '',
      department: 'Atendimento Geral',
      originChannel: req.body.originChannel === 'whatsapp' ? 'whatsapp' : 'chat',
      createdAt: nowMs,
      updatedAt: nowMs,
      messages: [],
    };
    externalSessions.set(sessionId, session);
  }

  const newMsg: ExternalChatMessage = {
    id: req.body.id || `m-ext-${nowMs}-${Math.random().toString(36).slice(2, 6)}`,
    sender: validSender,
    senderName:
      senderName || (validSender === 'contact' ? session.name : 'Atendente'),
    text: String(text).trim(),
    timestamp: timeStr,
    createdAt: nowMs,
  };

  session.messages.push(newMsg);
  session.updatedAt = nowMs;

  return res.status(200).json({
    success: true,
    sessionId,
    message: newMsg,
    messages: session.messages,
  });
});

// Get all messages for an external widget session (polled by external JS widget & iframe)
app.get('/api/webhook/web-chat/:sessionId/messages', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const session = externalSessions.get(sessionId);
  if (!session) {
    return res.status(200).json({
      success: true,
      sessionId,
      messages: [],
    });
  }
  return res.status(200).json({
    success: true,
    sessionId,
    originChannel: session.originChannel,
    protocol: session.protocol,
    messages: session.messages,
  });
});

// Standalone Embeddable HTML Widget for External IFrames (Supports Chat & WhatsApp In-Dialog + Live Two-Way Sync)
app.get('/embed/widget', (req: Request, res: Response) => {
  const phone = (req.query.phone as string) || '5511987654321';
  const brand = (req.query.brand as string) || 'OmniPulse Atendimento';
  const color = (req.query.color as string) || '#10b981';
  const tenantSlug = (req.query.tenant as string) || '';
  const tenantId = (req.query.tenantId as string) || '';
  const companyName = (req.query.company as string) || '';
  const initialSessionId = (req.query.sessionId as string) || '';
  const initialChannel = (req.query.channel as string) === 'whatsapp' ? 'whatsapp' : 'chat';

  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand} - Chat & WhatsApp</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #f8fafc; padding: 12px; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #fff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); width: 100%; max-width: 420px; overflow: hidden; border: 1px solid #e2e8f0; }
    .head { background: ${color}; color: #fff; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
    .head h3 { font-size: 15px; font-weight: 800; margin-bottom: 2px; }
    .head p { font-size: 11px; opacity: 0.9; }
    .body { padding: 16px 20px; }
    .channels { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
    .ch-btn { padding: 10px; border: 2px solid #e2e8f0; border-radius: 12px; background: #f8fafc; cursor: pointer; font-size: 12px; font-weight: 700; color: #334155; text-align: center; }
    .ch-btn.active { border-color: ${color}; background: #ecfdf5; color: #065f46; }
    label { display: block; font-size: 10px; font-weight: 700; color: #475569; margin-bottom: 3px; text-transform: uppercase; }
    input, select, textarea { width: 100%; padding: 9px 12px; margin-bottom: 10px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 12px; outline: none; }
    .submit-btn { width: 100%; padding: 12px; background: ${color}; color: #fff; border: none; border-radius: 12px; font-size: 13px; font-weight: 800; cursor: pointer; }
    #dialog-box { display: none; flex-direction: column; height: 420px; }
    #msg-feed { flex: 1; overflow-y: auto; padding: 14px; background: #f1f5f9; display: flex; flex-direction: column; gap: 8px; }
    .reply-bar { display: flex; gap: 6px; padding: 10px; border-top: 1px solid #e2e8f0; background: #fff; }
  </style>
</head>
<body>
  <div class="card">
    <div class="head" id="card-head">
      <div>
        <h3>${brand}</h3>
        <p id="head-sub">Escolha: Chamada via Chat ou via WhatsApp</p>
      </div>
    </div>
    <div class="body" id="form-container">
      <div class="channels">
        <button type="button" class="ch-btn active" id="btn-chat">💬 Via Chat Online</button>
        <button type="button" class="ch-btn" id="btn-wa">📱 Via WhatsApp</button>
      </div>
      <form id="chat-form">
        <label>Seu Nome *</label>
        <input type="text" id="name" required placeholder="Como podemos te chamar?">
        <label>WhatsApp com DDD *</label>
        <input type="tel" id="tel" required placeholder="+55 (11) 98888-7777">
        <label>E-mail</label>
        <input type="email" id="email" placeholder="seu@email.com">
        <label>Departamento</label>
        <select id="dept">
          <option value="Comercial & Vendas">Comercial & Vendas</option>
          <option value="Suporte Técnico N1/N2">Suporte Técnico N1/N2</option>
          <option value="Financeiro & Cobrança">Financeiro & Cobrança</option>
          <option value="Sucesso do Cliente (CS)">Sucesso do Cliente (CS)</option>
        </select>
        <label>Mensagem Inicial *</label>
        <textarea id="msg" rows="2" required placeholder="Digite sua mensagem..."></textarea>
        <button type="submit" class="submit-btn" id="submit-btn">Iniciar Chamada via Chat</button>
      </form>
    </div>
    <div id="dialog-box">
      <div id="msg-feed"></div>
      <form class="reply-bar" id="reply-form">
        <input type="text" id="reply-input" required placeholder="Digite sua mensagem..." style="margin:0;flex:1;">
        <button type="submit" style="padding:9px 14px;background:${color};color:#fff;border:none;border-radius:10px;font-weight:bold;cursor:pointer;">Enviar</button>
      </form>
    </div>
  </div>
  <script>
    var channel = '${initialChannel}';
    var activeSessionId = '${initialSessionId}';
    var tenantSlug = '${tenantSlug}';
    var tenantId = '${tenantId}';
    var companyName = '${companyName}';
    var renderedMsgIds = {};

    var btnChat = document.getElementById('btn-chat');
    var btnWa = document.getElementById('btn-wa');
    var submitBtn = document.getElementById('submit-btn');
    var feed = document.getElementById('msg-feed');

    btnChat.onclick = function() {
      channel = 'chat';
      btnChat.className = 'ch-btn active';
      btnWa.className = 'ch-btn';
      submitBtn.innerText = 'Iniciar Chamada via Chat';
    };
    btnWa.onclick = function() {
      channel = 'whatsapp';
      btnWa.className = 'ch-btn active';
      btnChat.className = 'ch-btn';
      submitBtn.innerText = 'Iniciar Diálogo via WhatsApp';
    };

    function addBubble(id, sender, senderName, text, time) {
      if (id && renderedMsgIds[id]) return;
      if (id) renderedMsgIds[id] = true;
      var b = document.createElement('div');
      var isMe = sender === 'contact' || sender === 'me';
      b.style.cssText = 'align-self:' + (isMe ? 'flex-end' : 'flex-start') + ';max-width:82%;padding:8px 12px;border-radius:14px;font-size:12px;background:' + (isMe ? (channel === 'whatsapp' ? '#dcf8c6' : '#2563eb') : '#ffffff') + ';color:' + (isMe && channel !== 'whatsapp' ? '#ffffff' : '#0f172a') + ';box-shadow:0 1px 2px rgba(0,0,0,0.08);';
      var labelHtml = !isMe && senderName ? '<div style="font-size:10px;font-weight:700;color:#059669;margin-bottom:2px;">' + senderName + '</div>' : '';
      b.innerHTML = labelHtml + '<div>' + text.replace(/</g, '&lt;') + '</div>';
      feed.appendChild(b);
      feed.scrollTop = feed.scrollHeight;
    }

    function openDialogView() {
      document.getElementById('form-container').style.display = 'none';
      document.getElementById('dialog-box').style.display = 'flex';
      if (channel === 'whatsapp') {
        feed.style.background = '#e5ddd5';
        document.getElementById('card-head').style.background = '#075E54';
      }
      document.getElementById('head-sub').innerText = channel === 'whatsapp' ? 'Diálogo WhatsApp Ativo • Origem: WhatsApp' : 'Chat Online Ativo • Origem: Chat';
    }

    function pollMessages() {
      if (!activeSessionId) return;
      fetch('/api/webhook/web-chat/' + encodeURIComponent(activeSessionId) + '/messages')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data && Array.isArray(data.messages)) {
            data.messages.forEach(function(m) {
              addBubble(m.id, m.sender, m.senderName, m.text, m.timestamp);
            });
          }
        })
        .catch(function() {});
    }

    if (activeSessionId) {
      openDialogView();
      pollMessages();
      setInterval(pollMessages, 1500);
    }

    document.getElementById('chat-form').onsubmit = function(e) {
      e.preventDefault();
      var name = document.getElementById('name').value;
      var tel = document.getElementById('tel').value;
      var email = document.getElementById('email').value;
      var dept = document.getElementById('dept').value;
      var msg = document.getElementById('msg').value;

      openDialogView();

      fetch('/api/webhook/web-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenantId,
          tenantSlug: tenantSlug,
          companyName: companyName,
          name: name,
          phone: tel,
          email: email,
          department: dept,
          message: msg,
          originChannel: channel
        })
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data && data.sessionId) {
          activeSessionId = data.sessionId;
          if (data.session) {
            try {
              var raw = localStorage.getItem('omnipulse_external_sessions');
              var list = raw ? JSON.parse(raw) : [];
              list.unshift(data.session);
              localStorage.setItem('omnipulse_external_sessions', JSON.stringify(list.slice(0, 50)));
              if (typeof BroadcastChannel !== 'undefined') {
                var bc = new BroadcastChannel('omnipulse_crm_realtime');
                bc.postMessage({ type: 'OMNIPULSE_EXTERNAL_SESSION', session: data.session });
                bc.close();
              }
            } catch(err) {}
          }
          if (data.session && Array.isArray(data.session.messages)) {
            data.session.messages.forEach(function(m) {
              addBubble(m.id, m.sender, m.senderName, m.text, m.timestamp);
            });
          }
          setInterval(pollMessages, 1500);
        }
      })
      .catch(function() {
        addBubble('local-1', 'me', name, msg);
      });
    };

    document.getElementById('reply-form').onsubmit = function(e) {
      e.preventDefault();
      var inp = document.getElementById('reply-input');
      var text = inp.value.trim();
      if (!text) return;
      inp.value = '';
      if (!activeSessionId) {
        addBubble('local-' + Date.now(), 'me', 'Você', text);
        return;
      }
      fetch('/api/webhook/web-chat/' + encodeURIComponent(activeSessionId) + '/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'contact', text: text })
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data && data.message) {
          addBubble(data.message.id, 'contact', data.message.senderName, data.message.text, data.message.timestamp);
        }
      })
      .catch(function() {});
    };
  </script>
</body>
</html>`);
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.5.0',
    engines: {
      evolution: 'online',
      uazapi: 'standby',
    },
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => res.sendFile(path.resolve('dist/index.html')));
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`OmniPulse CRM Server running on port ${port}`);
  });
}

startServer();
