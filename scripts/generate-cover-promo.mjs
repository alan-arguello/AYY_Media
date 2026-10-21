// Generates marketing/bogota-forward-cover.png (1080×1080, rendered at 2×):
// a magazine-cover square. The masthead "bogota" sits behind the speakers,
// who appear in natural colour, cut out with Apple Vision person masks, and
// ".forward() summit" sits in front of them on the lower panel, so the three
// stand between the two halves of the name.
// Photos live in marketing/photos/ (git-ignored); masks are written with:
//   swift scripts/person-mask.swift marketing/photos/masks marketing/photos/<photo>.jpg
// Run with `npm run promo:cover`.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArrowRight } from "lucide-react";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const S = 2; // render scale
const OUT = "marketing/bogota-forward-cover.png";
const CHROME =
  process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const file = (path) => readFile(new URL(path, root));
const dataUrl = async (path, type) => `data:${type};base64,${(await file(path)).toString("base64")}`;
const icon = (Icon, size) => renderToStaticMarkup(h(Icon, { size, strokeWidth: 2.2, "aria-hidden": true }));

// Each speaker: photo, Vision face box (source px), the face height and face
// centre on the 1080 canvas, stacking order, and a colour correction that
// brings three different lights (studio, interior, stage) together.
const PEOPLE = [
  {
    id: "alan", name: "Alan Argüello", session: "Workshop · Cómo volverte un 10X Operator",
    photo: "marketing/photos/alan-arguello-fireside-crop.jpg", mask: "marketing/photos/masks/alan-arguello-fireside-crop.png",
    face: { x: 692, y: 543, w: 336, h: 336 }, faceH: 118, at: [196, 452], z: 1,
    // Drop the raised hand: beside Alex it reads as his. Source px, crop coords.
    clipX: 1330,
    // Stage light leaves a magenta cast: pull red and blue down against green.
    recomb: [[0.9, 0.08, 0.02], [0.0, 1.0, 0.0], [0.0, 0.08, 0.88]],
    filter: "saturate(0.96) contrast(1.05)",
  },
  {
    id: "alex", name: "Alexander Torrenegra", session: "Charla · Cómo predecir el futuro",
    photo: "marketing/photos/alex-torrenegra-studio.jpg", mask: "marketing/photos/masks/alex-torrenegra-studio.png",
    face: { x: 1220, y: 515, w: 856, h: 856 }, faceH: 166, at: [548, 474], z: 3,
    filter: "saturate(0.95) contrast(1.03)",
  },
  {
    id: "tania", name: "Tania Zapata", session: "Fireside chat · Reinventar tu compañía",
    photo: "marketing/photos/tania-zapata-editorial.jpg", mask: "marketing/photos/masks/tania-zapata-editorial.png",
    face: { x: 404, y: 178, w: 150, h: 150 }, faceH: 118, at: [884, 456], z: 2,
    filter: "saturate(0.95) contrast(1.04)",
  },
];

// Cut each photo out at the resolution the canvas needs (2×), mask as alpha.
async function cutout(p) {
  const src = sharp(await file(p.photo)).rotate();
  const { width, height } = await src.metadata();
  const scale = (p.faceH * S) / p.face.h;
  const w = Math.round(width * scale), hgt = Math.round(height * scale);
  let pipeline = sharp(await file(p.photo)).rotate().resize(w, hgt).removeAlpha();
  if (p.recomb) pipeline = pipeline.recomb(p.recomb);
  // Photos enlarged past their source resolution get a gentle sharpen.
  if (scale > 1) pipeline = pipeline.sharpen({ sigma: 0.8, m1: 0.6, m2: 1.4 });
  const rgb = await pipeline.raw().toBuffer();
  // Tighten the mask edge a little so light backgrounds don't leave a halo.
  const alpha = await sharp(await file(p.mask)).resize(w, hgt).greyscale().median(5)
    .linear(1.3, -0.3 * 255).raw().toBuffer();
  if (p.clipX) {
    const cx = Math.round(p.clipX * scale);
    for (let y = 0; y < hgt; y++) for (let x = cx; x < w; x++) alpha[y * w + x] = 0;
  }
  const png = await sharp(rgb, { raw: { width: w, height: hgt, channels: 3 } })
    .joinChannel(alpha, { raw: { width: w, height: hgt, channels: 1 } })
    .png()
    .toBuffer();
  // Position so the face centre lands on p.at (design px).
  const k = p.faceH / p.face.h;
  return {
    ...p,
    src: `data:image/png;base64,${png.toString("base64")}`,
    w: width * k, h: height * k,
    left: p.at[0] - (p.face.x + p.face.w / 2) * k,
    top: p.at[1] - (p.face.y + p.face.h / 2) * k,
  };
}

