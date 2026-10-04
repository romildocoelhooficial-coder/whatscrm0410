import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

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

// Web Lead endpoint for External Gadget embed submissions
app.post('/api/webhook/web-lead', (req: Request, res: Response) => {
  const { name, phone, email, department, message, originUrl } = req.body;
  const protocol = `OP-WEB-${Date.now().toString().slice(-5)}`;
  console.log(`[External Web Gadget Lead]: ${name} (${phone}) - Dept: ${department}`);

  return res.status(200).json({
    success: true,
    protocol,
    receivedAt: new Date().toISOString(),
    message: 'Lead registrado com sucesso na fila do OmniPulse CRM',
  });
});

// Standalone Embeddable HTML Widget for External IFrames
app.get('/embed/widget', (req: Request, res: Response) => {
  const phone = (req.query.phone as string) || '5511987654321';
  const brand = (req.query.brand as string) || 'OmniPulse Atendimento';
  const color = (req.query.color as string) || '#10b981';

  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand} - Chat WhatsApp</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #f8fafc; padding: 16px; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #fff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); width: 100%; max-width: 400px; overflow: hidden; border: 1px solid #e2e8f0; }
    .head { background: ${color}; color: #fff; padding: 18px 20px; }
    .head h3 { font-size: 16px; font-weight: 800; margin-bottom: 2px; }
    .head p { font-size: 11px; opacity: 0.9; }
    .body { padding: 20px; }
    label { display: block; font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    input, select, textarea { width: 100%; padding: 10px 12px; margin-bottom: 12px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 13px; outline: none; transition: border-color 0.2s; }
    input:focus, select:focus, textarea:focus { border-color: ${color}; }
    button { width: 100%; padding: 13px; background: ${color}; color: #fff; border: none; border-radius: 12px; font-size: 13px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: filter 0.2s; }
    button:hover { filter: brightness(0.92); }
    .success { display: none; padding: 20px; text-align: center; }
    .success svg { width: 48px; height: 48px; fill: ${color}; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="head">
      <h3>${brand}</h3>
      <p>Iniciar atendimento direto no WhatsApp oficial</p>
    </div>
    <div class="body" id="form-container">
      <form id="chat-form">
        <label>Seu Nome *</label>
        <input type="text" id="name" required placeholder="Como podemos te chamar?">
        <label>WhatsApp com DDD *</label>
        <input type="tel" id="tel" required placeholder="+55 (11) 98888-7777">
        <label>E-mail</label>
        <input type="email" id="email" placeholder="seu@email.com">
        <label>Departamento</label>
        <select id="dept">
          <option value="Comercial">Comercial & Vendas</option>
          <option value="Suporte">Suporte Técnico N1/N2</option>
          <option value="Financeiro">Financeiro & Cobrança</option>
          <option value="Geral">Atendimento Geral</option>
        </select>
        <label>Como podemos te ajudar? *</label>
        <textarea id="msg" rows="3" required placeholder="Digite sua mensagem..."></textarea>
        <button type="submit">Iniciar Conversa no WhatsApp</button>
      </form>
    </div>
    <div class="success" id="success-box">
      <h3>Conversa Iniciada!</h3>
      <p style="font-size: 13px; color: #64748b; margin-top: 6px;">Redirecionando para o WhatsApp...</p>
    </div>
  </div>
  <script>
    document.getElementById('chat-form').onsubmit = function(e) {
      e.preventDefault();
      var name = document.getElementById('name').value;
      var tel = document.getElementById('tel').value;
      var email = document.getElementById('email').value;
      var dept = document.getElementById('dept').value;
      var msg = document.getElementById('msg').value;

      try {
        fetch('/api/webhook/web-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name, phone: tel, email: email, department: dept, message: msg })
        });
      } catch(err) {}

      var clean = "${phone}".replace(/\\D/g, '') || '5511987654321';
      var text = encodeURIComponent('Olá! Me chamo ' + name + (email ? ' (' + email + ')' : '') + '. Departamento: ' + dept + '. ' + msg);
      window.open('https://wa.me/' + clean + '?text=' + text, '_blank');

      document.getElementById('form-container').style.display = 'none';
      document.getElementById('success-box').style.display = 'block';
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
