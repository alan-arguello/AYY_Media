// Generates the speaker promos in the site's design system:
//   marketing/bogota-forward-linkedin.png   1200×627, rendered at 2×
//   marketing/bogota-forward-instagram.png  1080×1080, rendered at 2×
// Alexander, Tania and Alan appear as cut-outs (person masks from Apple's
// Vision framework), toned ink-on-paper, their bodies dissolving into a
// pixel grid. Run with `npm run promo:speakers`. Masks are written once with:
//   swift scripts/person-mask.swift marketing/masks public/images/speakers/<photo>.webp
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const file = (path) => readFile(new URL(path, root));
const dataUrl = async (path, type) =>
  `data:${type};base64,${(await file(path)).toString("base64")}`;
const icon = (Icon, size) =>
  renderToStaticMarkup(h(Icon, { size, strokeWidth: 2, "aria-hidden": true }));
const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// Some logos use semi-transparent ink; stretch the alpha so they print solid.
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

// Face boxes in source pixels, from Apple's Vision framework.
const SPEAKERS = [
  {
    name: "Alexander Torrenegra",
    role: "Cofundador de Torre.ai",
    photo: "public/images/speakers/alexander-torrenegra.webp",
    mask: "marketing/masks/alexander-torrenegra.png",
    face: { x: 315, y: 167, w: 195, h: 195 },
    logos: ["credential-torre-ai.png", "credential-shark-tank.png"],
  },
  {
    name: "Tania Zapata",
    role: "Cofundadora de Voice123",
    photo: "public/images/speakers/tania-zapata.webp",
    mask: "marketing/masks/tania-zapata.png",
    face: { x: 361, y: 175, w: 248, h: 248 },
    logos: ["credential-bunnyinc.png", "credential-stanford.png"],
  },
  {
    name: "Alan Argüello",
    role: "Torrenegra & Co",
    photo: "public/images/speakers/alan-arguello-sf.webp",
    mask: "marketing/masks/alan-arguello-sf.png",
    face: { x: 343, y: 191, w: 230, h: 230 },
    logos: ["credential-georgia.png"],
  },
];

const MARK = [".......r", "......k.", "......k.", ".....k..", "....k...", "..kk....", "kk......"];
const PALETTE = { k: "#0d0b01", r: "#ce1126" };
function pixelSvg(rows, size) {
  const width = Math.max(...rows.map((row) => row.length));
  let rects = "";
  rows.forEach((row, y) =>
    [...row].forEach((key, x) => {
      if (PALETTE[key]) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${PALETTE[key]}"/>`;
    }),
  );
  return `<svg viewBox="0 0 ${width} ${rows.length}" width="${size}" height="${(size * rows.length) / width}" shape-rendering="crispEdges">${rects}</svg>`;
}

const fonts = "node_modules/geist/dist/fonts/";
const [sans, pixel, mono, field, aiyaiyai, torre, worder, torrenegraTsx] = await Promise.all([
  dataUrl(`${fonts}geist-sans/Geist-Variable.woff2`, "font/woff2"),
  dataUrl(`${fonts}geist-pixel/GeistPixel-Square.woff2`, "font/woff2"),
  dataUrl(`${fonts}geist-mono/GeistMono-Variable.woff2`, "font/woff2"),
  dataUrl("public/images/pixel-field.svg", "image/svg+xml"),
  dataUrl("public/images/colombia-summit/aiyaiyai.png", "image/png"),
  solidLogo("public/images/colombia-summit/credential-torre-ai.png"),
  dataUrl("public/images/colombia-summit/worder.png", "image/png"),
  file("src/components/torrenegra-mark.tsx"),
]);
const torrenegra = `<svg viewBox="0 0 48 28.364" width="1.7em" height="1em"><path d="${
  torrenegraTsx.toString().match(/d="([^"]+)"/)[1]
}" fill="currentColor"/></svg>`;
const speakers = await Promise.all(
  SPEAKERS.map(async (speaker) => ({
    ...speaker,
    photo: await dataUrl(speaker.photo, "image/webp"),
    mask: await dataUrl(speaker.mask, "image/png"),
    logos: await Promise.all(
      speaker.logos.map((logo) => dataUrl(`public/images/colombia-summit/${logo}`, "image/png")),
    ),
  })),
);

