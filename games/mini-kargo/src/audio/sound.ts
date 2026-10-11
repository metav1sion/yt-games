export function createSound() {
  let context: AudioContext | null = null,
    enabled = true,
    paused = false,
    unavailable = typeof AudioContext === "undefined";

  // Sürekli çalışan sentezleyici node'ları
  let masterGain: GainNode | null = null;
  let engineOsc: OscillatorNode | null = null;
  let engineFilter: BiquadFilterNode | null = null;
  let engineGain: GainNode | null = null;

  let skidGain: GainNode | null = null;
  let skidFilter: BiquadFilterNode | null = null;
  let skidSource: AudioBufferSourceNode | null = null;

  let nitroGain: GainNode | null = null;
  let nitroFilter: BiquadFilterNode | null = null;

  let continuousStarted = false;

  function setupContinuousNodes() {
    if (!context || continuousStarted) return;
    try {
      masterGain = context.createGain();
      masterGain.gain.setValueAtTime(enabled && !paused ? 1 : 0, context.currentTime);
      masterGain.connect(context.destination);

      // 1. Motor Osilatörü (Tok triangle dalgası + dinamik lowpass)
      engineOsc = context.createOscillator();
      engineOsc.type = "triangle";
      engineOsc.frequency.setValueAtTime(48, context.currentTime);

      engineFilter = context.createBiquadFilter();
      engineFilter.type = "lowpass";
      engineFilter.frequency.setValueAtTime(140, context.currentTime);
      engineFilter.Q.setValueAtTime(2.0, context.currentTime);

      engineGain = context.createGain();
      engineGain.gain.setValueAtTime(0, context.currentTime);

      engineOsc.connect(engineFilter);
      engineFilter.connect(engineGain);
      engineGain.connect(masterGain);
      engineOsc.start();

      // 2. Beyaz Gürültü Tamponu (Drift cızırtısı & Nitro rüzgarı için ortak)
      const bufferSize = context.sampleRate;
      const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      skidSource = context.createBufferSource();
      skidSource.buffer = noiseBuffer;
      skidSource.loop = true;

      // Drift filtresi & gain
      skidFilter = context.createBiquadFilter();
      skidFilter.type = "bandpass";
      skidFilter.frequency.setValueAtTime(1900, context.currentTime);
      skidFilter.Q.setValueAtTime(1.4, context.currentTime);

      skidGain = context.createGain();
      skidGain.gain.setValueAtTime(0, context.currentTime);

      skidSource.connect(skidFilter);
      skidFilter.connect(skidGain);
      skidGain.connect(masterGain);

      // Nitro alev rezonans filtresi & gain
      nitroFilter = context.createBiquadFilter();
      nitroFilter.type = "bandpass";
      nitroFilter.frequency.setValueAtTime(950, context.currentTime);
      nitroFilter.Q.setValueAtTime(3.0, context.currentTime);

      nitroGain = context.createGain();
      nitroGain.gain.setValueAtTime(0, context.currentTime);

      skidSource.connect(nitroFilter);
      nitroFilter.connect(nitroGain);
      nitroGain.connect(masterGain);

      skidSource.start();
      continuousStarted = true;
    } catch {
      // Audio isteğe bağlıdır, hata olursa sessiz kal
    }
  }

  async function unlock() {
    if (unavailable) return;
    try {
      context ??= new AudioContext();
      if (!paused && context.state === "suspended") await context.resume();
      setupContinuousNodes();
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
      if (masterGain && context) {
        masterGain.gain.setTargetAtTime(value && !paused ? 1 : 0, context.currentTime, 0.03);
      }
    },
    setPaused(value: boolean) {
      paused = value;
      if (masterGain && context) {
        masterGain.gain.setTargetAtTime(enabled && !value ? 1 : 0, context.currentTime, 0.03);
      }
      if (context) {
        const operation = value ? context.suspend() : context.resume();
        void operation.catch(() => {});
      }
    },
    updateMotor(
      speed: number,
      throttle: number,
      nitro: boolean,
      drifting: boolean,
    ) {
      if (
        !context ||
        !enabled ||
        paused ||
        context.state !== "running" ||
        !engineOsc ||
        !engineFilter ||
        !engineGain
      )
        return;

      const now = context.currentTime;
      const absThrottle = Math.abs(throttle);
      const speedNorm = Math.min(1, speed / 18);

      // Devir hissi (RPM): hız ve gaz basma oranı
      const rpm = speedNorm * 0.72 + absThrottle * 0.28;
      const nitroBoost = nitro && absThrottle > 0.1 ? 35 : 0;

      // 1. Motor frekansı ve alçak geçiren filtre
      const targetFreq = 48 + rpm * 155 + nitroBoost;
      const targetCutoff = 130 + rpm * 520 + (nitro ? 140 : 0);
      const targetEngineGain = speed > 0.1 || absThrottle > 0.05 ? 0.055 : 0.022;

      engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.05);
      engineFilter.frequency.setTargetAtTime(targetCutoff, now, 0.06);
      engineGain.gain.setTargetAtTime(targetEngineGain, now, 0.05);

      // 2. Drift cızırtısı
      if (skidGain) {
        const targetSkid = drifting && speed > 2.0 ? Math.min(0.045, (speed / 14) * 0.045) : 0;
        skidGain.gain.setTargetAtTime(targetSkid, now, 0.035);
      }

      // 3. Nitro fısıltısı
      if (nitroGain) {
        const targetNitro = nitro && absThrottle > 0.1 && speed > 1.0 ? 0.035 : 0;
        nitroGain.gain.setTargetAtTime(targetNitro, now, 0.045);
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
    collision() {
      note(110, 0, 0.12);
      note(75, 0.08, 0.18);
    },
    dispose() {
      try {
        engineOsc?.stop();
        skidSource?.stop();
        engineOsc?.disconnect();
        skidSource?.disconnect();
        masterGain?.disconnect();
      } catch {}
      void context?.close().catch(() => {});
      context = null;
      continuousStarted = false;
    },
  };
}
