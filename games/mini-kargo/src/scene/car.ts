import * as THREE from "three";
import { box } from "./world";
import type { VehicleState, VehicleType } from "../game/types";

export type WheelPivot = {
  holder: THREE.Group;
  roll: THREE.Group;
  isFront: boolean;
};

export type VanVisual = {
  group: THREE.Group;
  wheelPivots: WheelPivot[];
  cargo: THREE.Group;
};

export type ScooterVisual = {
  group: THREE.Group;
  frontHolder: THREE.Group;
  frontRoll: THREE.Group;
  rearRoll: THREE.Group;
  cargo: THREE.Group;
  parcel: THREE.Group;
};

export function buildVanVisual(): VanVisual {
  const group = new THREE.Group();

  // 1. Sarı kaporta, kabin, camlar ve tamponlar
  box(group, [1.25, 0.48, 2.1], [0, 0.65, 0], "#f3b544");
  box(group, [1.16, 0.58, 0.85], [0, 1.11, 0.55], "#ffe4a2");
  box(group, [1.04, 0.38, 0.055], [0, 1.14, 0.99], "#406c73");
  for (const x of [-0.59, 0.59])
    box(group, [0.04, 0.34, 0.58], [x, 1.15, 0.56], "#406c73");
  box(group, [1.34, 0.16, 0.15], [0, 0.48, 1.1], "#fff0c7");
  box(group, [1.3, 0.16, 0.12], [0, 0.49, -1.1], "#326157");
  for (const x of [-0.43, 0.43]) {
    box(group, [0.23, 0.18, 0.035], [x, 0.78, 1.07], "#fff8d2");
    box(group, [0.2, 0.14, 0.035], [x, 0.67, -1.09], "#bc594a");
  }

  // 2. 4 adet dönen tekerlek ve jantlar (doğru pivot ve yuvarlanma hiyerarşisi)
  const wheelPivots: WheelPivot[] = [];

  const tireGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.18, 12);
  const tireMat = new THREE.MeshStandardMaterial({
    color: "#283e3d",
    roughness: 1,
  });
  const hubGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.2, 10);
  const hubMat = new THREE.MeshStandardMaterial({ color: "#dce3cf" });

  for (const x of [-0.65, 0.65]) {
    for (const z of [-0.65, 0.7]) {
      const holder = new THREE.Group();
      holder.position.set(x, 0.35, z);
      group.add(holder);

      const roll = new THREE.Group();
      holder.add(roll);

      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      roll.add(tire);

      const hub = new THREE.Mesh(hubGeo, hubMat);
      hub.rotation.z = Math.PI / 2;
      roll.add(hub);

      wheelPivots.push({
        holder,
        roll,
        isFront: z > 0,
      });
    }
  }

  // 3. Kargo kasası
  const cargo = new THREE.Group();
  cargo.position.set(0, 0.9, -0.43);
  group.add(cargo);
  box(cargo, [0.85, 0.7, 0.85], [0, 0.35, 0], "#c98e51");
  box(cargo, [0.17, 0.71, 0.86], [0, 0.35, 0], "#f6d191");
  box(cargo, [0.86, 0.71, 0.13], [0, 0.35, 0], "#f6d191");

  return { group, wheelPivots, cargo };
}