const wordmark = `<span class="obj">bogota</span><span class="dot">.</span><span class="fn">forward</span><span class="call">()</span>`;

const css = /* css */ `
@font-face { font-family: Geist; src: url(${sans}) format("woff2"); font-weight: 100 900; }
@font-face { font-family: GeistPixel; src: url(${pixel}) format("woff2"); font-weight: 500; }
@font-face { font-family: GeistMono; src: url(${mono}) format("woff2"); font-weight: 100 900; }
:root {
  --bg: #fcfbf6; --ink: #0d0b01; --muted: #6d685a; --subtle: #9b9584;
  --line: #d8d2c1; --line2: #b5ae99;
  --blue: #003893; --yellow: #fcd116; --red: #ce1126;
  --flag: linear-gradient(var(--yellow) 0 50%, var(--blue) 50% 75%, var(--red) 75%);
  --flag-h: linear-gradient(90deg, var(--yellow) 0 50%, var(--blue) 50% 75%, var(--red) 75%);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { position: relative; overflow: hidden; background: var(--bg); color: var(--ink);
  font: 400 16px/1.35 Geist, sans-serif; letter-spacing: -0.008em; -webkit-font-smoothing: antialiased; }
.abs { position: absolute; }
.pixel { font-family: GeistPixel, GeistMono, monospace; font-weight: 500; }
.mono { font-family: GeistMono, monospace; }
.stripe { position: absolute; inset: 0 0 auto; background: var(--flag-h); }
.rails { position: absolute; inset: 0; pointer-events: none;
  --rail: repeating-linear-gradient(to bottom, var(--line) 0 5px, transparent 5px 10px); }
.field { position: absolute; inset: 0; pointer-events: none; background: url("${field}") 0 0 / 1200px auto; }

.dot-flag { display: inline-block; width: 1.05em; height: 0.7em; flex-shrink: 0; background: var(--flag);
  box-shadow: 0 0 0 1px rgb(13 11 1 / 0.1); }
.tag { display: inline-flex; align-items: center; gap: 0.6em; padding: 0.35em 0.65em;
  border: 1px dashed var(--line2); background: var(--bg); color: var(--muted); white-space: nowrap; }
.card { position: absolute; border: 1px dashed var(--line2); background: var(--bg); }
.card::before, .card::after { content: ""; position: absolute; z-index: 5; width: 5px; height: 5px; background: var(--ink); }
.card::before { top: -3px; left: -3px; }
.card::after { right: -3px; bottom: -3px; }
.card.blue { border-color: var(--blue); }
.card.blue::before, .card.blue::after { background: var(--blue); }

h1 { line-height: 1.02; letter-spacing: -0.035em; white-space: nowrap; }
h1 > span { display: block; }
.dot { color: var(--subtle); } .fn { color: var(--blue); } .call { color: var(--red); }
.cursor { display: inline-block; width: 0.5em; height: 0.8em; margin-left: 0.08em; vertical-align: -0.04em;
  background: var(--yellow); box-shadow: inset 0 0 0 1px rgb(13 11 1 / 0.12); }
.lead { color: var(--muted); }

.stage { background:
  radial-gradient(ellipse 70% 60% at 50% 40%, transparent, var(--bg) 85%), url("${field}") 50% 0 / 900px auto; }
.stage .clip { position: absolute; inset: 0; overflow: hidden; }
.stage canvas { position: absolute; bottom: 0; display: block; }
.name { position: absolute; z-index: 6; display: grid; gap: 0.25em; padding: 0.55em 0.75em;
  border: 1px dashed var(--line2); background: var(--bg); white-space: nowrap; }
.name b { font-weight: 500; }
.name span { color: var(--muted); font-size: 0.8em; }
.name .creds { display: flex; align-items: center; gap: 0.9em; margin-top: 0.35em; padding-top: 0.45em;
  border-top: 1px dashed var(--line); }
.name .creds img { height: 1.05em; width: auto; filter: grayscale(1); opacity: 0.7; }

.names-strip { z-index: 6; display: grid; grid-template-columns: repeat(3, 1fr); }
.names-strip > div { display: grid; gap: 0.2em; padding: 0.6em 0.8em; white-space: nowrap; }
.names-strip > div + div { border-left: 1px dashed var(--line); }
.names-strip b { font-weight: 500; }
.names-strip span { color: var(--muted); font-size: 0.85em; }
.cta { display: inline-flex; align-items: center; gap: 0.6em; padding: 0 1em; background: var(--blue); color: #fff; white-space: nowrap; }
.cta b { font-weight: 400; color: var(--yellow); font-family: GeistMono, monospace; }
.foot { display: flex; align-items: center; color: var(--muted); white-space: nowrap; }
.foot::before { content: ""; position: absolute; left: 0; right: 0; top: 0; border-top: 1px dashed var(--line2); }
.foot img { display: block; filter: brightness(0); }
.foot .tn { display: inline-flex; align-items: center; gap: 0.45em; color: var(--ink); font-weight: 500; letter-spacing: -0.02em; }
.brand { display: flex; align-items: center; gap: 0.6em; letter-spacing: -0.02em; }
.brand .kind { color: var(--muted); }
`;

