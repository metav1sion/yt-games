import type { DistrictId } from "../game/districts";
import { createAmbience } from "./ambience";
import { createRadio, type StationId, type StationDef, RADIO_STATIONS } from "./radio";

export type { StationId, StationDef };
export { RADIO_STATIONS };

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
  const radio = createRadio(() => context);

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
      radio.setEnabled(value);
      if (masterGain && context) {
        masterGain.gain.setTargetAtTime(value && !paused ? 1 : 0, context.currentTime, 0.03);
      }
    },
    setPaused(value: boolean) {
      paused = value;
      ambience.setPaused(value);
      radio.setPaused(value);
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
      radio.duck(0.25, 1.2);
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
      radio.duck(0.2, 2.0);
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
    leafCrunch() {
      if (!context || !enabled || paused || context.state !== "running") return;
      try {
        const at = context.currentTime;
        // Sonbahar kuru yaprak yığını ezilme ve hışırtı sesi (3 katmanlı bant filtreli çıtırtı)
        for (let i = 0; i < 3; i++) {
          const t = at + i * 0.035;
          const dur = 0.09 + i * 0.02;
          const osc = context.createOscillator();
          const filter = context.createBiquadFilter();
          const gain = context.createGain();

          osc.type = i === 0 ? "triangle" : "sawtooth";
          osc.frequency.setValueAtTime(320 - i * 40, t);
          osc.frequency.exponentialRampToValueAtTime(110, t + dur);

          filter.type = "bandpass";
          filter.frequency.setValueAtTime(1800 + i * 600, t);
          filter.Q.setValueAtTime(2.2, t);

          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.045, t + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(context.destination);
          osc.start(t);
          osc.stop(t + dur + 0.01);
          osc.onended = () => {
            osc.disconnect();
            filter.disconnect();
            gain.disconnect();
          };
        }
      } catch {}
    },
    surfCrash(volume = 1.0) {
      if (!context || !enabled || paused || context.state !== "running") return;
      const vol = Math.max(0, Math.min(1, volume));
      if (vol <= 0.02) return;
      try {
        const at = context.currentTime;
        const dur = 1.35;
        // Sahil kayalıklarına vuran derin okyanus dalgası çarpma ve köpük sesi
        const osc = context.createOscillator();
        const sub = context.createOscillator();
        const filter = context.createBiquadFilter();
        const gain = context.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(120, at);
        osc.frequency.exponentialRampToValueAtTime(45, at + dur);

        sub.type = "sine";
        sub.frequency.setValueAtTime(58, at);
        sub.frequency.exponentialRampToValueAtTime(32, at + dur * 0.8);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(420, at);
        filter.frequency.exponentialRampToValueAtTime(80, at + dur);
        filter.Q.setValueAtTime(1.8, at);

        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(0.05 * vol, at + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, at + dur);

        osc.connect(filter);
        sub.connect(filter);
        filter.connect(gain);
        gain.connect(context.destination);

        osc.start(at);
        sub.start(at);
        osc.stop(at + dur + 0.02);
        sub.stop(at + dur + 0.02);
        osc.onended = () => {
          osc.disconnect();
          sub.disconnect();
          filter.disconnect();
          gain.disconnect();
        };
      } catch {}
    },
    weldingArc(volume = 1.0) {
      if (!context || !enabled || paused || context.state !== "running") return;
      const vol = Math.max(0, Math.min(1, volume));
      if (vol <= 0.02) return;
      try {
        const at = context.currentTime;
        const dur = 0.22;
        // Sanayi metal atölyesi elektrik ark kaynağı cızırtı ve plazma kıvılcım sesi
        const osc = context.createOscillator();
        const filter = context.createBiquadFilter();
        const gain = context.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(110 + (Math.random() - 0.5) * 30, at);
        osc.frequency.linearRampToValueAtTime(220 + (Math.random() - 0.5) * 40, at + dur);

        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1600 + Math.random() * 800, at);
        filter.Q.setValueAtTime(3.2, at);

        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(0.035 * vol, at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, at + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(context.destination);
        osc.start(at);
        osc.stop(at + dur + 0.01);
        osc.onended = () => {
          osc.disconnect();
          filter.disconnect();
          gain.disconnect();
        };
      } catch {}
    },
    packageDrop() {
      if (!context || !enabled || paused || context.state !== "running") return;
      try {
        const at = context.currentTime;
        // 1. Koli bandı ve karton hışırtısı (kısa yüksek frekanslı bandpass gürültü)
        const dur = 0.16;
        const buf = context.createBuffer(1, Math.floor(context.sampleRate * dur), context.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.3));
        const noise = context.createBufferSource();
        noise.buffer = buf;
        const filter = context.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(2800, at);
        filter.Q.setValueAtTime(2.5, at);
        const gain = context.createGain();
        gain.gain.setValueAtTime(0.08, at);
        gain.gain.exponentialRampToValueAtTime(0.001, at + dur);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(context.destination);
        noise.start(at);

        // 2. Masaya / tezgaha tok teslimat vuruşu (damping triangle lowpass)
        const osc = context.createOscillator();
        const oscGain = context.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(140, at);
        osc.frequency.exponentialRampToValueAtTime(55, at + 0.12);
        oscGain.gain.setValueAtTime(0.12, at);
        oscGain.gain.exponentialRampToValueAtTime(0.001, at + 0.14);
        osc.connect(oscGain);
        oscGain.connect(context.destination);
        osc.start(at);
        osc.stop(at + 0.15);
      } catch {}
    },
    courierBeep() {
      if (!context || !enabled || paused || context.state !== "running") return;
      try {
        const at = context.currentTime;
        // İki tonlu neşeli scooter korna cıvıltısı ("bip-bip!")
        const osc1 = context.createOscillator();
        const gain1 = context.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(1250, at);
        osc1.frequency.setValueAtTime(1450, at + 0.06);
        gain1.gain.setValueAtTime(0.08, at);
        gain1.gain.setValueAtTime(0.08, at + 0.05);
        gain1.gain.setValueAtTime(0.005, at + 0.055);
        gain1.gain.setValueAtTime(0.08, at + 0.06);
        gain1.gain.exponentialRampToValueAtTime(0.001, at + 0.14);
        osc1.connect(gain1);
        gain1.connect(context.destination);
        osc1.start(at);
        osc1.stop(at + 0.15);
      } catch {}
    },
    puddleSplash(speed = 5.0) {
      if (!context || !enabled || paused || context.state !== "running") return;
      try {
        const at = context.currentTime;
        const dur = 0.22;
        const vol = Math.min(0.22, 0.07 + speed * 0.012);

        // 1. Su püskürmesi ve tekerlek cızırtısı (bandpass noise sweep)
        const bufLen = Math.floor(context.sampleRate * dur);
        const buf = context.createBuffer(1, bufLen, context.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

        const noise = context.createBufferSource();
        noise.buffer = buf;
        const filter = context.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(2600, at);
        filter.frequency.exponentialRampToValueAtTime(650, at + dur);
        filter.Q.setValueAtTime(2.2, at);

        const gain = context.createGain();
        gain.gain.setValueAtTime(vol, at);
        gain.gain.exponentialRampToValueAtTime(0.001, at + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(context.destination);
        noise.start(at);

        // 2. Suya girme tok vuruşu (damping triangle lowpass)
        const osc = context.createOscillator();
        const oscGain = context.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(120, at);
        osc.frequency.exponentialRampToValueAtTime(45, at + 0.11);
        oscGain.gain.setValueAtTime(vol * 0.9, at);
        oscGain.gain.exponentialRampToValueAtTime(0.001, at + 0.13);

        osc.connect(oscGain);
        oscGain.connect(context.destination);
        osc.start(at);
        osc.stop(at + 0.14);
      } catch {}
    },
    customerTip() {
      if (!context || !enabled || paused || context.state !== "running") return;
      try {
        const at = context.currentTime;
        radio.duck(0.4, 0.6);

        // İki tonlu neşeli altın sikke / bahşiş çanı (A6 1760Hz -> E7 2637Hz)
        const osc1 = context.createOscillator();
        const gain1 = context.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(1760, at);
        gain1.gain.setValueAtTime(0.12, at);
        gain1.gain.exponentialRampToValueAtTime(0.001, at + 0.32);
        osc1.connect(gain1);
        gain1.connect(context.destination);
        osc1.start(at);
        osc1.stop(at + 0.35);

        const osc2 = context.createOscillator();
        const gain2 = context.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(2637, at + 0.08);
        gain2.gain.setValueAtTime(0.001, at);
        gain2.gain.setValueAtTime(0.14, at + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, at + 0.44);
        osc2.connect(gain2);
        gain2.connect(context.destination);
        osc2.start(at + 0.08);
        osc2.stop(at + 0.46);
      } catch {}
    },
    chargerHum(progress = 0.5) {
      if (!context || !enabled || paused || context.state !== "running") return;
      try {
        const at = context.currentTime;
        const osc = context.createOscillator();
        const gain = context.createGain();
        const filter = context.createBiquadFilter();

        osc.type = "sine";
        const freq = 220 + Math.max(0, Math.min(1, progress)) * 480;
        osc.frequency.setValueAtTime(freq, at);
        osc.frequency.exponentialRampToValueAtTime(freq + 40, at + 0.12);

        filter.type = "bandpass";
        filter.frequency.setValueAtTime(freq * 1.5, at);
        filter.Q.setValueAtTime(3.0, at);

        gain.gain.setValueAtTime(0.08, at);
        gain.gain.exponentialRampToValueAtTime(0.001, at + 0.14);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(context.destination);

        osc.start(at);
        osc.stop(at + 0.15);
      } catch {}
    },
    chargeComplete() {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      try {
        const at = ctx.currentTime;
        radio.duck(0.35, 0.8);

        // Geleceğin elektrikli hızlı şarj tamamlama arpej jingle'ı (E5 659Hz, A5 880Hz, E6 1318Hz, A6 1760Hz)
        const notes = [659, 880, 1318, 1760];
        notes.forEach((freq, idx) => {
          const t = at + idx * 0.07;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.setValueAtTime(0.12, t + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.38);
        });
      } catch {}
    },
    streetSnack() {
      if (!context || !enabled || paused || context.state !== "running") return;
      try {
        const at = context.currentTime;
        radio.duck(0.4, 0.6);

        // Çıtır simit / sıcak kestane atıştırma sesi (İki çıtır rezonans tıkırtısı ve neşeli majör akor)
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1046, at); // C6
        osc.frequency.exponentialRampToValueAtTime(1318, at + 0.1); // E6

        gain.gain.setValueAtTime(0.14, at);
        gain.gain.exponentialRampToValueAtTime(0.001, at + 0.28);

        osc.connect(gain);
        gain.connect(context.destination);
        osc.start(at);
        osc.stop(at + 0.3);
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
      radio.update(dt);
    },
    setRadioStation(stationId: StationId) {
      radio.setStation(stationId);
    },
    cycleRadioStation(): StationId {
      return radio.cycleStation();
    },
    getRadioStation(): StationId {
      return radio.getStation();
    },
    getRadioStationInfo(stationId?: StationId): StationDef {
      return radio.getStationInfo(stationId);
    },
    duckRadio(factor?: number, duration?: number) {
      radio.duck(factor, duration);
    },
    dispose() {
      ambience.dispose();
      radio.dispose();
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