export function buildScooterVisual(): ScooterVisual {
  const group = new THREE.Group();

  // 1. İki tekerlek (ön ve arka tekerlek + jantlar)
  const tireGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.12, 12);
  const tireMat = new THREE.MeshStandardMaterial({
    color: "#283e3d",
    roughness: 1,
  });
  const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.14, 10);
  const hubMat = new THREE.MeshStandardMaterial({ color: "#dce3cf" });

  // Ön tekerlek & gidon tertibatı (dönüşte birlikte yönlenir)
  const frontHolder = new THREE.Group();
  frontHolder.position.set(0, 0.30, 0.68);
  group.add(frontHolder);

  const frontRoll = new THREE.Group();
  frontHolder.add(frontRoll);

  const frontTire = new THREE.Mesh(tireGeo, tireMat);
  frontTire.rotation.z = Math.PI / 2;
  frontTire.castShadow = true;
  frontRoll.add(frontTire);

  const frontHub = new THREE.Mesh(hubGeo, hubMat);
  frontHub.rotation.z = Math.PI / 2;
  frontRoll.add(frontHub);

  // Ön çatal (fork)
  box(frontHolder, [0.05, 0.40, 0.05], [-0.09, 0.18, 0], "#526362");
  box(frontHolder, [0.05, 0.40, 0.05], [0.09, 0.18, 0], "#526362");
  // Gidon borusu (stem)
  box(frontHolder, [0.06, 0.38, 0.06], [0, 0.46, -0.05], "#333333");
  // Gidon (Handlebar bar)
  box(frontHolder, [0.72, 0.05, 0.05], [0, 0.65, -0.08], "#333333");
  // Sol ve sağ elcikler (grips)
  box(frontHolder, [0.12, 0.065, 0.065], [-0.30, 0.65, -0.08], "#111111");
  box(frontHolder, [0.12, 0.065, 0.065], [0.30, 0.65, -0.08], "#111111");
  // Aynalar
  box(frontHolder, [0.08, 0.08, 0.02], [-0.34, 0.74, -0.06], "#406c73");
  box(frontHolder, [0.08, 0.08, 0.02], [0.34, 0.74, -0.06], "#406c73");

  // Arka tekerlek tertibatı
  const rearHolder = new THREE.Group();
  rearHolder.position.set(0, 0.30, -0.65);
  group.add(rearHolder);

  const rearRoll = new THREE.Group();
  rearHolder.add(rearRoll);

  const rearTire = new THREE.Mesh(tireGeo, tireMat);
  rearTire.rotation.z = Math.PI / 2;
  rearTire.castShadow = true;
  rearRoll.add(rearTire);

  const rearHub = new THREE.Mesh(hubGeo, hubMat);
  rearHub.rotation.z = Math.PI / 2;
  rearRoll.add(rearHub);

  // Arka çamurluk
  box(group, [0.22, 0.16, 0.38], [0, 0.40, -0.68], "#326157");

  // 2. Kıvrak gövde (ayaklık, ön kalkan, sele, farlar)
  // Ayaklık (footboard)
  box(group, [0.46, 0.10, 0.76], [0, 0.24, 0.05], "#326157");
  // Orta gövde tüneli / akü kapağı
  box(group, [0.38, 0.38, 0.65], [0, 0.44, -0.22], "#f3b544");
  // Ön kalkan / siperlik
  box(group, [0.46, 0.58, 0.12], [0, 0.60, 0.38], "#f3b544");
  box(group, [0.36, 0.18, 0.06], [0, 0.54, 0.45], "#fff0c7");
  // Ön far
  box(group, [0.18, 0.12, 0.05], [0, 0.74, 0.45], "#fff8d2");
  // Arka stop lambası
  box(group, [0.16, 0.08, 0.04], [0, 0.44, -0.86], "#bc594a");
  // Sele (seat)
  box(group, [0.30, 0.14, 0.52], [0, 0.58, -0.20], "#222222");

  // 3. Kurye kaskı (courier helmet)
  box(group, [0.32, 0.28, 0.34], [0, 0.84, -0.15], "#ff4757");
  box(group, [0.26, 0.12, 0.08], [0, 0.83, 0.02], "#1e293b"); // Vizör
  box(group, [0.06, 0.29, 0.35], [0, 0.85, -0.15], "#ffffff"); // Şerit

  // 4. Arkada kargo sepeti ve koli (rear cargo basket & parcel)
  box(group, [0.48, 0.04, 0.46], [0, 0.54, -0.62], "#333333"); // Taşıyıcı demir
  const cargo = new THREE.Group();
  cargo.position.set(0, 0.56, -0.62);
  group.add(cargo);

  box(cargo, [0.52, 0.44, 0.46], [0, 0.22, 0], "#c98e51"); // Kargo sepeti
  box(cargo, [0.54, 0.08, 0.48], [0, 0.44, 0], "#f6d191"); // Sepet kapağı
  box(cargo, [0.14, 0.45, 0.47], [0, 0.22, 0], "#f6d191"); // Kemer şerit

  const parcel = new THREE.Group();
  cargo.add(parcel);
  box(parcel, [0.38, 0.32, 0.34], [0, 0.25, 0], "#e67e22"); // Koli
  box(parcel, [0.40, 0.08, 0.36], [0, 0.25, 0], "#f39c12"); // Koli bandı

  return {
    group,
    frontHolder,
    frontRoll,
    rearRoll,
    cargo,
    parcel,
  };
}

