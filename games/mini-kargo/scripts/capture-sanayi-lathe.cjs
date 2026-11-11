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
          bestScore: 400,
          soundEnabled: false,
          money: 2000,
          reputation: 60,
          companyLevel: 2,
          unlockedDistricts: ["sunny", "industrial"],
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

    // Teleport car at Sanayi "Tarihi Makine, Torna & Freze İmalathanesi" Service Bay (X: 40.0, Z: -52.6 facing North towards workshop)
    await page.evaluate(() => {
      if (window.__MINI_KARGO_DEV__) {
        window.__MINI_KARGO_DEV__.setVehiclePos(40.0, -52.6, -Math.PI);
        const ls = window.__MINI_KARGO_DEV__.getLatheWorkshopState?.();
        if (ls) {
          ls.honkGreetingTimer = 8.0;
          ls.lastHonkCallout = "⚙️ Necati Usta: Hoş geldin evlat! Binde bir milim hassasiyetle işleriz! 🔩";
        }
      }
    });

    await page.waitForTimeout(1000);

    const shotPath = path.resolve(output, "sanayi-lathe-workshop.png");
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot to ${shotPath}`);

    // Copy to current conversation artifact directory
    const brainDir = "/Users/metehansozen/.gemini/antigravity/brain/c696dc20-d847-4199-bf19-c43ecf99556e";
    if (fs.existsSync(brainDir)) {
      fs.copyFileSync(shotPath, path.join(brainDir, "sanayi-lathe-workshop.png"));
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
