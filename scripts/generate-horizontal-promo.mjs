// Generates marketing/accelerating-latam-summit-horizontal.png: a 16:9 promo
// (1920×1080 designed, rendered at 2× = 3840×2160) in the site's dot-matrix
// design system: Geist Pixel type, dashed rules, corner markers, the Bogotá
// photo dissolving into pixels, the speakers and the sponsors.
// Run with `npm run promo`. Needs Google Chrome (or CHROME_PATH).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArrowRight, CalendarDays, ListChecks, MapPin } from "lucide-react";
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import { speakers } from "../src/app/speakers.ts";
import { rocket } from "../src/app/pixel-icons.ts";

const root = new URL("../", import.meta.url);
const file = (path) => readFile(new URL(path, root));
const dataUrl = async (path, type) =>
  `data:${type};base64,${(await file(path)).toString("base64")}`;
// Some logos use semi-transparent ink; stretch the alpha so they print as
// solid ink like the others.
async function solidLogo(path) {
  const source = await file(path);
  const { width, height } = await sharp(source).metadata();
  const raw = await sharp(source).ensureAlpha().extractChannel(3).raw().toBuffer();
  const alpha = await sharp(raw, { raw: { width, height, channels: 1 } })
    .normalise()
    .toColourspace("b-w")
    .raw()
    .toBuffer();
  const png = await sharp({ create: { width, height, channels: 3, background: "#0d0b01" } })
    .joinChannel(alpha, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}
const icon = (Icon, size = 24) =>
  renderToStaticMarkup(h(Icon, { size, strokeWidth: 2, "aria-hidden": true }));

const OUT = "marketing/accelerating-latam-summit-horizontal.png";
const URL_LABEL = "aiyaiyai.io";
const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// Same palette and bitmaps as src/components/ui.tsx and pixel-icons.ts.
const PALETTE = {
  k: "#0d0b01", d: "#3a362b", m: "#8f8a7b", g: "#d9d3c2", w: "#ffffff",
  b: "#794e00", a: "#b17300", l: "#e2a93b", y: "#f3d48c",
};
const MARK = [
  ".......a",
  "......k.",
  "......k.",
  ".....k..",
  "....k...",
  "..kk....",
  "kk......",
];
function pixelSvg(rows, size) {
  const width = Math.max(...rows.map((row) => row.length));
  let rects = "";
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; ) {
      let run = 1;
      while (row[x + run] === row[x]) run++;
      if (PALETTE[row[x]])
        rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${PALETTE[row[x]]}"/>`;
      x += run;
    }
  });
  return `<svg viewBox="0 0 ${width} ${rows.length}" width="${size}" height="${(size * rows.length) / width}" shape-rendering="crispEdges">${rects}</svg>`;
}

// Where each face sits in its photo, as object-position for a ~1.4:1 crop.
const CROP = {
  "Alexander Torrenegra": "50% 4%",
  "Tania Zapata": "62% 12%",
  "Alan Argüello": "50% 18%",
  "Catalina Morales": "50% 40%",
  "Juan Pablo Rodríguez": "47% 36%",
};

const fontPath = "node_modules/geist/dist/fonts/";
const [sans, pixel, mono, field, hero, aiyaiyai, torre, worder, torrenegraTsx] =
  await Promise.all([
    dataUrl(`${fontPath}geist-sans/Geist-Variable.woff2`, "font/woff2"),
    dataUrl(`${fontPath}geist-pixel/GeistPixel-Square.woff2`, "font/woff2"),
    dataUrl(`${fontPath}geist-mono/GeistMono-Variable.woff2`, "font/woff2"),
    dataUrl("public/images/pixel-field.svg", "image/svg+xml"),
    dataUrl("public/images/photos/bogota-golden-hour.webp", "image/webp"),
    dataUrl("public/images/colombia-summit/aiyaiyai.png", "image/png"),
    solidLogo("public/images/colombia-summit/credential-torre-ai.png"),
    dataUrl("public/images/colombia-summit/worder.png", "image/png"),
    file("src/components/torrenegra-mark.tsx"),
  ]);
const torrenegraPath = torrenegraTsx.toString().match(/d="([^"]+)"/)[1];
const portraits = await Promise.all(
  speakers.map((speaker) =>
    dataUrl(`public${speaker.image}`, "image/webp").then((src) => ({ ...speaker, src })),
  ),
);

