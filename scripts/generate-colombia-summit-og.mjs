// Generates the share images in public/images/colombia-summit/:
//   opengraph.jpg      1200×630   (Open Graph, Twitter, LinkedIn, WhatsApp)
//   opengraph-4x3.jpg  1200×900   (Event schema)
//   opengraph-1x1.jpg  1200×1200  (Event schema)
// Run with `npm run og` after changing the hero photo or the headline.
// Rendered with headless Chrome (CHROME_PATH) so the site's own fonts are
// used as-is; the composition mirrors the hero: the city under the sunbeams,
// the date and the headline in white serif over it. JPEG, kept under ~300 KB
// so WhatsApp and iMessage still show the preview. The favicons in src/app/
// are static files and are not touched here.
import { readFile } from "node:fs/promises";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const asset = (path) => new URL(path, root);
const CHROME =
  process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const dataUrl = async (path, type) =>
  `data:${type};base64,${(await readFile(asset(path))).toString("base64")}`;

const PAPER = "#f4f5f2";
const INK = "#121411";
const GREEN_LIGHT = "#5bc896";

const fonts = "node_modules/geist/dist/fonts/";
const [serif, sans, mono, photo] = await Promise.all([
  dataUrl("src/app/fonts/newsreader-latin-400-normal.woff2", "font/woff2"),
  dataUrl(`${fonts}geist-sans/Geist-Regular.woff2`, "font/woff2"),
  dataUrl(`${fonts}geist-mono/GeistMono-Medium.woff2`, "font/woff2"),
  dataUrl("public/images/photos/bogota-rayos.webp", "image/webp"),
]);

// One layout, three frames. `pos` is the photo's focal point: on the square
// the frame is narrow, so it moves toward the downtown towers.
const frames = [
  { file: "opengraph.jpg", w: 1200, h: 630, h1: 68, pad: 64, brand: 22, eye: 21, gap: 20, bottom: 64, pos: "58% 50%" },
  { file: "opengraph-4x3.jpg", w: 1200, h: 900, h1: 76, pad: 72, brand: 24, eye: 23, gap: 24, bottom: 80, pos: "56% 50%" },
  { file: "opengraph-1x1.jpg", w: 1200, h: 1200, h1: 84, pad: 80, brand: 26, eye: 25, gap: 26, bottom: 96, pos: "54% 50%" },
];

const html = (f) => /* html */ `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
@font-face { font-family: Newsreader; src: url(${serif}) format("woff2"); font-weight: 400; }
@font-face { font-family: Geist; src: url(${sans}) format("woff2"); font-weight: 400; }
@font-face { font-family: GeistMono; src: url(${mono}) format("woff2"); font-weight: 500; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${f.w}px; height: ${f.h}px; }
body { position: relative; overflow: hidden; background: ${INK}; color: ${PAPER}; -webkit-font-smoothing: antialiased; }
.photo { position: absolute; inset: 0; background: url(${photo}) ${f.pos} / cover no-repeat; }
.scrim { position: absolute; inset: 0; background:
  linear-gradient(to top, rgb(10 12 10 / 0.86) 0%, rgb(10 12 10 / 0.58) 34%, rgb(10 12 10 / 0) 66%),
  linear-gradient(to bottom, rgb(10 12 10 / 0.5) 0%, rgb(10 12 10 / 0) 24%); }
.brand { position: absolute; left: ${f.pad}px; top: ${f.pad - 8}px; font: 500 ${f.brand}px/1 GeistMono, monospace; letter-spacing: -0.02em; }
.brand .dim { color: #b9bdb5; } .brand .fn { color: ${GREEN_LIGHT}; }
.copy { position: absolute; left: ${f.pad}px; right: ${f.pad}px; bottom: ${f.bottom}px; }
.eye { font: 400 ${f.eye}px/1 Geist, sans-serif; color: rgb(244 245 242 / 0.8); margin-bottom: ${f.gap}px; }
h1 { font: 400 ${f.h1}px/1.04 Newsreader, Georgia, serif; letter-spacing: -0.025em; max-width: ${Math.round(f.w * 0.86)}px; }
</style></head><body>
<div class="photo"></div><div class="scrim"></div>
<div class="brand">bogota<span class="dim">.</span><span class="fn">forward</span><span class="dim">()</span></div>
<div class="copy">
  <p class="eye">Jueves 19 de noviembre de 2026 · Bogotá</p>
  <h1>Evento y cena privada para founders, managers y C-levels</h1>
</div>
</body></html>`;

// Chrome refuses to run its sandbox as root (CI containers); a desktop run keeps it.
const args = process.getuid?.() === 0 ? ["--no-sandbox"] : [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args });
try {
  for (const f of frames) {
    const page = await browser.newPage();
    await page.setViewport({ width: f.w, height: f.h, deviceScaleFactor: 1 });
    await page.setContent(html(f), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const png = await page.screenshot({ type: "png" });
    await page.close();
    const out = asset(`public/images/colombia-summit/${f.file}`);
    const info = await sharp(png)
      .jpeg({ quality: 80, progressive: true, mozjpeg: true, chromaSubsampling: "4:2:0" })
      .toFile(out.pathname);
    console.log(`Generated ${out.pathname} (${f.w}×${f.h}, ${Math.round(info.size / 1024)} KB)`);
  }
} finally {
  await browser.close();
}
