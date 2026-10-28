export type StationId = "off" | "cozy_chill" | "arcade_turbo" | "city_vibes";

export type StationDef = {
  id: StationId;
  name: string;
  shortName: string;
  genre: string;
  emoji: string;
  bpm: number;
};

export const RADIO_STATIONS: StationDef[] = [
  {
    id: "off",
    name: "Radyo Kapalı",
    shortName: "KAPALI",
    genre: "Sessiz",
    emoji: "📻",
    bpm: 0,
  },
  {
    id: "cozy_chill",
    name: "Sakin Lo-Fi",
    shortName: "LO-FI",
    genre: "Chillhop & Rhodes",
    emoji: "☕",
    bpm: 76,
  },
  {
    id: "arcade_turbo",
    name: "Turbo FM",
    shortName: "TURBO FM",
    genre: "80s Synthwave",
    emoji: "⚡",
    bpm: 126,
  },
  {
    id: "city_vibes",
    name: "Şehir Vibes",
    shortName: "ŞEHİR",
    genre: "City Funk & Groove",
    emoji: "🌆",
    bpm: 106,
  },
];

export type RadioSystem = {
  setStation(stationId: StationId): void;
  cycleStation(): StationId;
  getStation(): StationId;
  getStationInfo(stationId?: StationId): StationDef;
  setEnabled(enabled: boolean): void;
  setPaused(paused: boolean): void;
  duck(duckFactor?: number, restoreDuration?: number): void;
  update(dt: number): void;
  dispose(): void;
};

/**
 * Procedural In-Game Car Radio (Jukebox) System
 * Generates 100% procedural Lo-Fi, Synthwave, and City Funk music tracks
 * using the Web Audio API with zero external audio assets.
 */
