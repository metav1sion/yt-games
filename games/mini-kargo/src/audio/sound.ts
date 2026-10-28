import type { DistrictId } from "../game/districts";
import { createAmbience } from "./ambience";

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
  const ambience = createAmbience(() => context);

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
      ambience.setEnabled(value);
      if (masterGain && context) {
        masterGain.gain.setTargetAtTime(value && !paused ? 1 : 0, context.currentTime, 0.03);
      }
    },
    setPaused(value: boolean) {
      paused = value;
      ambience.setPaused(value);
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
    collision(kind?: "cone" | "trash" | "box") {
      this.propHit(kind);
    },
    propHit(kind?: "cone" | "trash" | "box") {
      if (!context || !enabled || paused || context.state !== "running") return;
      try {
        const at = context.currentTime;

        // Prop türüne göre frekans ve tını parametreleri (arcade knock / crunch)
        let startFreq = 260;
        let endFreq = 55;
        let duration = 0.12;
        let oscType: OscillatorType = "triangle";
        let snapFreq = 620;

        if (kind === "cone") {
          // Plastik kuka: tıkırtılı, hafif tiz içi boş plastik sesi (pop & clack)
          startFreq = 340;
          endFreq = 85;
          duration = 0.09;
          oscType = "sine";
          snapFreq = 780;
        } else if (kind === "trash") {
          // Metalik çöp tenekesi: tok metal darbe ve çınlama hissi (clang & rattle)
          startFreq = 210;
          endFreq = 48;
          duration = 0.16;
          oscType = "sawtooth";
          snapFreq = 480;
        } else {
          // Karton kutu (box): tok kütleme ve karton kırılma hışırtısı (thud & crunch)
          startFreq = 175;
          endFreq = 38;
          duration = 0.11;
          oscType = "triangle";
          snapFreq = 380;
        }

        // 1. Ana darbe vuruşu (tok inişli gövde darbesi)
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = oscType;
        osc.frequency.setValueAtTime(startFreq, at);
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), at + duration * 0.85);

        gain.gain.setValueAtTime(0.11, at);
        gain.gain.exponentialRampToValueAtTime(0.001, at + duration);

        osc.connect(gain);
        gain.connect(context.destination);
        osc.start(at);
        osc.stop(at + duration + 0.02);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };

        // 2. Anlık çıtırtı/klik rezonansı (arcade snap / crunch)
        const snap = context.createOscillator();
        const snapGain = context.createGain();
        snap.type = "sine";
        snap.frequency.setValueAtTime(snapFreq, at);
        snap.frequency.exponentialRampToValueAtTime(110, at + 0.04);

        snapGain.gain.setValueAtTime(0.07, at);
        snapGain.gain.exponentialRampToValueAtTime(0.001, at + 0.045);

        snap.connect(snapGain);
        snapGain.connect(context.destination);
        snap.start(at);
        snap.stop(at + 0.05);
        snap.onended = () => {
          snap.disconnect();
          snapGain.disconnect();
        };
      } catch {
        /* Sound is optional */
      }
    },
    carHorn() {
      if (!context || !enabled || paused || context.state !== "running") return;
      try {
        const at = context.currentTime;
        const dur = 0.32;
        // Çift harmonik araba kornası (420 Hz & 505 Hz)
        for (const freq of [420, 505]) {
          const osc = context.createOscillator();
          const gain = context.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, at);

          gain.gain.setValueAtTime(0, at);
          gain.gain.linearRampToValueAtTime(0.045, at + 0.015);
          gain.gain.setValueAtTime(0.045, at + dur - 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, at + dur);

          osc.connect(gain);
          gain.connect(context.destination);
          osc.start(at);
          osc.stop(at + dur + 0.02);
          osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
          };
        }
      } catch {}
    },
    metalCrash() {
      note(110, 0, 0.12);
      note(75, 0.08, 0.18);
      if (!context || !enabled || paused || context.state !== "running") return;
      try {
        const at = context.currentTime;
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(95, at);
        osc.frequency.exponentialRampToValueAtTime(28, at + 0.2);

        gain.gain.setValueAtTime(0.12, at);
        gain.gain.exponentialRampToValueAtTime(0.001, at + 0.22);

        osc.connect(gain);
        gain.connect(context.destination);
        osc.start(at);
        osc.stop(at + 0.24);
      } catch {}
    },
    playMoneyDrain() {
      if (!context || !enabled || paused || context.state !== "running") return;
      try {
        const osc = context.createOscillator();
        const gain = context.createGain();
        const at = context.currentTime;
        // Ritmik, hafif ve tok sayma tıkırtısı
        const freq = 1050 + (Math.random() - 0.5) * 140;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, at);
        osc.frequency.exponentialRampToValueAtTime(420, at + 0.035);

        gain.gain.setValueAtTime(0.045, at);
        gain.gain.exponentialRampToValueAtTime(0.001, at + 0.04);

        osc.connect(gain);
        gain.connect(context.destination);
        osc.start(at);
        osc.stop(at + 0.045);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      } catch {
        /* Sound is optional */
      }
    },
    playUnlockJingle() {
      // C5 - E5 - G5 - C6 neşeli zafer arpeji
      note(523.25, 0, 0.1);
      note(659.25, 0.07, 0.1);
      note(783.99, 0.14, 0.12);
      note(1046.5, 0.21, 0.35);
    },
    jumpLaunch() {
      if (!context || !enabled || paused || context.state !== "running") return;
      try {
        const at = context.currentTime;
        const dur = 0.45;
        // Yükselen rüzgar / hava fırlatma osilatörü (Whoosh sweep: 95Hz -> 320Hz)
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(95, at);
        osc.frequency.exponentialRampToValueAtTime(320, at + dur);

        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(0.09, at + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, at + dur);

        osc.connect(gain);
        gain.connect(context.destination);
        osc.start(at);
        osc.stop(at + dur + 0.02);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      } catch {}
    },
    jumpLanding(intensity = 1.0) {
      if (!context || !enabled || paused || context.state !== "running") return;
      try {
        const at = context.currentTime;
        const dur = 0.22;
        // Tok süspansiyon iniş darbesi (Suspension thud: 110Hz -> 32Hz)
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(110, at);
        osc.frequency.exponentialRampToValueAtTime(32, at + dur * 0.9);

        const volume = Math.min(0.18, 0.08 * Math.max(0.5, intensity));
        gain.gain.setValueAtTime(volume, at);
        gain.gain.exponentialRampToValueAtTime(0.001, at + dur);

        osc.connect(gain);
        gain.connect(context.destination);
        osc.start(at);
        osc.stop(at + dur + 0.02);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };

        // Lastik asfalt kavrama çıtırtısı (Tire pavement grip snap)
        const snap = context.createOscillator();
        const snapGain = context.createGain();
        snap.type = "sine";
        snap.frequency.setValueAtTime(360, at);
        snap.frequency.exponentialRampToValueAtTime(120, at + 0.06);

        snapGain.gain.setValueAtTime(0.05, at);
        snapGain.gain.exponentialRampToValueAtTime(0.001, at + 0.065);

        snap.connect(snapGain);
        snapGain.connect(context.destination);
        snap.start(at);
        snap.stop(at + 0.07);
        snap.onended = () => {
          snap.disconnect();
          snapGain.disconnect();
        };
      } catch {}
    },
    cleanDriveBonus() {
      // D5, F#5, A5 neşeli majör üçlü arpej
      note(587.33, 0, 0.12);
      note(739.99, 0.08, 0.14);
      note(880.0, 0.16, 0.22);
    },
    comboFanfare(streak = 2) {
      if (streak >= 5) {
        // C5, E5, G5, B5, C6, E6 muzaffer şampiyon arpeji
        note(523.25, 0, 0.12);
        note(659.25, 0.06, 0.12);
        note(783.99, 0.12, 0.14);
        note(987.77, 0.18, 0.16);
        note(1046.5, 0.24, 0.22);
        note(1318.5, 0.32, 0.35);
      } else if (streak >= 4) {
        // C5, E5, G5, C6
        note(523.25, 0, 0.12);
        note(659.25, 0.07, 0.12);
        note(783.99, 0.14, 0.15);
        note(1046.5, 0.22, 0.28);
      } else if (streak >= 3) {
        // C5, G5, C6
        note(523.25, 0, 0.12);
        note(783.99, 0.08, 0.15);
        note(1046.5, 0.16, 0.25);
      } else {
        // C5, E5, G5
        note(523.25, 0, 0.12);
        note(659.25, 0.08, 0.14);
        note(783.99, 0.16, 0.22);
      }
    },
    seagullCry() {
      if (!context || !enabled || paused || context.state !== "running") return;
      try {
        const at = context.currentTime;
        const dur = 0.58;
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = "sine";
        // Sahil martı çığlığı: tiz yükseliş ve dalgalı alçalış
        osc.frequency.setValueAtTime(1450, at);
        osc.frequency.exponentialRampToValueAtTime(2150, at + 0.18);
        osc.frequency.exponentialRampToValueAtTime(1550, at + dur);

        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(0.045, at + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, at + dur);

        osc.connect(gain);
        gain.connect(context.destination);
        osc.start(at);
        osc.stop(at + dur + 0.02);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      } catch {}
    },
    pigeonScatter() {
      if (!context || !enabled || paused || context.state !== "running") return;
      try {
        const at = context.currentTime;
        // Çarşı güvercinlerinin panikle havalanma kanat çırpış puf sesleri
        for (let i = 0; i < 4; i++) {
          const t = at + i * 0.065;
          const osc = context.createOscillator();
          const gain = context.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(260 - i * 22, t);
          osc.frequency.exponentialRampToValueAtTime(95, t + 0.05);

          gain.gain.setValueAtTime(0.038, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

          osc.connect(gain);
          gain.connect(context.destination);
          osc.start(t);
          osc.stop(t + 0.06);
          osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
          };
        }
      } catch {}
    },
    catMeow() {
      if (!context || !enabled || paused || context.state !== "running") return;
      try {
        const at = context.currentTime;
        const dur = 0.42;
        // Güneş Mahallesi sevimli kedi miyavlaması (formant filtreli)
        const osc = context.createOscillator();
        const filter = context.createBiquadFilter();
        const gain = context.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(580, at);
        osc.frequency.exponentialRampToValueAtTime(820, at + 0.14);
        osc.frequency.exponentialRampToValueAtTime(520, at + dur);

        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1100, at);
        filter.frequency.exponentialRampToValueAtTime(1850, at + 0.16);
        filter.frequency.exponentialRampToValueAtTime(950, at + dur);
        filter.Q.setValueAtTime(3.5, at);

        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(0.035, at + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, at + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(context.destination);
        osc.start(at);
        osc.stop(at + dur + 0.02);
        osc.onended = () => {
          osc.disconnect();
          filter.disconnect();
          gain.disconnect();
        };
      } catch {}
    },
    dogBark() {
      if (!context || !enabled || paused || context.state !== "running") return;
      try {
        const at = context.currentTime;
        // Sanayi lojistik bekçi köpeği ("Karabaş") canlı çift havlama
        for (let i = 0; i < 2; i++) {
          const t = at + i * 0.15;
          const dur = 0.11;
          const osc = context.createOscillator();
          const filter = context.createBiquadFilter();
          const gain = context.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(185, t);
          osc.frequency.exponentialRampToValueAtTime(85, t + dur);

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(520, t);
          filter.Q.setValueAtTime(2.0, t);

          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.055, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(context.destination);
          osc.start(t);
          osc.stop(t + dur + 0.02);
          osc.onended = () => {
            osc.disconnect();
            filter.disconnect();
            gain.disconnect();
          };
        }
      } catch {}
    },
    setDistrict(districtId: DistrictId) {
      ambience.setDistrict(districtId);
    },
    setRainIntensity(intensity: number) {
      ambience.setRainIntensity(intensity);
    },
    updateAmbience(dt: number) {
      ambience.update(dt);
    },
    dispose() {
      ambience.dispose();
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