// One name card per speaker, centred under their portrait.
const names = (centers, top, fontSize, withLogos) =>
  speakers
    .map(
      (speaker, i) => `<div class="name" style="left:${centers[i]}px; top:${top}px; font-size:${fontSize}px; transform:translateX(-50%)">
  <b>${speaker.name}</b><span>${speaker.role}</span>
  ${withLogos ? `<div class="creds">${speaker.logos.map((src) => `<img src="${src}" alt="">`).join("")}</div>` : ""}
</div>`,
    )
    .join("");

const portraits = (layout) =>
  layout
    .map(
      (p, i) =>
        `<canvas id="p${i}" style="left:${p.left}px; width:${p.w}px; height:${p.h}px; z-index:${p.z}"></canvas>`,
    )
    .join("");

const sponsors = (size) => `
  <span>Organiza</span><img src="${aiyaiyai}" style="height:${size * 1.25}px" alt="">
  <span style="margin-left:auto">Con el apoyo de</span>
  <span class="tn">${torrenegra}Torrenegra &amp; Co</span>
  <img src="${torre}" style="height:${size * 1.05}px; filter:none" alt="">
  <img src="${worder}" style="height:${size * 1.1}px" alt="">`;

// ── LinkedIn, 1200×627 ──────────────────────────────────────────────────────
const LI = { w: 1200, h: 627 };
const liStage = { left: 600, top: 44, w: 536, h: 456 };
const liPortraits = [
  { left: 0, w: 252, h: 440, z: 1 },
  { left: 142, w: 252, h: 440, z: 3 },
  { left: 284, w: 252, h: 440, z: 2 },
];
const linkedin = /* html */ `
<div class="stripe" style="height:5px"></div>
<div class="rails" style="background:
  var(--rail) 32px 0/1px 100% no-repeat, var(--rail) 64px 0/1px 100% no-repeat,
  var(--rail) 1135px 0/1px 100% no-repeat, var(--rail) 1167px 0/1px 100% no-repeat"></div>
<div class="field" style="-webkit-mask-image: radial-gradient(ellipse 40% 55% at 22% 32%, #000, transparent 80%)"></div>

<div class="abs brand pixel" style="left:88px; top:44px; font-size:17px">${pixelSvg(MARK, 20)}<span>${wordmark} <span class="kind">summit</span></span></div>

<span class="abs tag" style="left:88px; top:108px; font-size:14px"><span class="dot-flag"></span>Próximamente · Bogotá, Colombia</span>
<h1 class="abs pixel" style="left:86px; top:150px; font-size:62px"><span>${wordmark}</span><span>summit<span class="cursor"></span></span></h1>
<p class="abs lead" style="left:88px; top:292px; width:470px; font-size:19px">IA, empresas y lo que viene. La próxima conversación empieza en Bogotá.</p>

<div class="abs" style="left:88px; top:362px; display:flex; gap:12px">
  <div class="card" style="position:relative; display:flex; align-items:center; gap:10px; height:52px; padding:0 14px">
    ${icon(CalendarDays, 20)}<span class="pixel" style="font-size:21px">19.11.2026</span>
  </div>
  <div class="card" style="position:relative; display:flex; align-items:center; gap:10px; height:52px; padding:0 14px">
    ${icon(MapPin, 20)}<span class="pixel" style="font-size:21px">Bogotá</span>
  </div>
</div>
<span class="abs cta" style="left:88px; top:432px; height:52px; font-size:18px">Conoce más en <b>aiyaiyai.io</b>${icon(ArrowRight, 18)}</span>

<div class="card blue stage" style="left:${liStage.left}px; top:${liStage.top}px; width:${liStage.w}px; height:${liStage.h}px">
  <div class="clip">${portraits(liPortraits)}</div>
</div>
<span class="abs tag" style="left:${liStage.left + 18}px; top:${liStage.top - 14}px; font-size:13px; z-index:7"><span class="dot-flag"></span>Speakers</span>
<div class="card names-strip" style="left:${liStage.left + 16}px; top:${liStage.top + liStage.h - 58}px; width:${liStage.w - 32}px; font-size:13px">
  ${speakers.map((speaker) => `<div><b>${speaker.name}</b><span>${speaker.role}</span></div>`).join("")}
</div>

<div class="abs foot" style="left:88px; top:540px; width:1048px; height:58px; padding-top:4px; gap:14px; font-size:13px">${sponsors(16)}</div>`;

