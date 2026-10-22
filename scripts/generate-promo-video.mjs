// Generates the promo animation in the site's design system, in two formats
// (1920×1080 for LinkedIn and YouTube, 1080×1920 for Reels, TikTok and
// Stories) and two variants: "agenda" walks through three sessions one by
// one; "lineup" shows the five speakers of the site together on one slide.
//   marketing/bogota-forward-summit[-lineup][-vertical].mp4
// Both share one timeline: the page draws every frame from a single render(t)
// function, so the result is deterministic; Chrome captures each frame and
// ffmpeg encodes H.264.
// Run with `npm run promo:video` (all four) or narrow it down, e.g.
// `npm run promo:video -- lineup vertical`.
// Needs Google Chrome (or CHROME_PATH) and ffmpeg.
// STILLS=1.2,5,9 STILLS_DIR=/tmp/x renders only those seconds as PNGs.
// MUSIC=track.mp3 MUSIC_START=233.052 BPM=132.5 lays a track under the video
// and retimes it to the music: scene cuts land on bar downbeats counted from
// MUSIC_START, entrances snap to eighth notes, and the cursor and the flag
// stripe pulse on the beat. Outputs get a "-music" suffix.
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArrowRight, Check } from "lucide-react";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const FPS = 30;
const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const file = (path) => readFile(new URL(path, root));
const dataUrl = async (path, type) =>
  `data:${type};base64,${(await file(path)).toString("base64")}`;
const icon = (Icon, size) =>
  renderToStaticMarkup(h(Icon, { size, strokeWidth: 2.2, "aria-hidden": true }));
const logo = (name) => dataUrl(`public/images/colombia-summit/${name}`, "image/png");

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

// The agenda as published on aiyaiyai.io. Face boxes come from Apple's
// Vision framework; masks from scripts/person-mask.swift.
const SESSIONS = [
  {
    index: "01",
    kind: "Charla",
    title: "Cómo predecir el futuro",
    name: "Alexander Torrenegra",
    role: "Cofundador de Torre.ai, Voice123 y Bunny Studio",
    photo: "public/images/speakers/alexander-torrenegra.webp",
    mask: "marketing/masks/alexander-torrenegra.png",
    face: { x: 315, y: 167, w: 195, h: 195 },
    logos: ["torre", "credential-shark-tank.png", "credential-endeavor.png"],
  },
  {
    index: "02",
    kind: "Fireside chat",
    title: "Reinventar tu compañía cuando es disrumpida",
    name: "Tania Zapata",
    role: "Cofundadora de Voice123 · Chairwoman de Bunny Inc.",
    photo: "public/images/speakers/tania-zapata.webp",
    mask: "marketing/masks/tania-zapata.png",
    face: { x: 361, y: 175, w: 248, h: 248 },
    logos: ["credential-bunnyinc.png", "credential-stanford.png", "credential-endeavor.png"],
  },
  {
    index: "03",
    kind: "Workshop",
    title: "Cómo volverte un 10X Operator",
    subtitle: "Así uso Claude y Codex para operar yo solo.",
    name: "Alan Argüello",
    role: "Ingeniero de software y emprendedor · Torrenegra & Co",
    photo: "public/images/speakers/alan-arguello-sf.webp",
    mask: "marketing/masks/alan-arguello-sf.png",
    face: { x: 343, y: 191, w: 230, h: 230 },
    logos: ["credential-georgia.png"],
  },
];

// The five speakers as listed on the site, for the lineup variant.
const LINEUP = [
  { ...SESSIONS[0], role: "Cofundador · Torre.ai" },
  { ...SESSIONS[1], role: "Cofundadora · Voice123" },
  { ...SESSIONS[2], role: "Torrenegra & Co" },
  {
    name: "Catalina Morales",
    role: "Head of Operations · Torre.ai",
    photo: "public/images/colombia-summit/catalina-morales.webp",
    mask: "marketing/masks/catalina-morales.png",
    face: { x: 87, y: 89, w: 131, h: 131 },
  },
  {
    name: "Juan Pablo Rodríguez",
    role: "Head of Marketing · Torre.ai",
    photo: "public/images/colombia-summit/juan-pablo-rodriguez.webp",
    mask: "marketing/masks/juan-pablo-rodriguez.png",
    face: { x: 192, y: 227, w: 184, h: 184 },
  },
];

const TIERS = [
  { name: "General", line: "Un día para abrir la perspectiva.", seats: "Acceso al summit", price: 349,
    perk: "Entrada al summit, bebidas y snacks", tone: "paper" },
  { name: "VIP", line: "La conversación sigue en la mesa.", seats: "10 personas · Sujeto a aceptación", price: 549,
    perk: "Cena privada con Alex Torrenegra y Tania Zapata", tone: "tint" },
  { name: "VIP Plus", line: "Una conversación enfocada en ti.", seats: "5 personas · Sujeto a aceptación", price: 1349,
    perk: "Sesión 1 a 1 de 45 min con Alexander Torrenegra", tone: "navy" },
];

const MARK = [".......r", "......k.", "......k.", ".....k..", "....k...", "..kk....", "kk......"];
const markSvg = (size) => {
  let rects = "";
  MARK.forEach((row, y) =>
    [...row].forEach((key, x) => {
      if (key !== ".") rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${key === "r" ? "#ce1126" : "#0d0b01"}"/>`;
    }),
  );
  return `<svg viewBox="0 0 8 7" width="${size}" height="${(size * 7) / 8}" shape-rendering="crispEdges">${rects}</svg>`;
};

const fonts = "node_modules/geist/dist/fonts/";
const [sans, pixel, mono, field, hero, aiyaiyai, torre, worder, torrenegraTsx] = await Promise.all([
  dataUrl(`${fonts}geist-sans/Geist-Variable.woff2`, "font/woff2"),
  dataUrl(`${fonts}geist-pixel/GeistPixel-Square.woff2`, "font/woff2"),
  dataUrl(`${fonts}geist-mono/GeistMono-Variable.woff2`, "font/woff2"),
  dataUrl("public/images/pixel-field.svg", "image/svg+xml"),
  dataUrl("public/images/photos/bogota-golden-hour.webp", "image/webp"),
  logo("aiyaiyai.png"),
  solidLogo("public/images/colombia-summit/credential-torre-ai.png"),
  logo("worder.png"),
  file("src/components/torrenegra-mark.tsx"),
]);
const torrenegra = `<svg viewBox="0 0 48 28.364" width="1.7em" height="1em"><path d="${
  torrenegraTsx.toString().match(/d="([^"]+)"/)[1]
}" fill="currentColor"/></svg>`;
// A median pass drops stray specks the person mask leaves behind.
const cleanMask = async (path) =>
  `data:image/png;base64,${(await sharp(await file(path)).median(17).png().toBuffer()).toString("base64")}`;
const lineup = await Promise.all(
  LINEUP.map(async ({ name, role, photo, mask, face }) => ({
    name, role, face, photo: await dataUrl(photo, "image/webp"), mask: await cleanMask(mask),
  })),
);
const sessions = await Promise.all(
  SESSIONS.map(async (s) => ({
    ...s,
    photo: await dataUrl(s.photo, "image/webp"),
    mask: await cleanMask(s.mask),
    logos: await Promise.all(s.logos.map((name) => (name === "torre" ? torre : logo(name)))),
  })),
);