const html = /* html */ `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<style>
@font-face { font-family: Geist; src: url(${sans}) format("woff2"); font-weight: 100 900; }
@font-face { font-family: GeistPixel; src: url(${pixel}) format("woff2"); font-weight: 500; }
@font-face { font-family: GeistMono; src: url(${mono}) format("woff2"); font-weight: 100 900; }
:root {
  --bg: #fcfbf6; --ink: #0d0b01; --ink2: #3a362b; --muted: #6d685a; --subtle: #9b9584;
  --line: #d8d2c1; --line2: #b5ae99; --amber: #b17300; --brown: #794e00;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1920px; height: 1080px; }
body {
  position: relative; overflow: hidden; background: var(--bg); color: var(--ink);
  font: 400 18px/1.4 Geist, sans-serif; letter-spacing: -0.008em;
  -webkit-font-smoothing: antialiased;
}
.pixel { font-family: GeistPixel, GeistMono, monospace; font-weight: 500; }
.accent { color: var(--amber); }

/* Frame: two pairs of dashed rails and a faint pixel mosaic */
.rails { position: absolute; inset: 0; pointer-events: none;
  --rail: repeating-linear-gradient(to bottom, var(--line) 0 5px, transparent 5px 10px);
  background:
    var(--rail) 48px 0 / 1px 100% no-repeat, var(--rail) 1871px 0 / 1px 100% no-repeat,
    var(--rail) 96px 0 / 1px 100% no-repeat, var(--rail) 1823px 0 / 1px 100% no-repeat; }
.field { position: absolute; inset: 0; pointer-events: none;
  background: url("${field}") 0 0 / 1440px auto;
  -webkit-mask-image: radial-gradient(ellipse 46% 60% at 26% 30%, #000, transparent 78%); }
.field.right { -webkit-mask-image: radial-gradient(ellipse 40% 40% at 78% 92%, #000, transparent 75%); }

/* Primitives */
.card { position: absolute; border: 1px dashed var(--line2); background: var(--bg); }
.card::before, .card::after { content: ""; position: absolute; z-index: 3; width: 5px; height: 5px; background: var(--ink); }
.card::before { top: -3px; left: -3px; }
.card::after { right: -3px; bottom: -3px; }
.card.amber { border-color: var(--amber); }
.card.amber::before, .card.amber::after { background: var(--amber); }
.tag { display: inline-flex; align-items: center; gap: 10px; padding: 6px 11px;
  border: 1px dashed var(--line2); background: var(--bg); color: var(--muted);
  font-size: 18px; line-height: 1.35; white-space: nowrap; }
.dot { width: 10px; height: 10px; background: var(--amber); flex-shrink: 0; }
.tile { position: absolute; display: grid; place-items: center; width: 60px; height: 60px;
  border: 1px dashed var(--line2); background: var(--bg); }
.mono-logo { filter: brightness(0); display: block; }

/* Header */
.nav { left: 120px; top: 40px; width: 1680px; height: 76px; display: flex; align-items: center;
  gap: 28px; padding: 0 22px; }
.nav .brand { display: flex; align-items: center; gap: 14px; font-size: 26px; letter-spacing: -0.02em; }
.nav .theme { margin-left: auto; color: var(--muted); font-size: 19px; }
.nav .sep { width: 1px; height: 30px; border-left: 1px dashed var(--line2); }
.nav .org { display: flex; align-items: center; gap: 14px; color: var(--muted); font-size: 18px; }

/* Hero, left */
.hero { position: absolute; left: 120px; top: 162px; width: 900px; }
h1 { margin-top: 26px; font-size: 118px; line-height: 1.0; letter-spacing: -0.035em; }
h1 span { display: block; }
.lead { margin-top: 24px; font-size: 25px; line-height: 1.38; color: var(--muted); white-space: nowrap; }
.facts { position: absolute; left: 120px; top: 548px; width: 900px; height: 96px; }
.facts .card { top: 0; height: 96px; width: 288px; padding: 16px 18px; display: grid;
  grid-template-columns: auto 1fr; column-gap: 16px; align-content: center; }
.facts .card svg { grid-row: span 2; align-self: center; }
.facts strong { font: 500 30px/1.05 GeistPixel, monospace; letter-spacing: -0.02em; font-weight: 500; }
.facts span { color: var(--muted); font-size: 17px; }

/* Hero, right: the photo */
.stage { left: 1080px; top: 162px; width: 720px; height: 482px; overflow: visible; }
.stage canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.stage .float { position: absolute; z-index: 4; }

/* Speakers */
.speakers-head { position: absolute; left: 120px; top: 678px; width: 1680px; display: flex;
  align-items: center; gap: 18px; }
.speakers-head h2 { font-size: 36px; line-height: 1; letter-spacing: -0.02em; }
.speakers-head p { margin-left: auto; color: var(--muted); font-size: 18px; }
.speaker { top: 732px; width: 266px; height: 242px; }
.speaker .photo { height: 152px; border-bottom: 1px dashed var(--line); overflow: hidden; background: #ece7d9; }
.speaker .photo img { width: 100%; height: 100%; object-fit: cover; display: block;
  filter: grayscale(1) sepia(0.4) contrast(1.05); }
.speaker .meta { padding: 11px 14px 0; }
.speaker .name { font-size: 19px; font-weight: 500; line-height: 1.2; }
.speaker .role { margin-top: 4px; font-size: 14.5px; line-height: 1.32; color: var(--muted); }
.more { display: flex; flex-direction: column; gap: 10px; padding: 18px 16px 14px;
  background: url("${field}") 50% 0 / 900px auto; }
.more .rocket { position: absolute; right: 18px; bottom: 16px; }
.more h3 { font: 500 28px/1.05 GeistPixel, monospace; letter-spacing: -0.02em; }
.more p { max-width: 130px; margin-top: auto; color: var(--muted); font-size: 15px; line-height: 1.3; }

/* Footer */
.foot { position: absolute; left: 120px; top: 1000px; width: 1680px; height: 56px; display: flex;
  align-items: center; gap: 34px; }
.foot::before { content: ""; position: absolute; left: 0; right: 0; top: -14px; border-top: 1px dashed var(--line2); }
.foot .label { color: var(--muted); font-size: 18px; }
.foot .torrenegra { display: flex; align-items: center; gap: 11px; font-size: 22px; font-weight: 500; letter-spacing: -0.02em; }
.cta { margin-left: auto; display: flex; align-items: center; gap: 12px; height: 56px; padding: 0 22px;
  background: var(--brown); color: #fff; font-size: 21px; }
.cta b { font-weight: 400; color: #f3d48c; font-family: GeistMono, monospace; font-size: 19px; }
</style></head>
<body>
<div class="rails"></div>
<div class="field"></div>
<div class="field right"></div>

<header class="card nav">
  <div class="brand pixel">${pixelSvg(MARK, 30)}Accelerating LATAM Summit</div>
  <div class="theme">IA · Empresas · Lo que viene</div>
  <div class="sep"></div>
  <div class="org">Organiza <img class="mono-logo" src="${aiyaiyai}" height="30" alt=""></div>
</header>

<section class="hero">
  <span class="tag"><span class="dot"></span>Próximamente · Bogotá, Colombia</span>
  <h1 class="pixel"><span>Accelerating</span><span class="accent">LATAM Summit.</span></h1>
  <p class="lead">IA, empresas y lo que viene. La próxima conversación empieza en Bogotá.</p>
</section>

<div class="facts">
  <div class="card" style="left:0">${icon(CalendarDays, 30)}<strong>19.11.2026</strong><span>Jueves 19 de noviembre</span></div>
  <div class="card" style="left:306px">${icon(MapPin, 30)}<strong>Bogotá</strong><span>Colombia</span></div>
  <div class="card" style="left:612px">${icon(ListChecks, 30)}<strong>Lista abierta</strong><span>Registro de interés</span></div>
</div>

<figure class="card amber stage">
  <canvas id="photo"></canvas>
  <span class="tag float" style="left:-22px; top:44%"><span class="dot"></span>Bogotá, Colombia</span>
  <span class="tag float" style="right:-22px; top:13%; color:var(--ink); font-family:GeistMono, monospace; font-size:17px"><span class="dot"></span>19.11.2026</span>
  <span class="tile float" style="left:44px; top:-30px">${icon(MapPin, 26)}</span>
  <span class="tile float" style="right:-30px; top:62%">${icon(CalendarDays, 26)}</span>
</figure>

<div class="speakers-head">
  <span class="tag">Speakers</span>
  <h2 class="pixel">Las primeras <span class="accent">voces.</span></h2>
  <p>Fundadores y operadores que están transformando las empresas de la región.</p>
</div>
${portraits
  .map(
    (speaker, i) => `<div class="card speaker" style="left:${120 + i * 282.8}px">
  <div class="photo"><img src="${speaker.src}" style="object-position:${CROP[speaker.name] ?? "50% 25%"}" alt=""></div>
  <div class="meta"><div class="name">${speaker.name}</div><div class="role">${speaker.role}</div></div>
