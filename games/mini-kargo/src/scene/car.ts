import * as THREE from "three";
import { box } from "./world";
import type { VehicleState } from "../game/types";

export function createCar(assetModel?: THREE.Group | null) {
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);

  // 1. Sarı kaporta, kabin, camlar ve tamponlar
  box(body, [1.25, 0.48, 2.1], [0, 0.65, 0], "#f3b544");
  box(body, [1.16, 0.58, 0.85], [0, 1.11, 0.55], "#ffe4a2");
  box(body, [1.04, 0.38, 0.055], [0, 1.14, 0.99], "#406c73");
  for (const x of [-0.59, 0.59])
    box(body, [0.04, 0.34, 0.58], [x, 1.15, 0.56], "#406c73");
  box(body, [1.34, 0.16, 0.15], [0, 0.48, 1.1], "#fff0c7");
  box(body, [1.3, 0.16, 0.12], [0, 0.49, -1.1], "#326157");
  for (const x of [-0.43, 0.43]) {
    box(body, [0.23, 0.18, 0.035], [x, 0.78, 1.07], "#fff8d2");
    box(body, [0.2, 0.14, 0.035], [x, 0.67, -1.09], "#bc594a");
  }

  // 2. 4 adet dönen tekerlek ve jantlar (doğru pivot ve yuvarlanma hiyerarşisi)
  type WheelPivot = {
    holder: THREE.Group;
    roll: THREE.Group;
    isFront: boolean;
  };
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
      body.add(holder);

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
  body.add(cargo);
  box(cargo, [0.85, 0.7, 0.85], [0, 0.35, 0], "#c98e51");
  box(cargo, [0.17, 0.71, 0.86], [0, 0.35, 0], "#f6d191");
  box(cargo, [0.86, 0.71, 0.13], [0, 0.35, 0], "#f6d191");

  // Harici aksesuar eklentisi (gövdeyi asla gizlemez)
  let customAcc: THREE.Object3D | null = null;
  if (assetModel) {
    customAcc = assetModel.clone(true);
    body.add(customAcc);
  }

  let wheelSpin = 0,
    time = 0,
    lastHeading = 0;

  return {
    group,
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
      const speed = Math.hypot(state.velocity.x, state.velocity.z);
      time += dt;
      wheelSpin += (speed * dt) / 0.3;
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
      const pitchTarget = state.airborne
        ? THREE.MathUtils.clamp(-state.verticalVelocity * 0.025, -0.32, 0.32)
        : Math.max(-0.035, Math.min(0.035, -speed * 0.004));
      body.rotation.x = THREE.MathUtils.lerp(
        body.rotation.x,
        pitchTarget,
        1 - Math.exp((state.airborne ? 10 : 7) * dt),
      );
      const steering = -state.steerAngle;
      for (const w of wheelPivots) {
        w.roll.rotation.x = wheelSpin;
        if (w.isFront) {
          w.holder.rotation.y = steering;
        }
      }
      cargo.visible = hasPackage;
      cargo.rotation.z = Math.sin(time * 6) * speed * 0.006 - turn * 2;
      cargo.rotation.x = Math.sin(time * 5) * speed * 0.004;
    },
  };
}