const css = /* css */ `
@font-face { font-family: Geist; src: url(${sans}) format("woff2"); font-weight: 100 900; }
@font-face { font-family: GeistPixel; src: url(${pixel}) format("woff2"); font-weight: 500; }
@font-face { font-family: GeistMono; src: url(${mono}) format("woff2"); font-weight: 100 900; }
:root {
  --bg: #fcfbf6; --ink: #0d0b01; --muted: #6d685a; --subtle: #9b9584; --line: #d8d2c1; --line2: #b5ae99;
  --blue: #003893; --navy: #0a1f4d; --tint: #e2e8f5; --yellow: #fcd116; --red: #ce1126;
  --flag: linear-gradient(var(--yellow) 0 50%, var(--blue) 50% 75%, var(--red) 75%);
  --flag-h: linear-gradient(90deg, var(--yellow) 0 50%, var(--blue) 50% 75%, var(--red) 75%);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { position: relative; overflow: hidden; background: var(--bg); color: var(--ink);
  font: 400 24px/1.35 Geist, sans-serif; letter-spacing: -0.008em; -webkit-font-smoothing: antialiased; }
.abs { position: absolute; }
.pixel { font-family: GeistPixel, GeistMono, monospace; font-weight: 500; letter-spacing: -0.03em; }
.mono { font-family: GeistMono, monospace; }
.blue { color: var(--blue); } .muted { color: var(--muted); }
.obj { color: var(--ink); } .dot { color: var(--subtle); } .fn { color: var(--blue); } .call { color: var(--red); }
.cursor { display: inline-block; width: 0.5em; height: 0.8em; margin-left: 0.08em; vertical-align: -0.04em;
  background: var(--yellow); box-shadow: inset 0 0 0 1px rgb(13 11 1 / 0.12); }
.rail { position: absolute; top: 0; width: 1px; height: 100%; transform-origin: top;
  background: repeating-linear-gradient(to bottom, var(--line) 0 6px, transparent 6px 12px); }
.stripe { position: absolute; left: 0; top: 0; height: 8px; background: var(--flag-h); }
.field { position: absolute; inset: 0; background: url("${field}") 0 0 / 1440px auto; }
.scene { position: absolute; inset: 0; visibility: hidden; }
.flag { display: inline-block; width: 1.05em; height: 0.7em; flex-shrink: 0; background: var(--flag);
  box-shadow: 0 0 0 1px rgb(13 11 1 / 0.1); }
.tag { display: inline-flex; align-items: center; gap: 0.6em; padding: 0.35em 0.7em; border: 1px dashed var(--line2);
  background: var(--bg); color: var(--muted); white-space: nowrap; }
.card { position: absolute; border: 1px dashed var(--line2); background: var(--bg); }
.card::before, .card::after { content: ""; position: absolute; z-index: 5; width: 6px; height: 6px; background: var(--ink); }
.card::before { top: -3px; left: -3px; } .card::after { right: -3px; bottom: -3px; }
.card.accent { border-color: var(--blue); } .card.accent::before, .card.accent::after { background: var(--blue); }
.cta { display: inline-flex; align-items: center; gap: 0.6em; padding: 0 1.1em; background: var(--blue); color: #fff; white-space: nowrap; }
.cta b { font-weight: 400; color: var(--yellow); font-family: GeistMono, monospace; }
.header { left: 192px; top: 52px; width: 1536px; display: flex; align-items: center; gap: 14px; font-size: 26px; }
.header .right { margin-left: auto; font-size: 22px; }
.facts { display: flex; gap: 20px; }
.fact { position: relative; padding: 16px 20px; display: grid; gap: 4px; min-width: 250px; }
.fact strong { font: 500 34px/1.05 GeistPixel, monospace; letter-spacing: -0.02em; }
.fact span { color: var(--muted); font-size: 20px; }
.badge { display: grid; place-items: center; width: 76px; height: 76px; background: var(--blue); color: #fff;
  font: 500 36px/1 GeistPixel, monospace; }
.logos { display: flex; align-items: center; gap: 34px; }
.logos img { height: 34px; width: auto; filter: grayscale(1); opacity: 0.75; }
.tier { position: absolute; top: 400px; width: 496px; height: 470px; padding: 34px 34px 30px; display: flex; flex-direction: column; }
.tier.tint { background: var(--tint); border-color: var(--blue); }
.tier.navy { background: var(--navy); border: 1px solid var(--navy); color: #fff; }
.tier.navy::before, .tier.navy::after { background: var(--yellow); }
.tier h3 { font: 500 44px/1 GeistPixel, monospace; letter-spacing: -0.02em; }
.tier .line { margin-top: 10px; color: var(--muted); font-size: 22px; }
.tier.navy .line, .tier.navy .seats, .tier.navy .usd { color: rgb(255 255 255 / 0.7); }
.tier .seats { margin-top: 28px; font-size: 19px; color: var(--muted); }
.tier .price { margin-top: 14px; font: 500 92px/1 GeistPixel, monospace; letter-spacing: -0.04em; }
.tier .usd { font: 400 22px/1 Geist, sans-serif; color: var(--muted); margin-left: 8px; letter-spacing: 0; }
.tier .perk { margin-top: auto; padding-top: 20px; border-top: 1px dashed var(--line2); display: flex; gap: 10px;
  align-items: flex-start; font-size: 20px; line-height: 1.3; }
.tier.navy .perk { border-color: rgb(255 255 255 / 0.25); }
.tier .perk svg { flex-shrink: 0; margin-top: 2px; color: var(--blue); }
.tier.navy .perk svg { color: var(--yellow); }
.foot { display: flex; align-items: center; gap: 22px; color: var(--muted); font-size: 21px; white-space: nowrap; }
.foot img { display: block; filter: brightness(0); }
.foot .tn { display: inline-flex; align-items: center; gap: 0.45em; color: var(--ink); font-weight: 500; letter-spacing: -0.02em; }
#wipe { position: absolute; inset: 0; z-index: 50; }
.lineup canvas { position: absolute; }
.names { position: absolute; display: grid; border: 1px dashed var(--line2); background: var(--bg); }
.names::before, .names::after { content: ""; position: absolute; z-index: 5; width: 6px; height: 6px; background: var(--blue); }
.names::before { top: -3px; left: -3px; } .names::after { right: -3px; bottom: -3px; }
.names > div { padding: 14px 18px; display: grid; gap: 4px; white-space: nowrap; }
.names > div + div { border-left: 1px dashed var(--line); }
.names b { font-weight: 500; letter-spacing: -0.015em; }
.names span { color: var(--muted); font-size: 0.72em; }
`;

const wordmarkTarget = (id, size, extra = "") =>
  `<h1 id="${id}" class="abs pixel" style="font-size:${size}px; line-height:1.02; white-space:nowrap; ${extra}"></h1>`;

