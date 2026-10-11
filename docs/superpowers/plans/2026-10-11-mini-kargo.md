# Mini Kargo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Renkli bir 3D mahallede serbest sürüş ve üç teslimatlık turlar sunan, mobil ve masaüstünde oynanabilir bir prototip oluşturmak.

**Architecture:** Three.js sahnesi görselleştirmeyi, bağımsız TypeScript modülleri araç hareketi ve tur kurallarını yönetir. HTML arayüz ve yön girdisi bu modüllere bağlanır. Platform adaptörü yerel kayıt ile gelecekteki YouTube entegrasyonunu ayırır.

**Tech Stack:** TypeScript, Three.js, Vite; kritik mantık testleri için Vitest. Sürümler uygulama sırasında güncel resmî belgelerle seçilir ve kilit dosyasına sabitlenir.

**Spec:** `docs/superpowers/specs/2026-10-11-mini-kargo-design.md`

## Global Constraints

- İlk oyun `games/mini-kargo` altında bağımsız geliştirilir ve paketlenir; ortak paket oluşturulmaz.
- Bir depo, altı teslimat evi, bir meydan, bir araba, tek aktif hedef ve tek paket.
- Her tur üç teslimat; yükleme ve teslimat için yaklaşık bir saniye durma.
- Başlangıç bonus süresi teslimat başına 45 saniye; süre bitince oyun sona ermez.
- Mobil joystick ve WASD/ok tuşları aynı ekran yönü modelini kullanır.
- Paketler sallanır fakat düşmez; trafik, yakıt, satın alma ve para ekonomisi yoktur.
- Gizlenen sekmede oyun ve bonus sayacı durur; dönüşte zaman sıçraması olmaz.
- Kayıt yalnızca en iyi tur puanı ve ses tercihini saklar.
- Paket içi varlık yolları göreli; açılış hedefi beş saniyenin altı.
- Yerel prototip YouTube SDK entegrasyonu veya yayın onayı olarak sunulmaz.

## Review Focus

- Dokunmanın iptal edilmesi veya klavyenin odak kaybetmesi: araç hareket girdisi sıfırlanır (Task 1).
- Uzun kare aralığı ve gizlenip geri dönme: araç duvarı atlamaz, bonus geriden ilerlemez (Task 2).
- Teslimat alanından ayrılıp geri gelme: bekleme yeniden başlar, puan iki kez verilmez (Task 3).
- Hatalı kayıt ve depolama erişim hatası: oyun varsayılanlarla oynanabilir kalır (Task 4).
- Küçük/yatay ekran veya WebGL başlatma hatası: kontroller erişilir kalır veya anlaşılır yeniden deneme ekranı çıkar (Task 4).

## File Map

`games/mini-kargo/` içinde:

