import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { stepVehicle, resetVehicle, TUNING } from "../../src/game/vehicle";
import { resolveCollision, resolveMovement, testCircleVsRect, DEFAULT_VEHICLE_COLLIDERS } from "../../src/game/collision";
import { RAMPS, checkRampLaunch } from "../../src/game/ramps";
import { ROAD_NODES, ROAD_EDGES, findNearestNode, findNodePath } from "../../src/game/fleet";
import { districts, getAvailableHomeIndices } from "../../src/game/districts";
import { DISTRICT_BUY_PAD_DEFS } from "../../src/scene/district-barriers";
import { createWorld } from "../../src/scene/world";
import { createProps } from "../../src/scene/props";
import { createTraffic } from "../../src/scene/traffic";
import { createPedestrians } from "../../src/scene/pedestrians";
import { createParticles } from "../../src/scene/particles";
import { createSkidmarks } from "../../src/scene/skidmarks";
import * as THREE from "three";

describe("Adversarial Simulation & Stress Testing", () => {
  const worldBounds = { minX: -100, maxX: 100, minZ: -100, maxZ: 100 };
  const mockAssets = {
    cloneModel: () => null,
  };
  const world = createWorld(mockAssets);

  describe("1. Extreme Velocities & Sub-stepping Robustness", () => {
    it("handles extreme velocities without NaN, Infinity, or out-of-bounds escape", () => {
      const extremeSpeeds = [20, 50, 100, 500, 1000, 5000];
      const angles = [0, Math.PI / 4, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

      for (const speed of extremeSpeeds) {
        for (const angle of angles) {
          const vx = Math.sin(angle) * speed;
          const vz = Math.cos(angle) * speed;

          const previous = { x: 0, z: 0 };
          const proposed = { x: previous.x + vx * 0.016, z: previous.z + vz * 0.016 };

          const result = resolveCollision(previous, proposed, world.obstacles, worldBounds, {
            velocity: { x: vx, z: vz },
            heading: angle,
          });

          // Zero NaN or infinite checks
          expect(Number.isFinite(result.position.x)).toBe(true);
          expect(Number.isFinite(result.position.z)).toBe(true);
          expect(Number.isFinite(result.velocity.x)).toBe(true);
          expect(Number.isFinite(result.velocity.z)).toBe(true);
          expect(Number.isNaN(result.position.x)).toBe(false);
          expect(Number.isNaN(result.position.z)).toBe(false);

          // Clamping within world bounds (accounting for collider radius ~0.58)
          expect(result.position.x).toBeGreaterThanOrEqual(worldBounds.minX);
          expect(result.position.x).toBeLessThanOrEqual(worldBounds.maxX);
          expect(result.position.z).toBeGreaterThanOrEqual(worldBounds.minZ);
          expect(result.position.z).toBeLessThanOrEqual(worldBounds.maxZ);
        }
      }
    });

    it("measures performance scaling under high-velocity sub-stepping", () => {
      const previous = { x: 0, z: 0 };
      const proposed = { x: 500, z: 500 }; // Extreme jump
      const t0 = performance.now();
      const result = resolveCollision(previous, proposed, world.obstacles, worldBounds, {
        velocity: { x: 500, z: 500 },
        heading: 0,
      });
      const dtMs = performance.now() - t0;

      expect(Number.isFinite(result.position.x)).toBe(true);
      expect(result.position.x).toBeLessThanOrEqual(worldBounds.maxX);
      expect(dtMs).toBeLessThan(100); // Should resolve within 100ms even for extreme jump
    });

    it("handles zero velocity and stationary edge cases without divide-by-zero", () => {
      const pos = { x: 0, z: 0 };
      const result = resolveCollision(pos, pos, world.obstacles, worldBounds, {
        velocity: { x: 0, z: 0 },
        heading: 0,
      });

      expect(result.position.x).toBe(0);
      expect(result.position.z).toBe(0);
      expect(result.velocity.x).toBe(0);
      expect(result.velocity.z).toBe(0);
      expect(Number.isNaN(result.position.x)).toBe(false);
    });
  });

  describe("2. Boundary Clamping & Corner Trapping", () => {
    it("strictly clamps at all four boundary edges and corners", () => {
      const corners = [
        { x: -105, z: -105, name: "NW corner" },
        { x: 105, z: -105, name: "NE corner" },
        { x: -105, z: 105, name: "SW corner" },
        { x: 105, z: 105, name: "SE corner" },
      ];

      for (const corner of corners) {
        const previous = { x: Math.sign(corner.x) * 98, z: Math.sign(corner.z) * 98 };
        const proposed = { x: corner.x, z: corner.z };

        const result = resolveCollision(previous, proposed, world.obstacles, worldBounds, {
          velocity: { x: (corner.x - previous.x) * 60, z: (corner.z - previous.z) * 60 },
          heading: Math.atan2(corner.x, corner.z),
        });

        expect(result.collided).toBe(true);
        expect(result.position.x).toBeGreaterThanOrEqual(worldBounds.minX);
        expect(result.position.x).toBeLessThanOrEqual(worldBounds.maxX);
        expect(result.position.z).toBeGreaterThanOrEqual(worldBounds.minZ);
        expect(result.position.z).toBeLessThanOrEqual(worldBounds.maxZ);
      }
    });

    it("preserves tangential wall sliding when impacting boundaries at grazing angles", () => {
      // Approach east boundary (x = 100) moving diagonally: forward Z with slight positive X drift
      const previous = { x: 99.0, z: 10 };
      const proposed = { x: 102.0, z: 20 };
      const vel = { x: 30, z: 100 };

      const result = resolveCollision(previous, proposed, world.obstacles, worldBounds, {
        velocity: vel,
        heading: 0,
      });

      expect(result.collided).toBe(true);
      expect(result.position.x).toBeLessThanOrEqual(worldBounds.maxX);
      // Tangential velocity along Z should be preserved (friction applied)
      expect(result.velocity.z).toBeGreaterThan(0);
      // Normal velocity towards wall (X > 0) should be zeroed or reversed by restitution
      expect(result.velocity.x).toBeLessThanOrEqual(0);
    });
  });

  describe("3. Ballistic Airtime from Ramps", () => {
    it("successfully launches from all 5 strategic ramps at max speed", () => {
      for (const ramp of RAMPS) {
        const vehicle = resetVehicle(ramp.position);
        vehicle.heading = ramp.heading;
        const forwardSpeed = ramp.launchSpeed + 4.0;
        vehicle.velocity = {
          x: Math.sin(ramp.heading) * forwardSpeed,
          z: Math.cos(ramp.heading) * forwardSpeed,
        };

        const launch = checkRampLaunch(vehicle, [ramp]);
        expect(launch, `Ramp ${ramp.id} launch failed`).not.toBeNull();
        expect(launch!.verticalVelocity).toBeGreaterThan(0);
        expect(launch!.launchSpeed).toBeGreaterThanOrEqual(ramp.launchSpeed);
      }
    });

    it("simulates full ballistic flight trajectory and lands cleanly within world bounds", () => {
      for (const ramp of RAMPS) {
        let vehicle = resetVehicle(ramp.position);
        vehicle.heading = ramp.heading;
        const boostSpeed = 16.5; // Nitro boost speed
        vehicle.velocity = {
          x: Math.sin(ramp.heading) * boostSpeed,
          z: Math.cos(ramp.heading) * boostSpeed,
        };

        const launch = checkRampLaunch(vehicle, [ramp]);
        expect(launch).not.toBeNull();

        vehicle.verticalVelocity = launch!.verticalVelocity;
        vehicle.altitude = 0.2;
        vehicle.airborne = true;

        let maxAlt = 0;
        let flightSteps = 0;
        const dt = 0.016;

        while (vehicle.airborne && flightSteps < 300) {
          flightSteps++;
          vehicle = stepVehicle(vehicle, { throttle: 1, steer: 0, handbrake: false, nitro: false }, dt);
          if (vehicle.altitude > maxAlt) maxAlt = vehicle.altitude;

          // Check coordinates stay in bounds during flight
          expect(vehicle.position.x).toBeGreaterThanOrEqual(worldBounds.minX);
          expect(vehicle.position.x).toBeLessThanOrEqual(worldBounds.maxX);
          expect(vehicle.position.z).toBeGreaterThanOrEqual(worldBounds.minZ);
          expect(vehicle.position.z).toBeLessThanOrEqual(worldBounds.maxZ);
        }

        expect(maxAlt).toBeGreaterThan(0.5); // Achieved clear ballistic height
        expect(vehicle.airborne).toBe(false); // Successfully landed
        expect(vehicle.altitude).toBe(0);
      }
    });

    it("rejects launch when approaching from opposite or perpendicular direction", () => {
      const ramp = RAMPS[0];
      const vehicle = resetVehicle(ramp.position);
      vehicle.heading = ramp.heading + Math.PI; // Reverse direction
      vehicle.velocity = {
        x: Math.sin(vehicle.heading) * 14,
        z: Math.cos(vehicle.heading) * 14,
      };

      const launch = checkRampLaunch(vehicle, [ramp]);
      expect(launch).toBeNull();
    });

    it("does not re-launch when already flying high above the ramp", () => {
      const ramp = RAMPS[0];
      const vehicle = resetVehicle(ramp.position);
      vehicle.heading = ramp.heading;
      vehicle.altitude = ramp.height + 2.0; // High in air
      vehicle.verticalVelocity = -5;
      vehicle.velocity = {
        x: Math.sin(ramp.heading) * 14,
        z: Math.cos(ramp.heading) * 14,
      };

      const launch = checkRampLaunch(vehicle, [ramp]);
      expect(launch).toBeNull();
    });
  });

  describe("4. Rapid Repetitive Collisions & Zero Stuck Loops", () => {
    it("endures 1,000 continuous collision frames against building collider without NaN or tunneling", () => {
      const depotWall = world.obstacles[0]; // First building obstacle
      let vehicle = resetVehicle({ x: depotWall.minX - 2.0, z: (depotWall.minZ + depotWall.maxZ) / 2 });
      vehicle.heading = Math.PI / 2; // Facing +X into the wall

      let stuckCount = 0;
      const dt = 0.016;

      for (let i = 0; i < 1000; i++) {
        const previous = { ...vehicle.position };
        vehicle = stepVehicle(vehicle, { throttle: 1.0, steer: 0, handbrake: false, nitro: false }, dt);

        const proposed = { ...vehicle.position };
        const col = resolveCollision(previous, proposed, [depotWall], worldBounds, {
          heading: vehicle.heading,
          velocity: vehicle.velocity,
        });

        vehicle.position = col.position;
        vehicle.velocity = col.velocity;

        // Vehicle must never penetrate inside the obstacle
        const checkInside =
          vehicle.position.x > depotWall.minX + 0.3 &&
          vehicle.position.x < depotWall.maxX - 0.3 &&
          vehicle.position.z > depotWall.minZ + 0.3 &&
          vehicle.position.z < depotWall.maxZ - 0.3;
        expect(checkInside, `Vehicle penetrated inside obstacle on frame ${i}`).toBe(false);

        expect(Number.isNaN(vehicle.position.x)).toBe(false);
        expect(Number.isNaN(vehicle.position.z)).toBe(false);
        expect(Number.isNaN(vehicle.velocity.x)).toBe(false);
        expect(Number.isNaN(vehicle.velocity.z)).toBe(false);

        if (Math.hypot(vehicle.position.x - previous.x, vehicle.position.z - previous.z) < 0.001) {
          stuckCount++;
        }
      }

      // Reverse away from wall
      for (let i = 0; i < 60; i++) {
        const previous = { ...vehicle.position };
        vehicle = stepVehicle(vehicle, { throttle: -1.0, steer: 0, handbrake: false, nitro: false }, dt);
        const col = resolveCollision(previous, vehicle.position, [depotWall], worldBounds, {
          heading: vehicle.heading,
          velocity: vehicle.velocity,
        });
        vehicle.position = col.position;
        vehicle.velocity = col.velocity;
      }

      // Must be able to back away freely
      expect(vehicle.position.x).toBeLessThan(depotWall.minX);
    });

    it("verifies breakable prop collisions and physics update without NaN", () => {
      const scene = new THREE.Scene();
      const props = createProps(scene);
      let vehicle = resetVehicle({ x: -48, z: -25 });

      for (let i = 0; i < 100; i++) {
        vehicle.position.x += 0.1;
        props.update(0.016, vehicle);
      }

      for (const item of props.props) {
        expect(Number.isFinite(item.mesh.position.x)).toBe(true);
        expect(Number.isFinite(item.mesh.position.y)).toBe(true);
        expect(Number.isFinite(item.mesh.position.z)).toBe(true);
        expect(Number.isNaN(item.mesh.position.x)).toBe(false);
      }
    });

    it("verifies traffic collisions and impact recoil without NaN", () => {
      const scene = new THREE.Scene();
      const traffic = createTraffic(scene);
      const playerPos = { x: -50, z: 0 }; // Boulevard

      traffic.setCompanyLevel(4);

      for (let i = 0; i < 120; i++) {
        const result = traffic.update(0.016, playerPos);
        if (result.collisionCarIndex != null) {
          traffic.impactCar(result.collisionCarIndex, playerPos, 12);
        }
        for (const car of traffic.cars) {
          expect(Number.isFinite(car.position.x)).toBe(true);
          expect(Number.isFinite(car.position.z)).toBe(true);
          expect(Number.isFinite(car.recoilX)).toBe(true);
          expect(Number.isFinite(car.recoilZ)).toBe(true);
        }
      }
    });
  });

  describe("5. Road Graph Connectivity & Reachability of Homes & Buy Pads", () => {
    it("road graph is fully connected (all 40 nodes belong to single connected component)", () => {
      const allNodeKeys = Object.keys(ROAD_NODES);
      expect(allNodeKeys.length).toBeGreaterThanOrEqual(35);

      const visited = new Set<string>();
      const queue = ["depot_gate"];
      visited.add("depot_gate");

      const adj = new Map<string, string[]>();
      for (const [a, b] of ROAD_EDGES) {
        if (!adj.has(a)) adj.set(a, []);
        if (!adj.has(b)) adj.set(b, []);
        adj.get(a)!.push(b);
        adj.get(b)!.push(a);
      }

      while (queue.length > 0) {
        const curr = queue.shift()!;
        const neighbors = adj.get(curr) || [];
        for (const n of neighbors) {
          if (!visited.has(n)) {
            visited.add(n);
            queue.push(n);
          }
        }
      }

      const unreachable = allNodeKeys.filter((k) => !visited.has(k));
      expect(unreachable, `Unreachable road nodes found: ${unreachable.join(", ")}`).toEqual([]);
    });

    it("findNodePath finds valid non-empty path between any two road nodes", () => {
      const sampleNodes = ["depot_gate", "sunny_nw", "boulevard_far_e", "ind_n_e", "mkt_s_e", "cst_s_w"];
      for (const start of sampleNodes) {
        for (const end of sampleNodes) {
          const path = findNodePath(start, end);
          expect(path.length).toBeGreaterThanOrEqual(1);
          expect(path[0]).toEqual(ROAD_NODES[start]);
          expect(path[path.length - 1]).toEqual(ROAD_NODES[end]);
        }
      }
    });

    it("findNodePath finds valid non-empty path between ALL pairs of the 40 road nodes", () => {
      const allKeys = Object.keys(ROAD_NODES);
      let totalPathsTested = 0;
      for (const start of allKeys) {
        for (const end of allKeys) {
          const path = findNodePath(start, end);
          expect(path.length).toBeGreaterThanOrEqual(1);
          expect(path[0].x).toBe(ROAD_NODES[start].x);
          expect(path[0].z).toBe(ROAD_NODES[start].z);
          expect(path[path.length - 1].x).toBe(ROAD_NODES[end].x);
          expect(path[path.length - 1].z).toBe(ROAD_NODES[end].z);
          totalPathsTested++;
        }
      }
      expect(totalPathsTested).toBe(allKeys.length * allKeys.length);
    });

    it("all 16 delivery homes are reachable and not blocked by building colliders", () => {
      expect(world.homes.length).toBe(16);

      for (let i = 0; i < world.homes.length; i++) {
        const home = world.homes[i];
        expect(home).toBeDefined();

        // 1. Check distance to nearest road node
        const nearestKey = findNearestNode(home);
        const nearestNode = ROAD_NODES[nearestKey];
        const distToRoad = Math.hypot(home.x - nearestNode.x, home.z - nearestNode.z);
        expect(
          distToRoad,
          `Home ${i} at (${home.x}, ${home.z}) is too far from nearest road node ${nearestKey} (${distToRoad.toFixed(1)}m)`,
        ).toBeLessThanOrEqual(28);

        // 2. Check path from depot to nearest road node exists
        const path = findNodePath("depot_gate", nearestKey);
        expect(path.length).toBeGreaterThanOrEqual(1);

        // 3. Check delivery drop location is not inside an impenetrable building collider
        for (let oIdx = 0; oIdx < world.obstacles.length; oIdx++) {
          const obs = world.obstacles[oIdx];
          const hitTest = testCircleVsRect(home.x, home.z, 0.65, obs);
          expect(
            hitTest.hit,
            `Home ${i} at (${home.x}, ${home.z}) is trapped inside obstacle #${oIdx} [minX: ${obs.minX}, maxX: ${obs.maxX}, minZ: ${obs.minZ}, maxZ: ${obs.maxZ}]`,
          ).toBe(false);
        }
      }
    });

    it("all Buy Pads are reachable and not blocked by building colliders", () => {
      const buyPads = [
        { name: "Engine Pad", pos: { x: -52, z: -27 } },
        { name: "Cargo Pad", pos: { x: -52, z: -37 } },
        { name: "Courier Pad", pos: { x: -44, z: -32 } },
        { name: "Nitro Pad", pos: { x: -60, z: -24 } },
        { name: "Scooter Pad", pos: { x: -68, z: -32 } },
        ...DISTRICT_BUY_PAD_DEFS.map((d) => ({ name: d.name, pos: d.position })),
      ];

      for (const pad of buyPads) {
        // Nearest road node reachable from depot
        const nearestKey = findNearestNode(pad.pos);
        const path = findNodePath("depot_gate", nearestKey);
        expect(path.length).toBeGreaterThanOrEqual(1);

        // Not inside any building obstacle
        for (let oIdx = 0; oIdx < world.obstacles.length; oIdx++) {
          const obs = world.obstacles[oIdx];
          const hitTest = testCircleVsRect(pad.pos.x, pad.pos.z, 0.65, obs);
          expect(
            hitTest.hit,
            `BuyPad '${pad.name}' at (${pad.pos.x}, ${pad.pos.z}) collides with obstacle #${oIdx}`,
          ).toBe(false);
        }
      }
    });
  });

  describe("6. Object Pooling & Allocation Audit", () => {
    it("particles system uses a fixed ring buffer pool and instanced mesh", () => {
      const scene = new THREE.Scene();
      const ps = createParticles(scene);

      // Verify InstancedMesh exists
      const instancedMesh = scene.children[0]?.children?.find(
        (c) => c instanceof THREE.InstancedMesh,
      ) as THREE.InstancedMesh | undefined;
      expect(instancedMesh).toBeDefined();
      expect(instancedMesh!.count).toBe(450);

      // Run 300 updates with heavy spawning
      const state = resetVehicle({ x: 0, z: 0 });
      state.drifting = true;
      for (let i = 0; i < 300; i++) {
        ps.update(state, true, 0.016);
        ps.spawnMoneyStream({ x: 0, z: 0 }, { x: 10, z: 10 });
        ps.spawnConfetti({ x: 5, z: 5 });
        ps.spawnImpactSparks({ x: 2, z: 2 });
      }

      // Mesh count must remain exactly 450 (no growth)
      expect(instancedMesh!.count).toBe(450);
      ps.dispose();
    });

    it("skidmarks system uses a fixed capacity instanced mesh pool", () => {
      const scene = new THREE.Scene();
      const skid = createSkidmarks(scene);

      const instancedMesh = scene.children[0]?.children?.find(
        (c) => c instanceof THREE.InstancedMesh,
      ) as THREE.InstancedMesh | undefined;
      expect(instancedMesh).toBeDefined();
      expect(instancedMesh!.count).toBe(180);

      const state = resetVehicle({ x: 0, z: 0 });
      state.drifting = true;
      state.velocity = { x: 8, z: 8 };

      for (let i = 0; i < 300; i++) {
        state.position.x += 0.2;
        state.position.z += 0.2;
        skid.update(state, 0.016);
      }

      expect(instancedMesh!.count).toBe(180);
      skid.dispose();
    });

    it("audits per-frame allocations in skidmarks update loop", () => {
      // In skidmarks.ts: verify whether update() allocates temporary Vector3 instances
      const skidmarksSrc = fs.readFileSync(
        path.resolve(__dirname, "../../src/scene/skidmarks.ts"),
        "utf-8",
      );
      const updateMethodMatch = skidmarksSrc.match(/update\s*\([^)]*\)\s*\{([\s\S]*?)\n\s*reset\s*\(\)/);
      expect(updateMethodMatch).not.toBeNull();
      const updateBody = updateMethodMatch![1];
      const newVectorMatches = updateBody.match(/new\s+THREE\.Vector3/g) || [];
      // Lines 103-104 allocate 2 new THREE.Vector3 instances per frame:
      // const currentLeft = new THREE.Vector3(leftX, 0.022, leftZ);
      // const currentRight = new THREE.Vector3(rightX, 0.022, rightZ);
      expect(newVectorMatches.length).toBe(2);
    });

    it("audits per-frame allocations in traffic update flasher loop", () => {
      const trafficSrc = fs.readFileSync(
        path.resolve(__dirname, "../../src/scene/traffic.ts"),
        "utf-8",
      );
      const updateStart = trafficSrc.indexOf("update(dt: number, player: Vec2)");
      expect(updateStart).toBeGreaterThan(0);
      const updateBody = trafficSrc.slice(updateStart);
      const newColorMatches = updateBody.match(/new\s+THREE\.Color/g) || [];
      // Lines 384 and 387 allocate new THREE.Color() in the flasher loop
      expect(newColorMatches.length).toBe(2);
    });
  });

  describe("7. Airborne Descent & Obstacle Landing Robustness", () => {
    it("handles ballistic landing directly onto obstacle bounds safely", () => {
      const containerObstacle = world.obstacles.find((o) => o.height && o.height > 1);
      expect(containerObstacle).toBeDefined();

      const obs = containerObstacle!;
      // Start in air above obstacle
      const startX = (obs.minX + obs.maxX) / 2;
      const startZ = (obs.minZ + obs.maxZ) / 2;

      let vehicle = resetVehicle({ x: startX, z: startZ });
      vehicle.altitude = obs.height! + 1.0;
      vehicle.verticalVelocity = -4; // Descending
      vehicle.airborne = true;
      vehicle.velocity = { x: 2, z: 0 };

      const dt = 0.016;
      let landed = false;

      for (let i = 0; i < 120; i++) {
        const previous = { ...vehicle.position };
        vehicle = stepVehicle(vehicle, { throttle: 0, steer: 0, handbrake: false, nitro: false }, dt);

        const col = resolveCollision(previous, vehicle.position, [obs], worldBounds, {
          heading: vehicle.heading,
          velocity: vehicle.velocity,
          altitude: vehicle.altitude,
        });

        vehicle.position = col.position;
        vehicle.velocity = col.velocity;

        if (vehicle.altitude === 0) {
          landed = true;
          // Once landed, vehicle must be pushed outside the obstacle bounds
          const inside =
            vehicle.position.x > obs.minX + 0.2 &&
            vehicle.position.x < obs.maxX - 0.2 &&
            vehicle.position.z > obs.minZ + 0.2 &&
            vehicle.position.z < obs.maxZ - 0.2;
          expect(inside, `Vehicle remained inside obstacle after landing on frame ${i}`).toBe(false);
          break;
        }
      }

      expect(landed).toBe(true);
      expect(Number.isFinite(vehicle.position.x)).toBe(true);
      expect(Number.isFinite(vehicle.position.z)).toBe(true);
    });
  });
});

