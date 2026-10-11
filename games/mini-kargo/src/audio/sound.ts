export function createSound() {
  let context: AudioContext | null = null,
    enabled = true,
    paused = false,
    unavailable = false;
  async function unlock() {
    if (unavailable) return;
    try {
      context ??= new AudioContext();
      if (!paused && context.state === "suspended") await context.resume();
    } catch {
      unavailable = true;
    }
  }
  function note(frequency: number, offset: number, duration: number) {
    if (!context || !enabled || paused || context.state !== "running") return;
    try {
      const oscillator = context.createOscillator(),
        gain = context.createGain(),
        at = context.currentTime + offset;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.07, at + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, at + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(at);
      oscillator.stop(at + duration + 0.02);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    } catch {
      /* Sound is optional. */
    }
  }
  return {
    unlock,
    setEnabled(value: boolean) {
      enabled = value;
    },
    setPaused(value: boolean) {
      paused = value;
      if (context) {
        const operation = value ? context.suspend() : context.resume();
        void operation.catch(() => {});
      }
    },
    pickup() {
      note(440, 0, 0.1);
      note(660, 0.09, 0.13);
    },
    delivery() {
      note(523, 0, 0.12);
      note(659, 0.09, 0.13);
      note(784, 0.18, 0.2);
    },
    dispose() {
      void context?.close().catch(() => {});
      context = null;
    },
  };
}