const horizontalBody = /* html */ `
<div id="field" class="field"></div>
<div class="rail" id="r0" style="left:96px"></div><div class="rail" id="r1" style="left:192px"></div>
<div class="rail" id="r2" style="left:1727px"></div><div class="rail" id="r3" style="left:1823px"></div>
<div class="stripe" id="stripe"></div>

<div class="abs header" id="header">
  ${markSvg(30)}<span class="pixel"><span class="obj">bogota</span><span class="dot">.</span><span class="fn">forward</span><span class="call">()</span> <span class="muted">summit</span></span>
  <span class="right mono muted">19.11.2026 · Bogotá, Colombia</span>
</div>
<div class="abs mono muted" id="url" style="right:192px; bottom:44px; font-size:22px">aiyaiyai.io</div>

<!-- 1 · Boot -->
<section class="scene" id="s1">
  <span class="abs tag" id="s1-tag" style="left:50%; top:262px; font-size:24px"><span class="flag"></span>Próximamente · Bogotá, Colombia</span>
  ${wordmarkTarget("s1-word", 196, "left:50%; top:330px; transform:translateX(-50%)")}
  <p class="abs muted" id="s1-lead" style="left:0; right:0; top:772px; text-align:center; font-size:38px">IA, empresas y lo que viene.</p>
</section>

<!-- 2 · The summit -->
<section class="scene" id="s2">
  <span class="abs tag" id="s2-tag" style="left:192px; top:196px; font-size:22px"><span class="flag"></span>El summit</span>
  <div class="abs pixel" style="left:188px; top:262px; font-size:124px; line-height:1.04">
    <div id="s2-l0">IA,</div><div id="s2-l1">empresas</div><div id="s2-l2" class="blue">y lo que viene.</div>
  </div>
  <p class="abs muted" id="s2-lead" style="left:192px; top:672px; width:760px; font-size:32px">La próxima conversación sobre IA y empresas empieza en Bogotá.</p>
  <div class="abs facts" style="left:192px; top:810px">
    <div class="card fact" id="s2-f0"><strong>19.11.2026</strong><span>Jueves</span></div>
    <div class="card fact" id="s2-f1"><strong>10 a. m. – 4 p. m.</strong><span>Hora de Bogotá</span></div>
    <div class="card fact" id="s2-f2"><strong>Bogotá</strong><span>Presencial</span></div>
  </div>
  <div class="card accent" id="s2-stage" style="left:1060px; top:196px; width:668px; height:728px">
    <canvas id="city" style="position:absolute; inset:0; width:100%; height:100%"></canvas>
  </div>
  <span class="abs tag" id="s2-t0" style="left:1032px; top:640px; font-size:22px; z-index:6"><span class="flag"></span>Bogotá, Colombia</span>
  <span class="abs tag mono" id="s2-t1" style="left:1560px; top:244px; font-size:21px; z-index:6; color:var(--ink)"><span class="flag"></span>19.11.2026</span>
</section>

<!-- 3 · Agenda -->
<section class="scene" id="s3">
  <div class="abs" style="left:192px; top:150px; display:flex; align-items:center; gap:18px" id="s3-head">
    <span class="tag" style="font-size:22px"><span class="flag"></span>La agenda</span>
    <span class="pixel" style="font-size:44px">Del futuro <span class="blue">a la acción.</span></span>
  </div>
  <canvas id="portrait" class="abs" style="left:150px; top:236px; width:720px; height:844px"></canvas>
  <div class="abs" id="s3-copy" style="left:930px; top:300px; width:800px">
    <div style="display:flex; align-items:center; gap:18px" id="s3-meta">
      <span class="badge" id="s3-index"></span><span class="tag" id="s3-kind" style="font-size:24px"></span>
    </div>
    <h2 class="pixel" id="s3-title" style="margin-top:34px; font-size:78px; line-height:1.04; min-height:162px"></h2>
    <p class="muted" id="s3-sub" style="margin-top:14px; font-size:30px; min-height:40px"></p>
    <div id="s3-person" style="margin-top:44px; padding-top:30px; border-top:1px dashed var(--line2)">
      <div id="s3-name" style="font-size:44px; font-weight:500; letter-spacing:-0.02em"></div>
      <div id="s3-role" class="muted" style="margin-top:6px; font-size:25px"></div>
      <div id="s3-logos" class="logos" style="margin-top:30px"></div>
    </div>
  </div>
  <div class="abs mono" id="s3-steps" style="right:192px; top:160px; display:flex; gap:10px; font-size:20px">
    <span>01</span><span>02</span><span>03</span>
  </div>
</section>

<!-- 4 · Tickets -->
<section class="scene" id="s4">
  <span class="abs tag" id="s4-tag" style="left:192px; top:170px; font-size:22px"><span class="flag"></span>Entradas</span>
  <h2 class="abs pixel" id="s4-title" style="left:190px; top:230px; font-size:92px; line-height:1">Tu lugar en <span class="blue">lo que viene.</span></h2>
  <span class="abs tag" id="s4-phase" style="right:192px; top:250px; font-size:22px; color:var(--ink); border-color:var(--blue)">
    <span class="mono blue">Fase 01</span> · Hasta el 24 de octubre</span>
  ${TIERS.map((tier, i) => `<div class="card tier ${tier.tone}" id="s4-c${i}" style="left:${192 + i * 520}px">
    <h3>${tier.name}</h3><div class="line">${tier.line}</div>
    <div class="seats">${tier.seats}</div>
    <div class="price"><span id="s4-p${i}">$0</span><span class="usd">USD</span></div>
    <div class="perk">${icon(Check, 22)}<span>${tier.perk}</span></div>
  </div>`).join("")}
  <p class="abs muted" id="s4-note" style="left:192px; top:912px; font-size:20px">Precios por persona en USD · Fase 01 hasta el 24 de octubre de 2026 · VIP y VIP Plus sujetos a aceptación</p>
</section>

<!-- 5 · Close -->
<section class="scene" id="s5">
  ${wordmarkTarget("s5-word", 176, "left:50%; top:214px; transform:translateX(-50%)")}
  <div class="abs mono" id="s5-facts" style="left:0; right:0; top:618px; text-align:center; font-size:32px">
    19.11.2026 <span class="muted">·</span> 10 a. m. a 4 p. m. <span class="muted">·</span> Bogotá, Colombia</div>
  <div class="abs" id="s5-cta" style="left:0; right:0; top:704px; display:flex; justify-content:center">
    <span class="cta" style="height:96px; font-size:40px">Conoce más en <b>aiyaiyai.io</b>${icon(ArrowRight, 38)}</span>
  </div>
  <div class="abs foot" id="s5-foot" style="left:192px; right:192px; top:930px; padding-top:28px; border-top:1px dashed var(--line2)">
    <span>Organiza</span><img src="${aiyaiyai}" style="height:30px" alt="">
    <span style="margin-left:auto">Con el apoyo de</span>
    <span class="tn">${torrenegra}Torrenegra &amp; Co</span>
    <img src="${torre}" style="height:27px; filter:none" alt="">
    <img src="${worder}" style="height:29px" alt="">
  </div>
</section>

<canvas id="wipe" width="1920" height="1080"></canvas>`;

