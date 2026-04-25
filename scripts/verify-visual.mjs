import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const baseURL = process.env.VISUAL_BASE_URL || 'http://localhost:5173';
const executablePath = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const currentDir = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(currentDir, '../artifacts/visual-check');

const checks = [
  { name: 'desktop-home', path: '/', viewport: { width: 1440, height: 1000 } },
  { name: 'mobile-voice', path: '/voice', viewport: { width: 390, height: 844 } },
];

async function getCanvasSignal(page) {
  return page.$$eval('canvas', (canvases) =>
    canvases.map((canvas) => {
      const gl =
        canvas.getContext('webgl2', { preserveDrawingBuffer: true }) ||
        canvas.getContext('webgl', { preserveDrawingBuffer: true }) ||
        canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true });

      if (!gl) {
        return { width: canvas.width, height: canvas.height, litPixels: 0, checkedPixels: 0 };
      }

      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;
      const pixels = new Uint8Array(width * height * 4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

      let litPixels = 0;
      let checkedPixels = 0;
      const step = 32;

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = (y * width + x) * 4;
          const alpha = pixels[index + 3];
          const brightness = pixels[index] + pixels[index + 1] + pixels[index + 2];
          checkedPixels += 1;
          if (alpha > 8 && brightness > 28) litPixels += 1;
        }
      }

      return { width, height, litPixels, checkedPixels };
    }),
  );
}

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  for (const check of checks) {
    const page = await browser.newPage({ viewport: check.viewport, deviceScaleFactor: 1 });
    await page.goto(`${baseURL}${check.path}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForTimeout(1400);

    const screenshotPath = resolve(outputDir, `${check.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const signals = await getCanvasSignal(page);
    const strongest = signals.reduce((best, item) => (item.litPixels > best.litPixels ? item : best), {
      litPixels: 0,
      checkedPixels: 0,
      width: 0,
      height: 0,
    });

    console.log(
      `${check.name}: ${strongest.width}x${strongest.height}, lit ${strongest.litPixels}/${strongest.checkedPixels}, screenshot ${screenshotPath}`,
    );

    if (strongest.litPixels < 12) {
      throw new Error(`3D canvas looks blank for ${check.name}`);
    }

    await page.close();
  }
} finally {
  await browser.close();
}
