import React, { useState } from 'react';
import { Calendar, Video, Clock, X } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { createCalendarMeeting } from '../../services/calendarService';
import { getAccessToken } from '../../services/firebaseAuth';

export const ScheduleMeetingModal: React.FC = () => {
  const {
    isScheduleModalOpen,
    setIsScheduleModalOpen,
    scheduleTargetLead,
    setScheduleTargetLead,
  } = useCRM();

  const [summary, setSummary] = useState(
    scheduleTargetLead ? `Demonstração OmniPulse: ${scheduleTargetLead.name}` : 'Apresentação Comercial'
  );
  const [email, setEmail] = useState(scheduleTargetLead?.email || '');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('14:30');
  const [notes, setNotes] = useState(
    'Demonstração ao vivo do funil de vendas, WhatsApp Evolution/Uazapi e IA de transbordo.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isScheduleModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = await getAccessToken();
      const startDateTime = new Date(`${date}T${time}:00`).toISOString();
      const endDateTime = new Date(new Date(`${date}T${time}:00`).getTime() + 45 * 60000).toISOString();

      if (token) {
        await createCalendarMeeting({
          summary,
          description: notes,
          startDateTime,
          endDateTime,
          attendeeEmail: email || undefined,
          attendeeName: scheduleTargetLead?.name,
        });
        alert(`Reunião agendada com sucesso no Google Calendar para ${scheduleTargetLead?.name || 'o cliente'} com link do Google Meet!`);
      } else {
        alert(`Reunião registrada internamente no CRM para ${scheduleTargetLead?.name} (${date} às ${time}). Conecte sua conta do Google Workspace na aba "Google Calendar" para sincronizar com sua agenda!`);
      }

      setIsScheduleModalOpen(false);
      setScheduleTargetLead(null);
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao agendar: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Agendar Demonstração Google Meet
              </h2>
              <p className="text-slate-500 mt-0.5">
                Sincronizado com Google Calendar Workspace
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsScheduleModalOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Título do Compromisso *
            </label>
            <input
              type="text"
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              E-mail do Cliente (Google Meet Invite)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@empresa.com.br"
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
                value={date}
                onChange={(e) => setDate(e.target.value)}
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
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Notas & Pauta da Call
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm"
            >
              {isSubmitting ? 'Agendando...' : 'Confirmar no Google Calendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
