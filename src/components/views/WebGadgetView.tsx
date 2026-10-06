import React, { useState, useRef, useEffect } from 'react';
import {
  Code,
  Copy,
  Check,
  Sliders,
  ExternalLink,
  MessageSquare,
  Eye,
  Phone,
  ShieldCheck,
  Send,
  Laptop,
  CheckCircle2,
  Globe,
  RefreshCw,
  Headphones,
  Bot,
  CheckCheck,
  User,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const WebGadgetView: React.FC = () => {
  const {
    webGadgetConfig,
    updateWebGadgetConfig,
    departments,
    gatewayConfig,
    setIsGadgetFloatingOpen,
    startChatFromGadget,
    sendChatMessage,
    tickets,
    currentAgent,
    currentTenant,
    setActiveView,
    setSelectedTicket,
  } = useCRM();

  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'simulator' | 'script' | 'html' | 'iframe'>('simulator');

  // Simulator state
  const [simName, setSimName] = useState('Mariana Alves');
  const [simPhone, setSimPhone] = useState('+55 11 98877-6655');
  const [simEmail, setSimEmail] = useState('mariana@empresa.com.br');
  const [simDept, setSimDept] = useState(departments[0]?.id || 'dept-01');
  const [simMessage, setSimMessage] = useState('Olá! Gostaria de falar com o time sobre a demonstração da plataforma.');
  const [simChannel, setSimChannel] = useState<'chat' | 'whatsapp'>('chat');
  const [simActiveTicketId, setSimActiveTicketId] = useState<string | null>(null);

  // Live messaging state inside the Simulator Dialog Box
  const [simClientInput, setSimClientInput] = useState('');
  const [simAgentInput, setSimAgentInput] = useState('');

  const simMessagesEndRef = useRef<HTMLDivElement | null>(null);

  const liveSimTicket = simActiveTicketId
    ? tickets.find((t) => t.id === simActiveTicketId) || null
    : null;

  useEffect(() => {
    if (liveSimTicket && simMessagesEndRef.current) {
      simMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveSimTicket?.messages.length]);

  const companyPhone = currentTenant?.primaryPhoneNumber || gatewayConfig.primaryPhoneNumber || '+55 11 98765-4321';
  const cleanPhone = companyPhone.replace(/\D/g, '') || '5511987654321';
  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://crm.omnipulse.io';

  // 100% Self-Contained Autonomous JavaScript Snippet for External Sites (Scoped to this Company ONLY!)
  const standaloneScriptCode = `<!-- ==================================================== -->
<!-- GADGET & FORMULÁRIO EXCLUSIVO DA EMPRESA: ${(currentTenant?.name || 'EMPRESA').toUpperCase()} -->
<!-- Tenant ID: ${currentTenant?.id} | Rota: /?empresa=${currentTenant?.slug} -->
<!-- Cole este código antes da tag </body> do site da sua empresa -->
<!-- ==================================================== -->
<script>
(function() {
  var config = {
    tenantId: "${currentTenant?.id || 'tenant-omnipulse'}",
    tenantSlug: "${currentTenant?.slug || 'omnipulse-sp'}",
    companyName: "${currentTenant?.name || 'OmniPulse'}",
    phone: "${cleanPhone}",
    brandTitle: "${webGadgetConfig.brandTitle}",
    brandSubtitle: "${webGadgetConfig.brandSubtitle}",
    primaryColor: "${webGadgetConfig.primaryColor || '#10B981'}",
    position: "${webGadgetConfig.buttonPosition || 'bottom-right'}",
    greeting: "${webGadgetConfig.greetingMessage.replace(/"/g, '\\"')}",
    departments: ${JSON.stringify(departments.map((d) => ({ id: d.id, name: d.name })))},
    apiOrigin: "${appOrigin}",
    webhookUrl: "${appOrigin}/api/webhook/web-lead?tenant=${encodeURIComponent(currentTenant?.slug || '')}"
  };

  var root = document.createElement('div');
  root.id = 'omnipulse-hybrid-widget';
  document.body.appendChild(root);

  var isLeft = config.position === 'bottom-left';
  var posCss = isLeft ? 'left: 20px; bottom: 20px;' : 'right: 20px; bottom: 20px;';

  var style = document.createElement('style');
  style.innerHTML = \`
    #omni-bubble-btn {
      position: fixed; \${posCss} z-index: 999999;
      padding: 14px 20px; border-radius: 999px;
      background: \${config.primaryColor}; color: #ffffff;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      border: none; cursor: pointer; display: flex;
      align-items: center; justify-content: center; gap: 10px;
      font-family: sans-serif; font-weight: bold; font-size: 13px;
      transition: all 0.25s ease;
    }
    #omni-bubble-btn:hover { transform: scale(1.05); }
    #omni-chat-modal {
      display: none; position: fixed; \${posCss} z-index: 999999;
      width: 380px; max-width: calc(100vw - 32px);
      background: #ffffff; border-radius: 24px;
      box-shadow: 0 20px 50px rgba(15,23,42,0.25);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden; border: 1px solid #e2e8f0;
    }
    .omni-head {
      background: \${config.primaryColor}; color: #ffffff;
      padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;
    }
    .omni-content { padding: 16px 20px; max-height: 75vh; overflow-y: auto; text-align: left; }
    .omni-field {
      width: 100%; padding: 9px 12px; margin-bottom: 10px;
      border: 1px solid #cbd5e1; border-radius: 10px; font-size: 12px; box-sizing: border-box;
    }
    .omni-channels { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
    .omni-ch-btn {
      padding: 10px; border: 2px solid #e2e8f0; border-radius: 12px; background: #f8fafc;
      cursor: pointer; font-weight: bold; font-size: 12px; text-align: center;
    }
    .omni-ch-btn.active { border-color: \${config.primaryColor}; background: #ecfdf5; color: #065f46; }
    .omni-btn-send {
      width: 100%; padding: 12px; background: \${config.primaryColor};
      color: #ffffff; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 13px;
    }
  \`;
  document.head.appendChild(style);

  var currentChannel = 'chat';
  var activeSessionId = '';
  var renderedMsgIds = {};

  // Hidden Cross-Domain Real-Time Bridge Iframe (Connects External Site directly to CRM Attendant Inbox & Sound Chime)
  var bridgeFrame = document.createElement('iframe');
  bridgeFrame.style.cssText = 'display:none;width:0;height:0;border:0;position:absolute;';
  bridgeFrame.src = config.apiOrigin + '/?embed=bridge&tenant=' + encodeURIComponent(config.tenantSlug) + '&tenantId=' + encodeURIComponent(config.tenantId);
  document.body.appendChild(bridgeFrame);

  window.addEventListener('message', function(ev) {
    var d = ev.data;
    if (d && d.type === 'OMNIPULSE_AGENT_REPLY' && d.sessionId === activeSessionId && d.message) {
      appendBubble(d.message.id, d.message.sender, d.message.senderName, d.message.text);
    }
  });

  root.innerHTML = \`
    <button id="omni-bubble-btn">💬 Iniciar Atendimento (Chat / WhatsApp)</button>
    <div id="omni-chat-modal">
      <div class="omni-head" id="omni-modal-head">
        <div>
          <div style="font-weight:800;font-size:15px;">\${config.brandTitle}</div>
          <div style="font-size:11px;opacity:0.9;">\${config.brandSubtitle}</div>
        </div>
        <button id="omni-close-x" style="background:none;border:none;color:#fff;font-size:22px;cursor:pointer;">&times;</button>
      </div>
      <div class="omni-content" id="omni-form-step">
        <p style="font-size:12px;color:#475569;margin:0 0 10px 0;">\${config.greeting}</p>
        <div class="omni-channels">
          <button type="button" class="omni-ch-btn active" id="ch-chat">💬 Via Chat Online</button>
          <button type="button" class="omni-ch-btn" id="ch-wa">📱 Via WhatsApp</button>
        </div>
        <form id="omni-lead-form">
          <input class="omni-field" type="text" id="omni-name" required placeholder="Seu Nome Completo *" />
          <input class="omni-field" type="tel" id="omni-phone" required placeholder="WhatsApp com DDD *" />
          <input class="omni-field" type="email" id="omni-email" placeholder="Seu E-mail" />
          <select class="omni-field" id="omni-dept">
            \${config.departments.map(function(d) { return '<option value="' + d.name + '">' + d.name + '</option>'; }).join('')}
          </select>
          <textarea class="omni-field" id="omni-msg" rows="2" required placeholder="Como podemos ajudar? *"></textarea>
          <button type="submit" class="omni-btn-send" id="omni-submit-btn">Iniciar Atendimento via Chat</button>
        </form>
      </div>
      <div class="omni-content" id="omni-dialog-step" style="display:none;padding:0;">
        <div id="omni-messages" style="height:280px;overflow-y:auto;padding:14px;background:#f1f5f9;display:flex;flex-direction:column;gap:8px;"></div>
        <form id="omni-reply-form" style="display:flex;gap:6px;padding:10px;border-top:1px solid #e2e8f0;background:#fff;">
          <input type="text" id="omni-reply-input" required placeholder="Digite sua mensagem..." style="flex:1;padding:8px 12px;border:1px solid #cbd5e1;border-radius:10px;font-size:12px;" />
          <button type="submit" style="padding:8px 14px;background:\${config.primaryColor};color:#fff;border:none;border-radius:10px;font-weight:bold;cursor:pointer;">Enviar</button>
        </form>
      </div>
    </div>
  \`;

  var bubbleBtn = document.getElementById('omni-bubble-btn');
  var chatModal = document.getElementById('omni-chat-modal');
  var closeX = document.getElementById('omni-close-x');
  var chChat = document.getElementById('ch-chat');
  var chWa = document.getElementById('ch-wa');
  var submitBtn = document.getElementById('omni-submit-btn');
  var formStep = document.getElementById('omni-form-step');
  var dialogStep = document.getElementById('omni-dialog-step');
  var messagesBox = document.getElementById('omni-messages');

  chChat.onclick = function() {
    currentChannel = 'chat';
    chChat.className = 'omni-ch-btn active';
    chWa.className = 'omni-ch-btn';
    submitBtn.innerText = 'Iniciar Atendimento via Chat';
  };
  chWa.onclick = function() {
    currentChannel = 'whatsapp';
    chWa.className = 'omni-ch-btn active';
    chChat.className = 'omni-ch-btn';
    submitBtn.innerText = 'Iniciar Diálogo via WhatsApp';
  };
  bubbleBtn.onclick = function() { chatModal.style.display = 'block'; bubbleBtn.style.display = 'none'; };
  closeX.onclick = function() { chatModal.style.display = 'none'; bubbleBtn.style.display = 'flex'; };

  function appendBubble(id, sender, senderName, text) {
    if (id && renderedMsgIds[id]) return;
    if (id) renderedMsgIds[id] = true;
    var div = document.createElement('div');
    var isMe = sender === 'client' || sender === 'contact';
    div.style.cssText = 'align-self:' + (isMe ? 'flex-end' : 'flex-start') + ';max-width:82%;padding:8px 12px;border-radius:14px;font-size:12px;background:' + (isMe ? (currentChannel === 'whatsapp' ? '#dcf8c6' : '#2563eb') : '#ffffff') + ';color:' + (isMe && currentChannel !== 'whatsapp' ? '#ffffff' : '#0f172a') + ';box-shadow:0 1px 2px rgba(0,0,0,0.08);';
    var headerHtml = !isMe && senderName ? '<div style="font-size:10px;font-weight:700;color:#059669;margin-bottom:2px;">' + senderName + '</div>' : '';
    div.innerHTML = headerHtml + '<div>' + String(text).replace(/</g, '&lt;') + '</div>';
    messagesBox.appendChild(div);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  function pollRemoteMessages() {
    if (!activeSessionId) return;
    fetch(config.apiOrigin + '/api/webhook/web-chat/' + encodeURIComponent(activeSessionId) + '/messages')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data && Array.isArray(data.messages)) {
          data.messages.forEach(function(m) {
            appendBubble(m.id, m.sender, m.senderName, m.text);
          });
        }
      })
      .catch(function() {});
  }

  document.getElementById('omni-lead-form').onsubmit = function(e) {
    e.preventDefault();
    var name = document.getElementById('omni-name').value;
    var phone = document.getElementById('omni-phone').value;
    var email = document.getElementById('omni-email').value;
    var dept = document.getElementById('omni-dept').value;
    var msg = document.getElementById('omni-msg').value;

    formStep.style.display = 'none';
    dialogStep.style.display = 'block';
    if (currentChannel === 'whatsapp') {
      messagesBox.style.background = '#e5ddd5';
    }

    var nowMs = Date.now();
    var dNow = new Date();
    var timeStr = ('0' + dNow.getHours()).slice(-2) + ':' + ('0' + dNow.getMinutes()).slice(-2);
    activeSessionId = 'ext-' + nowMs + '-' + Math.random().toString(36).slice(2, 6);
    var protocol = (currentChannel === 'chat' ? 'OP-CHAT-' : 'OP-WA-') + String(nowMs).slice(-4);
    var welcomeText = 'Olá ' + name + '! Recebemos sua mensagem via ' + (currentChannel === 'whatsapp' ? 'WhatsApp' : 'Chat Online') + ' para ' + config.companyName + ' no setor ' + dept + '. Um atendente já foi acionado e responderá aqui mesmo!';

    var initMsgs = [
      { id: 'm-ext-init-' + nowMs, sender: 'contact', senderName: name, text: msg, timestamp: timeStr, createdAt: nowMs },
      { id: 'm-ext-welcome-' + (nowMs + 1), sender: 'agent', senderName: 'Atendimento ' + config.companyName, text: welcomeText, timestamp: timeStr, createdAt: nowMs + 1 }
    ];

    initMsgs.forEach(function(m) {
      appendBubble(m.id, m.sender, m.senderName, m.text);
    });

    var sessionObj = {
      sessionId: activeSessionId,
      protocol: protocol,
      tenantId: config.tenantId,
      tenantSlug: config.tenantSlug,
      companyName: config.companyName,
      name: name,
      phone: phone,
      email: email,
      department: dept,
      originChannel: currentChannel,
      createdAt: nowMs,
      updatedAt: nowMs,
      messages: initMsgs
    };

    fetch('https://ntfy.sh/omnipulse_live_hub_2026_v4', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({ type: 'OMNIPULSE_EXTERNAL_SESSION', session: sessionObj })
    }).catch(function() {});

    try {
      if (bridgeFrame && bridgeFrame.contentWindow) {
        bridgeFrame.contentWindow.postMessage({ type: 'OMNIPULSE_EXTERNAL_SESSION', session: sessionObj }, '*');
      }
    } catch(err) {}

    try {
      var beaconImg = new Image();
      beaconImg.src = config.apiOrigin + '/api/webhook/web-lead-beacon?d=' + encodeURIComponent(JSON.stringify({
        sessionId: activeSessionId,
        protocol: protocol,
        tenantId: config.tenantId,
        tenantSlug: config.tenantSlug,
        companyName: config.companyName,
        name: name,
        phone: phone,
        email: email,
        department: dept,
        message: msg,
        originChannel: currentChannel
      })) + '&_t=' + nowMs;
    } catch(err) {}

    if (window.location.origin !== config.apiOrigin) {
      try {
        var syncWin = window.open(
          config.apiOrigin + '/?embed=sync&data=' + encodeURIComponent(JSON.stringify({ type: 'OMNIPULSE_EXTERNAL_SESSION', session: sessionObj })),
          'omnipulse_sync_pulse',
          'width=80,height=60,left=9999,top=9999,menubar=no,toolbar=no,location=no,status=no'
        );
        if (syncWin) {
          setTimeout(function() { try { syncWin.close(); } catch(e) {} }, 450);
        }
      } catch(err) {}
    }

    try {
      if (typeof EventSource !== 'undefined') {
        var es = new EventSource('https://ntfy.sh/omnipulse_live_hub_2026_v4/sse');
        es.onmessage = function(ev) {
          try {
            var outer = JSON.parse(ev.data);
            if (outer && outer.event === 'message' && outer.message) {
              var inner = JSON.parse(outer.message);
              if (inner && inner.type === 'OMNIPULSE_AGENT_REPLY' && inner.sessionId === activeSessionId && inner.message) {
                appendBubble(inner.message.id, inner.message.sender, inner.message.senderName, inner.message.text);
              }
            }
          } catch(e) {}
        };
      }
    } catch(err) {}

    fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({
        sessionId: activeSessionId,
        protocol: protocol,
        tenantId: config.tenantId,
        tenantSlug: config.tenantSlug,
        companyName: config.companyName,
        name: name,
        phone: phone,
        email: email,
        department: dept,
        message: msg,
        originChannel: currentChannel
      })
    })
    .then(function(r) { return r.json(); })
    .then(function() {
      setInterval(pollRemoteMessages, 1500);
    })
    .catch(function() {
      setInterval(pollRemoteMessages, 1500);
    });
  };

  document.getElementById('omni-reply-form').onsubmit = function(e) {
    e.preventDefault();
    var inp = document.getElementById('omni-reply-input');
    var text = inp.value.trim();
    if (!text) return;
    inp.value = '';
    var nowMs = Date.now();
    var dNow = new Date();
    var timeStr = ('0' + dNow.getHours()).slice(-2) + ':' + ('0' + dNow.getMinutes()).slice(-2);
    var msgObj = {
      id: 'm-ext-' + nowMs + '-' + Math.random().toString(36).slice(2, 6),
      sender: 'contact',
      senderName: document.getElementById('omni-name').value || 'Cliente',
      text: text,
      timestamp: timeStr,
      createdAt: nowMs
    };
    appendBubble(msgObj.id, 'contact', msgObj.senderName, msgObj.text);

    if (!activeSessionId) return;

    fetch('https://ntfy.sh/omnipulse_live_hub_2026_v4', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({
        type: 'OMNIPULSE_CUSTOMER_MESSAGE',
        sessionId: activeSessionId,
        originChannel: currentChannel,
        message: msgObj
      })
    }).catch(function() {});

    try {
      if (bridgeFrame && bridgeFrame.contentWindow) {
        bridgeFrame.contentWindow.postMessage({
          type: 'OMNIPULSE_CUSTOMER_MESSAGE',
          sessionId: activeSessionId,
          message: msgObj
        }, '*');
      }
    } catch(err) {}

    fetch(config.apiOrigin + '/api/webhook/web-chat/' + encodeURIComponent(activeSessionId) + '/message', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({ id: msgObj.id, sender: 'contact', senderName: msgObj.senderName, text: text })
    }).catch(function() {});
  };
})();
</script>`;

  const htmlFormCode = `<!-- ============================================== -->
<!-- FORMULÁRIO HTML PURO EXCLUSIVO DA EMPRESA: ${(currentTenant?.name || 'EMPRESA').toUpperCase()} -->
<!-- Funciona em qualquer página externa (HTML local, WordPress, Elementor, Vercel) -->
<!-- ============================================== -->
<form action="${appOrigin}/" method="GET" target="_blank" class="omnipulse-clean-form" style="max-width: 480px; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; font-family: sans-serif; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
  <input type="hidden" name="embed" value="widget" />
  <input type="hidden" name="autoStart" value="1" />
  <input type="hidden" name="tenant" value="${currentTenant?.slug || ''}" />
  <input type="hidden" name="tenantId" value="${currentTenant?.id || ''}" />
  <input type="hidden" name="company" value="${currentTenant?.name || ''}" />
  <input type="hidden" name="phone" value="${cleanPhone}" />
  <input type="hidden" name="brand" value="${webGadgetConfig.brandTitle}" />
  <input type="hidden" name="color" value="${webGadgetConfig.primaryColor || '#10B981'}" />
  
  <h3 style="margin-top: 0; color: #0f172a;">${webGadgetConfig.brandTitle}</h3>
  <p style="font-size: 13px; color: #64748b;">${webGadgetConfig.greetingMessage}</p>

  <label style="display:block; font-size: 12px; font-weight: bold; margin-bottom: 6px;">Escolha o Canal de Atendimento:</label>
  <div style="display:flex; gap: 12px; margin-bottom: 12px; font-size: 13px;">
    <label><input type="radio" name="originChannel" value="chat" checked /> 💬 Via Chat Online</label>
    <label><input type="radio" name="originChannel" value="whatsapp" /> 📱 Via WhatsApp</label>
  </div>

  <label style="display:block; font-size: 12px; font-weight: bold; margin-bottom: 4px;">Nome Completo:</label>
  <input type="text" name="name" required placeholder="Seu nome" style="width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;" />

  <label style="display:block; font-size: 12px; font-weight: bold; margin-bottom: 4px;">WhatsApp (com DDD):</label>
  <input type="tel" name="whatsapp" required placeholder="+55 (11) 98888-7777" style="width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;" />

  <label style="display:block; font-size: 12px; font-weight: bold; margin-bottom: 4px;">E-mail Corporativo:</label>
  <input type="email" name="email" placeholder="seu@email.com" style="width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;" />

  <label style="display:block; font-size: 12px; font-weight: bold; margin-bottom: 4px;">Departamento:</label>
  <select name="department" style="width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;">
${departments.map((d) => `    <option value="${d.name}">${d.name}</option>`).join('\n')}
  </select>

  <label style="display:block; font-size: 12px; font-weight: bold; margin-bottom: 4px;">Mensagem:</label>
  <textarea name="message" rows="3" required placeholder="Como podemos ajudar?" style="width: 100%; padding: 10px; margin-bottom: 16px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;"></textarea>

  <button type="submit" style="width: 100%; padding: 12px; background-color: ${webGadgetConfig.primaryColor || '#10B981'}; color: #fff; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 14px;">
    Iniciar Atendimento Agora
  </button>
</form>`;

  const iframeCode = `<!-- ============================================== -->
<!-- WIDGET IFRAME EXCLUSIVO DA EMPRESA: ${(currentTenant?.name || 'EMPRESA').toUpperCase()} -->
<!-- Cole onde desejar exibir o widget de atendimento -->
<!-- ============================================== -->
<iframe
  src="${appOrigin}/?embed=widget&tenant=${encodeURIComponent(currentTenant?.slug || '')}&tenantId=${encodeURIComponent(currentTenant?.id || '')}&company=${encodeURIComponent(currentTenant?.name || '')}&phone=${cleanPhone}&brand=${encodeURIComponent(webGadgetConfig.brandTitle)}&color=${encodeURIComponent(webGadgetConfig.primaryColor)}"
  width="100%"
  height="560"
  allow="storage-access; autoplay; clipboard-write"
  style="border: none; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); max-width: 440px; display: block; margin: 0 auto;"
  title="Atendimento ${currentTenant?.name || 'OmniPulse'}"
></iframe>`;

  const handleCopy = (type: 'script' | 'html' | 'iframe') => {
    let text = standaloneScriptCode;
    if (type === 'html') text = htmlFormCode;
    if (type === 'iframe') text = iframeCode;

    navigator.clipboard.writeText(text);
    if (type === 'script') {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } else if (type === 'html') {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } else {
      setCopiedIframe(true);
      setTimeout(() => setCopiedIframe(false), 2000);
    }
  };

  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim() || !simPhone.trim() || !simMessage.trim()) return;

    const ticketId = await startChatFromGadget({
      name: simName.trim(),
      email: simEmail.trim(),
      phone: simPhone.trim(),
      departmentId: simDept,
      message: simMessage.trim(),
      channel: simChannel,
    });

    setSimActiveTicketId(ticketId);
  };

  const handleSendSimClientMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simClientInput.trim() || !liveSimTicket) return;
    const text = simClientInput.trim();
    setSimClientInput('');
    await sendChatMessage(liveSimTicket.id, text, 'contact');
  };

  const handleSendSimAgentMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simAgentInput.trim() || !liveSimTicket) return;
    const text = simAgentInput.trim();
    setSimAgentInput('');
    await sendChatMessage(liveSimTicket.id, text, 'agent');
  };

  const isSimWhatsApp = liveSimTicket
    ? liveSimTicket.originChannel === 'whatsapp'
    : simChannel === 'whatsapp';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full">
              Empresa: {currentTenant?.name}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              Código Habilitado Somente para Esta Empresa
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gadget & Formulário Web — {currentTenant?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Código de incorporação exclusivo da empresa <strong>{currentTenant?.name}</strong> (Linha vinculada: <strong>{companyPhone}</strong>) com opção de Chat Online ou WhatsApp
          </p>
        </div>

        <button
          onClick={() => setIsGadgetFloatingOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start md:self-auto"
        >
          <Eye className="w-4 h-4" />
          Abrir Widget Flutuante Ao Vivo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customization Settings (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-sm">
              Personalização do Widget
            </h2>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Título da Janela
            </label>
            <input
              type="text"
              value={webGadgetConfig.brandTitle}
              onChange={(e) => updateWebGadgetConfig({ brandTitle: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Subtítulo / SLA Exibido
            </label>
            <input
              type="text"
              value={webGadgetConfig.brandSubtitle}
              onChange={(e) => updateWebGadgetConfig({ brandSubtitle: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Cor Principal do Widget
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={webGadgetConfig.primaryColor}
                onChange={(e) => updateWebGadgetConfig({ primaryColor: e.target.value })}
                className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200"
              />
              <input
                type="text"
                value={webGadgetConfig.primaryColor}
                onChange={(e) => updateWebGadgetConfig({ primaryColor: e.target.value })}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Mensagem de Acolhimento
            </label>
            <textarea
              rows={3}
              value={webGadgetConfig.greetingMessage}
              onChange={(e) => updateWebGadgetConfig({ greetingMessage: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Posição no Site
              </label>
              <select
                value={webGadgetConfig.buttonPosition}
                onChange={(e) =>
                  updateWebGadgetConfig({
                    buttonPosition: e.target.value as 'bottom-right' | 'bottom-left',
                  })
                }
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="bottom-right">Inferior Direito</option>
                <option value="bottom-left">Inferior Esquerdo</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Departamento Padrão
              </label>
              <select
                value={webGadgetConfig.defaultDepartmentId}
                onChange={(e) =>
                  updateWebGadgetConfig({ defaultDepartmentId: e.target.value })
                }
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-950 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Linha WhatsApp Vinculada: <strong>{gatewayConfig.primaryPhoneNumber}</strong>
            </span>
          </div>
        </div>

        {/* Right Column: Live Simulator & Code Snippets (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-sm">
                Simulador Ao Vivo & Códigos de Embed
              </h2>
            </div>

            <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setActiveCodeTab('simulator')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activeCodeTab === 'simulator'
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                Simulador Ao Vivo (Chat / WhatsApp)
              </button>
              <button
                onClick={() => setActiveCodeTab('script')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeCodeTab === 'script'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600'
                }`}
              >
                Widget JS
              </button>
              <button
                onClick={() => setActiveCodeTab('html')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeCodeTab === 'html'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600'
                }`}
              >
                HTML Puro
              </button>
              <button
                onClick={() => setActiveCodeTab('iframe')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeCodeTab === 'iframe'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600'
                }`}
              >
                Iframe
              </button>
            </div>
          </div>

          {activeCodeTab === 'simulator' ? (
            /* TAB 1: LIVE INTERACTIVE SIMULATOR WITH CHAT & WHATSAPP DIALOG */
            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">
                    Simulador ao Vivo: Escolha entre Atendimento via Chat ou via WhatsApp
                  </span>
                </div>

                {liveSimTicket && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTicket(liveSimTicket);
                        setActiveView('inbox');
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Abrir no Inbox do Painel ({isSimWhatsApp ? 'Origem: WhatsApp' : 'Origem: Chat'})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimActiveTicketId(null)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reiniciar Simulador
                    </button>
                  </div>
                )}
              </div>

              {!liveSimTicket ? (
                /* STEP 1: CLIENT CHOOSES CHAT OR WHATSAPP AND STARTS CONVERSATION */
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-emerald-400">
                        {webGadgetConfig.brandTitle}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {webGadgetConfig.greetingMessage}
                      </p>
                    </div>
                  </div>

                  {/* CHANNEL CHOICE CARDS */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-2 uppercase tracking-wider">
                      1. Como você deseja ser atendido agora? *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSimChannel('chat')}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                          simChannel === 'chat'
                            ? 'bg-blue-950/70 border-blue-500 ring-2 ring-blue-500/20 text-white'
                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-white">
                              Chamada via Chat Online
                            </span>
                            {simChannel === 'chat' && (
                              <span className="text-[9px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                Selecionado
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                            Conversa ao vivo aqui mesmo com o atendente. No painel CRM constará{' '}
                            <strong className="text-blue-300">Origem: Chat</strong>.
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSimChannel('whatsapp')}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                          simChannel === 'whatsapp'
                            ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/20 text-white'
                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-white">
                              Chamada via WhatsApp
                            </span>
                            {simChannel === 'whatsapp' && (
                              <span className="text-[9px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                                Selecionado
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                            Habilita o diálogo do WhatsApp aqui mesmo na caixa de diálogo e registra{' '}
                            <strong className="text-emerald-300">Origem: WhatsApp</strong>.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* FORM FIELDS */}
                  <form onSubmit={handleSimulateSubmit} className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                          Nome do Cliente:
                        </label>
                        <input
                          type="text"
                          required
                          value={simName}
                          onChange={(e) => setSimName(e.target.value)}
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                          WhatsApp / Telefone com DDD:
                        </label>
                        <input
                          type="tel"
                          required
                          value={simPhone}
                          onChange={(e) => setSimPhone(e.target.value)}
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                          E-mail Corporativo:
                        </label>
                        <input
                          type="email"
                          value={simEmail}
                          onChange={(e) => setSimEmail(e.target.value)}
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                          Departamento de Destino:
                        </label>
                        <select
                          value={simDept}
                          onChange={(e) => setSimDept(e.target.value)}
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                        Mensagem Inicial do Cliente:
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={simMessage}
                        onChange={(e) => setSimMessage(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className={`w-full py-3 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg ${
                        simChannel === 'whatsapp'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {simChannel === 'whatsapp' ? (
                        <>
                          <Phone className="w-4 h-4" />
                          <span>Iniciar Atendimento via WhatsApp (Abrir Caixa de Diálogo Aqui)</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          <span>Iniciar Atendimento via Chat Online (Origem: Chat)</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                /* STEP 2: ACTIVE TWO-WAY DIALOG BOX (CUSTOMER <-> ATTENDANT IN REAL TIME) */
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Left Box (7 cols): The Customer's Live Dialog Box (Chat or WhatsApp) */}
                  <div className="md:col-span-7 bg-white rounded-2xl overflow-hidden border border-slate-700 flex flex-col h-[430px] text-slate-800 shadow-xl">
                    {/* Dialog Header */}
                    <div
                      className="px-4 py-3 text-white flex items-center justify-between"
                      style={{
                        backgroundColor: isSimWhatsApp ? '#075E54' : '#2563EB',
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                          {isSimWhatsApp ? (
                            <Phone className="w-4 h-4 text-white" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-xs flex items-center gap-1.5">
                            <span>{webGadgetConfig.brandTitle}</span>
                            <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded uppercase">
                              {isSimWhatsApp ? 'WhatsApp Direto' : 'Chat Online'}
                            </span>
                          </div>
                          <div className="text-[10px] text-white/85">
                            Atendente: {currentAgent.name} • {liveSimTicket.protocol}
                          </div>
                        </div>
                      </div>

                      {isSimWhatsApp && (
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(simMessage)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] bg-white/15 hover:bg-white/25 px-2 py-1 rounded-lg flex items-center gap-1 text-white font-semibold"
                          title="Abrir também no WhatsApp Web/App se desejar"
                        >
                          <span>wa.me</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Live Messages Feed inside Dialog */}
                    <div
                      className={`flex-1 p-3.5 overflow-y-auto space-y-2.5 ${
                        isSimWhatsApp ? 'bg-[#e5ddd5]' : 'bg-slate-50'
                      }`}
                    >
                      <div className="text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-semibold">
                          {isSimWhatsApp
                            ? `📱 Diálogo WhatsApp Habilitado na Caixa (${gatewayConfig.primaryPhoneNumber})`
                            : `💬 Atendimento via Chat Online • Consta "Origem: Chat" no Painel`}
                        </span>
                      </div>

                      {liveSimTicket.messages.map((msg) => {
                        const isCustomer = msg.sender === 'contact';
                        const isAi = msg.sender === 'ai_bot';

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs shadow-2xs ${
                                isCustomer
                                  ? isSimWhatsApp
                                    ? 'bg-[#dcf8c6] text-slate-900 rounded-br-xs border border-emerald-200'
                                    : 'bg-blue-600 text-white rounded-br-xs'
                                  : isAi
                                  ? 'bg-purple-50 text-purple-950 border border-purple-200 rounded-bl-xs'
                                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                              }`}
                            >
                              <div
                                className={`text-[9px] font-bold uppercase mb-0.5 flex items-center gap-1 ${
                                  isCustomer
                                    ? isSimWhatsApp
                                      ? 'text-emerald-800'
                                      : 'text-blue-100'
                                    : isAi
                                    ? 'text-purple-700'
                                    : 'text-emerald-700'
                                }`}
                              >
                                {isAi && <Bot className="w-3 h-3" />}
                                <span>
                                  {isCustomer
                                    ? `${liveSimTicket.contactName} (Cliente)`
                                    : msg.senderName || `${currentAgent.name} (Atendente)`}
                                </span>
                              </div>
                              <p className="whitespace-pre-wrap text-[11px] leading-relaxed">
                                {msg.text}
                              </p>
                              <div
                                className={`mt-1 text-[9px] flex items-center justify-end gap-1 font-mono ${
                                  isCustomer && !isSimWhatsApp ? 'text-blue-100' : 'text-slate-400'
                                }`}
                              >
                                <span>{msg.timestamp}</span>
                                {isCustomer && <CheckCheck className="w-3 h-3 text-sky-500" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={simMessagesEndRef} />
                    </div>

                    {/* Customer Input inside Dialog Box */}
                    <form
                      onSubmit={handleSendSimClientMsg}
                      className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={simClientInput}
                        onChange={(e) => setSimClientInput(e.target.value)}
                        placeholder={`Escrever como cliente (${liveSimTicket.contactName})...`}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                        style={{
                          backgroundColor: isSimWhatsApp ? '#075E54' : '#2563EB',
                        }}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar</span>
                      </button>
                    </form>
                  </div>

                  {/* Right Box (5 cols): Attendant Live Reply Console (Synced with CRM Inbox) */}
                  <div className="md:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between space-y-3 text-xs">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <Headphones className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-white">
                            Console do Atendente ({currentAgent.name})
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSimWhatsApp
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {isSimWhatsApp ? '📱 Origem: WhatsApp' : '💬 Origem: Chat'}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Protocolo no Painel:</span>
                          <span className="font-mono font-bold text-white">
                            {liveSimTicket.protocol}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Cliente Conectado:</span>
                          <span className="font-bold text-emerald-400">
                            {liveSimTicket.contactName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Origem Registrada:</span>
                          <span className="font-bold text-white">
                            {isSimWhatsApp ? 'WhatsApp Oficial' : 'Chat (Web Chat)'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400 block">
                          Respostas Rápidas do Atendente (1 Clique):
                        </label>
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              sendChatMessage(
                                liveSimTicket.id,
                                `Perfeito, ${liveSimTicket.contactName}! Estou analisando sua solicitação aqui no painel. Como posso te ajudar agora?`,
                                'agent'
                              )
                            }
                            className="text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors"
                          >
                            👋 "Perfeito! Estou analisando sua solicitação aqui no painel..."
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              sendChatMessage(
                                liveSimTicket.id,
                                `Acabei de liberar sua proposta comercial! Você prefere revisar os detalhes por aqui mesmo ou agendar uma call?`,
                                'agent'
                              )
                            }
                            className="text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors"
                          >
                            📄 "Acabei de liberar sua proposta comercial! Você prefere..."
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Attendant Custom Reply Form */}
                    <form onSubmit={handleSendSimAgentMsg} className="space-y-2 pt-2 border-t border-slate-800">
                      <label className="text-[10px] font-bold text-emerald-400 block">
                        Responder como Atendente ({currentAgent.name}):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={simAgentInput}
                          onChange={(e) => setSimAgentInput(e.target.value)}
                          placeholder="Digite a resposta do atendente..."
                          className="flex-1 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="submit"
                          className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shrink-0 transition-colors"
                        >
                          Responder
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TAB 2, 3 & 4: CODE SNIPPET + EXTERNAL TESTER */
            <>
              <div className="flex items-center justify-between gap-3 flex-wrap bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3">
                <p className="text-xs text-slate-700 flex-1">
                  {activeCodeTab === 'script'
                    ? 'Snippet 100% autônomo (Zero Dependências). Cole antes da tag </body> do seu site externo para gerar atendimentos em tempo real e tocar a campainha do atendente.'
                    : activeCodeTab === 'html'
                    ? 'Formulário HTML Puro com acionamento imediato do atendimento no sistema e campainha sonora ao enviar de qualquer página externa.'
                    : 'Tag Iframe isolada com sincronização em tempo real (Cloud Pub/Sub + First-Party Sync) para gerar o chamado e tocar a campainha.'}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const snippet =
                        activeCodeTab === 'script'
                          ? standaloneScriptCode
                          : activeCodeTab === 'html'
                          ? htmlFormCode
                          : iframeCode;
                      const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Site Externo de Teste — ${currentTenant?.name || 'Empresa'} (${activeCodeTab.toUpperCase()})</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 32px 16px; }
    .container { max-width: 760px; margin: 0 auto; background: #fff; border-radius: 20px; padding: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .badge { display: inline-block; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 999px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">PÁGINA EXTERNA DE TESTE • ${activeCodeTab.toUpperCase()}</span>
    <h1 style="margin: 0 0 8px 0; font-size: 22px;">Site Oficial — ${currentTenant?.name || 'Empresa'}</h1>
    <p style="margin: 0 0 24px 0; font-size: 13px; color: #475569;">
      Preencha o widget abaixo para testar a abertura de chamado em tempo real e o toque da campainha no painel do atendente.
    </p>
    ${snippet}
  </div>
</body>
</html>`;
                      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `pagina-externa-${currentTenant?.slug || 'empresa'}-${activeCodeTab}.html`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      setTimeout(() => URL.revokeObjectURL(url), 2000);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Baixar Página .HTML Externa de Teste
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 text-emerald-400 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-96 leading-relaxed">
                  {activeCodeTab === 'script'
                    ? standaloneScriptCode
                    : activeCodeTab === 'html'
                    ? htmlFormCode
                    : iframeCode}
                </pre>

                <button
                  onClick={() => handleCopy(activeCodeTab as 'script' | 'html' | 'iframe')}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition-colors border border-white/20"
                >
                  {(activeCodeTab === 'script'
                    ? copiedScript
                    : activeCodeTab === 'html'
                    ? copiedHtml
                    : copiedIframe) ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Código
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Como Funciona o Widget Híbrido (Chat & WhatsApp)
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
              <li>
                <strong>Opção 1 — Chamada via Chat:</strong> Abre o chat em tempo real na própria janela e registra o atendimento no painel com a tag <strong>Origem: Chat</strong>.
              </li>
              <li>
                <strong>Opção 2 — Chamada via WhatsApp:</strong> Habilita o diálogo estilo WhatsApp na própria caixa de diálogo para troca imediata de mensagens entre usuário e atendente, registrando <strong>Origem: WhatsApp</strong>.
              </li>
              <li>
                <strong>Sincronização Total:</strong> Todas as mensagens enviadas pelo cliente ou respondidas pelo atendente aparecem instantaneamente no <strong>Inbox Multiatendimento</strong> e na caixa de diálogo.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
