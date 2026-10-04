import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Sparkles,
  Sliders,
  ExternalLink,
  MessageSquare,
  Eye,
  Phone,
  Palette,
  ShieldCheck,
  Send,
  Laptop,
  CheckCircle2,
  Globe,
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
  } = useCRM();

  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'script' | 'html' | 'iframe' | 'simulator'>('script');

  // Simulator state
  const [simName, setSimName] = useState('Mariana Alves');
  const [simPhone, setSimPhone] = useState('+55 11 98877-6655');
  const [simEmail, setSimEmail] = useState('mariana@empresa.com.br');
  const [simDept, setSimDept] = useState(departments[0]?.id || 'dept-01');
  const [simMessage, setSimMessage] = useState('Olá! Gostaria de falar com o time sobre a demonstração da plataforma.');
  const [simSubmitted, setSimSubmitted] = useState(false);

  const cleanPhone = (gatewayConfig.primaryPhoneNumber || '+55 11 98765-4321').replace(/\D/g, '') || '5511987654321';
  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://crm.omnipulse.io';

  // 100% Self-Contained, Zero-Dependency Autonomous JavaScript Snippet for External Sites
  const standaloneScriptCode = `<!-- ==================================================== -->
<!-- OMNIPULSE CRM - GADGET WHATSAPP EMBED (AUTO-EXECUTÁVEL) -->
<!-- Cole este código antes da tag </body> do seu site ou loja -->
<!-- ==================================================== -->
<script>
(function() {
  var config = {
    phone: "${cleanPhone}",
    brandTitle: "${webGadgetConfig.brandTitle}",
    brandSubtitle: "${webGadgetConfig.brandSubtitle}",
    primaryColor: "${webGadgetConfig.primaryColor || '#10B981'}",
    position: "${webGadgetConfig.buttonPosition || 'bottom-right'}",
    greeting: "${webGadgetConfig.greetingMessage.replace(/"/g, '\\"')}",
    departments: ${JSON.stringify(departments.map((d) => ({ id: d.id, name: d.name })))},
    webhookUrl: "${appOrigin}/api/webhook/web-lead"
  };

  // Cria o container do Widget no DOM do site externo
  var root = document.createElement('div');
  root.id = 'omnipulse-whatsapp-widget';
  document.body.appendChild(root);

  var isLeft = config.position === 'bottom-left';
  var posCss = isLeft ? 'left: 20px; bottom: 20px;' : 'right: 20px; bottom: 20px;';

  // Injeta estilos CSS isolados
  var style = document.createElement('style');
  style.innerHTML = \`
    #omni-bubble-btn {
      position: fixed; \${posCss} z-index: 999999;
      width: 60px; height: 60px; border-radius: 50%;
      background: \${config.primaryColor}; color: #ffffff;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      border: none; cursor: pointer; display: flex;
      align-items: center; justify-content: center;
      transition: all 0.25s ease;
    }
    #omni-bubble-btn:hover { transform: scale(1.08); box-shadow: 0 12px 30px rgba(0,0,0,0.35); }
    #omni-bubble-btn svg { width: 32px; height: 32px; fill: currentColor; }
    
    #omni-chat-modal {
      display: none; position: fixed; \${posCss} z-index: 999999;
      width: 380px; max-width: calc(100vw - 32px);
      background: #ffffff; border-radius: 24px;
      box-shadow: 0 20px 50px rgba(15,23,42,0.25);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden; border: 1px solid #e2e8f0; animation: omniSlideIn 0.25s ease forwards;
    }
    @keyframes omniSlideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    
    .omni-head {
      background: \${config.primaryColor}; color: #ffffff;
      padding: 18px 20px; display: flex; justify-content: space-between; align-items: center;
    }
    .omni-title { font-weight: 800; font-size: 15px; margin: 0; line-height: 1.2; }
    .omni-sub { font-size: 11px; opacity: 0.9; margin-top: 3px; }
    .omni-close { background: none; border: none; color: #ffffff; font-size: 24px; cursor: pointer; padding: 0; line-height: 1; opacity: 0.8; }
    .omni-close:hover { opacity: 1; }
    
    .omni-content { padding: 18px 20px; max-height: 75vh; overflow-y: auto; text-align: left; }
    .omni-greet { font-size: 12px; color: #475569; margin: 0 0 14px 0; line-height: 1.4; }
    .omni-label { display: block; font-size: 11px; font-weight: bold; color: #334155; margin-bottom: 4px; }
    
    .omni-field {
      width: 100%; padding: 10px 12px; margin-bottom: 10px;
      border: 1px solid #cbd5e1; border-radius: 12px; font-size: 13px;
      box-sizing: border-box; outline: none; transition: border-color 0.2s;
    }
    .omni-field:focus { border-color: \${config.primaryColor}; box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }
    
    .omni-btn-send {
      width: 100%; padding: 13px; background: \${config.primaryColor};
      color: #ffffff; border: none; border-radius: 14px; font-weight: bold;
      cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px;
      box-shadow: 0 4px 12px rgba(16,185,129,0.3); transition: filter 0.2s;
    }
    .omni-btn-send:hover { filter: brightness(0.92); }
  \`;
  document.head.appendChild(style);

  // Injeta HTML do botão flutuante e do modal
  root.innerHTML = \`
    <button id="omni-bubble-btn" title="Iniciar Atendimento no WhatsApp">
      <svg viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.79 14.19c-.24.67-1.4 1.24-1.95 1.28-.5.04-1.12.07-3.32-.79-2.28-.89-3.74-3.23-3.85-3.38-.11-.15-2.02-2.69-2.02-5.13 0-2.44 1.28-3.64 1.73-4.14.45-.5.98-.62 1.3-.62.33 0 .66.01.95.02.31.01.72-.12 1.13.86.42 1 .14 2.45 1.14 2.65.1.02.16.03.22.03.3 0 .47-.2.66-.46.33-.45.7-.77 1.05-.33.35.44 1.49 1.83 1.83 2.41.34.58.07.9-.17 1.22z"/></svg>
    </button>
    <div id="omni-chat-modal">
      <div class="omni-head">
        <div>
          <div class="omni-title">\${config.brandTitle}</div>
          <div class="omni-sub">\${config.brandSubtitle}</div>
        </div>
        <button class="omni-close" id="omni-close-x">&times;</button>
      </div>
      <div class="omni-content">
        <p class="omni-greet">\${config.greeting}</p>
        <form id="omni-lead-form">
          <label class="omni-label">Seu Nome Completo *</label>
          <input class="omni-field" type="text" id="omni-name" required placeholder="Como podemos te chamar?" />

          <label class="omni-label">WhatsApp com DDD (Ex: 11 98888-7777) *</label>
          <input class="omni-field" type="tel" id="omni-phone" required placeholder="+55 11 98888-7777" />

          <label class="omni-label">E-mail Corporativo</label>
          <input class="omni-field" type="email" id="omni-email" placeholder="seu@email.com" />

          <label class="omni-label">Departamento</label>
          <select class="omni-field" id="omni-dept">
            \${config.departments.map(function(d) { return '<option value="' + d.name + '">' + d.name + '</option>'; }).join('')}
          </select>

          <label class="omni-label">Mensagem Inicial *</label>
          <textarea class="omni-field" id="omni-msg" rows="3" required placeholder="Digite sua dúvida ou solicitação..."></textarea>

          <button type="submit" class="omni-btn-send">
            <span>Iniciar Conversa no WhatsApp</span>
          </button>
        </form>
      </div>
    </div>
  \`;

  var bubbleBtn = document.getElementById('omni-bubble-btn');
  var chatModal = document.getElementById('omni-chat-modal');
  var closeX = document.getElementById('omni-close-x');
  var form = document.getElementById('omni-lead-form');

  bubbleBtn.onclick = function() {
    chatModal.style.display = 'block';
    bubbleBtn.style.display = 'none';
  };

  closeX.onclick = function() {
    chatModal.style.display = 'none';
    bubbleBtn.style.display = 'flex';
  };

  form.onsubmit = function(e) {
    e.preventDefault();
    var name = document.getElementById('omni-name').value;
    var phone = document.getElementById('omni-phone').value;
    var email = document.getElementById('omni-email').value;
    var dept = document.getElementById('omni-dept').value;
    var msg = document.getElementById('omni-msg').value;

    // 1. Registra no CRM em segundo plano via Webhook
    try {
      fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, phone: phone, email: email, department: dept, message: msg })
      });
    } catch(err) {}

    // 2. Abre a conversa no WhatsApp oficial da empresa
    var cleanDest = config.phone.replace(/\\D/g, '') || '5511987654321';
    var textMsg = encodeURIComponent('Olá! Me chamo ' + name + (email ? ' (' + email + ')' : '') + '. Departamento: ' + dept + '. ' + msg);
    window.open('https://wa.me/' + cleanDest + '?text=' + textMsg, '_blank');

    chatModal.style.display = 'none';
    bubbleBtn.style.display = 'flex';
    form.reset();
  };
})();
</script>`;

  const htmlFormCode = `<!-- ============================================== -->
<!-- FORMULÁRIO HTML PURO EMBEDÁVEL (OMNIPULSE CRM)  -->
<!-- ============================================== -->
<form action="${appOrigin}/api/webhook/web-lead" method="POST" class="omnipulse-clean-form" style="max-width: 480px; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; font-family: sans-serif; background: #fff;">
  <input type="hidden" name="originWhatsApp" value="${gatewayConfig.primaryPhoneNumber}" />
  
  <h3 style="margin-top: 0; color: #0f172a;">${webGadgetConfig.brandTitle}</h3>
  <p style="font-size: 13px; color: #64748b;">${webGadgetConfig.greetingMessage}</p>

  <label style="display:block; font-size: 12px; font-weight: bold; margin-bottom: 4px;">Nome Completo:</label>
  <input type="text" name="name" required placeholder="Seu nome" style="width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;" />

  <label style="display:block; font-size: 12px; font-weight: bold; margin-bottom: 4px;">WhatsApp (com DDD):</label>
  <input type="tel" name="whatsapp" required placeholder="+55 (11) 98888-7777" style="width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;" />

  <label style="display:block; font-size: 12px; font-weight: bold; margin-bottom: 4px;">E-mail Corporativo:</label>
  <input type="email" name="email" placeholder="seu@email.com" style="width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;" />

  <label style="display:block; font-size: 12px; font-weight: bold; margin-bottom: 4px;">Departamento:</label>
  <select name="departmentId" style="width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;">
${departments.map((d) => `    <option value="${d.id}">${d.name}</option>`).join('\n')}
  </select>

  <label style="display:block; font-size: 12px; font-weight: bold; margin-bottom: 4px;">Mensagem:</label>
  <textarea name="message" rows="3" required placeholder="Como podemos ajudar?" style="width: 100%; padding: 10px; margin-bottom: 16px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;"></textarea>

  <button type="submit" style="width: 100%; padding: 12px; background-color: ${webGadgetConfig.primaryColor || '#10B981'}; color: #fff; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 14px;">
    Iniciar Conversa no WhatsApp
  </button>
</form>`;

  const iframeCode = `<!-- ============================================== -->
<!-- WIDGET IFRAME EMBED RESPONSIVO (OMNIPULSE CRM)  -->
<!-- Cole onde desejar exibir o widget de atendimento -->
<!-- ============================================== -->
<iframe
  src="${appOrigin}/embed/widget?phone=${cleanPhone}&brand=${encodeURIComponent(webGadgetConfig.brandTitle)}&color=${encodeURIComponent(webGadgetConfig.primaryColor)}"
  width="100%"
  height="540"
  style="border: none; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); max-width: 440px; display: block; margin: 0 auto;"
  title="Chat WhatsApp OmniPulse"
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
    if (!simName || !simPhone || !simMessage) return;

    await startChatFromGadget({
      name: simName,
      email: simEmail,
      phone: simPhone,
      departmentId: simDept,
      message: simMessage,
    });

    setSimSubmitted(true);
    setTimeout(() => setSimSubmitted(false), 3500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Embed Externo & Captação de Leads
            </span>
            <span className="text-xs text-slate-500">
              Funciona em Qualquer Site, Landing Page ou E-commerce
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gadget & Formulário de Iniciar Conversa
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gere o snippet auto-executável para colar no WordPress, Webflow, Shopify ou HTML de sites externos
          </p>
        </div>

        <button
          onClick={() => setIsGadgetFloatingOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start md:self-auto"
        >
          <Eye className="w-4 h-4" />
          Testar Gadget Flutuante na Aplicação
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customization Settings (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-sm">
              Configurações do Gadget
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
              Cor do Botão e Cabeçalho
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

        {/* Right Column: Code Snippets & Simulator (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-slate-800" />
              <h2 className="font-bold text-slate-900 text-sm">
                Código para Sites Externos
              </h2>
            </div>

            <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setActiveCodeTab('script')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeCodeTab === 'script'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600'
                }`}
              >
                Widget Flutuante JS
              </button>
              <button
                onClick={() => setActiveCodeTab('html')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeCodeTab === 'html'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600'
                }`}
              >
                Formulário HTML
              </button>
              <button
                onClick={() => setActiveCodeTab('iframe')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeCodeTab === 'iframe'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600'
                }`}
              >
                Iframe Embed
              </button>
              <button
                onClick={() => setActiveCodeTab('simulator')}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  activeCodeTab === 'simulator'
                    ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                    : 'text-slate-600'
                }`}
              >
                <Laptop className="w-3 h-3" />
                Simulador Ao Vivo
              </button>
            </div>
          </div>

          {activeCodeTab === 'simulator' ? (
            /* TAB 3: SIMULATOR */
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">Simulador de Site Externo</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">https://seusite.com.br</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="font-bold text-sm text-emerald-400">
                  {webGadgetConfig.brandTitle}
                </div>
                <p className="text-[11px] text-slate-400">
                  {webGadgetConfig.greetingMessage}
                </p>

                <form onSubmit={handleSimulateSubmit} className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Nome Completo:</label>
                      <input
                        type="text"
                        required
                        value={simName}
                        onChange={(e) => setSimName(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">WhatsApp com DDD:</label>
                      <input
                        type="tel"
                        required
                        value={simPhone}
                        onChange={(e) => setSimPhone(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">E-mail Corporativo:</label>
                      <input
                        type="email"
                        value={simEmail}
                        onChange={(e) => setSimEmail(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Departamento:</label>
                      <select
                        value={simDept}
                        onChange={(e) => setSimDept(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Mensagem Inicial:</label>
                    <textarea
                      rows={2}
                      required
                      value={simMessage}
                      onChange={(e) => setSimMessage(e.target.value)}
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Simular Envio do Lead para o CRM
                  </button>
                </form>

                {simSubmitted && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Lead recebido com sucesso! O chamado apareceu no seu Inbox do CRM e abriu o link do WhatsApp.</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TAB 1, 2 & 3: CODE SNIPPET */
            <>
              <p className="text-xs text-slate-500">
                {activeCodeTab === 'script'
                  ? 'Snippet 100% autônomo (Zero Dependências). Cole antes da tag </body> do seu site ou tema para renderizar o botão flutuante e o formulário de início de conversa.'
                  : activeCodeTab === 'html'
                  ? 'Formulário HTML estruturado com CSS limpo para incorporar em blocos fixos da sua landing page ou página de contato.'
                  : 'Tag Iframe moderna e isolada. Perfeita para sistemas e construtores de páginas que restringem a inserção de scripts JS.'}
              </p>

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
              Recursos do Script Externo
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
              <li>
                <strong>Auto-Executável:</strong> Injeta seus próprios estilos e elementos DOM sem conflitos com CSS do site hospedeiro.
              </li>
              <li>
                <strong>Encaminhamento Imediato:</strong> Redireciona o visitante diretamente para o WhatsApp oficial com a mensagem pré-formatada.
              </li>
              <li>
                <strong>Criação de Chamado:</strong> Registra instantaneamente o protocolo no <strong>Inbox Multiatendimento</strong> e notifica os atendentes.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