// ── Instagram, 1080×1080 ────────────────────────────────────────────────────
const IG = { w: 1080, h: 1080 };
const igStage = { left: 72, top: 372, w: 936, h: 470 };
const igPortraits = [
  { left: 0, w: 344, h: 456, z: 1 },
  { left: 296, w: 344, h: 456, z: 3 },
  { left: 592, w: 344, h: 456, z: 2 },
];
const instagram = /* html */ `
<div class="stripe" style="height:8px"></div>
<div class="rails" style="background:
  var(--rail) 36px 0/1px 100% no-repeat, var(--rail) 71px 0/1px 100% no-repeat,
  var(--rail) 1008px 0/1px 100% no-repeat, var(--rail) 1043px 0/1px 100% no-repeat"></div>
<div class="field" style="-webkit-mask-image: radial-gradient(ellipse 55% 30% at 35% 18%, #000, transparent 80%)"></div>

<div class="abs brand pixel" style="left:72px; top:52px; font-size:20px">${pixelSvg(MARK, 24)}<span>${wordmark} <span class="kind">summit</span></span></div>
<span class="abs tag" style="right:72px; top:46px; font-size:16px"><span class="dot-flag"></span>Bogotá, Colombia</span>

<h1 class="abs pixel" style="left:68px; top:120px; font-size:104px"><span>${wordmark}</span><span>summit<span class="cursor"></span></span></h1>
<div class="card" style="right:72px; top:252px; width:214px; height:88px; padding:14px 16px; display:grid; align-content:center; gap:4px">
  <span class="pixel" style="font-size:30px; letter-spacing:-0.02em">19.11.2026</span>
  <span style="color:var(--muted); font-size:15px">Jueves 19 de noviembre</span>
</div>

<div class="card blue stage" style="left:${igStage.left}px; top:${igStage.top}px; width:${igStage.w}px; height:${igStage.h}px">
  <div class="clip">${portraits(igPortraits)}</div>
</div>
<span class="abs tag" style="left:${igStage.left + 22}px; top:${igStage.top - 17}px; font-size:15px; z-index:7"><span class="dot-flag"></span>Speakers</span>
${names(igPortraits.map((p) => igStage.left + p.left + p.w / 2), igStage.top + igStage.h - 84, 16, true)}

<p class="abs lead" style="left:72px; top:884px; width:420px; font-size:22px">IA, empresas y lo que viene. La próxima conversación empieza en Bogotá.</p>
<span class="abs cta" style="right:72px; top:886px; height:62px; font-size:21px">Conoce más en <b>aiyaiyai.io</b>${icon(ArrowRight, 20)}</span>

<div class="abs foot" style="left:72px; top:986px; width:936px; height:62px; padding-top:4px; gap:16px; font-size:15px">${sponsors(18)}</div>`;

