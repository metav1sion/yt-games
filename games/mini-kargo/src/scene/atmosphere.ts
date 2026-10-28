import * as THREE from "three";

export type AtmospherePhase = "morning" | "noon" | "golden_hour" | "dusk";

export type AtmosphereState = {
  time: number; // 0..1
  phase: AtmospherePhase;
  phaseName: string;
  phaseIcon: string;
  isNightOrDusk: boolean;
  sunOffset: { x: number; y: number; z: number };
};

export type AtmosphereController = {
  update(dt: number, carPos?: { x: number; z: number }): AtmosphereState;
  setTime(time: number): AtmosphereState;
  getState(): AtmosphereState;
  dispose(): void;
};

type Keyframe = {
  time: number;
  phase: AtmospherePhase;
  phaseName: string;
  phaseIcon: string;
  clearColor: string;
  fogColor: string;
  sunColor: string;
  sunIntensity: number;
  sunOffset: [number, number, number];
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  isNightOrDusk: boolean;
};

// 4 Zaman Dilimi (Morning -> Midday -> Golden Hour Sunset -> Twilight Dusk)
const KEYFRAMES: Keyframe[] = [
  {
    time: 0.0,
    phase: "morning",
    phaseName: "Sabah",
    phaseIcon: "🌅",
    clearColor: "#6ab7f5",
    fogColor: "#cbe7fc",
    sunColor: "#fff8ee",
    sunIntensity: 2.9,
    sunOffset: [-32, 28, 24],
    hemiSky: "#e3f3ff",
    hemiGround: "#78b868",
    hemiIntensity: 2.1,
    isNightOrDusk: false,
  },
  {
    time: 0.28,
    phase: "noon",
    phaseName: "Öğle",
    phaseIcon: "☀️",
    clearColor: "#70c5ff",
    fogColor: "#cbe9fc",
    sunColor: "#fff5eb",
    sunIntensity: 3.2,
    sunOffset: [-24, 38, 18],
    hemiSky: "#e2f3ff",
    hemiGround: "#72b063",
    hemiIntensity: 2.2,
    isNightOrDusk: false,
  },
  {
    time: 0.62,
    phase: "golden_hour",
    phaseName: "Gün Batımı",
    phaseIcon: "🌇",
    clearColor: "#e67e50", // Sıcak gün batımı mercan rengi
    fogColor: "#df9d83", // Şeftali-gül ufuk sisi
    sunColor: "#ff9d42", // Altın sarısı/amber güneş
    sunIntensity: 3.4,
    sunOffset: [-38, 20, 12], // Uzun dramatik gölgeler
    hemiSky: "#ffd2a6",
    hemiGround: "#5c6e42",
    hemiIntensity: 2.1,
    isNightOrDusk: true,
  },
  {
    time: 0.84,
    phase: "dusk",
    phaseName: "Alacakaranlık",
    phaseIcon: "🌙",
    clearColor: "#1d243a", // Safir gece mavisi
    fogColor: "#2b3450", // Akşam sis perdesi
    sunColor: "#8ea4d2", // Mavi ay ışığı aydınlatması
    sunIntensity: 1.6,
    sunOffset: [-20, 32, -22],
    hemiSky: "#38476e",
    hemiGround: "#2d3d34",
    hemiIntensity: 1.7,
    isNightOrDusk: true,
  },
];

