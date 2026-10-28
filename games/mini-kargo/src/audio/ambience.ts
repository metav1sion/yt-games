import type { DistrictId } from "../game/districts";

export type AmbienceSystem = {
  setDistrict(districtId: DistrictId): void;
  setRainIntensity(intensity: number): void;
  setEnabled(enabled: boolean): void;
  setPaused(paused: boolean): void;
  update(dt: number): void;
  dispose(): void;
};

/**
 * Mini Kargo Prosedürel Bölge Ortam Sesleri (Procedural District Ambience Soundscapes)
 * Web Audio API ile sıfır harici ses dosyası kullanarak 4 bölgeye özel dinamik ses ortamı:
 * - Sahil: Ritmik kıyı dalgaları (Pink/Brown noise + 0.14Hz LFO) & uzaktan martı sesleri
 * - Sanayi: Ağır makine & fabrika jeneratörü uğultusu (48Hz sub-bass + 96Hz harmonik)
 * - Çarşı: Hareketli pazar ve meydan mırıltısı (Formant bant geçiren gürültü) & kafe fincan çınlaması
 * - Güneş: Hafif yaz esintisi & neşeli sabah kuş cıvıltıları
 */
export function createAmbience(getContext: () => AudioContext | null): AmbienceSystem {
  let enabled = true;
  let paused = false;
  let currentDistrict: DistrictId = "sunny";

  let masterGain: GainNode | null = null;
  let rainGain: GainNode | null = null;
  const districtGains: Record<DistrictId, GainNode | null> = {
    sunny: null,
    market: null,
    industrial: null,
    coastal: null,
  };

  let initialized = false;
  let timerSeagull = 4.0;
  let timerBird = 3.0;
  let timerCafe = 5.0;

  // Ses üretim node referansları (temizleme için)
  const activeNodes: (AudioNode | AudioBufferSourceNode | OscillatorNode)[] = [];

  function init() {
    const ctx = getContext();
    if (!ctx || initialized) return;

    try {
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(enabled && !paused ? 1 : 0, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Ortak 2 saniyelik gürültü tamponu (Rüzgar, dalga ve kalabalık fısıltısı için)
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pembe gürültüye yakın yumuşak filtreleme
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }

      // =======================================================================
      // 1. SAHİL ŞERİDİ (Kıyı Dalgaları)
      // =======================================================================
      const coastalGain = ctx.createGain();
      coastalGain.gain.setValueAtTime(currentDistrict === "coastal" ? 0.07 : 0, ctx.currentTime);
      coastalGain.connect(masterGain);
      districtGains.coastal = coastalGain;

      const waveSource = ctx.createBufferSource();
      waveSource.buffer = noiseBuffer;
      waveSource.loop = true;

      const waveFilter = ctx.createBiquadFilter();
      waveFilter.type = "lowpass";
      waveFilter.frequency.setValueAtTime(380, ctx.currentTime);

      // Dalga kabarması için LFO (0.13Hz periyot ~ 7.5 saniyede bir kıyıya vuran dalga)
      const waveLfo = ctx.createOscillator();
      waveLfo.type = "sine";
      waveLfo.frequency.setValueAtTime(0.13, ctx.currentTime);

      const waveLfoGain = ctx.createGain();
      waveLfoGain.gain.setValueAtTime(0.045, ctx.currentTime);

      const waveBaseGain = ctx.createGain();
      waveBaseGain.gain.setValueAtTime(0.02, ctx.currentTime);

      waveLfo.connect(waveLfoGain);
      waveLfoGain.connect(waveBaseGain.gain);

      waveSource.connect(waveFilter);
      waveFilter.connect(waveBaseGain);
      waveBaseGain.connect(coastalGain);

      waveSource.start();
      waveLfo.start();
      activeNodes.push(waveSource, waveFilter, waveLfo, waveLfoGain, waveBaseGain, coastalGain);

      // =======================================================================
      // 2. SANAYİ BÖLGESİ (Ağır Makine Uğultusu & Jeneratör Titreşimi)
      // =======================================================================
      const indGain = ctx.createGain();
      indGain.gain.setValueAtTime(currentDistrict === "industrial" ? 0.06 : 0, ctx.currentTime);
      indGain.connect(masterGain);
      districtGains.industrial = indGain;

      // 48Hz Sub-bass jeneratör uğultusu
      const indOsc1 = ctx.createOscillator();
      indOsc1.type = "triangle";
      indOsc1.frequency.setValueAtTime(48, ctx.currentTime);

      // 96Hz Harmonik titreşim
      const indOsc2 = ctx.createOscillator();
      indOsc2.type = "sine";
      indOsc2.frequency.setValueAtTime(96, ctx.currentTime);

      const indFilter = ctx.createBiquadFilter();
      indFilter.type = "lowpass";
      indFilter.frequency.setValueAtTime(120, ctx.currentTime);

      indOsc1.connect(indFilter);
      indOsc2.connect(indFilter);
      indFilter.connect(indGain);

      indOsc1.start();
      indOsc2.start();
      activeNodes.push(indOsc1, indOsc2, indFilter, indGain);

      // =======================================================================
      // 3. ÇARŞI BÖLGESİ (Pazar Meydanı Fısıltısı)
      // =======================================================================
      const marketGain = ctx.createGain();
      marketGain.gain.setValueAtTime(currentDistrict === "market" ? 0.045 : 0, ctx.currentTime);
      marketGain.connect(masterGain);
      districtGains.market = marketGain;

      const crowdSource = ctx.createBufferSource();
      crowdSource.buffer = noiseBuffer;
      crowdSource.loop = true;

      const crowdFilter = ctx.createBiquadFilter();
      crowdFilter.type = "bandpass";
      crowdFilter.frequency.setValueAtTime(650, ctx.currentTime);
      crowdFilter.Q.setValueAtTime(2.2, ctx.currentTime);

      crowdSource.connect(crowdFilter);
      crowdFilter.connect(marketGain);
      crowdSource.start();
      activeNodes.push(crowdSource, crowdFilter, marketGain);

      // =======================================================================
      // 4. GÜNEŞ MAHALLESİ (Hafif Esinti & Sakinlik)
      // =======================================================================
      const sunnyGain = ctx.createGain();
      sunnyGain.gain.setValueAtTime(currentDistrict === "sunny" ? 0.035 : 0, ctx.currentTime);
      sunnyGain.connect(masterGain);
      districtGains.sunny = sunnyGain;

      const breezeSource = ctx.createBufferSource();
      breezeSource.buffer = noiseBuffer;
      breezeSource.loop = true;

      const breezeFilter = ctx.createBiquadFilter();
      breezeFilter.type = "lowpass";
      breezeFilter.frequency.setValueAtTime(220, ctx.currentTime);

      breezeSource.connect(breezeFilter);
      breezeFilter.connect(sunnyGain);
      breezeSource.start();
      activeNodes.push(breezeSource, breezeFilter, sunnyGain);

      // =======================================================================
      // 5. YAZ YAĞMURU SESİ (Procedural Summer Rain Patter)
      // =======================================================================
      rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(0, ctx.currentTime);
      rainGain.connect(masterGain);

      const rainSource = ctx.createBufferSource();
      rainSource.buffer = noiseBuffer;
      rainSource.loop = true;

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = "bandpass";
      rainFilter.frequency.setValueAtTime(2400, ctx.currentTime);
      rainFilter.Q.setValueAtTime(0.75, ctx.currentTime);

      rainSource.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainSource.start();
      activeNodes.push(rainSource, rainFilter, rainGain);

      initialized = true;
    } catch {
      // Web Audio API opsiyoneldir
    }
  }

  // Martı sesi sentezleyici (Sahil için)
  function playSeagullSound() {
    const ctx = getContext();
    if (!ctx || !enabled || paused || currentDistrict !== "coastal") return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = "sine";
      // 2100Hz'den 1600Hz'e hafif martı süzülüşü
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(1550, now + 0.35);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.025, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(masterGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } catch {}
  }

  // Kuş cıvıltısı sentezleyici (Güneş Mahallesi için)
  function playBirdTweet() {
    const ctx = getContext();
    if (!ctx || !enabled || paused || currentDistrict !== "sunny") return;
    try {
      const now = ctx.currentTime;
      for (const [idx, baseFreq] of [2900, 3400].entries()) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const at = now + idx * 0.12;

        osc.type = "sine";
        osc.frequency.setValueAtTime(baseFreq, at);
        osc.frequency.linearRampToValueAtTime(baseFreq + 350, at + 0.04);
        osc.frequency.linearRampToValueAtTime(baseFreq - 200, at + 0.09);

        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(0.022, at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, at + 0.09);

        osc.connect(gain);
        gain.connect(masterGain || ctx.destination);

        osc.start(at);
        osc.stop(at + 0.11);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      }
    } catch {}
  }

  // Kafe fincan tıkırtısı (Çarşı için)
  function playCafeChime() {
    const ctx = getContext();
    if (!ctx || !enabled || paused || currentDistrict !== "market") return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = "sine";
      osc.frequency.setValueAtTime(1620, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.02, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(masterGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } catch {}
  }

  function crossfadeTo(districtId: DistrictId) {
    currentDistrict = districtId;
    const ctx = getContext();
    if (!ctx) return;

    const TARGET_VOLUMES: Record<DistrictId, number> = {
      coastal: 0.07,
      industrial: 0.06,
      market: 0.045,
      sunny: 0.035,
    };

    for (const [id, gain] of Object.entries(districtGains) as [DistrictId, GainNode | null][]) {
      if (gain && ctx) {
        const target = id === districtId ? TARGET_VOLUMES[id] : 0;
        try {
          gain.gain.setTargetAtTime(target, ctx.currentTime, 0.6);
        } catch {}
      }
    }
  }

  return {
    setDistrict(districtId: DistrictId) {
      if (!initialized) init();
      if (currentDistrict !== districtId) {
        crossfadeTo(districtId);
      }
    },
    setRainIntensity(intensity: number) {
      if (!initialized && intensity > 0.01) init();
      const ctx = getContext();
      if (rainGain && ctx) {
        try {
          const target = Math.max(0, Math.min(1, intensity)) * 0.085;
          rainGain.gain.setTargetAtTime(target, ctx.currentTime, 0.25);
        } catch {}
      }
    },
    setEnabled(value: boolean) {
      enabled = value;
      if (!initialized && value) init();
      const ctx = getContext();
      if (masterGain && ctx) {
        try {
          masterGain.gain.setTargetAtTime(value && !paused ? 1 : 0, ctx.currentTime, 0.05);
        } catch {}
      }
    },
    setPaused(value: boolean) {
      paused = value;
      const ctx = getContext();
      if (masterGain && ctx) {
        try {
          masterGain.gain.setTargetAtTime(enabled && !value ? 1 : 0, ctx.currentTime, 0.05);
        } catch {}
      }
    },
    update(dt: number) {
      if (!enabled || paused) return;
      if (!initialized) init();

      // Periyodik doğal efektler
      if (currentDistrict === "coastal") {
        timerSeagull -= dt;
        if (timerSeagull <= 0) {
          playSeagullSound();
          timerSeagull = 7.0 + Math.random() * 8.0;
        }
      } else if (currentDistrict === "sunny") {
        timerBird -= dt;
        if (timerBird <= 0) {
          playBirdTweet();
          timerBird = 6.0 + Math.random() * 7.0;
        }
      } else if (currentDistrict === "market") {
        timerCafe -= dt;
        if (timerCafe <= 0) {
          playCafeChime();
          timerCafe = 8.0 + Math.random() * 9.0;
        }
      }
    },
    dispose() {
      for (const node of activeNodes) {
        try {
          if ("stop" in node && typeof (node as AudioBufferSourceNode).stop === "function") {
            (node as AudioBufferSourceNode).stop();
          }
          node.disconnect();
        } catch {}
      }
      activeNodes.length = 0;
      masterGain?.disconnect();
      masterGain = null;
    },
  };
}