export function createCar(
  assetModel?: THREE.Group | null,
  initialType: VehicleType = "van",
) {
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);

  const vanVisual = buildVanVisual();
  const scooterVisual = buildScooterVisual();

  let currentType: VehicleType = initialType;
  if (currentType === "scooter") {
    body.add(scooterVisual.group);
  } else {
    body.add(vanVisual.group);
  }

  // Harici aksesuar eklentisi (gövdeyi asla gizlemez)
  let customAcc: THREE.Object3D | null = null;
  if (assetModel) {
    customAcc = assetModel.clone(true);
    body.add(customAcc);
  }

  let vanWheelSpin = 0,
    scooterWheelSpin = 0,
    time = 0,
    lastHeading = 0;

  function setVehicleType(type: VehicleType) {
    if (type === currentType) return;
    currentType = type;
    if (type === "scooter") {
      body.remove(vanVisual.group);
      body.add(scooterVisual.group);
    } else {
      body.remove(scooterVisual.group);
      body.add(vanVisual.group);
    }
  }

  return {
    group,
    setVehicleType,
    getVehicleType(): VehicleType {
      return currentType;
    },
    setModel(model?: THREE.Group | null) {
      if (customAcc) {
        body.remove(customAcc);
        customAcc = null;
      }
      if (model) {
        customAcc = model.clone(true);
        body.add(customAcc);
      }
    },
    update(state: VehicleState, hasPackage: boolean, dt: number) {
      if (state.type && state.type !== currentType) {
        setVehicleType(state.type);
      }

      const speed = Math.hypot(state.velocity.x, state.velocity.z);
      time += dt;

      const turn = Math.atan2(
        Math.sin(state.heading - lastHeading),
        Math.cos(state.heading - lastHeading),
      );
      lastHeading = state.heading;

      group.position.set(
        state.position.x,
        0.08 + state.altitude,
        state.position.z,
      );
      group.rotation.y = state.heading;

      const pitchTarget = state.airborne
        ? THREE.MathUtils.clamp(-state.verticalVelocity * 0.025, -0.32, 0.32)
        : Math.max(-0.035, Math.min(0.035, -speed * 0.004));

      body.rotation.x = THREE.MathUtils.lerp(
        body.rotation.x,
        pitchTarget,
        1 - Math.exp(-(state.airborne ? 10 : 7) * dt),
      );

      const steering = -state.steerAngle;

      if (currentType === "scooter") {
        // İki tekerlekli scooter için kıvrak viraj yatışı (lean)
        const targetRoll = THREE.MathUtils.clamp(
          -turn * speed * 1.6 - state.steerAngle * 0.18,
          -0.28,
          0.28,
        );
        body.rotation.z = THREE.MathUtils.lerp(
          body.rotation.z,
          targetRoll,
          1 - Math.exp(-9 * dt),
        );
        body.position.y = state.airborne
          ? 0
          : Math.sin(time * 18) * Math.min(speed / 7, 1) * 0.012;

        scooterWheelSpin += (speed * dt) / 0.26;
        scooterVisual.frontRoll.rotation.x = scooterWheelSpin;
        scooterVisual.rearRoll.rotation.x = scooterWheelSpin;
        scooterVisual.frontHolder.rotation.y = steering;

        scooterVisual.cargo.visible = true;
        scooterVisual.parcel.visible = hasPackage;
        scooterVisual.cargo.rotation.z =
          Math.sin(time * 6) * speed * 0.006 - turn * 1.5;
        scooterVisual.cargo.rotation.x = Math.sin(time * 5) * speed * 0.004;
      } else {
        body.rotation.z = THREE.MathUtils.lerp(
          body.rotation.z,
          Math.max(
            state.drifting ? -0.14 : -0.08,
            Math.min(
              state.drifting ? 0.14 : 0.08,
              -turn * speed * (state.drifting ? 1.6 : 1),
            ),
          ),
          1 - Math.exp(-8 * dt),
        );
        body.position.y = state.airborne
          ? 0
          : Math.sin(time * 15) * Math.min(speed / 8, 1) * 0.015;

        vanWheelSpin += (speed * dt) / 0.3;
        for (const w of vanVisual.wheelPivots) {
          w.roll.rotation.x = vanWheelSpin;
          if (w.isFront) {
            w.holder.rotation.y = steering;
          }
        }
        vanVisual.cargo.visible = hasPackage;
        vanVisual.cargo.rotation.z =
          Math.sin(time * 6) * speed * 0.006 - turn * 2;
        vanVisual.cargo.rotation.x = Math.sin(time * 5) * speed * 0.004;
      }
    },
  };
}