// ── Vertical (1080×1920): same ids, recomposed for a tall screen. Key content
// stays between y≈240 and y≈1600, clear of Reels/TikTok captions and buttons.
const verticalCss = /* css */ `
.header { left: 96px; top: 150px; width: 888px; font-size: 24px; }
.header .right { font-size: 19px; }
.facts.v { width: 888px; gap: 14px; }
.facts.v .fact { flex: 1; min-width: 0; padding: 14px 16px; }
.facts.v .fact strong { font-size: 26px; }
.facts.v .fact span { font-size: 18px; }
.tier.v { width: 888px; height: 292px; padding: 24px 28px 22px; display: grid; grid-template-columns: 1fr auto;
  grid-template-rows: auto auto auto 1fr; column-gap: 20px; }
.tier.v h3 { grid-area: 1 / 1; font-size: 40px; }
.tier.v .line { grid-area: 2 / 1; margin-top: 8px; font-size: 21px; }
.tier.v .seats { grid-area: 3 / 1; margin-top: 12px; font-size: 18px; }
.tier.v .price { grid-area: 1 / 2 / 4 / 3; margin-top: 0; align-self: center; font-size: 82px; }
.tier.v .perk { grid-area: 4 / 1 / 5 / 3; align-self: end; font-size: 19px; padding-top: 16px; }
.foot.v { justify-content: center; }
`;

const verticalBody = /* html */ `
<div id="field" class="field"></div>
<div class="rail" id="r0" style="left:40px"></div><div class="rail" id="r1" style="left:80px"></div>
<div class="rail" id="r2" style="left:999px"></div><div class="rail" id="r3" style="left:1039px"></div>
<div class="stripe" id="stripe" style="height:10px"></div>

<div class="abs header" id="header">
  ${markSvg(28)}<span class="pixel"><span class="obj">bogota</span><span class="dot">.</span><span class="fn">forward</span><span class="call">()</span> <span class="muted">summit</span></span>
  <span class="right mono muted">19.11.2026</span>
</div>
<div class="abs mono muted" id="url" style="left:96px; top:1600px; font-size:22px">aiyaiyai.io</div>

<!-- 1 · Boot -->
<section class="scene" id="s1">
  <span class="abs tag" id="s1-tag" style="left:50%; top:556px; font-size:24px"><span class="flag"></span>Próximamente · Bogotá, Colombia</span>
  ${wordmarkTarget("s1-word", 168, "left:50%; top:636px; transform:translateX(-50%)")}
  <p class="abs muted" id="s1-lead" style="left:0; right:0; top:1214px; text-align:center; font-size:40px">IA, empresas y lo que viene.</p>
</section>

<!-- 2 · The summit -->
<section class="scene" id="s2">
  <span class="abs tag" id="s2-tag" style="left:96px; top:256px; font-size:22px"><span class="flag"></span>El summit</span>
  <div class="abs pixel" style="left:92px; top:318px; font-size:110px; line-height:1.04">
    <div id="s2-l0">IA,</div><div id="s2-l1">empresas</div><div id="s2-l2" class="blue">y lo que viene.</div>
  </div>
  <div class="card accent" id="s2-stage" style="left:96px; top:706px; width:888px; height:560px">
    <canvas id="city" style="position:absolute; inset:0; width:100%; height:100%"></canvas>
  </div>
  <span class="abs tag" id="s2-t0" style="left:70px; top:1196px; font-size:22px; z-index:6"><span class="flag"></span>Bogotá, Colombia</span>
  <span class="abs tag mono" id="s2-t1" style="left:826px; top:734px; font-size:21px; z-index:6; color:var(--ink)"><span class="flag"></span>19.11.2026</span>
  <div class="abs facts v" style="left:96px; top:1306px">
    <div class="card fact" id="s2-f0"><strong>19.11.2026</strong><span>Jueves</span></div>
    <div class="card fact" id="s2-f1"><strong>10 a. m. – 4 p. m.</strong><span>Hora de Bogotá</span></div>
    <div class="card fact" id="s2-f2"><strong>Bogotá</strong><span>Presencial</span></div>
  </div>
  <p class="abs muted" id="s2-lead" style="left:96px; top:1450px; width:888px; font-size:30px">La próxima conversación sobre IA y empresas empieza en Bogotá.</p>
</section>

<!-- 3 · Agenda -->
<section class="scene" id="s3">
  <div class="abs" style="left:96px; top:252px; display:flex; align-items:center; gap:16px" id="s3-head">
    <span class="tag" style="font-size:21px"><span class="flag"></span>La agenda</span>
    <span class="pixel" style="font-size:38px">Del futuro <span class="blue">a la acción.</span></span>
  </div>
  <div class="abs mono" id="s3-steps" style="right:96px; top:260px; display:flex; gap:8px; font-size:19px">
    <span>01</span><span>02</span><span>03</span>
  </div>
  <canvas id="portrait" class="abs" style="left:190px; top:318px; width:700px; height:820px"></canvas>
  <div class="abs" id="s3-copy" style="left:96px; top:1112px; width:888px">
    <div style="display:flex; align-items:center; gap:16px" id="s3-meta">
      <span class="badge" id="s3-index" style="width:68px; height:68px; font-size:32px"></span><span class="tag" id="s3-kind" style="font-size:22px"></span>
    </div>
    <h2 class="pixel" id="s3-title" style="margin-top:22px; font-size:62px; line-height:1.05; min-height:130px"></h2>
    <p class="muted" id="s3-sub" style="margin-top:8px; font-size:26px; min-height:34px"></p>
    <div id="s3-person" style="margin-top:20px; padding-top:20px; border-top:1px dashed var(--line2)">
      <div id="s3-name" style="font-size:38px; font-weight:500; letter-spacing:-0.02em"></div>
      <div id="s3-role" class="muted" style="margin-top:4px; font-size:21px"></div>
      <div id="s3-logos" class="logos" style="margin-top:20px"></div>
    </div>
  </div>
</section>

<!-- 4 · Tickets -->
<section class="scene" id="s4">
  <span class="abs tag" id="s4-tag" style="left:96px; top:252px; font-size:22px"><span class="flag"></span>Entradas</span>
  <h2 class="abs pixel" id="s4-title" style="left:94px; top:312px; font-size:86px; line-height:1.02">Tu lugar en<br><span class="blue">lo que viene.</span></h2>
  <span class="abs tag" id="s4-phase" style="left:96px; top:508px; font-size:21px; color:var(--ink); border-color:var(--blue)">
    <span class="mono blue">Fase 01</span> · Hasta el 24 de octubre</span>
  ${TIERS.map((tier, i) => `<div class="card tier v ${tier.tone}" id="s4-c${i}" style="left:96px; top:${578 + i * 312}px">
    <h3>${tier.name}</h3><div class="line">${tier.line}</div>
    <div class="seats">${tier.seats}</div>
    <div class="price"><span id="s4-p${i}">$0</span><span class="usd">USD</span></div>
    <div class="perk">${icon(Check, 21)}<span>${tier.perk}</span></div>
  </div>`).join("")}
  <p class="abs muted" id="s4-note" style="left:96px; top:1524px; width:888px; font-size:19px">Precios por persona en USD · Fase 01 hasta el 24 de octubre de 2026 · VIP y VIP Plus sujetos a aceptación</p>
</section>

<!-- 5 · Close -->
<section class="scene" id="s5">
  ${wordmarkTarget("s5-word", 150, "left:50%; top:420px; transform:translateX(-50%)")}
  <div class="abs mono" id="s5-facts" style="left:0; right:0; top:930px; text-align:center; font-size:34px; line-height:1.5">
    19.11.2026<br>10 a. m. a 4 p. m.<br>Bogotá, Colombia</div>
  <div class="abs" id="s5-cta" style="left:0; right:0; top:1126px; display:flex; justify-content:center">
    <span class="cta" style="height:90px; font-size:35px">Conoce más en <b>aiyaiyai.io</b>${icon(ArrowRight, 34)}</span>
  </div>
  <div class="abs" id="s5-foot" style="left:96px; right:96px; top:1290px; padding-top:30px; border-top:1px dashed var(--line2); display:grid; gap:24px">
    <div class="foot v"><span>Organiza</span><img src="${aiyaiyai}" style="height:30px" alt=""></div>
    <div class="foot v"><span>Con el apoyo de</span>
      <span class="tn">${torrenegra}Torrenegra &amp; Co</span>
      <img src="${torre}" style="height:26px; filter:none" alt="">
      <img src="${worder}" style="height:28px" alt=""></div>
  </div>
</section>

<canvas id="wipe" width="1080" height="1920"></canvas>`;

