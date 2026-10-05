export type SoundPresetId =
  | 'crystal_bell'
  | 'whatsapp_pulse'
  | 'chat_modern'
  | 'urgent_sonar';

export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0.0 to 1.0
  preset: SoundPresetId;
  playOnNewTicket: boolean;
  playOnIncomingMessage: boolean;
  doubleRingOnNewTicket: boolean;
}

export const SOUND_PRESETS: {
  id: SoundPresetId;
  name: string;
  description: string;
  badge: string;
}[] = [
  {
    id: 'crystal_bell',
    name: 'Campainha Cristal Corporativa',
    description: 'Acorde harmônico de recepção (Dó-Mi-Sol-Dó) claro e profissional',
    badge: 'Recomendado',
  },
  {
    id: 'whatsapp_pulse',
    name: 'Pulso Duplo Esmeralda (WhatsApp)',
    description: 'Sinal sonoro duplo vibrante inspirado em mensageria instantânea',
    badge: 'WhatsApp',
  },
  {
    id: 'chat_modern',
    name: 'Sino Digital Web Chat',
    description: 'Arpejo suave de três notas agudas para chamadas de chat online',
    badge: 'Chat Web',
  },
  {
    id: 'urgent_sonar',
    name: 'Campainha Dupla de Balcão / Fila',
    description: 'Toque clássico de campainha de atendimento ("Ding-Dong" harmônico)',
    badge: 'Forte',
  },
];

class SoundNotificationEngine {
  private ctx: AudioContext | null = null;
  private unlocked = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        try {
          const ctx = this.getContext();
          if (ctx) {
            if (ctx.state === 'suspended') {
              ctx.resume().catch(() => {});
            }
            if (!this.unlocked) {
              // Play silent 1-frame buffer to permanently unlock Web Audio API for background webhook/polling events
              const buffer = ctx.createBuffer(1, 1, 22050);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(0);
              this.unlocked = true;
            }
          }
        } catch {
          // ignore
        }
      };

      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
      window.addEventListener('click', unlockAudio, { passive: true });
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    return this.ctx;
  }

  /**
   * Plays a rich harmonic bell note using a fundamental sine + triangle overtone
   */
  private playNote(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    volume: number,
    type: OscillatorType = 'sine'
  ) {
    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const gain = ctx.createGain();
    const overtoneGain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    // Subtle bell harmonic overtone (2x frequency)
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2, startTime);

    const safeVol = Math.max(0.02, Math.min(1, volume));

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(safeVol * 0.45, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0008, startTime + duration);

    overtoneGain.gain.setValueAtTime(0.001, startTime);
    overtoneGain.gain.linearRampToValueAtTime(safeVol * 0.12, startTime + 0.01);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0005, startTime + duration * 0.65);

    osc.connect(gain);
    overtone.connect(overtoneGain);
    gain.connect(ctx.destination);
    overtoneGain.connect(ctx.destination);

    osc.start(startTime);
    overtone.start(startTime);
    osc.stop(startTime + duration + 0.02);
    overtone.stop(startTime + duration + 0.02);
  }

  public playPreset(preset: SoundPresetId, volume = 0.85, doubleRing = false) {
    const ctx = this.getContext();
    if (!ctx) return;

    const executeRing = () => {
      const triggerSequence = (offset: number) => {
        const now = ctx.currentTime + offset;

        if (preset === 'crystal_bell') {
          // C5 -> E5 -> G5 -> C6 bright reception bell chime
          this.playNote(ctx, 523.25, now, 0.35, volume, 'sine');
          this.playNote(ctx, 659.25, now + 0.09, 0.38, volume, 'sine');
          this.playNote(ctx, 783.99, now + 0.18, 0.42, volume, 'sine');
          this.playNote(ctx, 1046.5, now + 0.27, 0.75, volume, 'sine');
        } else if (preset === 'whatsapp_pulse') {
          // G5 -> B5 -> D6 -> G6 emerald double pulse
          this.playNote(ctx, 783.99, now, 0.18, volume, 'sine');
          this.playNote(ctx, 987.77, now + 0.08, 0.22, volume, 'sine');
          this.playNote(ctx, 1174.66, now + 0.22, 0.25, volume, 'sine');
          this.playNote(ctx, 1567.98, now + 0.3, 0.55, volume, 'sine');
        } else if (preset === 'chat_modern') {
          // A5 -> C#6 -> E6 -> A6 modern digital chime
          this.playNote(ctx, 880.0, now, 0.25, volume, 'triangle');
          this.playNote(ctx, 1108.73, now + 0.1, 0.28, volume, 'triangle');
          this.playNote(ctx, 1318.51, now + 0.2, 0.55, volume, 'sine');
        } else if (preset === 'urgent_sonar') {
          // Classic High-Low-High Desk Reception Bell ("Ding-Dong-Ding")
          this.playNote(ctx, 987.77, now, 0.45, volume, 'sine'); // B5
          this.playNote(ctx, 783.99, now + 0.28, 0.65, volume, 'sine'); // G5
          this.playNote(ctx, 1174.66, now + 0.58, 0.75, volume, 'sine'); // D6
        }
      };

      triggerSequence(0);

      if (doubleRing) {
        triggerSequence(0.95);
      }
    };

    if (ctx.state === 'suspended') {
      ctx
        .resume()
        .then(() => executeRing())
        .catch(() => executeRing());
    } else {
      executeRing();
    }
  }

  /**
   * Subtle pop chime when a new message arrives inside an already open conversation
   */
  public playMessagePop(channel: 'chat' | 'whatsapp', volume = 0.75) {
    const ctx = this.getContext();
    if (!ctx) return;

    const executePop = () => {
      const now = ctx.currentTime;
      if (channel === 'whatsapp') {
        this.playNote(ctx, 783.99, now, 0.16, volume, 'sine');
        this.playNote(ctx, 1174.66, now + 0.07, 0.28, volume, 'sine');
      } else {
        this.playNote(ctx, 659.25, now, 0.16, volume, 'sine');
        this.playNote(ctx, 987.77, now + 0.07, 0.28, volume, 'sine');
      }
    };

    if (ctx.state === 'suspended') {
      ctx
        .resume()
        .then(() => executePop())
        .catch(() => executePop());
    } else {
      executePop();
    }
  }
}

export const soundEngine = new SoundNotificationEngine();