</div>`,
  )
  .join("")}
<div class="card speaker more" style="left:${120 + 5 * 282.8}px">
  <div class="rocket">${pixelSvg(rocket, 96)}</div>
  <h3>Y esto apenas <span class="accent">empieza.</span></h3>
  <p>Más speakers y la agenda, muy pronto.</p>
</div>

<footer class="foot">
  <span class="label">Con el apoyo de</span>
  <span class="torrenegra"><svg viewBox="0 0 48 28.364" width="40" height="24"><path d="${torrenegraPath}" fill="currentColor"/></svg>Torrenegra &amp; Co</span>
  <img class="mono-logo" src="${torre}" height="28" alt="">
  <img class="mono-logo" src="${worder}" height="30" alt="">
  <span class="cta">Únete a la lista de interés <b>${URL_LABEL}</b>${icon(ArrowRight, 22)}</span>
</footer>

<script>
// The site's PixelPhoto, in its settled state: the photo with its upper part
// dissolved into pixels of its own colours over a faint ink grid.
window.renderPhoto = (src) => new Promise((resolve, reject) => {
  const canvas = document.getElementById("photo");
  const w = canvas.clientWidth, h = canvas.clientHeight, dpr = window.devicePixelRatio;
  const cell = 20, solidFrom = 0.62, silhouette = 0.22, paper = "#fcfbf6";
  const photo = new Image();
  photo.onerror = reject;
  photo.onload = () => {
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    const scale = Math.max(w / photo.naturalWidth, h / photo.naturalHeight);
    const sw = w / scale, sh = h / scale;
    const sx = (photo.naturalWidth - sw) * 0.5, sy = (photo.naturalHeight - sh) * 0.42;
    const tone = "sepia(0.3) saturate(1.2) brightness(1.08)";
    ctx.imageSmoothingQuality = "high";
    ctx.filter = tone;
    ctx.drawImage(photo, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    ctx.filter = "none";
    const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
    const sample = document.createElement("canvas");
    sample.width = cols; sample.height = rows;
    const s = sample.getContext("2d");
    s.imageSmoothingQuality = "high";
    s.filter = tone;
    s.drawImage(photo, sx, sy, sw, sh, 0, 0, w / cell, h / cell);
    const colors = s.getImageData(0, 0, cols, rows).data;
    let seed = 1911;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 1;
    for (let r = 0; r < rows; r++) {
      const t = (r + 0.5) / rows / solidFrom;
      for (let c = 0; c < cols; c++) {
        const o = (r * cols + c) * 4;
        const rgb = colors[o] + "," + colors[o + 1] + "," + colors[o + 2];
        const lum = (0.299 * colors[o] + 0.587 * colors[o + 1] + 0.114 * colors[o + 2]) / 255;
        const v = t + (0.45 - lum) * silhouette + (random() - 0.5) * 0.45;
        if (v >= 1) continue;
        const x = c * cell, y = r * cell;
        if (v >= 0.45) {
          ctx.fillStyle = "rgb(" + rgb + ")"; ctx.fillRect(x, y, cell, cell);
          ctx.strokeStyle = "rgba(13,11,1,0.16)"; ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
          continue;
        }
        ctx.fillStyle = paper; ctx.fillRect(x, y, cell, cell);
        if (v >= 0.3) { ctx.fillStyle = "rgba(" + rgb + ",0.3)"; ctx.fillRect(x + 1, y + 1, cell - 1, cell - 1); }
        else if (v >= 0.18) { ctx.strokeStyle = "#d8d2c1"; ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1); }
      }
    }
    resolve();
  };
  photo.src = src;
});
</script>
</body></html>`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate((src) => window.renderPhoto(src), hero);
  await mkdir(new URL("marketing/", root), { recursive: true });
  const png = await page.screenshot({ type: "png" });
  await writeFile(new URL(OUT, root), png);
  console.log(`${OUT}: 3840×2160`);
} finally {
  await browser.close();
}