// ── Lineup variant: the five speakers on one slide ──────────────────────────
const nameStrip = (people, style) => `<div class="names" style="grid-template-columns:repeat(${people.length}, 1fr); ${style}">
  ${people.map((p) => `<div><b>${p.name}</b><span>${p.role}</span></div>`).join("")}</div>`;
const lineupScene = {
  horizontal: /* html */ `
<section class="scene lineup" id="s3">
  <div class="abs" id="s3-head" style="left:192px; top:150px; display:flex; align-items:center; gap:18px">
    <span class="tag" style="font-size:22px"><span class="flag"></span>Speakers</span>
    <span class="pixel" style="font-size:52px">Las primeras <span class="blue">voces.</span></span>
  </div>
  ${LINEUP.map((_, i) => `<canvas id="lp${i}" style="left:${192 + i * 274}px; top:236px; width:440px; height:620px; z-index:${[1, 2, 3, 2, 1][i]}"></canvas>`).join("")}
  ${nameStrip(LINEUP, "left:192px; top:832px; width:1536px; font-size:23px; z-index:6")}
  <span class="abs tag" id="s3-more" style="left:192px; top:952px; font-size:22px"><span class="flag"></span>Y esto apenas empieza · Más sesiones y nombres, muy pronto.</span>
</section>`,
  vertical: /* html */ `
<section class="scene lineup" id="s3">
  <div class="abs" id="s3-head" style="left:96px; top:252px; display:flex; align-items:center; gap:16px">
    <span class="tag" style="font-size:21px"><span class="flag"></span>Speakers</span>
    <span class="pixel" style="font-size:44px">Las primeras <span class="blue">voces.</span></span>
  </div>
  ${LINEUP.slice(0, 3).map((_, i) => `<canvas id="lp${i}" style="left:${96 + i * 264}px; top:316px; width:360px; height:500px; z-index:${[1, 3, 2][i]}"></canvas>`).join("")}
  ${nameStrip(LINEUP.slice(0, 3), "left:96px; top:808px; width:888px; font-size:20px; z-index:6")}
  ${LINEUP.slice(3).map((_, i) => `<canvas id="lp${i + 3}" style="left:${228 + i * 264}px; top:900px; width:360px; height:500px; z-index:${i + 1}"></canvas>`).join("")}
  ${nameStrip(LINEUP.slice(3), "left:228px; top:1226px; width:624px; font-size:20px; z-index:6")}
  <span class="abs tag" id="s3-more" data-dx="-50%" style="left:50%; top:1346px; font-size:21px"><span class="flag"></span>Y esto apenas empieza.</span>
</section>`,
};
const withLineup = (body, name) =>
  body.slice(0, body.indexOf("<!-- 3 · Agenda -->")) + lineupScene[name] + "\n\n" + body.slice(body.indexOf("<!-- 4 · Tickets -->"));

