import * as THREE from "three";
import { setWorldWetness } from "./world-kit";

export type WeatherType = "clear" | "rain";

export type WeatherState = {
  weather: WeatherType;
  weatherName: string;
  weatherIcon: string;
  rainIntensity: number; // 0..1 (görsel yağmur damlaları yoğunluğu)
  wetness: number; // 0..1 (asfalt ıslaklığı ve yansıma)
};

export type WeatherSystem = {
  group: THREE.Group;
  update(dt: number, carPos?: { x: number; z: number }): WeatherState;
  setWeather(weather: WeatherType): WeatherState;
  getState(): WeatherState;
  dispose(): void;
};

/**
 * Mini Kargo Dinamik Hava Durumu Sistemi (Dynamic Weather & Summer Rain System)
 * - Güneşli / Açık hava ve ferahlatıcı Yaz Yağmuru geçişleri
 * - Arabayı takip eden 350 adet 3D yağmur damlası çizgisi
 * - Islak asfalt parlaklığı ve yansıma kontrolü (Road sheen & specular reflection)
 */
export function createWeatherSystem(): WeatherSystem {
  const group = new THREE.Group();
  let currentWeather: WeatherType = "clear";
  let rainIntensity = 0.0;
  let wetness = 0.0;
  let weatherTimer = 35.0; // İlk yağmura kadar geçen süre

  // 1. Yağmur Parçacıkları (Rain drop streaks)
  const dropCount = 350;
  const spread = 52; // Araç etrafında 52x52 metrelik yağmur alanı
  const drops: { mesh: THREE.Mesh; speed: number; xOffset: number; zOffset: number }[] = [];

  const dropGeo = new THREE.BoxGeometry(0.035, 0.85, 0.035);
  const dropMat = new THREE.MeshBasicMaterial({
    color: "#a4b0be",
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const rainGroup = new THREE.Group();
  group.add(rainGroup);
  rainGroup.visible = false;

  for (let i = 0; i < dropCount; i++) {
    const mesh = new THREE.Mesh(dropGeo, dropMat);
    const xOff = (Math.random() - 0.5) * spread;
    const zOff = (Math.random() - 0.5) * spread;
    const y = Math.random() * 26 + 1.0;
    mesh.position.set(xOff, y, zOff);
    rainGroup.add(mesh);
    drops.push({
      mesh,
      speed: 26 + Math.random() * 8, // ~30 m/s düşüş hızı
      xOffset: xOff,
      zOffset: zOff,
    });
  }

  function getInfo(w: WeatherType) {
    if (w === "rain") {
      return { name: "Yaz Yağmuru", icon: "🌧️" };
    }
    return { name: "Açık", icon: "🌤️" };
  }

  function getState(): WeatherState {
    const info = getInfo(currentWeather);
    return {
      weather: currentWeather,
      weatherName: info.name,
      weatherIcon: info.icon,
      rainIntensity,
      wetness,
    };
  }

  function setWeather(weather: WeatherType): WeatherState {
    currentWeather = weather;
    if (weather === "rain") {
      weatherTimer = 40.0; // 40 saniye yağmur
    } else {
      weatherTimer = 90.0; // 90 saniye açık hava
    }
    return getState();
  }

  return {
    group,
    update(dt: number, carPos = { x: 0, z: 0 }): WeatherState {
      // Doğal döngü
      weatherTimer -= dt;
      if (weatherTimer <= 0) {
        setWeather(currentWeather === "clear" ? "rain" : "clear");
      }

      // Hedef yoğunluklara yumuşak geçiş
      const targetRain = currentWeather === "rain" ? 1.0 : 0.0;
      if (rainIntensity < targetRain) {
        rainIntensity = Math.min(targetRain, rainIntensity + dt * 0.45);
      } else if (rainIntensity > targetRain) {
        rainIntensity = Math.max(targetRain, rainIntensity - dt * 0.35);
      }

      // Islaklık: yağmurda artar, durunca yavaşça kurur
      if (rainIntensity > 0.05) {
        wetness = Math.min(1.0, wetness + dt * 0.18 * rainIntensity);
      } else {
        wetness = Math.max(0.0, wetness - dt * 0.045);
      }

      // Asfalt ıslaklık ve parlaklık yansımasını güncelle
      setWorldWetness(wetness);

      // Yağmur parçacıkları görünürlüğü ve opaklığı
      if (rainIntensity > 0.02) {
        rainGroup.visible = true;
        dropMat.opacity = rainIntensity * 0.55;
        rainGroup.position.set(carPos.x, 0, carPos.z);

        // Damlaların düşüşü
        for (const drop of drops) {
          drop.mesh.position.y -= dt * drop.speed;
          if (drop.mesh.position.y < 0.2) {
            drop.mesh.position.y = 24 + Math.random() * 4;
            drop.mesh.position.x = (Math.random() - 0.5) * spread;
            drop.mesh.position.z = (Math.random() - 0.5) * spread;
          }
        }
      } else {
        rainGroup.visible = false;
        dropMat.opacity = 0;
      }

      return getState();
    },
    setWeather,
    getState,
    dispose() {
      dropGeo.dispose();
      dropMat.dispose();
      setWorldWetness(0);
    },
  };
}
