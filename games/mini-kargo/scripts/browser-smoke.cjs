const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const output = path.resolve(__dirname, "../artifacts");
fs.mkdirSync(output, { recursive: true });
const url = process.env.MINI_KARGO_URL || "http://localhost:4173";
const chrome =
  process.env.MINI_KARGO_CHROME ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
(async () => {
  const b = await chromium.launch({
    executablePath: fs.existsSync(chrome) ? chrome : undefined,
    headless: true,
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  const reports = [];
  for (const [width, height, name] of [
    [1280, 800, "desktop"],
    [390, 844, "mobile"],
    [844, 390, "landscape"],
  ]) {
    const p = await b.newPage({ viewport: { width, height } });
    const errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    const start = Date.now();
    await p.goto(url);
    await p.locator("#start").waitFor();
    const loadMs = Date.now() - start;
    await p.locator("#start").click();
    await p.waitForFunction(
      () => document.querySelector("#target-name").textContent === "Ev 01",
    );
    const rects = await p.evaluate(() =>
      Object.fromEntries(
        [".task-card", ".score-card", "#joystick", ".toolbar"].map((s) => {
          const r = document.querySelector(s).getBoundingClientRect();
          return [s, { x: r.x, y: r.y, width: r.width, height: r.height }];
        }),
      ),
    );
    for (const r of Object.values(rects)) {
      assert(
        r.x >= 0 &&
          r.y >= 0 &&
          r.x + r.width <= width + 1 &&
          r.y + r.height <= height + 1,
        "UI outside viewport",
      );
    }
    const a = rects[".task-card"],
      c = rects[".score-card"];
    assert(
      a.x + a.width <= c.x ||
        c.x + c.width <= a.x ||
        a.y + a.height <= c.y ||
        c.y + c.height <= a.y,
      "Task and score panels overlap",
    );
    await p.locator("#sound").click();
    assert.equal(
      await p.locator("#sound").getAttribute("aria-label"),
      "Sesi aç",
    );
    await p.reload();
    assert.equal(
      await p.locator("#sound").getAttribute("aria-label"),
      "Sesi aç",
    );
    await p.locator("#start").click();
    await p.waitForFunction(
      () => document.querySelector("#target-name").textContent === "Ev 01",
    );
    const before = await p.locator("#distance").textContent();
    await p.keyboard.down("d");
    await p.waitForTimeout(900);
    await p.keyboard.up("d");
    await p.waitForTimeout(500);
    assert.notEqual(
      await p.locator("#distance").textContent(),
      before,
      "Keyboard must move the car",
    );
    await p.locator("#recover").click();
    const stick = rects["#joystick"];
    await p.mouse.move(stick.x + stick.width / 2, stick.y + stick.height / 2);
    await p.mouse.down();
    await p.mouse.move(
      stick.x + stick.width / 2 + 30,
      stick.y + stick.height / 2,
    );
    await p.waitForTimeout(400);
    await p
      .locator("#joystick")
      .dispatchEvent("pointercancel", { pointerId: 1 });
    await p.mouse.up();
    assert.equal(await p.locator("#joystick").getAttribute("class"), "");
    await p.locator("#recover").click();
    await p.waitForTimeout(600);
    await p.waitForFunction(
      () => document.querySelector("#target-name").textContent === "Ev 01",
    );
    await p.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    const frozen = await p.locator("#timer").textContent();
    await p.waitForTimeout(1200);
    assert.equal(await p.locator("#timer").textContent(), frozen);
    await p.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => false,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(output, `preview-${name}.png`) });
    reports.push({ name, loadMs, errors, rects });
    assert.equal(errors.length, 0);
    await p.close();
  }
  const fallback = await b.newPage();
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === "webgl2" || type === "webgl") return null;
      return original.call(this, type, ...args);
    };
  });
  await fallback.goto(url);
  await fallback.locator("#retry").waitFor();
  assert(
    (await fallback.locator("h2").textContent()) === "Oyun başlatılamadı.",
  );
  await fallback.close();
  const silent = await b.newPage();
  const errors = [];
  silent.on("pageerror", (e) => errors.push(e.message));
  await silent.addInitScript(() => {
    window.AudioContext = function () {
      throw new Error("audio disabled");
    };
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("storage blocked");
      },
    });
  });
  await silent.goto(url);
  await silent.locator("#start").click();
  await silent.waitForFunction(
    () => document.querySelector("#target-name").textContent === "Ev 01",
  );
  await silent.locator("#sound").click();
  assert.equal(errors.length, 0);
  await silent.close();
  console.log(
    "Viewport, keyboard, pause, storage/audio and WebGL checks passed.",
  );
  const page = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const tourErrors = [];
  page.on("pageerror", (e) => tourErrors.push(e.message));
  await page.goto(url);
  await page.locator("#start").click();
  await page.waitForFunction(
    () => document.querySelector("#target-name").textContent === "Ev 01",
  );
  await page.screenshot({ path: path.join(output, "gameplay-desktop.png") });
  const depot = { x: -22, z: -21 },
    homes = [
      { x: -12, z: -14 },
      { x: 12, z: -14 },
      { x: -12, z: 0 },
    ];
  async function waypoint(target, waypoint = target) {
    const stick = await page.locator("#joystick").boundingBox(),
      cx = stick.x + stick.width / 2,
      cy = stick.y + stick.height / 2,
      r = stick.width * 0.32;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    let near = false;
    for (let i = 0; i < 200; i++) {
      const nav = await page.evaluate(() => ({
        bearing: parseFloat(
          document
            .querySelector("#nav-arrow")
            .style.transform.match(/rotate\(([^r]+)/)[1],
        ),
        text: document.querySelector("#distance").textContent,
      }));
      // UI says 'Alandasın' inside the 2m zone: release to complete delivery.
      if (waypoint === target && nav.text.startsWith("Alandasın")) {
        near = true;
        break;
      }
      const distance = parseInt(nav.text) || 1.3;
      const pos = {
        x: target.x - Math.sin(nav.bearing) * (distance - 0.5),
        z: target.z + Math.cos(nav.bearing) * (distance - 0.5),
      };
      const dx = waypoint.x - pos.x,
        dz = waypoint.z - pos.z,
        d = Math.hypot(dx, dz);
      if (waypoint !== target && d < 1.8) {
        near = true;
        break;
      }
      const amount = Math.min(1, d / 5),
        nx = dx / Math.max(d, 0.1),
        nz = dz / Math.max(d, 0.1);
      await page.mouse.move(cx + nx * r * amount, cy + nz * r * amount);
      await page.waitForTimeout(100);
    }
    await page.mouse.up();
    await page.waitForTimeout(1800);
    assert(near, "Could not reach waypoint " + JSON.stringify(waypoint));
  }
  for (let i = 0; i < 3; i++) {
    console.log(`Tour: delivery ${i + 1}/3`);
    await waypoint(homes[i], { x: -22, z: i === 2 ? 0 : -14 });
    await waypoint(homes[i]);
    if (i === 0)
      await page.screenshot({
        path: path.join(output, "gameplay-desktop.png"),
      });
    if (i < 2) {
      await page.waitForFunction(
        () =>
          document.querySelector("#target-name").textContent === "Kargo deposu",
      );
      await waypoint(depot, { x: -22, z: -14 });
      await waypoint(depot);
      await page.waitForFunction(() =>
        document.querySelector("#target-name").textContent.startsWith("Ev"),
      );
    }
  }
  await page.waitForFunction(() => !document.querySelector("#result").hidden);
  const result = {
    score: await page.locator("#result-score").textContent(),
    best: await page.locator("#best-score").textContent(),
    errors: tourErrors,
  };
  assert(Number(result.score) >= 300);
  await page.screenshot({ path: path.join(output, "tour-result.png") });
  await page.locator("#restart").click();
  await page.waitForFunction(
    () => document.querySelector("#score").textContent === "0",
  );
  await page.locator("#recover").click();
  assert.equal(await page.locator("#score").textContent(), "0");
  const saved = Number(result.score);
  await page.reload();
  await page.locator("#start").waitFor();
  assert.equal(await page.locator("#best-score").textContent(), String(saved));
  assert.equal(tourErrors.length, 0);
  await page.close();
  const report = {
    reports,
    tour: result,
    webglFallback: true,
    unavailableAudioAndStorage: true,
    visibilityPause: true,
  };
  fs.writeFileSync(
    path.join(output, "browser-report.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
