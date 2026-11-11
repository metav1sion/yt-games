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
    catPurr() {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      try {
        const at = ctx.currentTime;
        radio.duck(0.4, 0.6);

        // Kedi mırıltısı: Titreşimli derin rezonans (42Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(42, at);

        gain.gain.setValueAtTime(0.08, at);
        gain.gain.exponentialRampToValueAtTime(0.001, at + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(at);
        osc.stop(at + 0.6);
      } catch {}
    },
    fuelPump() {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      try {
        const at = ctx.currentTime;
        radio.duck(0.4, 0.5);

        // 1. Düşük frekanslı pompa akış vuruşu (65Hz)
        const pumpOsc = ctx.createOscillator();
        const pumpGain = ctx.createGain();
        pumpOsc.type = "sine";
        pumpOsc.frequency.setValueAtTime(65, at);
        pumpOsc.frequency.exponentialRampToValueAtTime(110, at + 0.12);
        pumpGain.gain.setValueAtTime(0.12, at);
        pumpGain.gain.exponentialRampToValueAtTime(0.001, at + 0.2);
        pumpOsc.connect(pumpGain);
        pumpGain.connect(ctx.destination);
        pumpOsc.start(at);
        pumpOsc.stop(at + 0.22);

        // 2. Akaryakıt pompası klasik çift mekanik çan çınlaması (1318Hz & 1760Hz)
        const bellNotes = [1318, 1760];
        bellNotes.forEach((freq, idx) => {
          const t = at + 0.08 + idx * 0.08;
          const bellOsc = ctx.createOscillator();
          const bellGain = ctx.createGain();
          bellOsc.type = "triangle";
          bellOsc.frequency.setValueAtTime(freq, t);
          bellGain.gain.setValueAtTime(0.15, t);
          bellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
          bellOsc.connect(bellGain);
          bellGain.connect(ctx.destination);
          bellOsc.start(t);
          bellOsc.stop(t + 0.28);
        });
      } catch {}
    },
    carWash() {
      if (!context || !enabled || paused || context.state !== "running") return;
      try {
        const at = context.currentTime;
        radio.duck(0.35, 0.8);

        // 1. Dönen köpüklü fırça vınlaması (180Hz yumuşak rezonans)
        const brushOsc = context.createOscillator();
        const brushGain = context.createGain();
        brushOsc.type = "sine";
        brushOsc.frequency.setValueAtTime(160, at);
        brushOsc.frequency.linearRampToValueAtTime(220, at + 0.25);
        brushOsc.frequency.linearRampToValueAtTime(150, at + 0.55);
        brushGain.gain.setValueAtTime(0.08, at);
        brushGain.gain.exponentialRampToValueAtTime(0.001, at + 0.6);
        brushOsc.connect(brushGain);
        brushGain.connect(context.destination);
        brushOsc.start(at);
        brushOsc.stop(at + 0.62);

        // 2. Tazyikli su jeti püskürmesi (Bant geçiren gürültü patlaması)
        const bufferSize = Math.floor(context.sampleRate * 0.45);
        const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const noise = context.createBufferSource();
        noise.buffer = noiseBuffer;
        const filter = context.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1400, at);
        filter.Q.setValueAtTime(1.8, at);
        const nGain = context.createGain();
        nGain.gain.setValueAtTime(0.12, at);
        nGain.gain.exponentialRampToValueAtTime(0.001, at + 0.45);
        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(context.destination);
        noise.start(at);
      } catch {}
    },
    constructionDrill() {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      try {
        const at = ctx.currentTime;
        // Pnömatik kırıcı / kompresör: 18Hz ritmik darbe serisi (4 vuruş)
        for (let i = 0; i < 4; i++) {
          const t = at + i * 0.055;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(75, t);
          osc.frequency.exponentialRampToValueAtTime(35, t + 0.04);
          gain.gain.setValueAtTime(0.09, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.05);
        }
      } catch {}
    },
    teaSpoonClink() {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      try {
        const at = ctx.currentTime;
        // İnce belli çay bardağı içinde pirinç çay kaşığı çınlaması (2600Hz & 3400Hz harmonikleri)
        const notes = [2600, 3400];
        notes.forEach((freq, idx) => {
          const t = at + idx * 0.035;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.25);
        });
      } catch {}
    },
    fishingReel() {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      try {
        const at = ctx.currentTime;
        // Olta makarası tıkırtısı (hızlı klik sesleri)
        for (let i = 0; i < 3; i++) {
          const t = at + i * 0.04;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(1100 + i * 150, t);
          gain.gain.setValueAtTime(0.07, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.03);
        }
      } catch {}
    },
    thunderRoll(intensity = 1.0) {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      try {
        const at = ctx.currentTime;
        radio.duck(0.2, 2.5);

        // 1. Şimşek ilk darbe / keskin çıtırtı (Initial sharp lightning discharge crack)
        const crackLen = 0.12;
        const crackBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * crackLen), ctx.sampleRate);
        const crackData = crackBuf.getChannelData(0);
        for (let i = 0; i < crackData.length; i++) {
          crackData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.025));
        }
        const crackSource = ctx.createBufferSource();
        crackSource.buffer = crackBuf;
        const crackFilter = ctx.createBiquadFilter();
        crackFilter.type = "bandpass";
        crackFilter.frequency.setValueAtTime(2200, at);
        crackFilter.Q.setValueAtTime(2.0, at);
        const crackGain = ctx.createGain();
        crackGain.gain.setValueAtTime(0.25 * intensity, at);
        crackGain.gain.exponentialRampToValueAtTime(0.001, at + crackLen);
        crackSource.connect(crackFilter);
        crackFilter.connect(crackGain);
        crackGain.connect(ctx.destination);
        crackSource.start(at);

        // 2. Derin gök gürültüsü uğultusu ve yankısı (Sub-bass rolling rumble & reverberation)
        const rumbleDur = 2.4;
        const rumbleBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * rumbleDur), ctx.sampleRate);
        const rumbleData = rumbleBuf.getChannelData(0);
        let last = 0;
        for (let i = 0; i < rumbleData.length; i++) {
          const white = Math.random() * 2 - 1;
          last = (last + 0.04 * white) / 1.04;
          rumbleData[i] = last * 3.5;
        }
        const rumbleSource = ctx.createBufferSource();
        rumbleSource.buffer = rumbleBuf;

        const rumbleFilter = ctx.createBiquadFilter();
        rumbleFilter.type = "lowpass";
        rumbleFilter.frequency.setValueAtTime(220, at);
        rumbleFilter.frequency.exponentialRampToValueAtTime(45, at + rumbleDur);
        rumbleFilter.Q.setValueAtTime(3.2, at);

        const rumbleGain = ctx.createGain();
        rumbleGain.gain.setValueAtTime(0.35 * intensity, at + 0.04);
        rumbleGain.gain.exponentialRampToValueAtTime(0.001, at + rumbleDur);

        rumbleSource.connect(rumbleFilter);
        rumbleFilter.connect(rumbleGain);
        rumbleGain.connect(ctx.destination);
        rumbleSource.start(at + 0.04);

        // 3. Sub-bass darbe osilatörü (48Hz -> 32Hz)
        const subOsc = ctx.createOscillator();
        subOsc.type = "triangle";
        subOsc.frequency.setValueAtTime(52, at + 0.02);
        subOsc.frequency.exponentialRampToValueAtTime(28, at + 0.9);
        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.22 * intensity, at + 0.02);
        subGain.gain.exponentialRampToValueAtTime(0.001, at + 1.2);
        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.start(at + 0.02);
        subOsc.stop(at + 1.25);
      } catch {}
    },
    carnivalChime() {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      try {
        const at = ctx.currentTime;
        radio.duck(0.35, 1.2);
        // 4 notalı neşeli lunapark çan akoru (C5 -> E5 -> G5 -> C6)
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((freq, i) => {
          const t = at + i * 0.085;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.13, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.38);
        });
      } catch {}
    },
    tramBell() {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      try {
        const at = ctx.currentTime;
        radio.duck(0.4, 0.8);
        // Nostaljik tramvay pirinç çan vuruşu ("Çan çan!" - çift vuruş)
        const strikes = [0, 0.13];
        for (const offset of strikes) {
          const t = at + offset;
          // Ana parlak metalik çan frekansı (1568 Hz [G6])
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(1568, t);
          gain1.gain.setValueAtTime(0.18, t);
          gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start(t);
          osc1.stop(t + 0.4);

          // Üst harmonik zil çınlaması (3136 Hz [G7])
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = "triangle";
          osc2.frequency.setValueAtTime(3136, t);
          gain2.gain.setValueAtTime(0.08, t);
          gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(t);
          osc2.stop(t + 0.25);
        }
      } catch {}
    },
    railCrossing() {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      try {
        const t = ctx.currentTime;
        // Elektronik hemzemin geçit çan vuruşu (880 Hz [A5] berrak çınlama)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, t);
        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);

        // Üst harmonik (1760 Hz [A6])
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(1760, t);
        gain2.gain.setValueAtTime(0.06, t);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(t);
        osc2.stop(t + 0.2);
      } catch {}
    },
    trainHorn() {
      // Devre dışı bırakıldı: tekrarlayan piyanomsu korna sesi kaldırıldı
    },
    windChime() {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      try {
        const at = ctx.currentTime;
        radio.duck(0.5, 0.9);
        // Huzurlu bahçe rüzgar çanı ezgisi (pentatonik C6, E6, G6, C7, A6 kristal çınlama)
        const notes = [
          { freq: 1046.5, delay: 0.00 }, // C6
          { freq: 1318.5, delay: 0.08 }, // E6
          { freq: 1567.9, delay: 0.16 }, // G6
          { freq: 2093.0, delay: 0.26 }, // C7
          { freq: 1760.0, delay: 0.38 }, // A6
        ];
        for (const n of notes) {
          const t = at + n.delay;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(n.freq, t);
          gain.gain.setValueAtTime(0.09, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.7);
        }
      } catch {}
    },
    fishSizzle(volume = 1.0) {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      const vol = Math.max(0, Math.min(1, volume));
      if (vol <= 0.02) return;
      try {
        const at = ctx.currentTime;
        radio.duck(0.5, 1.2);
        const dur = 1.1;

        // 1. Taze palamut balığı sac ızgara cızırtısı (Bandpass gürültü sentezi)
        const sampleRate = ctx.sampleRate || 44100;
        const bufLen = Math.floor(sampleRate * dur);
        const buf = ctx.createBuffer(1, bufLen, sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
          // Çatırdayan mikro yağ damlacıkları ve cızırtı greni
          const grain = (Math.random() * 2 - 1) * (Math.random() > 0.88 ? 1.6 : 0.7);
          data[i] = grain;
        }

        const src = ctx.createBufferSource();
        src.buffer = buf;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(4200, at);
        filter.Q.setValueAtTime(3.2, at);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, at);
        gain.gain.linearRampToValueAtTime(0.18 * vol, at + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        src.start(at);
        src.stop(at + dur);
        src.onended = () => {
          src.disconnect();
          filter.disconnect();
          gain.disconnect();
        };

        // 2. Sıcak ızgaradaki balık yağı fokurdaması (Micro-pop bubbler)
        for (let j = 0; j < 4; j++) {
          const popTime = at + 0.08 + j * 0.22 + Math.random() * 0.06;
          const osc = ctx.createOscillator();
          const popGain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(380 + Math.random() * 240, popTime);
          osc.frequency.exponentialRampToValueAtTime(120, popTime + 0.05);
          popGain.gain.setValueAtTime(0.04 * vol, popTime);
          popGain.gain.exponentialRampToValueAtTime(0.0001, popTime + 0.05);
          osc.connect(popGain);
          popGain.connect(ctx.destination);
          osc.start(popTime);
          osc.stop(popTime + 0.06);
          osc.onended = () => {
            osc.disconnect();
            popGain.disconnect();
          };
        }
      } catch {}
    },
    wrenchClick(volume = 1.0) {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      const vol = Math.max(0, Math.min(1, volume));
      if (vol <= 0.02) return;
      try {
        const at = ctx.currentTime;
        // Cırcır lokma anahtar dişli dönüş tıklamaları (4-5 hızlı mikro-tıkırtı)
        const clicks = [0, 0.045, 0.09, 0.14, 0.195];
        for (let i = 0; i < clicks.length; i++) {
          const t = at + clicks[i];
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = "triangle";
          const baseFreq = 3400 + i * 160 + (Math.random() * 80 - 40);
          osc.frequency.setValueAtTime(baseFreq, t);
          osc.frequency.exponentialRampToValueAtTime(1400, t + 0.022);

          filter.type = "bandpass";
          filter.frequency.setValueAtTime(baseFreq, t);
          filter.Q.setValueAtTime(6.0, t);

          gain.gain.setValueAtTime(0.12 * vol, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + 0.03);
          osc.onended = () => {
            osc.disconnect();
            filter.disconnect();
            gain.disconnect();
          };
        }
      } catch {}
    },
    shopBell(volume = 1.0) {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      const vol = Math.max(0, Math.min(1, volume));
      if (vol <= 0.02) return;
      try {
        const at = ctx.currentTime;
        radio.duck(0.7, 0.5);
        // Geleneksel pirinç bakkal kapı çıngırağı (neşeli C7, E7, G7 kristal çan vuruşları)
        const strikes = [
          { freq: 2093.0, delay: 0.000, dur: 0.35, gain: 0.22 }, // C7
          { freq: 2637.0, delay: 0.075, dur: 0.45, gain: 0.26 }, // E7
          { freq: 3136.0, delay: 0.150, dur: 0.30, gain: 0.16 }, // G7
        ];
        for (const s of strikes) {
          const t = at + s.delay;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = "sine";
          osc.frequency.setValueAtTime(s.freq, t);
          // Doğal pirinç çan mikro-eğrisi
          osc.frequency.exponentialRampToValueAtTime(s.freq * 0.985, t + s.dur);

          filter.type = "bandpass";
          filter.frequency.setValueAtTime(s.freq, t);
          filter.Q.setValueAtTime(8.0, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(s.gain * vol, t + 0.003);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + s.dur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + s.dur + 0.05);
          osc.onended = () => {
            osc.disconnect();
            filter.disconnect();
            gain.disconnect();
          };
        }
      } catch {}
    },
    diceRoll(volume = 1.0) {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      const vol = Math.max(0, Math.min(1, volume));
      if (vol <= 0.02) return;
      try {
        const at = ctx.currentTime;
        radio.duck(0.75, 0.4);
        // Geleneksel sedef kakmalı ahşap tavla zarlarının tıkırtısı (Tavla Zarları Çalkalama & Yuvarlanma)
        const bounces = [
          { delay: 0.000, freq: 1950, dur: 0.028, gain: 0.28 },
          { delay: 0.040, freq: 2350, dur: 0.025, gain: 0.24 },
          { delay: 0.085, freq: 1720, dur: 0.024, gain: 0.20 },
          { delay: 0.135, freq: 2180, dur: 0.022, gain: 0.16 },
          { delay: 0.190, freq: 1850, dur: 0.020, gain: 0.12 },
          { delay: 0.250, freq: 2050, dur: 0.018, gain: 0.09 },
        ];
        for (const b of bounces) {
          const t = at + b.delay;
          // 1. Tok ahşap kasa rezonansı
          const lowOsc = ctx.createOscillator();
          const lowGain = ctx.createGain();
          lowOsc.type = "sine";
          lowOsc.frequency.setValueAtTime(310, t);
          lowOsc.frequency.exponentialRampToValueAtTime(140, t + b.dur);

          lowGain.gain.setValueAtTime(0.001, t);
          lowGain.gain.linearRampToValueAtTime(b.gain * 0.4 * vol, t + 0.002);
          lowGain.gain.exponentialRampToValueAtTime(0.0001, t + b.dur);

          lowOsc.connect(lowGain);
          lowGain.connect(ctx.destination);
          lowOsc.start(t);
          lowOsc.stop(t + b.dur + 0.02);
          lowOsc.onended = () => {
            lowOsc.disconnect();
            lowGain.disconnect();
          };

          // 2. Sert kemik/ahşap zar vuruş kliği
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(b.freq, t);
          osc.frequency.exponentialRampToValueAtTime(b.freq * 0.5, t + b.dur);

          filter.type = "bandpass";
          filter.frequency.setValueAtTime(b.freq, t);
          filter.Q.setValueAtTime(6.0, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(b.gain * vol, t + 0.001);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + b.dur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + b.dur + 0.03);
          osc.onended = () => {
            osc.disconnect();
            filter.disconnect();
            gain.disconnect();
          };
        }
      } catch {}
    },
    iceCreamBell(volume = 1.0) {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      const vol = Math.max(0, Math.min(1, volume));
      if (vol <= 0.02) return;
      try {
        const at = ctx.currentTime;
        radio.duck(0.7, 0.45);
        // Geleneksel Maraş dondurmacısı pirinç çıngırak sesi (Çift vuruşlu şıngırtı)
        const strikes = [
          { delay: 0.000, freq: 2637, overtone: 5274, dur: 0.18, gain: 0.35 },
          { delay: 0.085, freq: 3136, overtone: 6272, dur: 0.22, gain: 0.38 },
        ];
        for (const s of strikes) {
          const t = at + s.delay;
          // 1. Temel pirinç çan tınısı
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(s.freq, t);
          osc1.frequency.exponentialRampToValueAtTime(s.freq * 0.98, t + s.dur);

          gain1.gain.setValueAtTime(0.001, t);
          gain1.gain.linearRampToValueAtTime(s.gain * vol, t + 0.002);
          gain1.gain.exponentialRampToValueAtTime(0.0001, t + s.dur);

          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start(t);
          osc1.stop(t + s.dur + 0.04);
          osc1.onended = () => {
            osc1.disconnect();
            gain1.disconnect();
          };

          // 2. Parlak metalik üst harmonik (shimmer)
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc2.type = "triangle";
          osc2.frequency.setValueAtTime(s.overtone, t);

          filter.type = "highpass";
          filter.frequency.setValueAtTime(2200, t);

          gain2.gain.setValueAtTime(0.001, t);
          gain2.gain.linearRampToValueAtTime(s.gain * 0.45 * vol, t + 0.001);
          gain2.gain.exponentialRampToValueAtTime(0.0001, t + s.dur * 0.85);

          osc2.connect(filter);
          filter.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(t);
          osc2.stop(t + s.dur + 0.04);
          osc2.onended = () => {
            osc2.disconnect();
            filter.disconnect();
            gain2.disconnect();
          };
        }
      } catch {}
    },
    soupLadle(volume = 1.0) {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      const vol = Math.max(0, Math.min(1, volume));
      if (vol <= 0.02) return;
      try {
        const at = ctx.currentTime;
        radio.duck(0.7, 0.45);
        // Geleneksel esnaf lokantası paslanmaz çelik çorba kepçesi tıkırtısı ve sıcak yemek cızırtısı
        const strikes = [
          { delay: 0.000, freq: 1864, overtone: 3728, dur: 0.14, gain: 0.32 },
          { delay: 0.075, freq: 2093, overtone: 4186, dur: 0.16, gain: 0.35 },
        ];
        for (const s of strikes) {
          const t = at + s.delay;
          // 1. Metalik tencere/kepçe vuruş tınısı
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(s.freq, t);
          osc1.frequency.exponentialRampToValueAtTime(s.freq * 0.95, t + s.dur);

          gain1.gain.setValueAtTime(0.001, t);
          gain1.gain.linearRampToValueAtTime(s.gain * vol, t + 0.002);
          gain1.gain.exponentialRampToValueAtTime(0.0001, t + s.dur);

          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start(t);
          osc1.stop(t + s.dur + 0.03);
          osc1.onended = () => {
            osc1.disconnect();
            gain1.disconnect();
          };

          // 2. Çelik tını ve rezonans (triangle yüksek harmonik)
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc2.type = "triangle";
          osc2.frequency.setValueAtTime(s.overtone, t);

          filter.type = "bandpass";
          filter.frequency.setValueAtTime(2600, t);
          filter.Q.setValueAtTime(3.0, t);

          gain2.gain.setValueAtTime(0.001, t);
          gain2.gain.linearRampToValueAtTime(s.gain * 0.4 * vol, t + 0.001);
          gain2.gain.exponentialRampToValueAtTime(0.0001, t + s.dur * 0.8);

          osc2.connect(filter);
          filter.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(t);
          osc2.stop(t + s.dur + 0.03);
          osc2.onended = () => {
            osc2.disconnect();
            filter.disconnect();
            gain2.disconnect();
          };
        }

        // 3. Sıcak sulu yemek ve döner cızırtısı / kaynama kabarcığı
        const bufferSize = Math.floor(ctx.sampleRate * 0.28);
        const noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const out = noiseBuf.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          out[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(1550, at);
        noiseFilter.Q.setValueAtTime(2.5, at);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.001, at);
        noiseGain.gain.linearRampToValueAtTime(0.18 * vol, at + 0.03);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.28);

        noiseSrc.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noiseSrc.start(at);
        noiseSrc.stop(at + 0.3);
        noiseSrc.onended = () => {
          noiseSrc.disconnect();
          noiseFilter.disconnect();
          noiseGain.disconnect();
        };
      } catch {}
    },
    schoolBell(volume = 1.0) {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      const vol = Math.max(0, Math.min(1, volume));
      if (vol <= 0.02) return;
      try {
        const at = ctx.currentTime;
        radio.duck(0.75, 0.55);
        // Geleneksel Türk taş mektep pirinç okul zili (recess bell / teneffüs zili melodisi)
        // C6 (1046Hz) -> E6 (1318Hz) -> G6 (1568Hz) arpej ve pirinç çan çınlaması
        const strikes = [
          { delay: 0.000, freq: 1046.5, overtone: 2093.0, dur: 0.28, gain: 0.38 },
          { delay: 0.135, freq: 1318.5, overtone: 2637.0, dur: 0.28, gain: 0.40 },
          { delay: 0.270, freq: 1568.0, overtone: 3136.0, dur: 0.42, gain: 0.44 },
        ];
        for (const s of strikes) {
          const t = at + s.delay;
          // 1. Ana pirinç çan gövde tonu (sine)
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(s.freq, t);
          osc1.frequency.exponentialRampToValueAtTime(s.freq * 0.99, t + s.dur);

          gain1.gain.setValueAtTime(0.001, t);
          gain1.gain.linearRampToValueAtTime(s.gain * vol, t + 0.003);
          gain1.gain.exponentialRampToValueAtTime(0.0001, t + s.dur);

          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start(t);
          osc1.stop(t + s.dur + 0.04);
          osc1.onended = () => {
            osc1.disconnect();
            gain1.disconnect();
          };

          // 2. Pirinç çan parlak metalik üst harmonik (triangle + bandpass filtre)
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc2.type = "triangle";
          osc2.frequency.setValueAtTime(s.overtone, t);

          filter.type = "bandpass";
          filter.frequency.setValueAtTime(s.overtone, t);
          filter.Q.setValueAtTime(4.0, t);

          gain2.gain.setValueAtTime(0.001, t);
          gain2.gain.linearRampToValueAtTime(s.gain * 0.45 * vol, t + 0.002);
          gain2.gain.exponentialRampToValueAtTime(0.0001, t + s.dur * 0.9);

          osc2.connect(filter);
          filter.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(t);
          osc2.stop(t + s.dur + 0.04);
          osc2.onended = () => {
            osc2.disconnect();
            filter.disconnect();
            gain2.disconnect();
          };
        }
      } catch {}
    },
    woodOven(volume = 1.0) {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      const vol = Math.max(0, Math.min(1, volume));
      if (vol <= 0.02) return;
      try {
        const at = ctx.currentTime;
        radio.duck(0.75, 0.55);

        // 1. Taş taban fırın küreği tınısı (woody peel tap on brick stone hearth floor)
        const tapOsc = ctx.createOscillator();
        const tapGain = ctx.createGain();
        const tapFilter = ctx.createBiquadFilter();

        tapOsc.type = "sine";
        tapOsc.frequency.setValueAtTime(240, at);
        tapOsc.frequency.exponentialRampToValueAtTime(80, at + 0.18);

        tapFilter.type = "lowpass";
        tapFilter.frequency.setValueAtTime(450, at);

        tapGain.gain.setValueAtTime(0.001, at);
        tapGain.gain.linearRampToValueAtTime(0.42 * vol, at + 0.004);
        tapGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);

        tapOsc.connect(tapFilter);
        tapFilter.connect(tapGain);
        tapGain.connect(ctx.destination);
        tapOsc.start(at);
        tapOsc.stop(at + 0.2);
        tapOsc.onended = () => {
          tapOsc.disconnect();
          tapFilter.disconnect();
          tapGain.disconnect();
        };

        // 2. Meşe odunu ateşi kor çıtırtısı (hearth ember crackle bursts)
        const crackleCount = 4;
        for (let i = 0; i < crackleCount; i++) {
          const cAt = at + 0.02 + i * 0.045 + Math.random() * 0.02;
          const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.025), ctx.sampleRate);
          const data = noiseBuffer.getChannelData(0);
          for (let s = 0; s < data.length; s++) {
            data[s] = (Math.random() * 2 - 1) * Math.exp(-s / (data.length * 0.3));
          }
          const noiseSrc = ctx.createBufferSource();
          noiseSrc.buffer = noiseBuffer;

          const nFilter = ctx.createBiquadFilter();
          nFilter.type = "bandpass";
          nFilter.frequency.setValueAtTime(1400 + i * 400, cAt);
          nFilter.Q.setValueAtTime(6.0, cAt);

          const nGain = ctx.createGain();
          nGain.gain.setValueAtTime(0.001, cAt);
          nGain.gain.linearRampToValueAtTime(0.22 * vol, cAt + 0.002);
          nGain.gain.exponentialRampToValueAtTime(0.0001, cAt + 0.03);

          noiseSrc.connect(nFilter);
          nFilter.connect(nGain);
          nGain.connect(ctx.destination);
          noiseSrc.start(cAt);
          noiseSrc.stop(cAt + 0.035);
          noiseSrc.onended = () => {
            noiseSrc.disconnect();
            nFilter.disconnect();
            nGain.disconnect();
          };
        }

        // 3. Fırın kapak & simitçi çıngırak melodisi (G5 784Hz -> C6 1046Hz)
        const bellNotes = [
          { delay: 0.08, freq: 784.0, dur: 0.22, g: 0.3 },
          { delay: 0.20, freq: 1046.5, dur: 0.32, g: 0.35 },
        ];
        for (const b of bellNotes) {
          const bAt = at + b.delay;
          const bOsc = ctx.createOscillator();
          const bGain = ctx.createGain();

          bOsc.type = "sine";
          bOsc.frequency.setValueAtTime(b.freq, bAt);

          bGain.gain.setValueAtTime(0.001, bAt);
          bGain.gain.linearRampToValueAtTime(b.g * vol, bAt + 0.003);
          bGain.gain.exponentialRampToValueAtTime(0.0001, bAt + b.dur);

          bOsc.connect(bGain);
          bGain.connect(ctx.destination);
          bOsc.start(bAt);
          bOsc.stop(bAt + b.dur + 0.02);
          bOsc.onended = () => {
            bOsc.disconnect();
            bGain.disconnect();
          };
        }
      } catch {}
    },
    fogHorn(vol = 1.0) {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      const volume = Math.max(0, Math.min(1, vol));
      if (volume <= 0.02) return;
      try {
        const at = ctx.currentTime;
        radio.duck(0.25, 2.2);

        // 1. Deniz sis düdüğü kalın rezonans akoru (140Hz & 146.8Hz hafif vuruşlu ton, 70Hz göğüs bası)
        const tones = [
          { freq: 140.0, type: "sawtooth" as OscillatorType, g: 0.35, detune: 0 },
          { freq: 146.8, type: "sawtooth" as OscillatorType, g: 0.30, detune: 4 },
          { freq: 70.0, type: "triangle" as OscillatorType, g: 0.40, detune: 0 },
          { freq: 280.0, type: "sine" as OscillatorType, g: 0.18, detune: 2 },
        ];

        const dur = 1.8;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(320, at);
        filter.frequency.linearRampToValueAtTime(720, at + 0.35);
        filter.frequency.exponentialRampToValueAtTime(260, at + dur);
        filter.Q.setValueAtTime(3.5, at);

        const hornGain = ctx.createGain();
        hornGain.gain.setValueAtTime(0.001, at);
        hornGain.gain.linearRampToValueAtTime(0.45 * volume, at + 0.28);
        hornGain.gain.setValueAtTime(0.42 * volume, at + 1.1);
        hornGain.gain.exponentialRampToValueAtTime(0.0001, at + dur);

        filter.connect(hornGain);
        hornGain.connect(ctx.destination);

        for (const t of tones) {
          const osc = ctx.createOscillator();
          osc.type = t.type;
          osc.frequency.setValueAtTime(t.freq, at);
          if (t.detune) osc.detune.setValueAtTime(t.detune, at);

          const tGain = ctx.createGain();
          tGain.gain.setValueAtTime(t.g, at);
          osc.connect(tGain);
          tGain.connect(filter);

          osc.start(at);
          osc.stop(at + dur + 0.05);
          osc.onended = () => {
            osc.disconnect();
            tGain.disconnect();
          };
        }
      } catch {}
    },
    marketScale(vol = 1.0) {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      const volume = Math.max(0, Math.min(1, vol));
      if (volume <= 0.02) return;
      try {
        const at = ctx.currentTime;
        radio.duck(0.4, 0.85);

        // 1. Pirinç pazar terazisi kefesi & gram ağırlığı vuruşları (çınlama & tıkırtı)
        const strikes = [
          { delay: 0.00, freq: 2093.0, dur: 0.28, gain: 0.32 * volume, type: "sine" as OscillatorType },
          { delay: 0.00, freq: 3136.0, dur: 0.16, gain: 0.20 * volume, type: "triangle" as OscillatorType },
          { delay: 0.09, freq: 2637.0, dur: 0.22, gain: 0.28 * volume, type: "sine" as OscillatorType },
          { delay: 0.18, freq: 3951.0, dur: 0.14, gain: 0.18 * volume, type: "triangle" as OscillatorType },
          { delay: 0.26, freq: 1760.0, dur: 0.35, gain: 0.25 * volume, type: "sine" as OscillatorType },
        ];

        for (const s of strikes) {
          const sAt = at + s.delay;
          const osc = ctx.createOscillator();
          osc.type = s.type;
          osc.frequency.setValueAtTime(s.freq, sAt);
          osc.frequency.exponentialRampToValueAtTime(s.freq * 0.96, sAt + s.dur);

          const g = ctx.createGain();
          g.gain.setValueAtTime(0.001, sAt);
          g.gain.linearRampToValueAtTime(s.gain, sAt + 0.015);
          g.gain.exponentialRampToValueAtTime(0.0001, sAt + s.dur);

          osc.connect(g);
          g.connect(ctx.destination);

          osc.start(sAt);
          osc.stop(sAt + s.dur + 0.02);
          osc.onended = () => {
            osc.disconnect();
            g.disconnect();
          };
        }

        // 2. Mekanik denge kolu ve terazi rezonansı
        const armOsc = ctx.createOscillator();
        armOsc.type = "sine";
        armOsc.frequency.setValueAtTime(880, at);
        armOsc.frequency.exponentialRampToValueAtTime(659, at + 0.32);

        const armGain = ctx.createGain();
        armGain.gain.setValueAtTime(0.001, at);
        armGain.gain.linearRampToValueAtTime(0.18 * volume, at + 0.03);
        armGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.38);

        armOsc.connect(armGain);
        armGain.connect(ctx.destination);
        armOsc.start(at);
        armOsc.stop(at + 0.40);
        armOsc.onended = () => {
          armOsc.disconnect();
          armGain.disconnect();
        };
      } catch {}
    },
    buzzSaw(vol = 1.0) {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      const volume = Math.max(0, Math.min(1, vol));
      if (volume <= 0.02) return;
      try {
        const at = ctx.currentTime;
        radio.duck(0.4, 0.95);

        // 1. Dönen metal daire testere bıçağı vızıltısı ve diş sürtünmesi (sawtooth + bandpass)
        const sawOsc = ctx.createOscillator();
        const sawFilter = ctx.createBiquadFilter();
        const sawGain = ctx.createGain();

        sawOsc.type = "sawtooth";
        sawOsc.frequency.setValueAtTime(340, at);
        sawOsc.frequency.linearRampToValueAtTime(520, at + 0.18);
        sawOsc.frequency.exponentialRampToValueAtTime(280, at + 0.65);

        sawFilter.type = "bandpass";
        sawFilter.frequency.setValueAtTime(1450, at);
        sawFilter.frequency.linearRampToValueAtTime(1850, at + 0.25);
        sawFilter.Q.setValueAtTime(2.8, at);

        sawGain.gain.setValueAtTime(0.001, at);
        sawGain.gain.linearRampToValueAtTime(0.24 * volume, at + 0.04);
        sawGain.gain.setValueAtTime(0.22 * volume, at + 0.35);
        sawGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.68);

        sawOsc.connect(sawFilter);
        sawFilter.connect(sawGain);
        sawGain.connect(ctx.destination);

        sawOsc.start(at);
        sawOsc.stop(at + 0.70);
        sawOsc.onended = () => {
          sawOsc.disconnect();
          sawFilter.disconnect();
          sawGain.disconnect();
        };

        // 2. Ahşap kesim gövdesi rezonansı & el rendesi tok talaş sesi (triangle wood bite)
        const woodOsc = ctx.createOscillator();
        const woodGain = ctx.createGain();

        woodOsc.type = "triangle";
        woodOsc.frequency.setValueAtTime(165, at);
        woodOsc.frequency.linearRampToValueAtTime(110, at + 0.45);

        woodGain.gain.setValueAtTime(0.001, at);
        woodGain.gain.linearRampToValueAtTime(0.18 * volume, at + 0.03);
        woodGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.50);

        woodOsc.connect(woodGain);
        woodGain.connect(ctx.destination);

        woodOsc.start(at);
        woodOsc.stop(at + 0.52);
        woodOsc.onended = () => {
          woodOsc.disconnect();
          woodGain.disconnect();
        };
      } catch {}
    },
    coppersmith(vol = 1.0) {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      const volume = Math.max(0, Math.min(1, vol));
      if (volume <= 0.02) return;
      try {
        const at = ctx.currentTime;
        radio.duck(0.4, 0.95);

        // 1. Birinci Çekiç Vuruşu (Tık) - Bakır tavlama ve kalıp darbesi
        const strike1Osc = ctx.createOscillator();
        const strike1Gain = ctx.createGain();
        strike1Osc.type = "triangle";
        strike1Osc.frequency.setValueAtTime(1180, at);
        strike1Osc.frequency.exponentialRampToValueAtTime(740, at + 0.12);

        strike1Gain.gain.setValueAtTime(0.001, at);
        strike1Gain.gain.linearRampToValueAtTime(0.26 * volume, at + 0.015);
        strike1Gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.14);

        strike1Osc.connect(strike1Gain);
        strike1Gain.connect(ctx.destination);
        strike1Osc.start(at);
        strike1Osc.stop(at + 0.16);
        strike1Osc.onended = () => {
          strike1Osc.disconnect();
          strike1Gain.disconnect();
        };

        // 2. İkinci Ritmik Çekiç Çınlaması (Çınnn!) - Parlak metalik rezonans ve pirinç çan tınısı
        const t2 = at + 0.16;
        const strike2Osc = ctx.createOscillator();
        const strike2Filter = ctx.createBiquadFilter();
        const strike2Gain = ctx.createGain();

        strike2Osc.type = "sine";
        strike2Osc.frequency.setValueAtTime(1420, t2);
        strike2Osc.frequency.exponentialRampToValueAtTime(1260, t2 + 0.38);

        strike2Filter.type = "bandpass";
        strike2Filter.frequency.setValueAtTime(1380, t2);
        strike2Filter.Q.setValueAtTime(6.0, t2);

        strike2Gain.gain.setValueAtTime(0.001, t2);
        strike2Gain.gain.linearRampToValueAtTime(0.32 * volume, t2 + 0.012);
        strike2Gain.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.42);

        strike2Osc.connect(strike2Filter);
        strike2Filter.connect(strike2Gain);
        strike2Gain.connect(ctx.destination);
        strike2Osc.start(t2);
        strike2Osc.stop(t2 + 0.45);
        strike2Osc.onended = () => {
          strike2Osc.disconnect();
          strike2Filter.disconnect();
          strike2Gain.disconnect();
        };

        // 3. Yüksek Harmonik Bakır Tınısı (2840 Hz ince bakır şerbetliği çınlaması)
        const harmOsc = ctx.createOscillator();
        const harmGain = ctx.createGain();
        harmOsc.type = "sine";
        harmOsc.frequency.setValueAtTime(2840, t2);

        harmGain.gain.setValueAtTime(0.001, t2);
        harmGain.gain.linearRampToValueAtTime(0.12 * volume, t2 + 0.01);
        harmGain.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.35);

        harmOsc.connect(harmGain);
        harmGain.connect(ctx.destination);
        harmOsc.start(t2);
        harmOsc.stop(t2 + 0.38);
        harmOsc.onended = () => {
          harmOsc.disconnect();
          harmGain.disconnect();
        };

        // 4. Örs Kütüğü Tok Ahşap/Demir Taban Sesi (220 Hz tok darbe)
        const anvilOsc = ctx.createOscillator();
        const anvilGain = ctx.createGain();
        anvilOsc.type = "triangle";
        anvilOsc.frequency.setValueAtTime(220, at);
        anvilOsc.frequency.exponentialRampToValueAtTime(90, at + 0.09);

        anvilGain.gain.setValueAtTime(0.001, at);
        anvilGain.gain.linearRampToValueAtTime(0.20 * volume, at + 0.01);
        anvilGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.11);

        anvilOsc.connect(anvilGain);
        anvilGain.connect(ctx.destination);
        anvilOsc.start(at);
        anvilOsc.stop(at + 0.13);
        anvilOsc.onended = () => {
          anvilOsc.disconnect();
          anvilGain.disconnect();
        };
      } catch {}
    },
    filmProjector(vol = 1.0) {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      const volume = Math.max(0, Math.min(1, vol));
      if (volume <= 0.02) return;
      try {
        const at = ctx.currentTime;

        // 1. 35mm Projektör Mekanik Deklanşör / Obtüratör Tıklamaları (Rhythmic shutter clatter: 4 rapid clicks)
        for (let i = 0; i < 4; i++) {
          const t = at + i * 0.042;
          const clickOsc = ctx.createOscillator();
          const clickFilter = ctx.createBiquadFilter();
          const clickGain = ctx.createGain();

          clickOsc.type = "square";
          clickOsc.frequency.setValueAtTime(1450 + (i % 2) * 220, t);
          clickOsc.frequency.exponentialRampToValueAtTime(750, t + 0.018);

          clickFilter.type = "bandpass";
          clickFilter.frequency.setValueAtTime(1900, t);
          clickFilter.Q.setValueAtTime(4.2, t);

          clickGain.gain.setValueAtTime(0.001, t);
          clickGain.gain.linearRampToValueAtTime(0.18 * volume, t + 0.003);
          clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.022);

          clickOsc.connect(clickFilter);
          clickFilter.connect(clickGain);
          clickGain.connect(ctx.destination);

          clickOsc.start(t);
          clickOsc.stop(t + 0.025);
          clickOsc.onended = () => {
            clickOsc.disconnect();
            clickFilter.disconnect();
            clickGain.disconnect();
          };
        }

        // 2. Elektrikli Projektör Motor Uğultusu (160 Hz warm projector hum)
        const humOsc = ctx.createOscillator();
        const humGain = ctx.createGain();
        humOsc.type = "triangle";
        humOsc.frequency.setValueAtTime(160, at);
        humOsc.frequency.linearRampToValueAtTime(180, at + 0.18);
        humOsc.frequency.linearRampToValueAtTime(155, at + 0.38);

        humGain.gain.setValueAtTime(0.001, at);
        humGain.gain.linearRampToValueAtTime(0.12 * volume, at + 0.03);
        humGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.40);

        humOsc.connect(humGain);
        humGain.connect(ctx.destination);
        humOsc.start(at);
        humOsc.stop(at + 0.42);
        humOsc.onended = () => {
          humOsc.disconnect();
          humGain.disconnect();
        };

        // 3. Film Makarası Dönen Dişli Hışırtısı (Filtered soft hiss & flutter)
        const flutterOsc = ctx.createOscillator();
        const flutterFilter = ctx.createBiquadFilter();
        const flutterGain = ctx.createGain();

        flutterOsc.type = "sawtooth";
        flutterOsc.frequency.setValueAtTime(320, at);
        flutterOsc.frequency.exponentialRampToValueAtTime(480, at + 0.12);
        flutterOsc.frequency.exponentialRampToValueAtTime(240, at + 0.35);

        flutterFilter.type = "bandpass";
        flutterFilter.frequency.setValueAtTime(1100, at);
        flutterFilter.Q.setValueAtTime(3.0, at);

        flutterGain.gain.setValueAtTime(0.001, at);
        flutterGain.gain.linearRampToValueAtTime(0.08 * volume, at + 0.02);
        flutterGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.36);

        flutterOsc.connect(flutterFilter);
        flutterFilter.connect(flutterGain);
        flutterGain.connect(ctx.destination);

        flutterOsc.start(at);
        flutterOsc.stop(at + 0.38);
        flutterOsc.onended = () => {
          flutterOsc.disconnect();
          flutterFilter.disconnect();
          flutterGain.disconnect();
        };
      } catch {}
    },
    postStamp(vol = 1.0) {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      const volume = Math.max(0, Math.min(1, vol));
      if (volume <= 0.02) return;
      try {
        const at = ctx.currentTime;

        // 1. Posta Istampa / Mühür Tok Darbesi (Resonant stamp thud)
        const thudOsc = ctx.createOscillator();
        const thudFilter = ctx.createBiquadFilter();
        const thudGain = ctx.createGain();

        thudOsc.type = "sine";
        thudOsc.frequency.setValueAtTime(160, at);
        thudOsc.frequency.exponentialRampToValueAtTime(55, at + 0.08);

        thudFilter.type = "lowpass";
        thudFilter.frequency.setValueAtTime(420, at);
        thudFilter.Q.setValueAtTime(2.5, at);

        thudGain.gain.setValueAtTime(0.001, at);
        thudGain.gain.linearRampToValueAtTime(0.35 * volume, at + 0.004);
        thudGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.12);

        thudOsc.connect(thudFilter);
        thudFilter.connect(thudGain);
        thudGain.connect(ctx.destination);

        thudOsc.start(at);
        thudOsc.stop(at + 0.14);
        thudOsc.onended = () => {
          thudOsc.disconnect();
          thudFilter.disconnect();
          thudGain.disconnect();
        };

        // 2. Sert Istampa Mekanik Çıt / Tok Çarpması (Transient slap)
        const snapOsc = ctx.createOscillator();
        const snapFilter = ctx.createBiquadFilter();
        const snapGain = ctx.createGain();

        snapOsc.type = "triangle";
        snapOsc.frequency.setValueAtTime(1200, at);
        snapOsc.frequency.exponentialRampToValueAtTime(350, at + 0.025);

        snapFilter.type = "bandpass";
        snapFilter.frequency.setValueAtTime(1600, at);
        snapFilter.Q.setValueAtTime(3.0, at);

        snapGain.gain.setValueAtTime(0.001, at);
        snapGain.gain.linearRampToValueAtTime(0.22 * volume, at + 0.002);
        snapGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.035);

        snapOsc.connect(snapFilter);
        snapFilter.connect(snapGain);
        snapGain.connect(ctx.destination);

        snapOsc.start(at);
        snapOsc.stop(at + 0.04);
        snapOsc.onended = () => {
          snapOsc.disconnect();
          snapFilter.disconnect();
          snapGain.disconnect();
        };

        // 3. İki Hızlı Telgraf Anahtarı Tıkırtısı (2 rapid telegraph morse clicks)
        const clicks = [0.09, 0.15];
        clicks.forEach((offset, idx) => {
          const t = at + offset;
          const clickOsc = ctx.createOscillator();
          const clickGain = ctx.createGain();

          clickOsc.type = "sine";
          clickOsc.frequency.setValueAtTime(idx === 0 ? 1980 : 2340, t);
          clickOsc.frequency.exponentialRampToValueAtTime(1200, t + 0.016);

          clickGain.gain.setValueAtTime(0.001, t);
          clickGain.gain.linearRampToValueAtTime(0.16 * volume, t + 0.002);
          clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.022);

          clickOsc.connect(clickGain);
          clickGain.connect(ctx.destination);

          clickOsc.start(t);
          clickOsc.stop(t + 0.025);
          clickOsc.onended = () => {
            clickOsc.disconnect();
            clickGain.disconnect();
          };
        });
      } catch {}
    },
    powerHammer(vol = 1.0) {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      const volume = Math.max(0, Math.min(1, vol));
      if (volume <= 0.02) return;
      try {
        const at = ctx.currentTime;

        // 1. Ağır Şahmerdan Tok Darbesi (Deep drop hammer punch / kick)
        const punchOsc = ctx.createOscillator();
        const punchFilter = ctx.createBiquadFilter();
        const punchGain = ctx.createGain();

        punchOsc.type = "sine";
        punchOsc.frequency.setValueAtTime(85, at);
        punchOsc.frequency.exponentialRampToValueAtTime(28, at + 0.16);

        punchFilter.type = "lowpass";
        punchFilter.frequency.setValueAtTime(320, at);
        punchFilter.Q.setValueAtTime(2.0, at);

        punchGain.gain.setValueAtTime(0.001, at);
        punchGain.gain.linearRampToValueAtTime(0.42 * volume, at + 0.005);
        punchGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);

        punchOsc.connect(punchFilter);
        punchFilter.connect(punchGain);
        punchGain.connect(ctx.destination);

        punchOsc.start(at);
        punchOsc.stop(at + 0.24);
        punchOsc.onended = () => {
          punchOsc.disconnect();
          punchFilter.disconnect();
          punchGain.disconnect();
        };

        // 2. Pnömatik Hava Tıslaması (Pneumatic valve air release whoosh)
        const hissBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.08), ctx.sampleRate);
        const hissData = hissBuffer.getChannelData(0);
        for (let i = 0; i < hissData.length; i++) {
          hissData[i] = (Math.random() * 2 - 1) * (1 - i / hissData.length);
        }
        const hissSource = ctx.createBufferSource();
        hissSource.buffer = hissBuffer;
        const hissFilter = ctx.createBiquadFilter();
        hissFilter.type = "bandpass";
        hissFilter.frequency.setValueAtTime(2200, at);
        hissFilter.frequency.exponentialRampToValueAtTime(750, at + 0.07);
        hissFilter.Q.setValueAtTime(2.2, at);

        const hissGain = ctx.createGain();
        hissGain.gain.setValueAtTime(0.001, at);
        hissGain.gain.linearRampToValueAtTime(0.25 * volume, at + 0.004);
        hissGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.075);

        hissSource.connect(hissFilter);
        hissFilter.connect(hissGain);
        hissGain.connect(ctx.destination);

        hissSource.start(at);
        hissSource.stop(at + 0.08);
        hissSource.onended = () => {
          hissSource.disconnect();
          hissFilter.disconnect();
          hissGain.disconnect();
        };

        // 3. Parlak Dövme Çelik Örs Rezonansı (Metallic anvil ring harmonics)
        const ringFrequencies = [1760, 3520];
        ringFrequencies.forEach((freq, idx) => {
          const ringOsc = ctx.createOscillator();
          const ringGain = ctx.createGain();

          ringOsc.type = "sine";
          ringOsc.frequency.setValueAtTime(freq, at);

          ringGain.gain.setValueAtTime(0.001, at);
          ringGain.gain.linearRampToValueAtTime((0.18 / (idx + 1)) * volume, at + 0.003);
          ringGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.35 + idx * 0.05);

          ringOsc.connect(ringGain);
          ringGain.connect(ctx.destination);

          ringOsc.start(at);
          ringOsc.stop(at + 0.42);
          ringOsc.onended = () => {
            ringOsc.disconnect();
            ringGain.disconnect();
          };
        });
      } catch {}
    },
    turkishCoffee(vol = 1.0) {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      const volume = Math.max(0, Math.min(1, vol));
      if (volume <= 0.02) return;
      try {
        const at = ctx.currentTime;

        // 1. Közde Kahve Cızırtısı & Kavurma Çıtırtısı (Hot sand & bean roasting crackle)
        const crackleBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.16), ctx.sampleRate);
        const crackleData = crackleBuffer.getChannelData(0);
        for (let i = 0; i < crackleData.length; i++) {
          const decay = 1 - i / crackleData.length;
          const microPop = Math.random() > 0.88 ? (Math.random() * 2 - 1) * 1.5 : (Math.random() * 2 - 1) * 0.35;
          crackleData[i] = microPop * decay;
        }
        const crackleSource = ctx.createBufferSource();
        crackleSource.buffer = crackleBuffer;
        const crackleFilter = ctx.createBiquadFilter();
        crackleFilter.type = "bandpass";
        crackleFilter.frequency.setValueAtTime(3600, at);
        crackleFilter.Q.setValueAtTime(2.8, at);

        const crackleGain = ctx.createGain();
        crackleGain.gain.setValueAtTime(0.001, at);
        crackleGain.gain.linearRampToValueAtTime(0.24 * volume, at + 0.008);
        crackleGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.155);

        crackleSource.connect(crackleFilter);
        crackleFilter.connect(crackleGain);
        crackleGain.connect(ctx.destination);

        crackleSource.start(at);
        crackleSource.stop(at + 0.16);
        crackleSource.onended = () => {
          crackleSource.disconnect();
          crackleFilter.disconnect();
          crackleGain.disconnect();
        };

        // 2. Dövme Bakır Cezve Çınlaması & Dokunuş Tınısı (Brass/copper cezve metallic harmonic chimes)
        const cezveChimes = [1680, 2520, 3360];
        cezveChimes.forEach((freq, idx) => {
          const chimeOsc = ctx.createOscillator();
          const chimeGain = ctx.createGain();

          chimeOsc.type = "sine";
          chimeOsc.frequency.setValueAtTime(freq, at + 0.02 * idx);

          const startAt = at + 0.02 * idx;
          chimeGain.gain.setValueAtTime(0.001, startAt);
          chimeGain.gain.linearRampToValueAtTime((0.14 / (idx + 1)) * volume, startAt + 0.004);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.32 + idx * 0.04);

          chimeOsc.connect(chimeGain);
          chimeGain.connect(ctx.destination);

          chimeOsc.start(startAt);
          chimeOsc.stop(startAt + 0.38);
          chimeOsc.onended = () => {
            chimeOsc.disconnect();
            chimeGain.disconnect();
          };
        });

        // 3. Sıcak Kahve Köpürmesi Rezonansı (Frothy coffee brew simmer tone)
        const foamOsc = ctx.createOscillator();
        const foamGain = ctx.createGain();
        foamOsc.type = "triangle";
        foamOsc.frequency.setValueAtTime(420, at);
        foamOsc.frequency.exponentialRampToValueAtTime(280, at + 0.22);

        foamGain.gain.setValueAtTime(0.001, at);
        foamGain.gain.linearRampToValueAtTime(0.12 * volume, at + 0.015);
        foamGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.24);

        foamOsc.connect(foamGain);
        foamGain.connect(ctx.destination);

        foamOsc.start(at);
        foamOsc.stop(at + 0.25);
        foamOsc.onended = () => {
          foamOsc.disconnect();
          foamGain.disconnect();
        };
      } catch {}
    },
    lifeboatWinch(vol = 1.0) {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      const volume = Math.max(0, Math.min(1, vol));
      if (volume <= 0.02) return;
      try {
        const at = ctx.currentTime;

        // 1. Kıyı Emniyeti Denizci Sis Çanı Tınısı (Maritime brass fog bell harmonic chimes)
        const bellHarmonics = [880, 1320, 1760, 2640];
        bellHarmonics.forEach((freq, idx) => {
          const bellOsc = ctx.createOscillator();
          const bellGain = ctx.createGain();

          bellOsc.type = idx === 0 ? "triangle" : "sine";
          bellOsc.frequency.setValueAtTime(freq, at);

          bellGain.gain.setValueAtTime(0.001, at);
          bellGain.gain.linearRampToValueAtTime((0.18 / (idx + 1)) * volume, at + 0.003);
          bellGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.55 + idx * 0.05);

          bellOsc.connect(bellGain);
          bellGain.connect(ctx.destination);

          bellOsc.start(at);
          bellOsc.stop(at + 0.62);
          bellOsc.onended = () => {
            bellOsc.disconnect();
            bellGain.disconnect();
          };
        });

        // 2. Slipway Bot Kızağı Ağır Çelik Vinç Mandalı Tıkırtısı (Ratchet winch pawl clicks)
        const clickTimes = [0.06, 0.14, 0.22];
        clickTimes.forEach((delay, clickIdx) => {
          const clickTime = at + delay;
          const clickBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.04), ctx.sampleRate);
          const clickData = clickBuffer.getChannelData(0);
          for (let i = 0; i < clickData.length; i++) {
            const decay = 1 - i / clickData.length;
            clickData[i] = (Math.random() * 2 - 1) * decay;
          }

          const clickSource = ctx.createBufferSource();
          clickSource.buffer = clickBuffer;

          const clickFilter = ctx.createBiquadFilter();
          clickFilter.type = "bandpass";
          clickFilter.frequency.setValueAtTime(2400 + clickIdx * 300, clickTime);
          clickFilter.Q.setValueAtTime(3.5, clickTime);

          const clickGain = ctx.createGain();
          clickGain.gain.setValueAtTime(0.001, clickTime);
          clickGain.gain.linearRampToValueAtTime(0.22 * volume, clickTime + 0.002);
          clickGain.gain.exponentialRampToValueAtTime(0.0001, clickTime + 0.038);

          clickSource.connect(clickFilter);
          clickFilter.connect(clickGain);
          clickGain.connect(ctx.destination);

          clickSource.start(clickTime);
          clickSource.stop(clickTime + 0.04);
          clickSource.onended = () => {
            clickSource.disconnect();
            clickFilter.disconnect();
            clickGain.disconnect();
          };
        });
      } catch {}
    },
    medicalChime(vol = 1.0) {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      const volume = Math.max(0, Math.min(1, vol));
      if (volume <= 0.02) return;
      try {
        const at = ctx.currentTime;

        // 1. Hassas Medikal EKG Kalp Ritmi / Vital Monitör Çift Bip Sinyali (Cardiac vital monitor pulse blips)
        const pulses = [
          { freq: 880, start: 0.0, dur: 0.12 },
          { freq: 1174.66, start: 0.16, dur: 0.18 },
        ];
        pulses.forEach((p) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = at + p.start;

          osc.type = "sine";
          osc.frequency.setValueAtTime(p.freq, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.20 * volume, t + 0.003);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + p.dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + p.dur + 0.02);
          osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
          };
        });

        // 2. Sıcak ve Rezonanslı Sağlık Ocağı / Dispanser Melodik Çanı (Warm clinic reception chime arpeggio - C major)
        const chordFrequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        chordFrequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const delay = 0.36 + idx * 0.055;
          const t = at + delay;

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime((0.16 / (idx * 0.4 + 1)) * volume, t + 0.004);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + 0.70);
          osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
          };
        });
      } catch {}
    },
    latheMachine(vol = 1.0) {
      const ctx = context;
      if (!ctx || !enabled || paused || ctx.state !== "running") return;
      const volume = Math.max(0, Math.min(1, vol));
      if (volume <= 0.02) return;
      try {
        const at = ctx.currentTime;

        // 1. Yüksek Devirli Torna Aynası & Metal Kesme Uğultusu (High-speed spinning lathe chuck & cutting hum)
        const latheOsc = ctx.createOscillator();
        const latheFilter = ctx.createBiquadFilter();
        const latheGain = ctx.createGain();

        latheOsc.type = "sawtooth";
        latheOsc.frequency.setValueAtTime(420, at);
        latheOsc.frequency.exponentialRampToValueAtTime(780, at + 0.35);
        latheOsc.frequency.exponentialRampToValueAtTime(540, at + 0.70);

        latheFilter.type = "bandpass";
        latheFilter.frequency.setValueAtTime(1250, at);
        latheFilter.Q.setValueAtTime(4.5, at);

        latheGain.gain.setValueAtTime(0.001, at);
        latheGain.gain.linearRampToValueAtTime(0.18 * volume, at + 0.04);
        latheGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.75);

        latheOsc.connect(latheFilter);
        latheFilter.connect(latheGain);
        latheGain.connect(ctx.destination);

        latheOsc.start(at);
        latheOsc.stop(at + 0.78);
        latheOsc.onended = () => {
          latheOsc.disconnect();
          latheFilter.disconnect();
          latheGain.disconnect();
        };

        // 2. Ağır Hidrolik Eksantrik Pres Tok Darbesi (Heavy hydraulic stamp thump - 85Hz -> 38Hz)
        const stampOsc = ctx.createOscillator();
        const stampGain = ctx.createGain();

        stampOsc.type = "sine";
        stampOsc.frequency.setValueAtTime(85, at + 0.22);
        stampOsc.frequency.exponentialRampToValueAtTime(38, at + 0.42);

        stampGain.gain.setValueAtTime(0.001, at + 0.22);
        stampGain.gain.linearRampToValueAtTime(0.35 * volume, at + 0.23);
        stampGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.55);

        stampOsc.connect(stampGain);
        stampGain.connect(ctx.destination);

        stampOsc.start(at + 0.22);
        stampOsc.stop(at + 0.58);
        stampOsc.onended = () => {
          stampOsc.disconnect();
          stampGain.disconnect();
        };

        // 3. Pnömatik/Hidrolik Basınç Tahliye Tıslaması (Hydraulic fluid / pneumatic valve release hiss)
        const bufLen = Math.floor(ctx.sampleRate * 0.45);
        const noiseBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const ch = noiseBuf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) ch[i] = Math.random() * 2 - 1;

        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;

        const hissFilter = ctx.createBiquadFilter();
        hissFilter.type = "bandpass";
        hissFilter.frequency.setValueAtTime(2600, at + 0.24);
        hissFilter.Q.setValueAtTime(2.2, at + 0.24);

        const hissGain = ctx.createGain();
        hissGain.gain.setValueAtTime(0.001, at + 0.24);
        hissGain.gain.linearRampToValueAtTime(0.16 * volume, at + 0.26);
        hissGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.65);

        noiseSrc.connect(hissFilter);
        hissFilter.connect(hissGain);
        hissGain.connect(ctx.destination);

        noiseSrc.start(at + 0.24);
        noiseSrc.stop(at + 0.68);
        noiseSrc.onended = () => {
          noiseSrc.disconnect();
          hissFilter.disconnect();
          hissGain.disconnect();
        };
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