// ── Portrait renderer (runs in the page) ────────────────────────────────────
// Crops every speaker so their faces share one size and height, tones the
// photo ink-on-paper with levels measured on the face, applies the person
// mask, then dissolves the body and the canvas edges into a pixel grid.
const script = /* js */ `
window.renderPortrait = async (id, speaker, opts) => {
  const canvas = document.getElementById(id);
  const W = canvas.clientWidth, H = canvas.clientHeight, dpr = window.devicePixelRatio;
  const load = (src) => new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = src; });
  const [img, msk] = await Promise.all([load(speaker.photo), load(speaker.mask)]);
  const f = speaker.face, k = (opts.faceH * H) / f.h;
  const sw = W / k, sh = H / k;
  const sx = f.x + f.w / 2 - sw / 2, sy = f.y + f.h / 2 - (opts.faceY * H) / k;
  const cw = Math.round(W * dpr), ch = Math.round(H * dpr);
  const read = (source) => {
    const c = document.createElement("canvas"); c.width = cw; c.height = ch;
    const x = c.getContext("2d"); x.imageSmoothingQuality = "high";
    x.drawImage(source, sx, sy, sw, sh, 0, 0, cw, ch);
    return x.getImageData(0, 0, cw, ch).data;
  };
  const rgb = read(img), mask = read(msk);
  const lum = new Float32Array(cw * ch), alpha = new Float32Array(cw * ch);
  for (let i = 0; i < cw * ch; i++) {
    lum[i] = (0.299 * rgb[i * 4] + 0.587 * rgb[i * 4 + 1] + 0.114 * rgb[i * 4 + 2]) / 255;
    alpha[i] = (mask[i * 4] / 255) * (rgb[i * 4 + 3] / 255);
  }
  // Levels from the face box.
  const fx0 = Math.round((W / 2 - (f.w * k) / 2) * dpr), fx1 = Math.round((W / 2 + (f.w * k) / 2) * dpr);
  const fy0 = Math.round((opts.faceY * H - (f.h * k) / 2) * dpr), fy1 = Math.round((opts.faceY * H + (f.h * k) / 2) * dpr);
  const face = [];
  for (let y = fy0; y < fy1; y += 2) for (let x = fx0; x < fx1; x += 2) face.push(lum[y * cw + x]);
  face.sort((a, b) => a - b);
  const lo = face[Math.floor(face.length * 0.02)] * 0.6, hi = Math.min(1, face[Math.floor(face.length * 0.985)] * 1.08);
  const SHADOW = [12, 17, 38], LIGHT = [244, 240, 229];
  const tone = (l) => {
    const t = Math.pow(Math.min(1, Math.max(0, (l - lo) / (hi - lo))), 1.05);
    return [0, 1, 2].map((c) => SHADOW[c] + (LIGHT[c] - SHADOW[c]) * t);
  };
  const out = new ImageData(cw, ch);
  const o = out.data;
  for (let i = 0; i < cw * ch; i++) {
    const [r, g, b] = tone(lum[i]);
    o[i * 4] = r; o[i * 4 + 1] = g; o[i * 4 + 2] = b; o[i * 4 + 3] = alpha[i] * 255;
  }
  // Dissolve into cells below opts.from and near the side edges.
  let seed = opts.seed;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const FLAG = [[252, 209, 22], [252, 209, 22], [252, 209, 22], [0, 56, 147], [0, 56, 147], [206, 17, 38]];
  const cell = Math.round(opts.cell * dpr);
  // The photo's own edges, in canvas pixels: a sleeve cut by the original
  // frame must dissolve like the canvas edge does.
  const left = Math.max(0, -sx * k * dpr), right = Math.min(cw, (img.naturalWidth - sx) * k * dpr);
  const bottom = Math.min(ch, (img.naturalHeight - sy) * k * dpr);
  for (let cy = 0; cy < ch; cy += cell) {
    for (let cx = 0; cx < cw; cx += cell) {
      const px = cx + cell / 2, py = cy + cell / 2;
      const yN = py / bottom;
      const down = Math.min(1, Math.max(0, (yN - opts.from) / (opts.to - opts.from)));
      const side = Math.min(1, Math.max(0, Math.min(px - left, right - px) / cw / 0.14));
      const base = (1 - down) * (0.3 + 0.7 * side);
      // Noise only where the dissolve has begun, so faces stay whole.
      const v = base + (random() - 0.5) * 0.5 * Math.min(1, (1 - base) * 5);
      if (v >= 0.92) continue;
      let sr = 0, sg = 0, sb = 0, sa = 0, n = 0;
      for (let y = cy; y < Math.min(ch, cy + cell); y++) for (let x = cx; x < Math.min(cw, cx + cell); x++) {
        const i = y * cw + x; const a = alpha[i]; const [r, g, b] = tone(lum[i]);
        sr += r * a; sg += g * a; sb += b * a; sa += a; n++;
      }
      const cover = sa / n;
      let color = sa > 0 ? [sr / sa, sg / sa, sb / sa] : [0, 0, 0];
      let a = 0, grid = false;
      if (cover > 0.45 && v >= 0.5) { a = 1; grid = true; if (random() < 0.02) color = FLAG[Math.floor(random() * FLAG.length)]; }
      else if (cover > 0.45 && v >= 0.4) { a = 0.18; }
      for (let y = cy; y < Math.min(ch, cy + cell); y++) for (let x = cx; x < Math.min(cw, cx + cell); x++) {
        const i = (y * cw + x) * 4;
        const edge = grid && (x - cx < dpr || y - cy < dpr);
        o[i] = edge ? color[0] * 0.82 : color[0]; o[i + 1] = edge ? color[1] * 0.82 : color[1]; o[i + 2] = edge ? color[2] * 0.82 : color[2];
        o[i + 3] = a * 255;
      }
    }
  }
  canvas.width = cw; canvas.height = ch;
  canvas.getContext("2d").putImageData(out, 0, 0);
};`;

