export type SoundName = "clack" | "press" | "bell" | "lock" | "rustle";

export type PressAudio = {
  unlock: () => void;
  setMuted: (muted: boolean) => void;
  play: (name: SoundName) => void;
  dispose: () => void;
};

export function createPressAudio(): PressAudio {
  let ctx: AudioContext | null = null;
  let muted = false;

  function context(): AudioContext | null {
    if (muted) return null;
    if (typeof window === "undefined") return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    try {
      if (!ctx) ctx = new AudioCtx();
      if (ctx.state === "suspended") void ctx.resume();
      return ctx;
    } catch {
      return null;
    }
  }

  function tone(freq: number, duration: number, type: OscillatorType, gainValue: number) {
    const audio = context();
    if (!audio) return;
    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function noise(duration: number, gainValue: number, frequency: number) {
    const audio = context();
    if (!audio) return;
    const length = Math.max(1, Math.floor(audio.sampleRate * duration));
    const buffer = audio.createBuffer(1, length, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = audio.createBufferSource();
    source.buffer = buffer;
    const filter = audio.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = frequency;
    const gain = audio.createGain();
    gain.gain.value = gainValue;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);
    source.start();
  }

  return {
    unlock() {
      if (muted) return;
      context();
    },
    setMuted(next) {
      muted = next;
    },
    play(name) {
      try {
        if (name === "clack") {
          noise(0.04, 0.04, 1200);
          tone(180, 0.05, "square", 0.02);
        } else if (name === "press") {
          tone(90, 0.16, "sine", 0.06);
          noise(0.08, 0.03, 400);
        } else if (name === "bell") {
          tone(880, 0.28, "sine", 0.035);
          tone(1320, 0.36, "sine", 0.02);
        } else if (name === "lock") {
          tone(523, 0.18, "sine", 0.04);
          tone(659, 0.28, "sine", 0.03);
        } else {
          noise(0.18, 0.025, 900);
        }
      } catch {
        /* Audio can fail if the context is closed. The press still works. */
      }
    },
    dispose() {
      void ctx?.close();
      ctx = null;
    },
  };
}