// ── Timeline and drawing, evaluated in the page ─────────────────────────────
const scriptFor = (cfg) => /* js */ `
const W = ${cfg.w}, H = ${cfg.h};
const CITY_W = ${cfg.city[0]}, CITY_H = ${cfg.city[1]};
const WORD = ${JSON.stringify(cfg.word)};
const WIPE_DOWN = ${cfg.w < cfg.h};
const SESSIONS = ${JSON.stringify(sessions.map((s) => Object.fromEntries(Object.entries(s).filter(([key]) => key !== "photo" && key !== "mask"))))};
const TIERS = ${JSON.stringify(TIERS)};
const $ = (id) => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const out3 = (x) => 1 - Math.pow(1 - x, 3);
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const stepped = (x, n) => Math.round(x * n) / n; // pixel-like motion
const show = (el, o, dy = 0, dx = "0px") => { el.style.opacity = o; el.style.translate = dx + " " + dy + "px"; };
const BEAT = ${cfg.beat};
// With music, entrances snap to the eighth-note grid and the cursor blinks on the beat.
const snap = (at) => (BEAT ? Math.round(at / (BEAT / 2)) * (BEAT / 2) : at);
const pop = (el, t, at, dist = 28, dx = "0px") => { at = snap(at); const p = prog(t, at, at + 0.45); show(el, p > 0 ? 1 : 0, stepped(1 - out3(p), 4) * dist, dx); };
const blink = (t) => (BEAT ? Math.floor(t / BEAT) % 2 === 0 : Math.floor(t * 2.4) % 2 === 0);
const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Typing across coloured segments and lines, with the yellow cursor after the
// last typed character.
function typeWord(el, t, start, perChar, cursorOn = true) {
  const typed = Math.max(0, Math.floor((t - start) / perChar));
  const lengths = WORD.map((line) => line.reduce((n, [text]) => n + text.length, 0));
  const total = lengths.reduce((a, b) => a + b, 0);
  let acc = 0, cursorLine = WORD.length - 1;
  for (let i = 0; i < lengths.length; i++) { acc += lengths[i]; if (typed < acc) { cursorLine = i; break; } }
  const cursor = '<span class="cursor"' + (cursorOn && (typed < total || blink(t)) ? "" : ' style="opacity:0"') + "></span>";
  let budget = typed;
  el.innerHTML = WORD.map((line, i) => '<span style="display:block">' + line.map(([text, cls]) => {
    const take = text.slice(0, Math.max(0, budget)); budget -= text.length;
    return take ? '<span class="' + cls + '">' + take + "</span>" : "";
  }).join("") + (i === cursorLine ? cursor : "") + "</span>").join("");
}
function typeText(el, text, t, start, cps) {
  const n = Math.max(0, Math.floor((t - start) * cps));
  el.textContent = text.slice(0, n);
}

// ── Pixel wipe between scenes ──
const WIPES = [${cfg.timeline.summit}, ${cfg.timeline.speakers}, ${cfg.timeline.tickets}, ${cfg.timeline.close}];
const wipe = $("wipe").getContext("2d");
const CELL = 60, COLS = Math.ceil(W / CELL), ROWS = Math.ceil(H / CELL);
const wipeCells = (() => { const r = seeded(77); return Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = i % COLS, row = Math.floor(i / COLS), k = r();
  return { c, r: row, d: (WIPE_DOWN ? row / ROWS : c / COLS) * 0.62 + r() * 0.38,
    color: k < 0.82 ? "#003893" : k < 0.92 ? "#fcd116" : k < 0.96 ? "#ce1126" : "#0d0b01" }; }); })();
function drawWipe(t) {
  wipe.clearRect(0, 0, W, H);
  for (const mid of WIPES) {
    const u = (t - (mid - 0.32)) / 0.32; // 0..1 in, 1..2 out
    if (u <= 0 || u >= 2) continue;
    for (const cell of wipeCells) {
      const on = u < 1 ? u > cell.d : u - 1 < cell.d;
      if (!on) continue;
      wipe.fillStyle = cell.color;
      wipe.fillRect(cell.c * CELL, cell.r * CELL, CELL, CELL);
    }
  }
}

// ── Bogotá photo assembling into place (the site's PixelPhoto) ──
const city = { ready: false };
async function prepareCity(src) {
  const canvas = $("city"); const w = CITY_W, h = CITY_H, cell = 19;
  canvas.width = w; canvas.height = h;
  const img = new Image(); img.src = src; await img.decode();
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale, sh = h / scale, sx = (img.naturalWidth - sw) * 0.3, sy = (img.naturalHeight - sh) * 0.5;
  const base = document.createElement("canvas"); base.width = w; base.height = h;
  const b = base.getContext("2d"); b.imageSmoothingQuality = "high"; b.filter = "saturate(1.05) brightness(1.05)";
  b.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
  const s = document.createElement("canvas"); s.width = cols; s.height = rows;
  const sc = s.getContext("2d"); sc.imageSmoothingQuality = "high"; sc.filter = b.filter;
  sc.drawImage(img, sx, sy, sw, sh, 0, 0, w / cell, h / cell);
  const colors = sc.getImageData(0, 0, cols, rows).data;
  const r = seeded(1911);
  Object.assign(city, { ready: true, ctx: canvas.getContext("2d"), base, cell, cols, rows, colors,
    noise: Float32Array.from({ length: cols * rows }, () => r()) });
}
function drawCity(p, t) {
  const { ctx, base, cell, cols, rows, colors, noise } = city;
  ctx.clearRect(0, 0, CITY_W, CITY_H);
  ctx.drawImage(base, 0, 0);
  const lift = (1 - p) * 1.6, tick = Math.floor(t * 7);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c, o = i * 4;
    const lum = (0.299 * colors[o] + 0.587 * colors[o + 1] + 0.114 * colors[o + 2]) / 255;
    const flick = p >= 1 && ((i * 7919 + tick * 104729) % 97) < 2 ? 0.22 : 0;
    const v = (r + 0.5) / rows / 0.46 + (0.45 - lum) * 0.35 + (noise[i] - 0.5) * 0.45 - lift - flick;
    if (v >= 1) continue;
    const x = c * cell, y = r * cell, rgb = colors[o] + "," + colors[o + 1] + "," + colors[o + 2];
    if (v >= 0.45) {
      ctx.fillStyle = "rgb(" + rgb + ")"; ctx.fillRect(x, y, cell, cell);
      ctx.strokeStyle = "rgba(13,11,1,0.16)"; ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
      continue;
    }
    ctx.fillStyle = "#fcfbf6"; ctx.fillRect(x, y, cell, cell);
    if (v >= 0.3) { ctx.fillStyle = "rgba(" + rgb + ",0.3)"; ctx.fillRect(x + 1, y + 1, cell - 1, cell - 1); }
    else if (v >= 0.16) { ctx.strokeStyle = "#d8d2c1"; ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1); }
  }
}

// ── Speaker cut-outs: ink-navy duotone, masked, built from pixels ──
const PCELL = 14;
async function preparePortrait(session, PW, PH, seed) {
  const load = async (src) => { const i = new Image(); i.src = src; await i.decode(); return i; };
  const [img, msk] = await Promise.all([load(session.photo), load(session.mask)]);
  const f = session.face, k = (0.23 * PH) / f.h;
  const sw = PW / k, sh = PH / k, sx = f.x + f.w / 2 - sw / 2, sy = f.y + f.h / 2 - (0.24 * PH) / k;
  const read = (source) => { const c = document.createElement("canvas"); c.width = PW; c.height = PH;
    const x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(source, sx, sy, sw, sh, 0, 0, PW, PH);
    return x.getImageData(0, 0, PW, PH).data; };
  const rgb = read(img), mask = read(msk);
  const n = PW * PH, lum = new Float32Array(n), alpha = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    lum[i] = (0.299 * rgb[i * 4] + 0.587 * rgb[i * 4 + 1] + 0.114 * rgb[i * 4 + 2]) / 255;
    alpha[i] = (mask[i * 4] / 255) * (rgb[i * 4 + 3] / 255);
  }
  const fx0 = Math.round(PW / 2 - (f.w * k) / 2), fy0 = Math.round(0.24 * PH - (f.h * k) / 2), fs = Math.round(f.w * k);
  const face = []; for (let y = fy0; y < fy0 + fs; y += 2) for (let x = fx0; x < fx0 + fs; x += 2) face.push(lum[y * PW + x]);
  face.sort((a, b) => a - b);
  const lo = face[Math.floor(face.length * 0.02)] * 0.6, hi = Math.min(1, face[Math.floor(face.length * 0.985)] * 1.08);
  const SH = [12, 17, 38], LI = [244, 240, 229];
  const photo = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) {
    const t = Math.pow(clamp((lum[i] - lo) / (hi - lo)), 1.05);
    photo[i * 4] = SH[0] + (LI[0] - SH[0]) * t; photo[i * 4 + 1] = SH[1] + (LI[1] - SH[1]) * t;
    photo[i * 4 + 2] = SH[2] + (LI[2] - SH[2]) * t; photo[i * 4 + 3] = alpha[i] * 255;
  }
  const right = Math.min(PW, (img.naturalWidth - sx) * k), left = Math.max(0, -sx * k), bottom = Math.min(PH, (img.naturalHeight - sy) * k);
  const r = seeded(seed);
  const FLAG = [[252, 209, 22], [252, 209, 22], [0, 56, 147], [0, 56, 147], [206, 17, 38]];
  const cells = [];
  for (let cy = 0; cy < PH; cy += PCELL) for (let cx = 0; cx < PW; cx += PCELL) {
    let sr = 0, sg = 0, sb = 0, sa = 0, cnt = 0;
    for (let y = cy; y < Math.min(PH, cy + PCELL); y++) for (let x = cx; x < Math.min(PW, cx + PCELL); x++) {
      const i = (y * PW + x) * 4, a = photo[i + 3] / 255;
      sr += photo[i] * a; sg += photo[i + 1] * a; sb += photo[i + 2] * a; sa += a; cnt++;
    }
    const cover = sa / cnt; if (cover < 0.02) continue;
    const px = cx + PCELL / 2, py = cy + PCELL / 2;
    const down = clamp((py / bottom - 0.66) / 0.3);
    const side = clamp(Math.min(px - left, right - px) / PW / 0.14);
    const base = (1 - down) * (0.3 + 0.7 * side);
    const noise = (r() - 0.5) * 0.5 * Math.min(1, (1 - base) * 5);
    cells.push({ cx, cy, cover, base, noise, build: (py / PH) * 0.9 + r() * 0.35,
      color: r() < 0.025 ? FLAG[Math.floor(r() * FLAG.length)] : [sr / sa, sg / sa, sb / sa] });
  }
  return { photo, cells, w: PW, h: PH };
}
function drawPortrait(canvas, portrait, p) {
  const { photo, cells, w: PW, h: PH } = portrait;
  if (canvas.width !== PW) { canvas.width = PW; canvas.height = PH; }
  const ctx = canvas.getContext("2d"); ctx.clearRect(0, 0, PW, PH);
  if (p <= 0) return;
  const outImg = ctx.createImageData(PW, PH), o = outImg.data;
  for (const cell of cells) {
    // Building: cells arrive top-down as flat pixels, then resolve to photo.
    const arrive = clamp((p * 1.5 - cell.build) / 0.25);
    if (arrive <= 0) continue;
    const settled = clamp((p - 0.62) / 0.38);
    const v = cell.base + cell.noise;
    const solid = v >= 0.92 && settled > 0 && (cell.build * 0.6 < settled);
    const mode = solid ? 2 : cell.cover > 0.45 && v >= 0.5 ? 1 : cell.cover > 0.45 && v >= 0.4 ? 0.2 : (v >= 0.92 ? 1 : 0);
    if (mode === 0) continue;
    for (let y = cell.cy; y < Math.min(PH, cell.cy + PCELL); y++) for (let x = cell.cx; x < Math.min(PW, cell.cx + PCELL); x++) {
      const i = (y * PW + x) * 4;
      if (mode === 2) { o[i] = photo[i]; o[i + 1] = photo[i + 1]; o[i + 2] = photo[i + 2]; o[i + 3] = photo[i + 3]; continue; }
      const k = x === cell.cx || y === cell.cy ? 0.82 : 1;
      o[i] = cell.color[0] * k; o[i + 1] = cell.color[1] * k; o[i + 2] = cell.color[2] * k;
      o[i + 3] = (mode === 1 ? 255 : 46) * arrive * (cell.cover > 0.45 ? 1 : cell.cover * 2);
    }
  }
  ctx.putImageData(outImg, 0, 0);
}
const portraits = [], lineupPortraits = [];

// ── The timeline (scene starts come from the variant) ──
const T = ${JSON.stringify(cfg.timeline)};
const VARIANT = "${cfg.variant}";
const SCENES = [["s1", 0, T.summit], ["s2", T.summit, T.speakers], ["s3", T.speakers, T.tickets],
  ["s4", T.tickets, T.close], ["s5", T.close, 999]];
const slotLength = (T.tickets - T.speakers) / 3;
const SLOTS = [0, 1, 2].map((i) => [T.speakers + i * slotLength, T.speakers + (i + 1) * slotLength]);
let lastSlot = -1;
window.render = (t) => {
  for (const [id, a, b] of SCENES) $(id).style.visibility = t >= a && t < b ? "visible" : "hidden";
  ["r0", "r1", "r2", "r3"].forEach((id, i) => ($(id).style.transform = "scaleY(" + out3(prog(t, i * 0.08, 0.9 + i * 0.08)) + ")"));
  $("stripe").style.width = 100 * out3(prog(t, 0.1, 0.9)) + "%";
  if (BEAT) {
    // The flag stripe kicks on every beat, harder on the downbeat.
    const ph = (t / BEAT) % 1, down = Math.floor(t / BEAT + 1e-6) % 4 === 0;
    $("stripe").style.height = Math.round(STRIPE * (1 + (down ? 1.4 : 0.7) * Math.exp(-ph * 6))) + "px";
  }
  $("field").style.opacity = 0.9 * prog(t, 0.4, 1.6);
  const chrome = t >= T.summit && t < T.close;
  $("header").style.opacity = chrome ? 1 : 0; $("url").style.opacity = chrome ? 1 : 0;

  // 1 · Boot
  if (t < T.summit) {
    typeWord($("s1-word"), t, BEAT ? BEAT : 0.55, BEAT ? BEAT / 6 : 0.075);
    pop($("s1-tag"), t, 2.35, 18, "-50%");
    pop($("s1-lead"), t, 2.6, 18);
  }
  // 2 · The summit
  if (t >= T.summit && t < T.speakers) {
    const a = T.summit;
    pop($("s2-tag"), t, a + 0.1); ["s2-l0", "s2-l1", "s2-l2"].forEach((id, i) => pop($(id), t, a + 0.2 + i * 0.22, 40));
    pop($("s2-lead"), t, a + 1.05); ["s2-f0", "s2-f1", "s2-f2"].forEach((id, i) => pop($(id), t, a + 1.4 + i * 0.15));
    pop($("s2-stage"), t, a + 0.15, 0);
    if (city.ready) drawCity(out3(prog(t, a + 0.35, a + 2.7)), t);
    pop($("s2-t0"), t, a + 2.3, 16); pop($("s2-t1"), t, a + 2.5, 16);
  }
  // 3 · Speakers: one session at a time, or the whole lineup at once
  if (t >= T.speakers && t < T.tickets && VARIANT === "agenda") {
    pop($("s3-head"), t, T.speakers + 0.1, 16);
    const slot = SLOTS.findIndex(([a, b]) => t >= a && t < b);
    const [a, b] = SLOTS[slot]; const s = SESSIONS[slot];
    if (slot !== lastSlot) {
      $("s3-index").textContent = s.index; $("s3-kind").innerHTML = '<span class="flag"></span>' + s.kind;
      $("s3-name").textContent = s.name; $("s3-role").textContent = s.role;
      $("s3-logos").innerHTML = s.logos.map((src) => '<img src="' + src + '" alt="">').join("");
      [...$("s3-steps").children].forEach((el, i) => { el.style.cssText = i === slot
        ? "padding:6px 10px; background:#003893; color:#fff" : "padding:6px 10px; border:1px dashed #b5ae99; color:#9b9584"; });
      lastSlot = slot;
    }
    const leave = slot < 2 ? prog(t, b - 0.32, b) : 0;
    drawPortrait($("portrait"), portraits[slot], out3(prog(t, a + 0.05, a + 1.35)) * (1 - leave));
    pop($("s3-meta"), t, a + 0.1, 20);
    typeText($("s3-title"), s.title, t, a + 0.3, 34);
    typeText($("s3-sub"), s.subtitle || "", t, a + 1.0, 60);
    pop($("s3-person"), t, a + 0.75, 24);
    $("s3-copy").style.opacity = 1 - leave;
  }
  if (t >= T.speakers && t < T.tickets && VARIANT === "lineup") {
    const a = T.speakers;
    pop($("s3-head"), t, a + 0.1, 20);
    // A left-to-right wave: each cut-out builds a beat after the previous one.
    lineupPortraits.forEach((portrait, i) => { const s0 = BEAT ? a + i * (BEAT / 2) : a + 0.25 + i * 0.16;
      drawPortrait($("lp" + i), portrait, out3(prog(t, s0, s0 + 1.5))); });
    document.querySelectorAll(".names").forEach((el, row) => pop(el, t, a + 1.5 + row * 0.15, 22));
    pop($("s3-more"), t, a + 2.3, 14, $("s3-more").dataset.dx || "0px");
  }
  // 4 · Tickets
  if (t >= T.tickets && t < T.close) {
    const a = T.tickets;
    pop($("s4-tag"), t, a + 0.05); pop($("s4-title"), t, a + 0.15, 36); pop($("s4-phase"), t, a + 0.45, 16);
    TIERS.forEach((tier, i) => {
      pop($("s4-c" + i), t, a + 0.5 + i * 0.16, 70);
      const n = Math.round(tier.price * out3(prog(t, a + 0.8 + i * 0.16, a + 1.6 + i * 0.16)));
      $("s4-p" + i).textContent = "$" + n.toLocaleString("en-US");
    });
    pop($("s4-note"), t, a + 1.7, 12);
  }
  // 5 · Close
  if (t >= T.close) {
    const a = T.close;
    typeWord($("s5-word"), t, a + 0.12, 0.04);
    pop($("s5-facts"), t, a + 1.05, 18); pop($("s5-cta"), t, a + 1.3, 26); pop($("s5-foot"), t, a + 1.65, 14);
  }
  drawWipe(t);
};
const STRIPE = $("stripe").offsetHeight;
window.prepare = async (heroSrc, photos) => {
  // Fix the typed wordmarks at their final, centred position so typing
  // never shifts them.
  for (const id of ["s1-word", "s5-word"]) {
    const el = $(id); typeWord(el, 1e3, 0, 1);
    el.style.transform = "none"; el.style.left = Math.round((W - el.offsetWidth) / 2) + "px";
  }
  await prepareCity(heroSrc);
  if (VARIANT === "agenda")
    for (const [i, p] of photos.entries()) portraits.push(await preparePortrait(p, ${cfg.portrait[0]}, ${cfg.portrait[1]}, 4242 + i * 97));
  else
    for (const [i, p] of photos.entries()) lineupPortraits.push(await preparePortrait(p, ${cfg.lineupSize[0]}, ${cfg.lineupSize[1]}, 4242 + i * 97));
};`;

