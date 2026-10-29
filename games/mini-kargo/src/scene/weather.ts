import * as THREE from "three";
import { setWorldWetness } from "./world-kit";

export type WeatherType = "clear" | "rain" | "storm";

export type WeatherState = {
  weather: WeatherType;
  weatherName: string;
  weatherIcon: string;
  rainIntensity: number; // 0..1.5 (görsel yağmur damlaları yoğunluğu)
  wetness: number; // 0..1 (asfalt ıslaklığı ve yansıma)
  isStorm: boolean;
  lightningFlash: number; // 0..1 (şimşek aydınlatma patlama gücü)
  lightningTriggered: boolean; // Bu frame'de yeni şimşek çaktı mı (gök gürültüsü audio tetikleyici)
};

export type WeatherSystem = {
  group: THREE.Group;
  update(dt: number, carPos?: { x: number; z: number }): WeatherState;
  setWeather(weather: WeatherType): WeatherState;
  getState(): WeatherState;
  triggerLightning(carPos?: { x: number; z: number }): void;
  dispose(): void;
};

/**
 * Mini Kargo Dinamik Hava Durumu & Fırtına Sistemi (Dynamic Weather, Rain & Thunderstorm System)
 * - Açık Hava, Ferahlatıcı Yaz Yağmuru ve Şiddetli Yaz Fırtınası ("storm") geçişleri
 * - Arabayı takip eden 420 adet 3D yağmur damlası çizgisi & fırtınada rüzgar açısı (wind slant)
 * - Islak asfalt parlaklığı ve yansıma kontrolü (Road sheen & specular reflection)
 * - Gökyüzünde 3D çatallanan şimşek çakması (Procedural lightning bolt) ve parlama ışığı (Flash illumination)
 */
