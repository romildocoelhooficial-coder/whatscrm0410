import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  X,
  Radio,
  Server,
  Zap,
  Copy,
  Check,
  BatteryCharging,
  Terminal,
  ExternalLink,
  Send,
  Sparkles,
  ShieldCheck,
  Globe,
  Key,
  Layers,
  FileCheck,
  CheckCircle,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { WhatsAppEngine } from '../../types/crm';

export const WhatsAppQrModal: React.FC = () => {
  const {
    isQrModalOpen,
    setIsQrModalOpen,
    gatewayConfig,
    updateGatewayConfig,
    switchActiveEngine,
    whatsappConnectionState,
    setWhatsappConnectionState,
    currentUserRole,
  } = useCRM();

  const [activeEngine, setActiveEngine] = useState<WhatsAppEngine>(gatewayConfig.activeEngine || 'evolution');
  const [activeTab, setActiveTab] = useState<'qrcode' | 'pairing_code' | 'meta_setup'>('qrcode');
  const [viewMode, setViewMode] = useState<'qrcode_scan' | 'connected_info'>('qrcode_scan');
  const [countdown, setCountdown] = useState(45);
  const [pairingCode, setPairingCode] = useState('OMNI-8492');
  const [copiedCode, setCopiedCode] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [phoneNumberInput, setPhoneNumberInput] = useState(gatewayConfig?.primaryPhoneNumber || '+55 11 98765-4321');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testMessageInput, setTestMessageInput] = useState('');
  const [testSentSuccess, setTestSentSuccess] = useState(false);

  // Meta Cloud API specific form states
  const [wabaId, setWabaId] = useState(gatewayConfig?.metaCloud?.wabaId || '109284729103982');
  const [metaPhoneNumberId, setMetaPhoneNumberId] = useState(gatewayConfig?.metaCloud?.phoneNumberId || '104829102938472');
  const [metaAccessToken, setMetaAccessToken] = useState(gatewayConfig?.metaCloud?.accessToken || 'EAAG9...meta_system_user_token_live');
  const [metaWebhookToken, setMetaWebhookToken] = useState(gatewayConfig?.metaCloud?.webhookVerifyToken || 'omnipulse_meta_verify_token_2026');
  const [metaValidated, setMetaValidated] = useState(false);

  // Live Socket Console Logs
  const [socketLogs, setSocketLogs] = useState<string[]>([
    `[Evolution API v2] Inicializando socket WebSocket para instância '${gatewayConfig?.evolution?.instanceName || 'inst_corporate_sp'}'...`,
    `[Evolution API v2] Conexão com cluster SP estabelecida (Ping: 18ms)`,
    `[Evolution API v2] Evento: qrcode.updated recebido. Sessão pronta para leitura.`,
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Clean phone number for WhatsApp link with safe fallback
  const cleanPhone = (gatewayConfig?.primaryPhoneNumber || '+55 11 98765-4321').replace(/\D/g, '') || '5511987654321';

  // Generate Real Scannable QR Code as both Data URL (instant img) and Canvas
  const generateQrCode = async () => {
    setIsRefreshing(true);
    const sessionToken = Math.random().toString(36).substring(2, 10).toUpperCase();
    const payload = `https://wa.me/${cleanPhone}?text=OmniPulse-CRM-Ativacao-Instancia-[${sessionToken}]`;

    try {
      const url = await QRCode.toDataURL(payload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });
      setQrDataUrl(url);

      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, payload, {
          width: 240,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        });
      }

      const time = new Date().toLocaleTimeString('pt-BR');
      setSocketLogs((prev) => [
        ...prev.slice(-6),
        `[${time}] [${activeEngine.toUpperCase()}] QR Code gerado com sucesso (Hash: #token-${sessionToken})`,
      ]);
    } catch (err) {
      console.error('Erro gerando QR Code:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isQrModalOpen) {
      setViewMode('qrcode_scan');
      setCountdown(45);
      if (activeEngine !== 'meta_cloud') {
        generateQrCode();
      }
    }
  }, [isQrModalOpen, activeEngine]);

  useEffect(() => {
    if (!isQrModalOpen || viewMode === 'connected_info' || activeEngine === 'meta_cloud') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          generateQrCode();
          return 45;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isQrModalOpen, viewMode, activeEngine]);

  if (!isQrModalOpen) return null;

  // STRICT RBAC: Lock attendants from QR code pairing & line activation
  if (currentUserRole === 'atendente') {
    return null;
  }

  const handleSimulateScan = () => {
    setIsRefreshing(true);
    setWhatsappConnectionState('connecting');

    const time = new Date().toLocaleTimeString('pt-BR');
    setSocketLogs((prev) => [
      ...prev,
      `[${time}] [${activeEngine.toUpperCase()}] Handshake capturado do dispositivo móvel (+${cleanPhone})`,
      `[${time}] [${activeEngine.toUpperCase()}] Validando certificados Noise Protocol & Sessão criptografada...`,
    ]);

    setTimeout(() => {
      setIsRefreshing(false);
      setWhatsappConnectionState('open');
      setViewMode('connected_info');
      switchActiveEngine(activeEngine);
      setSocketLogs((prev) => [
        ...prev,
        `[${time}] [${activeEngine.toUpperCase()}] Estado da conexão alterado para: OPEN (Autenticado)`,
        `[${time}] [${activeEngine.toUpperCase()}] Sessão WhatsApp corporativa ativa e operacional!`,
      ]);
    }, 1200);
  };

  const handleValidateMetaOfficial = () => {
    setIsRefreshing(true);
    const time = new Date().toLocaleTimeString('pt-BR');
    setSocketLogs((prev) => [
      ...prev,
      `[${time}] [META CLOUD API] Chamando Graph API v21.0 endpoint (GET /${metaPhoneNumberId})...`,
      `[${time}] [META CLOUD API] Token de Sistema verificado com sucesso. Permissões: whatsapp_business_messaging, whatsapp_business_management.`,
    ]);

    setTimeout(() => {
      setIsRefreshing(false);
      setMetaValidated(true);
      setWhatsappConnectionState('open');
      setViewMode('connected_info');
      switchActiveEngine('meta_cloud');
      updateGatewayConfig({
        activeEngine: 'meta_cloud',
        metaCloud: {
          ...gatewayConfig.metaCloud,
          wabaId,
          phoneNumberId: metaPhoneNumberId,
          accessToken: metaAccessToken,
          webhookVerifyToken: metaWebhookToken,
          status: 'verified_active',
          isPrimary: true,
        },
      });

      setSocketLogs((prev) => [
        ...prev,
        `[${time}] [META CLOUD API] WABA ID #${wabaId} homologado com Selo Oficial Verde!`,
        `[${time}] [META CLOUD API] Webhook bi-direcional sincronizado: 0 msgs perdidas.`,
      ]);
    }, 1400);
  };

  const handleDisconnect = () => {
    setWhatsappConnectionState('qrcode');
    setViewMode('qrcode_scan');
    const time = new Date().toLocaleTimeString('pt-BR');
    setSocketLogs((prev) => [
      ...prev,
      `[${time}] [${activeEngine.toUpperCase()}] Sessão desconectada. Gerando novas chaves de pareamento...`,
    ]);
    if (activeEngine !== 'meta_cloud') {
      generateQrCode();
    }
  };

  const handleCopyPairingCode = () => {
    navigator.clipboard.writeText(pairingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendTestMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMessageInput.trim()) return;
    setTestSentSuccess(true);
    setTimeout(() => {
      setTestSentSuccess(false);
      setTestMessageInput('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 text-xs max-h-[94vh] overflow-y-auto relative">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  Ativação WhatsApp de Origem
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    whatsappConnectionState === 'open'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800 animate-pulse'
                  }`}
                >
                  {whatsappConnectionState === 'open' ? 'Conectado (Online)' : 'Aguardando Ativação'}
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Escolha o motor de conexão oficial e ative a linha corporativa
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsQrModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Engines Selector (Evolution, Uazapi, Meta Cloud API Oficial) */}
        <div className="mt-4 p-2 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Motor de Transmissão WhatsApp
            </span>
            {whatsappConnectionState === 'open' && (
              <button
                onClick={() => setViewMode(viewMode === 'qrcode_scan' ? 'connected_info' : 'qrcode_scan')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[10px] font-bold transition-colors"
              >
                {viewMode === 'qrcode_scan' ? 'Ver Aparelho Conectado' : 'Re-exibir Pareamento'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => {
                setActiveEngine('evolution');
                setActiveTab('qrcode');
                generateQrCode();
              }}
              className={`py-2 px-2 rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
                activeEngine === 'evolution'
                  ? 'bg-white text-emerald-950 shadow-xs border-emerald-300'
                  : 'bg-white/60 text-slate-600 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px]">Evolution API v2</span>
              </div>
              <span className="text-[9px] text-slate-400 font-normal">QR Code Web</span>
            </button>

            <button
              onClick={() => {
                setActiveEngine('uazapi');
                setActiveTab('pairing_code');
                generateQrCode();
              }}
              className={`py-2 px-2 rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
                activeEngine === 'uazapi'
                  ? 'bg-white text-indigo-950 shadow-xs border-indigo-300'
                  : 'bg-white/60 text-slate-600 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[11px]">Uazapi Cloud</span>
              </div>
              <span className="text-[9px] text-slate-400 font-normal">Pairing Code</span>
            </button>

            <button
              onClick={() => {
                setActiveEngine('meta_cloud');
                setActiveTab('meta_setup');
              }}
              className={`py-2 px-2 rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
                activeEngine === 'meta_cloud'
                  ? 'bg-blue-50 text-blue-950 shadow-xs border-blue-300 ring-1 ring-blue-400'
                  : 'bg-white/60 text-slate-600 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-extrabold text-blue-900">Meta Oficial</span>
              </div>
              <span className="text-[9px] text-blue-600 font-semibold flex items-center gap-0.5">
                <CheckCircle className="w-2.5 h-2.5 text-emerald-500" /> Cloud API BSP
              </span>
            </button>
          </div>
        </div>

        {/* VIEW: CONNECTED INFO */}
        {viewMode === 'connected_info' && whatsappConnectionState === 'open' ? (
          <div className="mt-5 space-y-4">
            <div className="p-5 bg-emerald-50/90 border border-emerald-300 rounded-3xl text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                    WhatsApp Conectado com Sucesso!
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.2 rounded-full font-bold">
                      {activeEngine === 'meta_cloud' ? 'Meta Cloud API Oficial' : 'Online'}
                    </span>
                  </div>
                  <div className="text-xs text-emerald-900/80 mt-1 flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold">{gatewayConfig?.primaryPhoneNumber || '+55 11 98765-4321'}</span>
                    <span>•</span>
                    <span>
                      {activeEngine === 'meta_cloud'
                        ? 'WhatsApp Business Platform (Graph v21.0)'
                        : 'WhatsApp Web v2.3000.1018'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-800">
                      <BatteryCharging className="w-3.5 h-3.5" /> 100% Conectado
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('qrcode_scan')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors shadow-2xs"
                >
                  Reconfigurar Linha
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition-colors shadow-2xs"
                >
                  Desconectar
                </button>
              </div>
            </div>

            {/* Test Send Message */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-600" />
                Testar Envio Imediato pelo Provedor Ativo (ACK 200)
              </div>
              <form onSubmit={handleSendTestMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite uma mensagem de teste..."
                  value={testMessageInput}
                  onChange={(e) => setTestMessageInput(e.target.value)}
                  className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar Teste
                </button>
              </form>

              {testSentSuccess && (
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mensagem transmitida pelo {activeEngine.toUpperCase()} com sucesso (Status: Delivered)!
                </div>
              )}
            </div>
          </div>
        ) : (
          /* VIEW: ACTIVE SETUP ACCORDING TO SELECTED ENGINE */
          <div className="mt-4 space-y-4">
            {/* ENGINE 3: META CLOUD API OFICIAL (WHATSAPP BUSINESS PLATFORM) */}
            {activeEngine === 'meta_cloud' ? (
              <div className="p-5 bg-gradient-to-b from-blue-50/80 to-white border border-blue-200 rounded-3xl space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-sm">
                          WhatsApp Business Platform (Meta Cloud API Oficial)
                        </h3>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Selo Oficial
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Integração direta com os servidores oficiais da Meta (Facebook Graph API v21.0). Sem risco de banimento de número.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      WABA ID (WhatsApp Business Account)
                    </label>
                    <input
                      type="text"
                      value={wabaId}
                      onChange={(e) => setWabaId(e.target.value)}
                      placeholder="Ex: 109284729103982"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Phone Number ID Oficial
                    </label>
                    <input
                      type="text"
                      value={metaPhoneNumberId}
                      onChange={(e) => setMetaPhoneNumberId(e.target.value)}
                      placeholder="Ex: 104829102938472"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    System User Permanent Access Token (Token Permanente Meta)
                  </label>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={metaAccessToken}
                      onChange={(e) => setMetaAccessToken(e.target.value)}
                      placeholder="EAAG9...meta_system_user_token"
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-2xl text-[11px]">
                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[9px] block">
                      Webhook Callback URL
                    </span>
                    <span className="font-mono text-slate-700 truncate block">
                      https://api.omnipulse.io/webhooks/meta-cloud
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[9px] block">
                      Verify Token Configurado
                    </span>
                    <span className="font-mono text-slate-700 font-bold">
                      {metaWebhookToken}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Quality Rating: <strong>HIGH (Verde)</strong> • Limite Tier 2</span>
                  </div>

                  <button
                    onClick={handleValidateMetaOfficial}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Validar Handshake Meta & Conectar Linha
                  </button>
                </div>
              </div>
            ) : activeEngine === 'evolution' ? (
              /* ENGINE 1: EVOLUTION API V2 (QR CODE) */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* QR Canvas / Image Box (5 cols) */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-5 bg-slate-50 border border-slate-200 rounded-3xl relative">
                  <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200 relative flex items-center justify-center min-w-[210px] min-h-[210px]">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR Code WhatsApp"
                        className="w-52 h-52 object-contain rounded-xl"
                      />
                    ) : (
                      <canvas ref={canvasRef} className="rounded-xl w-52 h-52" />
                    )}

                    {isRefreshing && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-2xs rounded-2xl flex flex-col items-center justify-center gap-2 text-emerald-700 font-bold">
                        <RefreshCw className="w-8 h-8 animate-spin" />
                        <span>Gerando QR Code...</span>
                      </div>
                    )}
                  </div>

                  {/* Countdown Progress */}
                  <div className="w-full mt-3 space-y-1 text-center">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                      <span>Atualiza automaticamente em:</span>
                      <span className="font-mono font-bold text-slate-800">{countdown}s</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${(countdown / 45) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 w-full">
                    <button
                      onClick={() => {
                        setCountdown(45);
                        generateQrCode();
                      }}
                      className="flex-1 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-semibold text-[11px] text-slate-700 flex items-center justify-center gap-1 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Novo QR Code
                    </button>

                    <button
                      onClick={handleSimulateScan}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm transition-colors"
                      title="Simula a leitura do QR Code pelo celular instantaneamente"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      Simular Leitura
                    </button>
                  </div>
                </div>

                {/* Instructions & Phone Verification (7 cols) */}
                <div className="md:col-span-7 space-y-3.5">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm">
                      Como ativar o WhatsApp de Origem via QR Code:
                    </h3>
                    <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 text-xs leading-relaxed">
                      <li>Abra o <strong>WhatsApp</strong> no smartphone corporativo.</li>
                      <li>
                        Acesse <strong>Aparelhos Conectados</strong> e toque em <strong>Conectar um Aparelho</strong>.
                      </li>
                      <li>
                        Aponte a câmera para o <strong>QR Code ao lado</strong> para parear.
                      </li>
                    </ol>
                  </div>

                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-800 font-bold uppercase block">
                        Linha WhatsApp de Origem
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {gatewayConfig?.primaryPhoneNumber || '+55 11 98765-4321'}
                      </span>
                    </div>

                    <a
                      href={`https://wa.me/${cleanPhone}?text=OmniPulse%20CRM%20Ativacao%20WhatsApp`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl font-semibold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      Abrir no WhatsApp
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Você também pode clicar no botão <strong>"Simular Leitura"</strong> para testar a homologação instantaneamente sem câmera.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* ENGINE 2: UAZAPI CLOUD (PAIRING CODE) */
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Conectar usando Código de Pareamento de 8 Dígitos (Uazapi Cloud)
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Conecte seu WhatsApp sem precisar usar a câmera fotográfica.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Número do WhatsApp a Conectar
                    </label>
                    <input
                      type="text"
                      value={phoneNumberInput}
                      onChange={(e) => setPhoneNumberInput(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Código de Pareamento Gerado
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-2 bg-emerald-50 border border-emerald-300 rounded-xl font-mono font-black text-emerald-950 text-sm tracking-widest text-center">
                        {pairingCode}
                      </div>
                      <button
                        onClick={handleCopyPairingCode}
                        className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-colors"
                        title="Copiar código"
                      >
                        {copiedCode ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                      let code = 'OMNI-';
                      for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
                      setPairingCode(code);
                    }}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs transition-colors"
                  >
                    Gerar Novo Código
                  </button>

                  <button
                    onClick={handleSimulateScan}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    Confirmar Código & Conectar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live WebSocket Event Console Log */}
        <div className="mt-5 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Terminal className="w-3 h-3 text-slate-500" />
              Console de Sockets & Webhooks em Tempo Real
            </span>
            <span className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {activeEngine === 'meta_cloud' ? 'Meta Graph API Online' : 'Socket Online (18ms)'}
            </span>
          </div>

          <div className="bg-slate-950 text-emerald-400 p-3 rounded-2xl text-[10px] font-mono space-y-1 max-h-24 overflow-y-auto leading-relaxed">
            {socketLogs.map((log, index) => (
              <div key={index} className="truncate">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs">
          <span>Provedor Ativo: <strong>{activeEngine.toUpperCase()}</strong></span>
          <button
            onClick={() => setIsQrModalOpen(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors shadow-2xs"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