const page = (body, size) => `<!doctype html><html lang="es"><head><meta charset="utf-8">
<style>${css} html, body { width: ${size.w}px; height: ${size.h}px; }</style></head>
<body>${body}<script>${script}</script></body></html>`;

const JOBS = [
  { out: "marketing/bogota-forward-linkedin.png", body: linkedin, size: LI,
    opts: { faceH: 0.23, faceY: 0.25, from: 0.62, to: 0.95, cell: 8 } },
  { out: "marketing/bogota-forward-instagram.png", body: instagram, size: IG,
    opts: { faceH: 0.24, faceY: 0.25, from: 0.62, to: 0.95, cell: 10 } },
];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
  await mkdir(new URL("marketing/", root), { recursive: true });
  for (const job of JOBS) {
    const tab = await browser.newPage();
    await tab.setViewport({ width: job.size.w, height: job.size.h, deviceScaleFactor: 2 });
    await tab.setContent(page(job.body, job.size), { waitUntil: "load" });
    await tab.evaluate(() => document.fonts.ready);
    for (const [i, speaker] of speakers.entries())
      await tab.evaluate(
        (id, s, opts) => window.renderPortrait(id, s, opts),
        `p${i}`,
        { photo: speaker.photo, mask: speaker.mask, face: speaker.face },
        { ...job.opts, seed: 1911 + i * 97 },
      );
    await writeFile(new URL(job.out, root), await tab.screenshot({ type: "png" }));
    console.log(`${job.out}: ${job.size.w * 2}×${job.size.h * 2}`);
  }
} finally {
  await browser.close();
}