export function createWeatherSystem(): WeatherSystem {
  const group = new THREE.Group();
  let currentWeather: WeatherType = "clear";
  let lastFromClear = true;
  let rainIntensity = 0.0;
  let wetness = 0.0;
  let weatherTimer = 35.0; // İlk yağmura kadar geçen süre

  // Şimşek Durumu (Lightning State)
  let lightningCooldown = 9.0;
  let lightningTimer = 0.0;
  let lightningFlash = 0.0;
  let lightningTriggered = false;

  // 1. Yağmur Parçacıkları (Rain drop streaks)
  const dropCount = 420;
  const spread = 54; // Araç etrafında 54x54 metrelik yağmur alanı
  const drops: { mesh: THREE.Mesh; speed: number; xOffset: number; zOffset: number }[] = [];

  const dropGeo = new THREE.BoxGeometry(0.035, 0.9, 0.035);
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
      speed: 26 + Math.random() * 8, // Normal yağmurda ~30 m/s
      xOffset: xOff,
      zOffset: zOff,
    });
  }

  // 2. 3D Çatallanan Şimşek Çizgisi (Procedural Lightning Bolt)
  const lightningPoints = 7;
  const lightningPositions = new Float32Array(lightningPoints * 3);
  const lightningGeo = new THREE.BufferGeometry();
  lightningGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(lightningPositions, 3),
  );
  const lightningMat = new THREE.LineBasicMaterial({
    color: "#e0ffff",
    linewidth: 2,
    transparent: true,
    opacity: 0,
  });
  const lightningLine = new THREE.Line(lightningGeo, lightningMat);
  lightningLine.visible = false;
  group.add(lightningLine);

  function generateLightningBolt(originX = 0, originZ = 0) {
    const startX = originX + (Math.random() - 0.5) * 60;
    const startZ = originZ + (Math.random() - 0.5) * 60;
    let currX = startX;
    let currY = 56;
    let currZ = startZ;

    const posAttr = lightningGeo.attributes.position;
    posAttr.setXYZ(0, currX, currY, currZ);

    for (let i = 1; i < lightningPoints; i++) {
      currX += (Math.random() - 0.5) * 14;
      currY -= 5.5 + Math.random() * 3.5;
      currZ += (Math.random() - 0.5) * 14;
      posAttr.setXYZ(i, currX, currY, currZ);
    }
    posAttr.needsUpdate = true;
    lightningLine.visible = true;
  }

  function triggerLightning(carPos = { x: 0, z: 0 }) {
    lightningTimer = 0.34;
    lightningFlash = 1.0;
    lightningTriggered = true;
    lightningCooldown = 7.0 + Math.random() * 8.0; // 7..15 sn aralık
    generateLightningBolt(carPos.x, carPos.z);
  }

  function getInfo(w: WeatherType) {
    if (w === "storm") {
      return { name: "Gök Gürültülü Fırtına", icon: "⛈️" };
    }
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
      isStorm: currentWeather === "storm",
      lightningFlash,
      lightningTriggered,
    };
  }

  function setWeather(weather: WeatherType): WeatherState {
    currentWeather = weather;
    if (weather === "storm") {
      weatherTimer = 35.0; // 35 saniye fırtına
      lightningCooldown = 3.5; // Fırtına başlar başlamaz ilk şimşek erken gelir
    } else if (weather === "rain") {
      weatherTimer = 40.0; // 40 saniye yağmur
    } else {
      weatherTimer = 90.0; // 90 saniye açık hava
    }
    return getState();
  }

  return {
    group,
    update(dt: number, carPos = { x: 0, z: 0 }): WeatherState {
      lightningTriggered = false;

      // Doğal döngü (clear -> rain -> storm -> rain -> clear)
      weatherTimer -= dt;
      if (weatherTimer <= 0) {
        if (currentWeather === "clear") {
          lastFromClear = true;
          setWeather("rain");
        } else if (currentWeather === "rain") {
          if (lastFromClear) {
            setWeather("storm");
          } else {
            setWeather("clear");
          }
        } else if (currentWeather === "storm") {
          lastFromClear = false;
          setWeather("rain");
        }
      }

      // Fırtınada şimşek zamanlayıcısı
      if (currentWeather === "storm") {
        lightningCooldown -= dt;
        if (lightningCooldown <= 0) {
          triggerLightning(carPos);
        }
      }

      // Şimşek parlaması animasyonu (Double-strike lightning decay)
      if (lightningTimer > 0) {
        lightningTimer -= dt;
        if (lightningTimer > 0.25) {
          // İlk ani parlama
          lightningFlash = 1.0;
          lightningMat.opacity = 1.0;
        } else if (lightningTimer > 0.19) {
          // Kısa ara düşüş
          lightningFlash = 0.28;
          lightningMat.opacity = 0.4;
        } else if (lightningTimer > 0.08) {
          // İkincil güçlü şimşek darbesi
          lightningFlash = 1.25;
          lightningMat.opacity = 1.0;
        } else {
          // Hızlı sönümlenme
          const ratio = Math.max(0, lightningTimer / 0.08);
          lightningFlash = ratio * 0.9;
          lightningMat.opacity = ratio;
        }

        if (lightningTimer <= 0) {
          lightningFlash = 0.0;
          lightningLine.visible = false;
          lightningMat.opacity = 0.0;
        }
      } else {
        lightningFlash = 0.0;
      }

      // Hedef yoğunluklara yumuşak geçiş
      let targetRain = 0.0;
      if (currentWeather === "storm") {
        targetRain = 1.35; // Fırtınada sağanak yoğunluğu
      } else if (currentWeather === "rain") {
        targetRain = 1.0;
      }

      if (rainIntensity < targetRain) {
        rainIntensity = Math.min(targetRain, rainIntensity + dt * (currentWeather === "storm" ? 0.65 : 0.45));
      } else if (rainIntensity > targetRain) {
        rainIntensity = Math.max(targetRain, rainIntensity - dt * 0.35);
      }

      // Islaklık: yağmur ve fırtınada hızla artar, durunca kurur
      if (rainIntensity > 0.05) {
        const wetSpeed = currentWeather === "storm" ? 0.26 : 0.18;
        wetness = Math.min(1.0, wetness + dt * wetSpeed * rainIntensity);
      } else {
        wetness = Math.max(0.0, wetness - dt * 0.045);
      }

      // Asfalt ıslaklık ve parlaklık yansımasını güncelle
      setWorldWetness(wetness);

      // Yağmur parçacıkları görünürlüğü ve opaklığı
      if (rainIntensity > 0.02) {
        rainGroup.visible = true;
        dropMat.opacity = Math.min(0.78, rainIntensity * 0.58);
        rainGroup.position.set(carPos.x, 0, carPos.z);

        const isStorm = currentWeather === "storm";
        const windTilt = isStorm ? -0.16 : 0.0;
        const speedBoost = isStorm ? 10.0 : 0.0;

        // Damlaların düşüşü
        for (const drop of drops) {
          drop.mesh.rotation.z = windTilt;
          drop.mesh.position.y -= dt * (drop.speed + speedBoost);
          if (drop.mesh.position.y < 0.2) {
            drop.mesh.position.y = 25 + Math.random() * 4;
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
    triggerLightning,
    dispose() {
      dropGeo.dispose();
      dropMat.dispose();
      lightningGeo.dispose();
      lightningMat.dispose();
      setWorldWetness(0);
    },
  };
}