const MUSIC = process.env.MUSIC
  ? { path: process.env.MUSIC, start: Number(process.env.MUSIC_START || 0), bpm: Number(process.env.BPM || 120) }
  : null;
const bars = (n) => Number(((n * 240) / MUSIC.bpm).toFixed(4));

const FORMATS = {
  horizontal: { w: 1920, h: 1080, body: horizontalBody, city: [668, 728], portrait: [720, 844], lineupSize: [440, 620],
    word: [[["bogota", "obj"], [".", "dot"], ["forward", "fn"], ["()", "call"]], [["summit", "obj"]]] },
  vertical: { w: 1080, h: 1920, body: verticalBody, city: [888, 560], portrait: [700, 820], lineupSize: [360, 500],
    word: [[["bogota", "obj"]], [[".", "dot"], ["forward", "fn"], ["()", "call"]], [["summit", "obj"]]] },
};
// Scene starts in seconds; the lineup slide is shorter than three sessions.
// With music, scenes are counted in bars from MUSIC_START.
const TIMELINES = MUSIC
  ? {
      agenda: { summit: bars(2), speakers: bars(4), tickets: bars(10), close: bars(12), end: bars(15) },
      lineup: { summit: bars(2), speakers: bars(4), tickets: bars(7), close: bars(9), end: bars(12) },
    }
  : {
      agenda: { summit: 3.9, speakers: 8.2, tickets: 16.5, close: 20.5, end: 25.5 },
      lineup: { summit: 3.9, speakers: 8.2, tickets: 12.6, close: 16.6, end: 21.6 },
    };
