import { getAccessToken } from './firebaseAuth';
import { GoogleCalendarMeeting } from '../types/crm';

export const listCalendarMeetings = async (): Promise<GoogleCalendarMeeting[]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Usuário não autenticado com Google Calendar');
  }

  const now = new Date();
  const timeMin = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
    timeMin
  )}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=25`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Erro ao consultar agenda (${response.status})`);
  }

  const data = await response.json();
  const items = data.items || [];

  return items.map((item: any) => ({
    id: item.id,
    summary: item.summary || 'Reunião Comercial',
    description: item.description || '',
    start: {
      dateTime: item.start?.dateTime || item.start?.date || new Date().toISOString(),
      timeZone: item.start?.timeZone,
    },
    end: {
      dateTime: item.end?.dateTime || item.end?.date || new Date().toISOString(),
      timeZone: item.end?.timeZone,
    },
    attendees: item.attendees?.map((a: any) => ({
      email: a.email,
      displayName: a.displayName,
    })),
    location: item.location || '',
    meetLink: item.hangoutLink || item.conferenceData?.entryPoints?.[0]?.uri,
  }));
};

export const createCalendarMeeting = async (meeting: {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  attendeeEmail?: string;
  attendeeName?: string;
}): Promise<GoogleCalendarMeeting> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Usuário não autenticado com Google Calendar');
  }

  const eventPayload: any = {
    summary: meeting.summary,
    description: meeting.description,
    start: {
      dateTime: meeting.startDateTime,
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: meeting.endDateTime,
      timeZone: 'America/Sao_Paulo',
    },
    conferenceData: {
      createRequest: {
        requestId: `omnipulse-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  if (meeting.attendeeEmail) {
    eventPayload.attendees = [
      {
        email: meeting.attendeeEmail,
        displayName: meeting.attendeeName || meeting.attendeeEmail,
      },
    ];
  }

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Erro ao agendar reunião (${response.status})`);
  }

  const created = await response.json();
  return {
    id: created.id,
    summary: created.summary,
    description: created.description || '',
    start: { dateTime: created.start?.dateTime },
    end: { dateTime: created.end?.dateTime },
    attendees: created.attendees,
    meetLink: created.hangoutLink || created.conferenceData?.entryPoints?.[0]?.uri,
  };
};

export const deleteCalendarMeeting = async (eventId: string, summary: string): Promise<void> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Usuário não autenticado com Google Calendar');
  }

  // MANDATORY Destructive Operation Confirmation (Skill requirement)
  const confirmed = window.confirm(
    `Tem certeza que deseja cancelar e excluir o evento "${summary}" do Google Calendar? Esta ação não pode ser desfeita.`
  );
  if (!confirmed) {
    return;
  }

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok && response.status !== 204 && response.status !== 404) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Erro ao remover evento da agenda');
  }
};
