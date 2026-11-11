const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { spawn, execSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..");
const output = path.resolve(projectRoot, "artifacts");
fs.mkdirSync(output, { recursive: true });

const chrome =
  process.env.MINI_KARGO_CHROME ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function checkServer(urlStr) {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const req = http.get(
        {
          hostname: u.hostname,
          port: u.port || (u.protocol === "https:" ? 443 : 80),
          path: u.pathname,
          timeout: 1500,
        },
        (res) => resolve(res.statusCode >= 200 && res.statusCode < 400),
      );
      req.on("error", () => resolve(false));
      req.on("timeout", () => {
        req.destroy();
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

async function ensureServer() {
  const targetUrl = process.env.MINI_KARGO_URL || "http://127.0.0.1:4173";
  if (await checkServer(targetUrl)) {
    return { url: targetUrl, serverProcess: null };
  }

  const serverProcess = spawn(
    "npx",
    ["vite", "preview", "--port", "4173", "--host", "127.0.0.1"],
    {
      cwd: projectRoot,
      stdio: "pipe",
      detached: false,
    },
  );

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await checkServer(targetUrl)) {
      return { url: targetUrl, serverProcess };
    }
  }

  if (serverProcess) serverProcess.kill();
  throw new Error(`Preview server not ready at ${targetUrl}`);
}

(async () => {
  let serverProcess = null;
  let browser = null;

  try {
    // Ensure build is up to date
    execSync("npm run build", { cwd: projectRoot, stdio: "inherit" });

    const serverInfo = await ensureServer();
    serverProcess = serverInfo.serverProcess;

    browser = await chromium.launch({
      executablePath: fs.existsSync(chrome) ? chrome : undefined,
      headless: true,
      args: [
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });

    const page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
    });

    await page.addInitScript(() => {
      localStorage.setItem(
        "mini-kargo:v1",
        JSON.stringify({
          bestScore: 500,
          soundEnabled: false,
          money: 3500,
          reputation: 80,
          companyLevel: 4,
          unlockedDistricts: ["sunny", "market", "industrial", "coastal"],
        }),
      );
    });

    await page.goto(serverInfo.url, { waitUntil: "domcontentloaded" });

    const startShiftBtn = page.locator(
      "#btn-start-shift, #company-sheet #btn-start-shift, .company-sheet #btn-start-shift",
    );
    await startShiftBtn.waitFor({ state: "visible", timeout: 15000 });
    await startShiftBtn.click();

    await page.waitForTimeout(600);

    // Teleport car to Sahil "Tarihi Kıyı Tahlisiye & Can Kurtarma İstasyonu" Service Bay (X: -68.0, Z: 80.5 facing South towards Boathouse & Lifeboat)
    await page.evaluate(() => {
      if (window.__MINI_KARGO_DEV__) {
        window.__MINI_KARGO_DEV__.setVehiclePos(-68.0, 80.5, 0); // facing South
        const lsState = window.__MINI_KARGO_DEV__.getLifesavingState?.();
        if (lsState) {
          lsState.honkGreetingTimer = 8.0;
          lsState.callout = "🛟 Tahlisiye Reisi Şükrü Kaptan: Selam kargocu evlat! Kıyı Emniyeti 7/24 nöbette, fırtına kopsa da yolun açık olsun! 🌊";
          lsState.lastHonkCallout = lsState.callout;
        }
        if (window.__MINI_KARGO_DEV__.world?.lifesaving?.onPlayerHonk) {
          window.__MINI_KARGO_DEV__.world.lifesaving.onPlayerHonk({ x: -68.0, z: 80.5 });
        }
      }
    });

    await page.waitForTimeout(400);

    // Honk horn
    await page.keyboard.press("KeyH");
    await page.waitForTimeout(600);

    const shotPath = path.resolve(output, "sahil-lifesaving.png");
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot to ${shotPath}`);

    // Copy to current conversation artifact directory
    const brainDir = "/Users/metehansozen/.gemini/antigravity/brain/fb2b54ca-f5f0-47b2-8dea-561e5b7b1011";
    if (fs.existsSync(brainDir)) {
      fs.copyFileSync(shotPath, path.join(brainDir, "sahil-lifesaving.png"));
      console.log(`Copied screenshot to brain artifact dir: ${brainDir}`);
    }
  } catch (err) {
    console.error("Screenshot error:", err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
    if (serverProcess) serverProcess.kill();
  }
})();