export function createRadio(getContext: () => AudioContext | null): RadioSystem {
  let enabled = true;
  let paused = false;
  let currentStationId: StationId = "off";
  let beatTimer = 0;
  let currentStep = 0;

  let radioGain: GainNode | null = null;
  let duckTimer = 0;
  let isDucked = false;
  let initialized = false;

  const activeNodes: (AudioNode | OscillatorNode | AudioBufferSourceNode)[] = [];

  function getStationInfo(id: StationId = currentStationId): StationDef {
    return RADIO_STATIONS.find((s) => s.id === id) || RADIO_STATIONS[0];
  }

  function initGain(ctx: AudioContext) {
    if (radioGain || initialized) return;
    try {
      radioGain = ctx.createGain();
      radioGain.gain.setValueAtTime(enabled && !paused ? 0.16 : 0, ctx.currentTime);
      radioGain.connect(ctx.destination);
      initialized = true;
    } catch {}
  }

  function triggerNote(
    ctx: AudioContext,
    freq: number,
    type: OscillatorType,
    duration: number,
    volume: number,
    filterFreq = 2200,
  ) {
    if (!radioGain || ctx.state !== "running") return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(filterFreq, now);

      // Attack & Exponential Decay
      const attack = 0.015;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(volume, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(radioGain);

      osc.start(now);
      osc.stop(now + duration + 0.05);

      activeNodes.push(osc, filter, gain);
      if (activeNodes.length > 50) {
        activeNodes.splice(0, 20);
      }
    } catch {}
  }

  function triggerPercussion(
    ctx: AudioContext,
    kind: "kick" | "snare" | "hihat",
    volume = 0.12,
  ) {
    if (!radioGain || ctx.state !== "running") return;
    try {
      const now = ctx.currentTime;
      if (kind === "kick") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.exponentialRampToValueAtTime(38, now + 0.11);
        gain.gain.setValueAtTime(volume * 1.5, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.connect(gain);
        gain.connect(radioGain);
        osc.start(now);
        osc.stop(now + 0.13);
      } else if (kind === "snare") {
        // Tok gövde + kısa gürültü patlaması
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        oscGain.gain.setValueAtTime(volume, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(oscGain);
        oscGain.connect(radioGain);
        osc.start(now);
        osc.stop(now + 0.1);

        const dur = 0.09;
        const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.4));
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.setValueAtTime(1200, now);
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(volume * 0.8, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(radioGain);
        noise.start(now);
      } else if (kind === "hihat") {
        const dur = 0.04;
        const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(6500, now);
        filter.Q.setValueAtTime(3.0, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(radioGain);
        noise.start(now);
      }
    } catch {}
  }

  // Musical frequency mappings
  const NOTE_FREQ: Record<string, number> = {
    C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, B2: 123.47,
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0,
  };

  // Step sequences (16-step patterns looped)
  function playCozyChillStep(ctx: AudioContext, step: number) {
    // 76 BPM Chillhop
    // Drums
    if (step === 0 || step === 10) triggerPercussion(ctx, "kick", 0.09);
    if (step === 4 || step === 12) triggerPercussion(ctx, "snare", 0.07);
    if (step % 2 === 0) triggerPercussion(ctx, "hihat", 0.035);

    // Warm Mellow Chords & Bass (Dm9 -> G13 -> Cmaj9 -> Am7)
    const bar = Math.floor(step / 4);
    const subStep = step % 4;

    const bassNotes = ["D2", "G2", "C2", "A2"];
    if (subStep === 0) {
      triggerNote(ctx, NOTE_FREQ[bassNotes[bar]], "sine", 0.45, 0.12, 380);
    }

    // Rhodes Chords on step 0 and 2 of each bar
    const chordVoices: Record<number, string[]> = {
      0: ["F3", "A3", "C4", "E4"], // Dm9 voicing
      1: ["F3", "B3", "E4", "A4"], // G13 voicing
      2: ["E3", "G3", "B3", "D4"], // Cmaj9 voicing
      3: ["C3", "E3", "G3", "C4"], // Am7 voicing
    };
    if (subStep === 0 || (subStep === 2 && bar % 2 === 1)) {
      const notes = chordVoices[bar];
      notes.forEach((n, idx) => {
        triggerNote(ctx, NOTE_FREQ[n], "triangle", 0.35, 0.045 - idx * 0.005, 950);
      });
    }

    // Pentatonic bell melodies on syncopated steps
    const melodySteps: Record<number, string> = {
      2: "A4", 6: "C5", 9: "D5", 14: "G4",
    };
    if (melodySteps[step]) {
      triggerNote(ctx, NOTE_FREQ[melodySteps[step]], "sine", 0.28, 0.05, 1400);
    }
  }

  function playArcadeTurboStep(ctx: AudioContext, step: number) {
    // 126 BPM 80s Synthwave / Electro
    // Four-on-the-floor kick
    if (step % 4 === 0) triggerPercussion(ctx, "kick", 0.14);
    // Punchy snare on 4 and 12
    if (step === 4 || step === 12) triggerPercussion(ctx, "snare", 0.11);
    // Driving upbeat 16th hi-hats
    triggerPercussion(ctx, "hihat", step % 2 === 0 ? 0.05 : 0.03);

    // Rolling 16th Synthwave Bass (Am -> F -> C -> G)
    const bar = Math.floor(step / 4);
    const roots = ["A2", "F2", "C2", "G2"];
    const octaves = ["A3", "F3", "C3", "G3"];
    const note = step % 2 === 0 ? roots[bar] : octaves[bar];
    triggerNote(ctx, NOTE_FREQ[note], "sawtooth", 0.11, 0.08, 620);

    // Arpeggiated lead synth
    const arpMap: Record<number, string[]> = {
      0: ["C4", "E4", "A4", "C5"],
      1: ["A3", "C4", "F4", "A4"],
      2: ["G3", "C4", "E4", "G4"],
      3: ["G3", "B3", "D4", "G4"],
    };
    const leadNote = arpMap[bar][step % 4];
    triggerNote(ctx, NOTE_FREQ[leadNote], "square", 0.12, 0.035, 1800);
  }

  function playCityVibesStep(ctx: AudioContext, step: number) {
    // 106 BPM City Funk
    // Syncopated funk beat
    if (step === 0 || step === 6 || step === 10) triggerPercussion(ctx, "kick", 0.11);
    if (step === 4 || step === 12) triggerPercussion(ctx, "snare", 0.09);
    if (step % 2 === 1) triggerPercussion(ctx, "hihat", 0.04);

    // Slap bass groove
    const bar = Math.floor(step / 4);
    const bassPatterns: Record<number, Record<number, string>> = {
      0: { 0: "E2", 3: "E2", 6: "G2", 7: "A2" },
      1: { 0: "A2", 3: "A2", 6: "D3", 7: "E3" },
      2: { 0: "D2", 3: "D2", 6: "F2", 7: "G2" },
      3: { 0: "B2", 2: "D2", 4: "E2", 7: "G2" },
    };
    const note = bassPatterns[bar]?.[step % 8];
    if (note && NOTE_FREQ[note]) {
      triggerNote(ctx, NOTE_FREQ[note], "sawtooth", 0.15, 0.09, 850);
    }

    // Jazzy chord stabs on off-beats
    if (step === 2 || step === 5 || step === 11 || step === 14) {
      const stabChords: Record<number, string[]> = {
        0: ["G3", "B3", "D4", "F#4"],
        1: ["A3", "C4", "E4", "G4"],
        2: ["F3", "A3", "C4", "E4"],
        3: ["B3", "D#4", "F#4", "A4"],
      };
      stabChords[bar]?.forEach((n) => {
        triggerNote(ctx, NOTE_FREQ[n], "triangle", 0.18, 0.04, 1300);
      });
    }
  }

  return {
    setStation(stationId: StationId) {
      currentStationId = stationId;
      beatTimer = 0;
      currentStep = 0;
      const ctx = getContext();
      if (ctx) initGain(ctx);
    },
    cycleStation(): StationId {
      const order: StationId[] = ["off", "cozy_chill", "arcade_turbo", "city_vibes"];
      const currentIndex = order.indexOf(currentStationId);
      const nextIndex = (currentIndex + 1) % order.length;
      const nextStation = order[nextIndex];
      this.setStation(nextStation);
      return nextStation;
    },
    getStation() {
      return currentStationId;
    },
    getStationInfo,
    setEnabled(val: boolean) {
      enabled = val;
      if (radioGain) {
        const ctx = getContext();
        if (ctx) {
          radioGain.gain.setValueAtTime(enabled && !paused ? (isDucked ? 0.07 : 0.16) : 0, ctx.currentTime);
        }
      }
    },
    setPaused(val: boolean) {
      paused = val;
      if (radioGain) {
        const ctx = getContext();
        if (ctx) {
          radioGain.gain.setValueAtTime(enabled && !paused ? (isDucked ? 0.07 : 0.16) : 0, ctx.currentTime);
        }
      }
    },
    duck(duckFactor = 0.4, restoreDuration = 1.4) {
      if (!radioGain || !enabled || paused) return;
      const ctx = getContext();
      if (!ctx || ctx.state !== "running") return;
      isDucked = true;
      duckTimer = restoreDuration;
      radioGain.gain.setValueAtTime(0.16 * duckFactor, ctx.currentTime);
    },
    update(dt: number) {
      if (currentStationId === "off" || !enabled || paused) return;
      const ctx = getContext();
      if (!ctx || ctx.state !== "running") return;
      initGain(ctx);

      // Handle ducking recovery
      if (isDucked) {
        duckTimer -= dt;
        if (duckTimer <= 0) {
          isDucked = false;
          radioGain?.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 0.3);
        }
      }

      const info = getStationInfo(currentStationId);
      if (info.bpm <= 0) return;

      const stepDuration = 60 / info.bpm / 4; // 16th note in seconds
      beatTimer += dt;

      while (beatTimer >= stepDuration) {
        beatTimer -= stepDuration;
        const step = currentStep % 16;
        if (currentStationId === "cozy_chill") {
          playCozyChillStep(ctx, step);
        } else if (currentStationId === "arcade_turbo") {
          playArcadeTurboStep(ctx, step);
        } else if (currentStationId === "city_vibes") {
          playCityVibesStep(ctx, step);
        }
        currentStep = (currentStep + 1) % 64;
      }
    },
    dispose() {
      for (const node of activeNodes) {
        try {
          if ("stop" in node && typeof node.stop === "function") node.stop();
          node.disconnect();
        } catch {}
      }
      activeNodes.length = 0;
      try {
        radioGain?.disconnect();
      } catch {}
      radioGain = null;
      initialized = false;
      currentStationId = "off";
    },
  };
}
