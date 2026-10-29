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
          bestScore: 250,
          soundEnabled: false,
          money: 1200,
          reputation: 35,
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

    // Teleport car facing Güneş Mahallesi "Bizim Bakkal" (X: -55.0, Z: -50.0, heading: Math.PI facing South)
    await page.evaluate(() => {
      if (window.__MINI_KARGO_DEV__) {
        window.__MINI_KARGO_DEV__.setVehiclePos(-55.0, -50.0, Math.PI);
        const gss = window.__MINI_KARGO_DEV__.getGroceryStoreState?.();
        if (gss) {
          gss.honkGreetingTimer = 5.0;
          gss.lastHonkCallout = "🥖 Bakkal Hüsnü Amca: Hoş geldin evlat! Fırından yeni çıktı ekmekler, çıtır çıtır! 🥐";
        }
      }
    });

    await page.waitForTimeout(800);

    const shotPath = path.resolve(output, "gunes-bizim-bakkal.png");
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot to ${shotPath}`);

    // Copy to current conversation artifact directory
    const brainDir = "/Users/metehansozen/.gemini/antigravity/brain/1a36c0d3-5af2-4855-be97-0001ca391e7c";
    if (fs.existsSync(brainDir)) {
      fs.copyFileSync(shotPath, path.join(brainDir, "gunes-bizim-bakkal.png"));
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