const fonts = "node_modules/geist/dist/fonts/";
const [sans, pixel, mono, field, aiyaiyai, people] = await Promise.all([
  dataUrl(`${fonts}geist-sans/Geist-Variable.woff2`, "font/woff2"),
  dataUrl(`${fonts}geist-pixel/GeistPixel-Square.woff2`, "font/woff2"),
  dataUrl(`${fonts}geist-mono/GeistMono-Variable.woff2`, "font/woff2"),
  dataUrl("public/images/pixel-field.svg", "image/svg+xml"),
  dataUrl("public/images/colombia-summit/aiyaiyai.png", "image/png"),
  Promise.all(PEOPLE.map(cutout)),
]);
const PANEL = 700; // top of the front panel, design px
const html = /* html */ `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
@font-face { font-family: Geist; src: url(${sans}) format("woff2"); font-weight: 100 900; }
@font-face { font-family: GeistPixel; src: url(${pixel}) format("woff2"); font-weight: 500; }
@font-face { font-family: GeistMono; src: url(${mono}) format("woff2"); font-weight: 100 900; }
:root { --bg: #fcfbf6; --ink: #0d0b01; --muted: #6d685a; --subtle: #9b9584; --line: #d8d2c1; --line2: #b5ae99;
  --blue: #003893; --yellow: #fcd116; --red: #ce1126;
  --flag: linear-gradient(var(--yellow) 0 50%, var(--blue) 50% 75%, var(--red) 75%);
  --flag-h: linear-gradient(90deg, var(--yellow) 0 50%, var(--blue) 50% 75%, var(--red) 75%); }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1080px; height: 1080px; }
body { position: relative; overflow: hidden; background: var(--bg); color: var(--ink);
  font: 400 20px/1.3 Geist, sans-serif; letter-spacing: -0.01em; -webkit-font-smoothing: antialiased; }
.abs { position: absolute; }
.pixel { font-family: GeistPixel, GeistMono, monospace; font-weight: 500; }
.mono { font-family: GeistMono, monospace; }
.field { position: absolute; inset: 0; background: url("${field}") 0 0 / 1200px auto;
  -webkit-mask-image: radial-gradient(ellipse 70% 45% at 50% 30%, #000, transparent 80%); }
.rail { position: absolute; top: 0; bottom: 0; width: 1px;
  background: repeating-linear-gradient(to bottom, var(--line) 0 5px, transparent 5px 10px); }
.flag { display: inline-block; width: 1.05em; height: 0.7em; background: var(--flag); box-shadow: 0 0 0 1px rgb(13 11 1 / 0.1); }
.tag { display: inline-flex; align-items: center; gap: 0.6em; padding: 0.35em 0.7em; border: 1px dashed var(--line2);
  background: var(--bg); color: var(--muted); white-space: nowrap; }
.dot { color: var(--subtle); } .fn { color: var(--blue); } .call { color: var(--red); }
.cursor { display: inline-block; width: 0.5em; height: 0.8em; margin-left: 0.08em; vertical-align: -0.04em;
  background: var(--yellow); box-shadow: inset 0 0 0 1px rgb(13 11 1 / 0.12); }
.person { position: absolute; display: block; }
.panel { position: absolute; left: 0; right: 0; top: ${PANEL}px; bottom: 0; z-index: 10; background: var(--bg);
  border-top: 1px dashed var(--line2); }
.panel::before, .panel::after { content: ""; position: absolute; top: -3px; width: 6px; height: 6px; background: var(--blue); }
.panel::before { left: 29px; } .panel::after { right: 29px; }
.name b { display: block; font-weight: 560; font-size: 21px; letter-spacing: -0.02em; white-space: nowrap; }
.name span { display: block; margin-top: 3px; font: 400 13.5px/1.3 GeistMono, monospace; color: var(--muted); white-space: nowrap; }
.cta { display: flex; align-items: center; height: 62px; padding: 0 20px; background: var(--blue); color: #fff; }
.cta b { font-weight: 400; color: var(--yellow); font-family: GeistMono, monospace; }
</style></head><body>
<div class="field"></div>
<div class="rail" style="left:30px"></div><div class="rail" style="left:1049px"></div>
<div class="abs" style="left:0; top:0; width:100%; height:8px; background:var(--flag-h)"></div>

<div class="abs" style="left:30px; right:30px; top:30px; display:flex; align-items:center; gap:14px; z-index:12">
  <span class="tag" style="font-size:15px"><span class="flag"></span>Próximamente · Bogotá, Colombia</span>
  <span style="margin-left:auto; display:flex; align-items:center; gap:10px; color:var(--muted); font-size:15px">Organiza
    <img src="${aiyaiyai}" style="height:22px; filter:brightness(0)" alt=""></span>
</div>

<!-- Masthead, behind the speakers -->
<div class="abs pixel" id="masthead" style="left:22px; top:54px; font-size:372px; line-height:1; letter-spacing:-0.045em; z-index:0">bogota</div>

${people.map((p) => `<img class="person" src="${p.src}" style="left:${p.left}px; top:${p.top}px; width:${p.w}px; height:${p.h}px; z-index:${p.z}; filter:${p.filter}" alt="">`).join("")}

<div class="panel">
  <div class="abs pixel" style="left:22px; top:4px; font-size:170px; line-height:1; letter-spacing:-0.045em; white-space:nowrap">
    <span class="dot">.</span><span class="fn">forward</span><span class="call">()</span></div>
  <div class="abs" style="right:30px; top:34px; text-align:right">
    <div class="pixel" style="font-size:62px; line-height:1; letter-spacing:-0.03em">summit<span class="cursor"></span></div>
    <div class="mono" style="margin-top:14px; font-size:16px; color:var(--muted)">IA · Empresas · Lo que viene</div>
  </div>
  ${people.map((p) => `<div class="abs name" style="left:${p.at[0]}px; top:${208}px; transform:translateX(-50%); text-align:center"><b>${p.name}</b><span>${p.session}</span></div>`).join("")}
  <div class="abs cta" style="left:30px; right:30px; top:286px">
    <span class="mono" style="font-size:17px">Jueves 19.11.2026 · 10 a. m. – 4 p. m. · Bogotá</span>
    <span style="margin-left:auto; display:flex; align-items:center; gap:10px; font-size:20px">Conoce más en <b>aiyaiyai.io</b>${icon(ArrowRight, 20)}</span>
  </div>
</div>
</body></html>`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: S });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  // Fit the masthead to the canvas between the rails.
  await page.evaluate(() => {
    const el = document.getElementById("masthead");
    const size = parseFloat(getComputedStyle(el).fontSize);
    el.style.fontSize = (size * 1028) / el.getBoundingClientRect().width + "px";
  });
  await mkdir(new URL("marketing/", root), { recursive: true });
  await writeFile(new URL(OUT, root), await page.screenshot({ type: "png" }));
  console.log(`${OUT}: ${1080 * S}×${1080 * S}`);
} finally {
  await browser.close();
}
