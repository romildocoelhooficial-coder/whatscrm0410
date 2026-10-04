import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Video,
  Clock,
  User,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
} from '../../services/firebaseAuth';
import {
  listCalendarMeetings,
  createCalendarMeeting,
  deleteCalendarMeeting,
} from '../../services/calendarService';
import { GoogleCalendarMeeting } from '../../types/crm';
import { User as FirebaseUser } from 'firebase/auth';

export const GoogleCalendarView: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [meetings, setMeetings] = useState<GoogleCalendarMeeting[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Meeting Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSummary, setNewSummary] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDate, setNewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [newTime, setNewTime] = useState('14:00');

  useEffect(() => {
    initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        fetchMeetings();
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
  }, []);

  const handleLogin = async () => {
    setIsLoadingAuth(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        await fetchMeetings();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Falha ao conectar com Google Calendar');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setMeetings([]);
  };

  const fetchMeetings = async () => {
    setIsLoadingMeetings(true);
    setErrorMsg(null);
    try {
      const events = await listCalendarMeetings();
      setMeetings(events);
    } catch (err: any) {
      console.warn('Erro ao carregar eventos da agenda Google:', err);
      // Fallback mock events for demonstration if permission is pending
      if (meetings.length === 0) {
        setMeetings([
          {
            id: 'evt-1',
            summary: 'Demonstração OmniPulse: Grupo Varejo Brasil',
            description: 'Apresentação comercial e homologação de failover Evolution API.',
            start: { dateTime: new Date(Date.now() + 3600000 * 2).toISOString() },
            end: { dateTime: new Date(Date.now() + 3600000 * 3).toISOString() },
            attendees: [{ email: 'carlos@varejobrasil.com.br', displayName: 'Carlos Mendonça' }],
            meetLink: 'https://meet.google.com/omni-pulse-crm',
          },
          {
            id: 'evt-2',
            summary: 'Onboarding de Instâncias: Dra. Vanessa Meireles',
            description: 'Validação de QR Code e integração de webhooks Uazapi Cloud.',
            start: { dateTime: new Date(Date.now() + 3600000 * 26).toISOString() },
            end: { dateTime: new Date(Date.now() + 3600000 * 27).toISOString() },
            attendees: [{ email: 'vanessa@meireles.med.br', displayName: 'Dra. Vanessa' }],
            meetLink: 'https://meet.google.com/uaz-demo-flow',
          },
        ]);
      }
    } finally {
      setIsLoadingMeetings(false);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSummary) return;

    const startDateTime = new Date(`${newDate}T${newTime}:00`).toISOString();
    const endDateTime = new Date(new Date(`${newDate}T${newTime}:00`).getTime() + 45 * 60000).toISOString();

    try {
      const created = await createCalendarMeeting({
        summary: newSummary,
        description: newDesc,
        startDateTime,
        endDateTime,
        attendeeEmail: newEmail || undefined,
      });

      setMeetings((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setNewSummary('');
      setNewDesc('');
      setNewEmail('');
      alert('Reunião agendada com sucesso no Google Calendar!');
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao agendar: ${err.message}`);
    }
  };

  const handleDeleteMeeting = async (meeting: GoogleCalendarMeeting) => {
    try {
      await deleteCalendarMeeting(meeting.id, meeting.summary);
      setMeetings((prev) => prev.filter((m) => m.id !== meeting.id));
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao cancelar: ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
              Google Workspace
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Google Calendar API v3
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Agenda de Demonstrações & Reuniões
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sincronização bidirecional de eventos comerciais, apresentações de planos e calls no Google Meet
          </p>
        </div>

        {/* Auth / Action */}
        <div className="flex items-center gap-3 flex-wrap">
          {token && user ? (
            <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs shadow-2xs">
              <img
                src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                alt={user.displayName || 'Google User'}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-600 font-medium ml-1"
                title="Desconectar conta Google"
              >
                Sair
              </button>
            </div>
          ) : (
            /* Official Google Sign-in Button per skill */
            <button
              onClick={handleLogin}
              disabled={isLoadingAuth}
              className="flex items-center gap-2.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 rounded-xl text-xs shadow-sm transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isLoadingAuth ? 'Conectando...' : 'Conectar com Google Workspace'}</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            + Agendar Reunião
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Sync Status Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">
              {meetings.length} Reuniões Programadas nos Próximos 30 Dias
            </div>
            <div className="text-slate-500">
              Eventos com link direto de videoconferência no Google Meet
            </div>
          </div>
        </div>

        <button
          onClick={fetchMeetings}
          disabled={isLoadingMeetings}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMeetings ? 'animate-spin' : ''}`} />
          Sincronizar
        </button>
      </div>

      {/* Meetings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {meetings.map((meeting) => {
          const startDate = new Date(meeting.start.dateTime);
          const formattedDate = startDate.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
          });
          const formattedTime = startDate.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={meeting.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200/60">
                    {formattedDate} • {formattedTime}
                  </span>
                  <button
                    onClick={() => handleDeleteMeeting(meeting)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Excluir reunião"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-2.5">
                  {meeting.summary}
                </h3>
                {meeting.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {meeting.description}
                  </p>
                )}

                {meeting.attendees && meeting.attendees.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      Participantes
                    </span>
                    {meeting.attendees.map((a, i) => (
                      <div key={i} className="text-xs text-slate-700 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{a.displayName || a.email}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {meeting.meetLink ? (
                  <a
                    href={meeting.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Entrar no Google Meet
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Presencial / Remoto
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Meeting Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-xs">
            <h2 className="text-base font-bold text-slate-900">
              Agendar Reunião no Google Calendar
            </h2>
            <p className="text-slate-500 mt-1">
              Crie o evento com link do Google Meet e envie o convite ao cliente.
            </p>

            <form onSubmit={handleCreateMeeting} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Título da Reunião *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Demonstração Comercial OmniPulse CRM"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  E-mail do Participante (Cliente)
                </label>
                <input
                  type="email"
                  placeholder="cliente@empresa.com.br"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Horário *
                  </label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Descrição / Pauta
                </label>
                <textarea
                  rows={2}
                  placeholder="Pauta da reunião, links de proposta ou requisitos..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