- `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `index.html`: bağımsız çalıştırma ve göreli üretim paketi.
- `src/main.ts`, `src/style.css`: başlatma, ekran yerleşimi ve yaşam döngüsü.
- `src/game/types.ts`, `src/game/input.ts`: ortak düzlem tipleri ve yön girdisi.
- `src/game/vehicle.ts`, `src/game/collision.ts`, `src/game/loop.ts`: hareket, engeller ve sabit adımlı döngü.
- `src/game/delivery.ts`: yükleme, teslimat, sayaç ve tur sonucu.
- `src/scene/world.ts`, `src/scene/car.ts`, `src/scene/camera.ts`: mahalle, araç görselleri ve takip kamerası.
- `src/ui/hud.ts`, `src/platform/storage.ts`, `src/audio/sound.ts`: oyun ekranları, kayıt ve ses.
- `src/game/*.test.ts`, `src/platform/storage.test.ts`: anlamlı mantık testleri.
- `README.md`: yerel kullanım, kontrol açıklaması ve platform durumunun sınırları.

## Task 1: Kontrol edilebilir araç ve mahalle

**Files:** Paket/derleme dosyaları; `main.ts`, `style.css`, `types.ts`, `input.ts`, `vehicle.ts`, `world.ts`, `car.ts`, `camera.ts`; `input.test.ts`, `vehicle.test.ts`.

**Interfaces:**
- `Vec2 = { x: number; z: number }`; `Rect = { minX: number; maxX: number; minZ: number; maxZ: number }`.
- `VehicleState = { position: Vec2; velocity: Vec2; heading: number }`.
- `InputController.read(): Vec2`, `.reset(): void`, `.dispose(): void`.
- `createInputState(): { set(direction: Vec2): void; read(): Vec2; reset(): void }` normalizes direction magnitude to at most one; this DOM-free state is tested directly.
- `createInput(joystick: HTMLElement): InputController` binds browser events to that state.
- `stepVehicle(state: VehicleState, input: Vec2, dt: number): VehicleState`.
- `createWorld(): { group: THREE.Group; obstacles: Rect[]; bounds: Rect; depot: Vec2; homes: Vec2[] }`.
- `createCar(): { group: THREE.Group; update(state: VehicleState, hasPackage: boolean, dt: number): void }`.
- `updateCamera(camera: THREE.PerspectiveCamera, position: Vec2, dt: number): void`.

- [ ] Scaffold package with `dev`, `build`, `typecheck`, `test` scripts. Root is a simple project directory; do not introduce a monorepo framework. Set Vite `base: './'`, TypeScript strict mode, and Vitest node environment. If Git is absent, initialize it at execution time with ignore rules for `node_modules` and `dist`.
- [ ] Write failing tests: `normalizesDiagonalInput` asserts magnitude ≤ 1; `resetClearsHeldDirection` asserts zero input after reset; `releaseSlowsVehicle` asserts lower speed after one second without input; `turnIsGradual` asserts an opposite direction does not instantly reverse heading.
- [ ] Run `npm test -- src/game/input.test.ts src/game/vehicle.test.ts` from the game folder and confirm the missing implementation fails.
- [ ] Implement the interfaces above. Input direction is camera-relative mapped to the horizontal world plane. Normalize diagonal keys; joystick distance controls speed. Reset input on blur, visibility loss, pointer cancellation and pointer release. Use pointer capture for dragging.
- [ ] Build the world with six homes and a depot placed beside connected roads. Use primitive geometries and shared materials; add delivery marker anchors. Add wheels and a visible package to the car; use time-based animation. The fixed-angle camera smoothly follows the vehicle.
- [ ] Run the two test files, typecheck and build. In a browser, confirm WASD, arrows and joystick move the car in the expected screen directions; release/blur/cancel stops acceleration. Capture an initial gameplay screenshot.
- [ ] Commit the independently playable driving scene if Git is available.

## Task 2: Çarpışma ve güvenilir oyun döngüsü

**Files:** `collision.ts`, `loop.ts`, `main.ts`, `vehicle.ts`; `collision.test.ts`, `loop.test.ts`.

**Interfaces:**
- `resolveMovement(previous: Vec2, proposed: Vec2, radius: number, obstacles: Rect[], bounds: Rect): Vec2`.
- `FrameScheduler = { request(callback: (timestampMs: number) => void): number; cancel(id: number): void }`.
- `createLoop(step: (dt: number) => void, render: () => void, scheduler?: FrameScheduler): { start(): void; setPaused(paused: boolean): void; dispose(): void }`. The default scheduler uses browser animation frames; tests inject controlled frames.
- Loop invokes game updates at 1/60 second; clamps visible frame delta to 0.1 second and resets its accumulator on pause transitions.

- [ ] Write failing tests: `buildingBlocksMovement` keeps the car outside a rectangle; `wallAllowsSliding` permits tangential movement; `boundsContainVehicle` keeps the full vehicle inside the world. Loop tests use controlled timestamps: `longFrameIsClamped` permits at most six steps; `resumeIgnoresHiddenElapsedTime` has no catch-up after a sixty-second hidden interval.
- [ ] Run `npm test -- src/game/collision.test.ts src/game/loop.test.ts` and confirm failure.
- [ ] Implement movement resolution in small/axis-separated increments with vehicle radius 0.65 world units. Feed the resolved position back into vehicle state, reducing blocked velocity. Obstacles cover houses and scenery that intersects roads; world bounds remain navigable.
- [ ] Implement loop and connect document visibility, input reset and pause overlay. Reuse this loop for the delivery timer in Task 3.
- [ ] Run tests, typecheck and build; manually drive into a corner, slide along walls and return after hiding the tab. Confirm no tunneling or unexpected movement.
- [ ] Commit collision and lifecycle support.

## Task 3: Tam teslimat turu ve puan

**Files:** `delivery.ts`, `delivery.test.ts`, `hud.ts`, `main.ts`, `world.ts`, `car.ts`.

**Interfaces:**
- `DeliveryState = { phase: 'loading' | 'delivering' | 'returning' | 'result'; completed: number; targetIndex: number; holdSeconds: number; secondsLeft: number; score: number }`.
- `createDeliveryState(): DeliveryState` initializes a fresh tour.
- `stepDelivery(state: DeliveryState, vehicle: VehicleState, depot: Vec2, homes: Vec2[], dt: number): DeliveryState`.
- `resetVehicle(depot: Vec2): VehicleState` creates a stationary car at the depot; recovery preserves delivery state and resets only `holdSeconds`.
- `createHud(root: HTMLElement, actions: { restart(): void; recover(): void; toggleSound(): void }): { update(state: DeliveryState, bestScore: number, soundEnabled: boolean): void; dispose(): void }`.

- [ ] Write failing tests: `depotRequiresOneSecondStop`; `leavingZoneResetsHold`; `wrongHouseDoesNotDeliver`; `expiredBonusStillAllowsDelivery`; `deliveryScoresOnce`; `thirdDeliveryEndsTour`; `restartClearsTour`. Use delivery radius 2 world units and stopped speed ≤ 0.5 units/second. A delivery earns 100 base points plus `floor(max(0, secondsLeft) * 2)`.
- [ ] Run `npm test -- src/game/delivery.test.ts` and confirm failure.
- [ ] Implement the pure state machine. Each pickup resets remaining time to 45 seconds. Decrease time during delivery only; after completion return to depot, advancing target through distinct houses. Stop at result after three deliveries. Leaving the correct zone or moving too fast resets the one-second hold. Do not award points in returning/result phases.
- [ ] Connect state to marker visibility, package visibility, pickup/delivery progress and HUD. Add start screen, one-time control hint, result screen and restart. Animate package moving toward the door on delivery. Recovery resets the car at depot, clears the hold, and preserves package, target and remaining time.
- [ ] Run tests, typecheck and build. Play all three deliveries; deliberately let a bonus expire and confirm progression. Verify restart and recovery using both input methods.
- [ ] Commit the full game loop.

## Task 4: Kayıt, ses ve teslim edilebilir prototip

**Files:** `storage.ts`, `storage.test.ts`, `sound.ts`, `hud.ts`, `style.css`, `main.ts`, `README.md`.

**Interfaces:**
- `Preferences = { bestScore: number; soundEnabled: boolean }`.
- `StorageAdapter = { load(): Preferences; save(value: Preferences): void }`; `createLocalStorageAdapter(storage: Pick<Storage, 'getItem' | 'setItem'>): StorageAdapter`.
- `createSound(): { unlock(): Promise<void>; setEnabled(enabled: boolean): void; pickup(): void; delivery(): void; dispose(): void }`.

- [ ] Write failing tests: `invalidJsonUsesDefaults`; `invalidFieldsUseDefaults`; `storageReadFailureUsesDefaults`; `storageWriteFailureDoesNotThrow`; `bestScoreNeverDecreases`. Defaults are score 0 and sound enabled; only finite nonnegative scores and boolean sound values are accepted. Best score comparison occurs when a tour finishes.
- [ ] Run `npm test -- src/platform/storage.test.ts` and confirm failure.
- [ ] Implement local storage with a versioned key `mini-kargo:v1`; isolate access behind the adapter. Future SDK implementation can replace it. Load preferences at startup; save on tour completion and mute changes; catch storage exceptions. Save the maximum of the existing valid score and the incoming valid score, retaining the incoming sound preference.
- [ ] Implement lightweight synthesized pickup/delivery sounds after user interaction. Catch unlock errors and retain a fully playable silent game. Wire mute control and visibility pause into audio lifecycle.
- [ ] Make HUD and joystick responsive with safe-area padding, a capped renderer pixel ratio and resize handling. Prevent canvas gestures from scrolling the page. On WebGL initialization failure show “Oyun başlatılamadı. Yeniden deneyebilirsin.” and a reload button.
- [ ] Verify viewport sizes 390×844, 844×390 and 1280×800. Check joystick drag/cancellation, safe-area layout and restart. Simulate renderer initialization failure to verify the fallback; check muted/unavailable audio remains playable. Inspect browser errors and capture the final gameplay screenshot.
- [ ] Run `npm test`, `npm run typecheck`, `npm run build` from `games/mini-kargo`; verify built asset paths are relative. Serve the production build and complete one tour. Record bundle size and observed load behavior; do not infer Android/iOS YouTube compatibility from desktop emulation.
- [ ] Write README commands, controls, game rules, known limits and the separate future SDK/certification step. Preserve final screenshot as a project artifact. Commit verified work.

## Completion and Handoff

- [ ] Review all spec requirements against implemented behavior and record any remaining limitation.
- [ ] Open the local playable game for the user and link its source, run commands and verification results.
- [ ] Claim the local prototype complete only after the checks above pass; YouTube ingestion, SDK integration and publication remain a later stage.

## Execution Recommendation

Native execution in this session is preferred: four tasks share the same game state, scene and input interfaces, so implementing them consecutively minimizes integration overhead. No delegation is authorized yet. The written plan must be reviewed and an execution method chosen before product code is written.