export function createAtmosphereController(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  sun: THREE.DirectionalLight,
  hemi: THREE.HemisphereLight,
  cycleDuration = 240, // 4 dakikada tam bir gün döngüsü
): AtmosphereController {
  let currentTime = 0.28; // Başlangıçta canlı öğle güneşi
  const tmpColor1 = new THREE.Color();
  const tmpColor2 = new THREE.Color();

  function applyState(t: number, carPos?: { x: number; z: number }): AtmosphereState {
    const wrapped = ((t % 1) + 1) % 1;

    // Aktif iki anahtar kareyi bul
    let k1 = KEYFRAMES[0];
    let k2 = KEYFRAMES[1];
    for (let i = 0; i < KEYFRAMES.length; i++) {
      const cur = KEYFRAMES[i];
      const next = KEYFRAMES[(i + 1) % KEYFRAMES.length];
      const nextTime = next.time < cur.time ? next.time + 1 : next.time;
      const checkTime = wrapped < cur.time ? wrapped + 1 : wrapped;

      if (checkTime >= cur.time && checkTime <= nextTime) {
        k1 = cur;
        k2 = next;
        break;
      }
    }

    const t1 = k1.time;
    let t2 = k2.time;
    if (t2 < t1) t2 += 1.0;
    let currentNorm = wrapped;
    if (currentNorm < t1) currentNorm += 1.0;

    const span = Math.max(0.001, t2 - t1);
    const alpha = Math.max(0, Math.min(1, (currentNorm - t1) / span));

    // Renkleri ve yoğunlukları akıcı bir şekilde enterpole et
    tmpColor1.set(k1.clearColor);
    tmpColor2.set(k2.clearColor);
    tmpColor1.lerp(tmpColor2, alpha);
    renderer.setClearColor(tmpColor1);

    if (scene.fog) {
      tmpColor1.set(k1.fogColor);
      tmpColor2.set(k2.fogColor);
      tmpColor1.lerp(tmpColor2, alpha);
      scene.fog.color.copy(tmpColor1);
    }

    tmpColor1.set(k1.sunColor);
    tmpColor2.set(k2.sunColor);
    tmpColor1.lerp(tmpColor2, alpha);
    sun.color.copy(tmpColor1);
    sun.intensity = k1.sunIntensity + (k2.sunIntensity - k1.sunIntensity) * alpha;

    tmpColor1.set(k1.hemiSky);
    tmpColor2.set(k2.hemiSky);
    tmpColor1.lerp(tmpColor2, alpha);
    hemi.color.copy(tmpColor1);

    tmpColor1.set(k1.hemiGround);
    tmpColor2.set(k2.hemiGround);
    tmpColor1.lerp(tmpColor2, alpha);
    hemi.groundColor.copy(tmpColor1);

    hemi.intensity = k1.hemiIntensity + (k2.hemiIntensity - k1.hemiIntensity) * alpha;

    const offX = k1.sunOffset[0] + (k2.sunOffset[0] - k1.sunOffset[0]) * alpha;
    const offY = k1.sunOffset[1] + (k2.sunOffset[1] - k1.sunOffset[1]) * alpha;
    const offZ = k1.sunOffset[2] + (k2.sunOffset[2] - k1.sunOffset[2]) * alpha;

    if (carPos) {
      sun.position.set(carPos.x + offX, offY, carPos.z + offZ);
      sun.target.position.set(carPos.x, 0, carPos.z);
    }

    const activeKeyframe = alpha < 0.5 ? k1 : k2;

    return {
      time: wrapped,
      phase: activeKeyframe.phase,
      phaseName: activeKeyframe.phaseName,
      phaseIcon: activeKeyframe.phaseIcon,
      isNightOrDusk: activeKeyframe.isNightOrDusk,
      sunOffset: { x: offX, y: offY, z: offZ },
    };
  }

  let currentState = applyState(currentTime);

  return {
    update(dt: number, carPos?: { x: number; z: number }): AtmosphereState {
      currentTime = (currentTime + dt / cycleDuration) % 1.0;
      currentState = applyState(currentTime, carPos);
      return currentState;
    },
    setTime(time: number): AtmosphereState {
      currentTime = ((time % 1) + 1) % 1;
      currentState = applyState(currentTime);
      return currentState;
    },
    getState(): AtmosphereState {
      return currentState;
    },
    dispose() {
      // Temizleme işlemleri
    },
  };
}