const args = process.argv.slice(2);
const pick = (all) => (args.some((a) => all.includes(a)) ? all.filter((a) => args.includes(a)) : all);
const JOBS = pick(Object.keys(TIMELINES)).flatMap((variant) =>
  pick(Object.keys(FORMATS)).map((format) => ({
    format, variant, ...FORMATS[format], timeline: TIMELINES[variant], beat: MUSIC ? 60 / MUSIC.bpm : 0,
    body: variant === "lineup" ? withLineup(FORMATS[format].body, format) : FORMATS[format].body,
    out: `marketing/bogota-forward-summit${variant === "lineup" ? "-lineup" : ""}${format === "vertical" ? "-vertical" : ""}${MUSIC ? "-music" : ""}.mp4`,
  })),
);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
  for (const cfg of JOBS) {
    const name = `${cfg.variant}-${cfg.format}`;
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${css}
html, body { width: ${cfg.w}px; height: ${cfg.h}px; } ${cfg.format === "vertical" ? verticalCss : ""}</style></head>
<body>${cfg.body}<script>${scriptFor(cfg)}</script></body></html>`;
    const page = await browser.newPage();
    await page.setViewport({ width: cfg.w, height: cfg.h, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(
      (heroSrc, photos) => window.prepare(heroSrc, photos),
      hero,
      (cfg.variant === "lineup" ? lineup : sessions).map(({ photo, mask, face }) => ({ photo, mask, face })),
    );

    if (process.env.STILLS) {
      const dir = process.env.STILLS_DIR || "marketing";
      await mkdir(dir, { recursive: true });
      for (const t of process.env.STILLS.split(",").map(Number)) {
        await page.evaluate((t) => window.render(t), t);
        await writeFile(`${dir}/${name}-${t.toFixed(2)}.png`, await page.screenshot({ type: "png" }));
      }
      console.log(`${name} stills → ${dir}`);
      continue;
    }
    await mkdir(new URL("marketing/", root), { recursive: true });
    const end = cfg.timeline.end;
    // The track starts on MUSIC_START, fades in briefly, fades out over the last
    // two seconds and is normalised to -14 LUFS for social platforms.
    const audio = MUSIC
      ? ["-ss", String(MUSIC.start), "-t", String(end), "-i", MUSIC.path, "-map", "0:v", "-map", "1:a",
         "-af", `afade=t=in:d=0.08,afade=t=out:st=${(end - 2.2).toFixed(3)}:d=2.2,loudnorm=I=-14:TP=-1.5:LRA=11`,
         "-c:a", "aac", "-b:a", "192k", "-ar", "48000"]
      : [];
    const ffmpeg = spawn("ffmpeg", [
      "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
      ...audio,
      "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
      "-t", String(end), new URL(cfg.out, root).pathname,
    ], { stdio: ["pipe", "inherit", "inherit"] });
    const done = new Promise((resolve, reject) =>
      ffmpeg.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)))),
    );
    const frames = Math.round(cfg.timeline.end * FPS);
    for (let f = 0; f < frames; f++) {
      await page.evaluate((t) => window.render(t), f / FPS);
      const jpg = await page.screenshot({ type: "jpeg", quality: 95, optimizeForSpeed: true });
      if (!ffmpeg.stdin.write(jpg)) await new Promise((r) => ffmpeg.stdin.once("drain", r));
      if (f % 150 === 0) console.log(`${name}: frame ${f}/${frames}`);
    }
    ffmpeg.stdin.end();
    await done;
    await page.close();
    console.log(`${cfg.out}: ${cfg.w}×${cfg.h}, ${FPS} fps, ${cfg.timeline.end}s`);
  }
} finally {
  await browser.close();
}
