// Generates public/images/colombia-summit/opengraph.png (1200×630) and
// src/app/icon.png for the private lunch. Run with `npm run og` after
// changing the photo or copy. Rendered with headless Chrome like the promos,
// so the site's own WOFF2 fonts (Geist Pixel Square, Geist, Geist Mono) are
// used as-is. Same language as the site: paper, ink, the flag by role.
import { readFile, writeFile } from "node:fs/promises";
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import { summitTickets, totalSeats } from "../src/lib/summit-pricing.ts";

const root = new URL("../", import.meta.url);
const asset = (path) => new URL(path, root);
const CHROME =
  process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const dataUrl = async (path, type) =>
  `data:${type};base64,${(await readFile(asset(path))).toString("base64")}`;
const W = 1200, H = 630;

const PAPER = "#fcfbf6", INK = "#0d0b01", MUTED = "#6d685a", LINE = "#b5ae99";
const BLUE = "#003893", YELLOW = "#fcd116", RED = "#ce1126";
const seats = Object.fromEntries(summitTickets.map((t) => [t.id, t.capacity]));

const fonts = "node_modules/geist/dist/fonts/";
const [pixel, sans, mono, photo] = await Promise.all([
  dataUrl(`${fonts}geist-pixel/GeistPixel-Square.woff2`, "font/woff2"),
  dataUrl(`${fonts}geist-sans/Geist-Variable.woff2`, "font/woff2"),
  dataUrl(`${fonts}geist-mono/GeistMono-Variable.woff2`, "font/woff2"),
  dataUrl("public/images/photos/bogota-golden-hour.webp", "image/webp"),
]);

// Same geometry as <LogoMark />: an exponential curve in pixels, red lead.
const MARK = [".......r", "......k.", "......k.", ".....k..", "....k...", "..kk....", "kk......"];
const markSvg = (ink) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 7" shape-rendering="crispEdges">${MARK.flatMap((row, y) =>
    [...row].map((c, x) => (c === "." ? "" : `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${c === "r" ? RED : ink}"/>`))).join("")}</svg>`;

const PHOTO_W = 430;
const html = /* html */ `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
@font-face { font-family: GeistPixel; src: url(${pixel}) format("woff2"); font-weight: 500; }
@font-face { font-family: Geist; src: url(${sans}) format("woff2"); font-weight: 100 900; }
@font-face { font-family: GeistMono; src: url(${mono}) format("woff2"); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${W}px; height: ${H}px; }
body { position: relative; overflow: hidden; background: ${PAPER}; color: ${INK}; font: 400 20px/1.3 Geist, sans-serif;
  letter-spacing: -0.01em; -webkit-font-smoothing: antialiased; }
.stripe { position: absolute; top: 0; left: 0; width: ${W}px; height: 8px;
  background: linear-gradient(90deg, ${YELLOW} 0 50%, ${BLUE} 50% 75%, ${RED} 75%); }
.photo { position: absolute; top: 8px; right: 0; width: ${PHOTO_W}px; height: ${H - 8}px; object-fit: cover; object-position: 50% 45%; }
.edge { position: absolute; top: 8px; right: ${PHOTO_W}px; width: 0; height: ${H - 8}px; border-left: 1px dashed ${LINE}; }
.corner { position: absolute; width: 5px; height: 5px; background: ${INK}; }
.copy { position: absolute; top: 8px; left: 0; width: ${W - PHOTO_W}px; height: ${H - 8}px; display: flex; flex-direction: column;
  justify-content: space-between; padding: 40px 44px 42px 48px; }
.top { display: flex; align-items: center; justify-content: space-between; }
.lockup { display: flex; align-items: center; gap: 10px; }
.lockup svg { width: 26px; height: 23px; }
.lockup .word { font: 500 22px/1 GeistPixel, monospace; letter-spacing: -0.02em; white-space: nowrap; }
.dot { color: #9b9584; } .fn { color: ${BLUE}; } .call { color: ${RED}; }
.tag { display: inline-flex; align-items: center; gap: 10px; padding: 7px 11px; border: 1px dashed ${LINE}; background: ${PAPER};
  font-size: 17px; color: ${MUTED}; white-space: nowrap; }
.tag b { font-weight: 500; color: ${INK}; }
.tag .mono { font-family: GeistMono, monospace; }
.flag { width: 14px; height: 9px; background: linear-gradient(${YELLOW} 0 50%, ${BLUE} 50% 75%, ${RED} 75%); box-shadow: 0 0 0 1px rgb(13 11 1 / 0.08); }
h1 { font: 500 58px/1.04 GeistPixel, monospace; letter-spacing: -0.03em; }
h1 .accent { color: ${BLUE}; }
.cursor { display: inline-block; width: 0.5em; height: 0.82em; margin-left: 0.08em; vertical-align: -0.06em; background: ${YELLOW};
  box-shadow: inset 0 0 0 1px rgb(13 11 1 / 0.12); }
.lead { margin-top: 20px; font-size: 24px; line-height: 1.35; color: #3a362b; }
.facts { display: flex; gap: 10px; }
</style></head><body>
<div class="stripe"></div>
<img class="photo" src="${photo}" alt="">
<div class="edge"></div>
<div class="corner" style="top:${8 - 2}px; right:${PHOTO_W - 2}px"></div>
<div class="corner" style="bottom:-2px; right:-2px"></div>
<div class="copy">
  <div class="top">
    <div class="lockup">${markSvg(INK)}<span class="word">bogota<span class="dot">.</span><span class="fn">forward</span><span class="call">()</span></span></div>
    <span class="tag"><span class="flag"></span>Jueves 19 de noviembre · Bogotá</span>
  </div>
  <div>
    <h1>Comida privada para<br><span class="accent">founders, managers<br>y C-levels</span><span class="cursor"></span></h1>
    <p class="lead">Con Alexander Torrenegra y Tania Zapata.</p>
  </div>
  <div class="facts">
    <span class="tag"><b>${totalSeats} lugares</b> · ${seats.vip} General · ${seats["vip-plus"]} VIP</span>
    <span class="tag"><b>Por aplicación</b></span>
    <span class="tag mono">1:30 – 6:00 p. m.</span>
  </div>
</div>
</body></html>`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const og = asset("public/images/colombia-summit/opengraph.png");
  await writeFile(og, await page.screenshot({ type: "png" }));
  console.log(`Generated ${og.pathname}`);
} finally {
  await browser.close();
}

// Favicon: the pixel curve in paper on an ink tile.
const icon = asset("src/app/icon.png");
await sharp(
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${INK}"/><g transform="translate(12 16.5) scale(5)">${MARK.flatMap((row, y) =>
      [...row].map((c, x) => (c === "." ? "" : `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${c === "r" ? RED : PAPER}"/>`))).join("")}</g></svg>`,
  ),
  { density: 600 },
)
  .resize(256, 256)
  .png()
  .toFile(icon.pathname);
console.log(`Generated ${icon.pathname}`);
