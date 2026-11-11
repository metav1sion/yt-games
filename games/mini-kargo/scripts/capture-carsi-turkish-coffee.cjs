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
          money: 2500,
          reputation: 60,
          companyLevel: 2,
          unlockedDistricts: ["sunny", "market"],
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

    // Teleport car to Çarşı "Tarihi Türk Kahvecisi & Közde Kahve / Lokum İmalathanesi" Service Bay (X: 37.0, Z: 81.0 facing North towards Pavilion)
    await page.evaluate(() => {
      if (window.__MINI_KARGO_DEV__) {
        window.__MINI_KARGO_DEV__.setVehiclePos(37.0, 81.0, Math.PI);
        const tcState = window.__MINI_KARGO_DEV__.getTurkishCoffeeState?.();
        if (tcState) {
          tcState.honkGreetingTimer = 8.0;
          tcState.callout = "☕ Kahveci Tahsin Efendi: Hoş geldin kargocu dostum! Közde kahvemiz pişti, bir fincanın kırk yıl hatırı vardır! 🍬";
          tcState.lastHonkCallout = tcState.callout;
        }
        if (window.__MINI_KARGO_DEV__.world?.turkishCoffee?.onPlayerHonk) {
          window.__MINI_KARGO_DEV__.world.turkishCoffee.onPlayerHonk({ x: 37.0, z: 81.0 });
        }
      }
    });

    await page.waitForTimeout(400);

    // Honk horn
    await page.keyboard.press("KeyH");
    await page.waitForTimeout(600);

    const shotPath = path.resolve(output, "carsi-turkish-coffee.png");
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot to ${shotPath}`);

    // Copy to current conversation artifact directory
    const brainDir = "/Users/metehansozen/.gemini/antigravity/brain/37aae114-ca28-417d-a787-4142af6c0bf4";
    if (fs.existsSync(brainDir)) {
      fs.copyFileSync(shotPath, path.join(brainDir, "carsi-turkish-coffee.png"));
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
