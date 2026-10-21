// Generates the OpenAI teaser for bogota.forward() summit:
//   marketing/bogota-forward-openai.mp4           1920×1080
//   marketing/bogota-forward-openai-vertical.mp4  1080×1920
// A dark terminal "declassifies" a guest whose name stays redacted, the
// headline builds around the blank, two beats of silence, and on the drop the
// OpenAI logo assembles from characters and the sentence completes. Then the
// hype line (Silicon Valley → LATAM, with data crossing a route), what is
// still to be announced, as pending lines of code, and the close.
// Every frame comes from one deterministic render(t). Scenes sit on a
// 124.5 BPM bar grid: with PaulYudin's "Deep House" from MUSIC_START=69.467,
// the blackout lands on the track's two silent beats and the logo on its drop.
//   npm run promo:openai                    both formats, silent
//   npm run promo:openai -- vertical        one format
//   MUSIC=marketing/music/paulyudin-deep-house.mp3 MUSIC_START=69.467 npm run promo:openai
//   LEAD="" npm run promo:openai            headline without "Por primera vez,"
//   STILLS=2,5,8.5 STILLS_DIR=/tmp/x        render only those seconds as PNGs
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArrowRight } from "lucide-react";
import puppeteer from "puppeteer-core";

const root = new URL("../", import.meta.url);
const FPS = 30;
const BPM = Number(process.env.BPM || 124.5);
const BEAT = 60 / BPM;
const at = (bars, beats = 0) => Number(((bars * 4 + beats) * BEAT).toFixed(4));
// Scene starts. The two beats before the drop are a blackout.
const T = { build: at(2), black: at(3, 2), drop: at(4), hype: at(6), tba: at(8), close: at(10), end: at(12) };
const MUSIC = process.env.MUSIC ? { path: process.env.MUSIC, start: Number(process.env.MUSIC_START || 0) } : null;
const CHROME =
  process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// The headline wraps around the logo: LEAD / PRE [OpenAI] POST.
const LEAD = process.env.LEAD ?? "Por primera vez,";
const PRE = LEAD ? "parte del equipo de" : "Parte del equipo de";

const file = (path) => readFile(new URL(path, root));
const dataUrl = async (path, type) => `data:${type};base64,${(await file(path)).toString("base64")}`;
const icon = (Icon, size) => renderToStaticMarkup(h(Icon, { size, strokeWidth: 2.2, "aria-hidden": true }));

const fonts = "node_modules/geist/dist/fonts/";
const [sans, pixel, mono, openai, aiyaiyai] = await Promise.all([
  dataUrl(`${fonts}geist-sans/Geist-Variable.woff2`, "font/woff2"),
  dataUrl(`${fonts}geist-pixel/GeistPixel-Square.woff2`, "font/woff2"),
  dataUrl(`${fonts}geist-mono/GeistMono-Variable.woff2`, "font/woff2"),
  dataUrl("public/images/logos/collaborations/openai.png", "image/png"),
  dataUrl("public/images/colombia-summit/aiyaiyai.png", "image/png"),
]);

// Per-format layout, in px. Vertical keeps key content between y≈240 and
// y≈1600, clear of Reels and TikTok captions.
const LAYOUTS = {
  horizontal: {
    w: 1920, h: 1080, rails: [96, 192, 1727, 1823], stripe: 8,
    header: "left:192px; top:50px; width:1536px; font-size:26px",
    url: "right:192px; bottom:44px; font-size:22px",
    term: "left:192px; top:250px; font-size:44px",
    lead: { top: 120, size: 116 }, pre: { top: 282, size: 62 },
    logo: { cx: 960, cy: 530, w: 1060, font: 14 }, redact: 190,
    post: { top: 726, size: 62, lines: ["estará oficialmente en un evento en Colombia."] },
    soon: 840,
    hype: { title: "left:190px; top:200px", size: 124, maxW: 1536, route: { y: 790, x0: 214, x1: 1706 }, labelY: 822 },
    tbaTag: "left:192px; top:186px; font-size:22px",
    tbaTitle: "left:190px; top:250px; font-size:88px",
    tbaNote: "left:192px; top:500px; font-size:34px",
    panel: "left:1080px; top:236px; width:650px; font-size:28px",
    close: { word: { top: 120, size: 150 }, inline: true, withTop: 500, logoW: 300, facts: 640, tag: 700, cta: 780, foot: 920 },
    word: [[["bogota", "obj"], [".", "dot"], ["forward", "fn"], ["()", "call"]], [["summit", "obj"]]],
    terminal: [
      [["~/bogota $ ", "prompt"], ["python3", "t"]],
      [[">>> ", "prompt"], ["bogota", "t"], [".", "dim"], ["forward", "fn"], ["()", "call"]],
    ],
  },
  vertical: {
    w: 1080, h: 1920, rails: [40, 80, 999, 1039], stripe: 10,
    header: "left:96px; top:150px; width:888px; font-size:24px",
    url: "left:96px; top:1652px; font-size:22px",
    term: "left:80px; top:600px; font-size:34px",
    lead: { top: 440, size: 104 }, pre: { top: 580, size: 58 },
    logo: { cx: 540, cy: 812, w: 860, font: 12 }, redact: 150,
    post: { top: 1000, size: 58, lines: ["estará oficialmente en", "un evento en Colombia."] },
    soon: 1200,
    hype: { title: "left:94px; top:620px", size: 104, maxW: 888, route: { y: 1100, x0: 112, x1: 968 }, labelY: 1132 },
    tbaTag: "left:96px; top:350px; font-size:22px",
    tbaTitle: "left:94px; top:420px; font-size:100px",
    tbaNote: "left:96px; top:1110px; font-size:38px",
    panel: "left:96px; top:700px; width:888px; font-size:30px",
    close: { word: { top: 360, size: 150 }, inline: false, withTop: 880, logoW: 380, facts: 1090, tag: 1160, cta: 1250, foot: 1400 },
    word: [[["bogota", "obj"]], [[".", "dot"], ["forward", "fn"], ["()", "call"]], [["summit", "obj"]]],
    terminal: [
      [["~/bogota $ ", "prompt"], ["python3", "t"]],
      [[">>> ", "prompt"], ["bogota", "t"], [".", "dim"], ["forward", "fn"], ["()", "call"]],
    ],
  },
};

const css = /* css */ `
@font-face { font-family: Geist; src: url(${sans}) format("woff2"); font-weight: 100 900; }
@font-face { font-family: GeistPixel; src: url(${pixel}) format("woff2"); font-weight: 500; }
@font-face { font-family: GeistMono; src: url(${mono}) format("woff2"); font-weight: 100 900; }
:root { --bg: #0d0b01; --cream: #f3efe3; --muted: #9a9481; --dim: #5e5a4c;
  --blue: #003893; --bluel: #8fb0ff; --yellow: #fcd116; --red: #ce1126; --redl: #ff6b7a;
  --flag: linear-gradient(var(--yellow) 0 50%, var(--blue) 50% 75%, var(--red) 75%);
  --flag-h: linear-gradient(90deg, var(--yellow) 0 50%, var(--blue) 50% 75%, var(--red) 75%); }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { position: relative; overflow: hidden; background: var(--bg); color: var(--cream);
  font: 400 24px/1.35 Geist, sans-serif; letter-spacing: -0.008em; -webkit-font-smoothing: antialiased; }
.abs { position: absolute; }
.layer { position: absolute; inset: 0; }
canvas { display: block; }
.pixel { font-family: GeistPixel, GeistMono, monospace; font-weight: 500; letter-spacing: -0.03em; }
.mono { font-family: GeistMono, monospace; letter-spacing: -0.01em; }
.muted { color: var(--muted); }
.obj { color: var(--cream); } .dot { color: var(--dim); } .fn { color: var(--bluel); } .call { color: var(--redl); }
.accent { color: var(--yellow); }
.scr { color: var(--bluel); opacity: 0.6; }
.line { white-space: nowrap; line-height: 1.05; }
.cursor { display: inline-block; width: 0.5em; height: 0.8em; margin-left: 0.08em; vertical-align: -0.04em; background: var(--yellow); }
.rail { position: absolute; top: 0; width: 1px; height: 100%;
  background: repeating-linear-gradient(to bottom, rgb(243 239 227 / 0.09) 0 6px, transparent 6px 12px); }
.stripe { position: absolute; left: 0; top: 0; width: 100%; background: var(--flag-h); }
.scene { position: absolute; inset: 0; visibility: hidden; }
.header { display: flex; align-items: center; gap: 14px; }
.header .right { margin-left: auto; }
.flag { display: inline-block; width: 1.05em; height: 0.7em; flex-shrink: 0; background: var(--flag); }
.tag { display: inline-flex; align-items: center; gap: 0.6em; padding: 0.35em 0.7em; border: 1px dashed rgb(243 239 227 / 0.28);
  color: var(--muted); white-space: nowrap; }
.tag.yellow { border-color: var(--yellow); color: var(--yellow); }
.live { display: inline-block; width: 0.55em; height: 0.55em; background: var(--yellow); }
.term { font-family: GeistMono, monospace; white-space: pre; line-height: 1.62; }
.term .prompt { color: var(--yellow); } .term .kw { color: var(--redl); } .term .t { color: var(--cream); }
.term .dim { color: #8a8371; } .term .fn { color: var(--bluel); } .term .call { color: var(--redl); }
.term .ok { color: #9be38f; } .term .warn { color: var(--yellow); }
.term .y { color: var(--yellow); } .term .bl { color: var(--bluel); } .term .r { color: var(--redl); }
.caret { display: inline-block; width: 0.6em; height: 1.05em; vertical-align: -0.18em; background: var(--yellow); }
.redact { display: inline-flex; gap: 0.06em; font-family: GeistMono, monospace; font-weight: 600; line-height: 1; }
.redact span { display: inline-grid; place-items: center; width: 0.66em; height: 1.02em; background: var(--yellow); color: var(--bg); }
.panel { border: 1px dashed rgb(243 239 227 / 0.24); background: rgb(243 239 227 / 0.03); }
.panel::before, .panel::after { content: ""; position: absolute; width: 7px; height: 7px; background: var(--yellow); }
.panel::before { top: -4px; left: -4px; } .panel::after { right: -4px; bottom: -4px; }
.cta { display: inline-flex; align-items: center; gap: 0.6em; padding: 0 1.1em; background: var(--blue); color: #fff; white-space: nowrap; }
.cta b { font-weight: 400; color: var(--yellow); font-family: GeistMono, monospace; }
.foot { display: flex; align-items: center; gap: 14px; color: var(--muted); font-size: 21px; }
#logo { filter: drop-shadow(0 0 22px rgb(143 176 255 / 0.28)); }
.route-label { font-size: 24px; white-space: nowrap; }
.route-label .t { color: var(--cream); } .route-label .dim { color: var(--dim); } .route-label .y { color: var(--yellow); }
#flash { background: #fff; opacity: 0; z-index: 60; pointer-events: none; }
#wipe { z-index: 50; }
`;

const wordmark = `<span class="obj">bogota</span><span class="dot">.</span><span class="fn">forward</span><span class="call">()</span>`;

const body = (L) => /* html */ `
<canvas id="rain" class="layer"></canvas>
${L.rails.map((x) => `<div class="rail chrome" style="left:${x}px"></div>`).join("")}
<div class="stripe chrome" id="stripe" style="height:${L.stripe}px"></div>
<div class="abs header chrome" id="header" style="${L.header}">
  <span class="pixel">${wordmark} <span class="muted">summit</span></span>
  <span class="right mono muted">19.11.2026 · Bogotá</span>
</div>
<div class="abs mono muted chrome" id="url" style="${L.url}">aiyaiyai.io</div>

<section class="scene" id="s-term"><div class="abs term" id="term" style="${L.term}"></div></section>

<section class="scene" id="s-head">
  ${LEAD ? `<div class="abs pixel line" id="lead" style="top:${L.lead.top}px; font-size:${L.lead.size}px">${LEAD}</div>` : ""}
  <div class="abs pixel line" id="pre" style="top:${L.pre.top}px; font-size:${L.pre.size}px">${PRE}</div>
  <div class="abs redact" id="redact" style="left:50%; top:${L.logo.cy}px; font-size:${L.redact}px; translate:-50% -50%"></div>
  <canvas id="logo" class="layer"></canvas>
  ${L.post.lines.map((s, i) => `<div class="abs pixel line" id="post${i}" style="top:${L.post.top + i * L.post.size * 1.18}px; font-size:${L.post.size}px">${s}</div>`).join("")}
  <div class="abs" id="soon" style="left:0; right:0; top:${L.soon}px; display:flex; justify-content:center">
    <span class="tag yellow" style="font-size:24px"><span class="live"></span>Anuncio oficial muy pronto</span></div>
</section>
<div class="layer" id="blackout" style="visibility:hidden">
  <span class="cursor" style="position:absolute; left:50%; top:50%; translate:-50% -50%; font-size:160px"></span></div>

<section class="scene" id="s-hype">
  <h2 class="abs pixel" id="hype-title" style="${L.hype.title}; font-size:${L.hype.size}px; line-height:1.04; white-space:nowrap"></h2>
  <canvas id="route" class="layer"></canvas>
  <div class="abs mono route-label" id="route-from" style="left:${L.hype.route.x0 - 16}px; top:${L.hype.labelY}px">
    <span class="t">Silicon Valley</span><span class="dim"> · 37.4°N</span></div>
  <div class="abs mono route-label" id="route-to" style="right:${L.w - L.hype.route.x1 - 16}px; top:${L.hype.labelY}px; text-align:right">
    <span class="y">Bogotá · LATAM</span><span class="dim"> · 4.7°N</span></div>
</section>

<section class="scene" id="s-tba">
  <span class="abs tag" id="tba-tag" style="${L.tbaTag}"><span class="flag"></span>Por anunciar</span>
  <h2 class="abs pixel" id="tba-title" style="${L.tbaTitle}; line-height:1.04; white-space:nowrap"></h2>
  <div class="abs panel term" id="tba-panel" style="${L.panel}; padding:24px 28px"></div>
  <p class="abs" id="tba-note" style="${L.tbaNote}; color:var(--muted)">Anuncio oficial, muy pronto.</p>
</section>

<section class="scene" id="s-close">
  <h1 class="abs pixel" id="close-word" style="top:${L.close.word.top}px; font-size:${L.close.word.size}px; line-height:1.02; white-space:nowrap"></h1>
  <div class="abs" id="close-with" style="left:0; right:0; top:${L.close.withTop}px; display:flex; flex-direction:${L.close.inline ? "row" : "column"}; align-items:center; justify-content:center; gap:${L.close.inline ? 22 : 16}px">
    <span id="close-with-text" style="font-size:34px; color:var(--muted)"></span>
    <img src="${openai}" style="width:${L.close.logoW}px; height:auto" alt="">
  </div>
  <div class="abs mono" id="close-facts" style="left:0; right:0; top:${L.close.facts}px; text-align:center; font-size:32px"></div>
  <div class="abs" id="close-tag" style="left:0; right:0; top:${L.close.tag}px; display:flex; justify-content:center">
    <span class="tag yellow" style="font-size:24px"><span class="live"></span>Anuncio oficial muy pronto</span></div>
  <div class="abs" id="close-cta" style="left:0; right:0; top:${L.close.cta}px; display:flex; justify-content:center">
    <span class="cta" style="height:88px; font-size:34px">Conoce más en <b>aiyaiyai.io</b>${icon(ArrowRight, 32)}</span></div>
  <div class="abs foot" id="close-foot" style="left:0; right:0; top:${L.close.foot}px; justify-content:center">
    <span>Organiza</span><img src="${aiyaiyai}" style="height:30px; filter:brightness(0) invert(1)" alt=""></div>
</section>

<div id="flash" class="layer"></div>
<canvas id="wipe" class="layer" width="${L.w}" height="${L.h}"></canvas>`;

// ── Timeline and drawing, evaluated in the page ─────────────────────────────
const scriptFor = (L) => /* js */ `
const W = ${L.w}, H = ${L.h}, BEAT = ${BEAT}, BAR = ${4 * BEAT};
const T = ${JSON.stringify(T)};
const L = ${JSON.stringify({ logo: L.logo, post: L.post.lines.length, word: L.word, terminal: L.terminal, hype: L.hype })};
const NAME = "OpenAI";
const $ = (id) => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const out3 = (x) => 1 - Math.pow(1 - x, 3);
const stepped = (x, n) => Math.round(x * n) / n;
const snap = (at) => Math.round(at / (BEAT / 2)) * (BEAT / 2);
const hr = (a, b) => { let x = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35);
  x ^= x >>> 15; x = Math.imul(x, 0x2c1b3c6d); x ^= x >>> 12; return (x >>> 0) / 4294967296; };
const show = (el, o, dy = 0, dx = "0px") => { el.style.opacity = o; el.style.translate = dx + " " + dy + "px"; };
const pop = (el, t, at, dist = 28, dx = "0px") => { at = snap(at); const p = prog(t, at, at + 0.45); show(el, p > 0 ? 1 : 0, stepped(1 - out3(p), 4) * dist, dx); };
const blink = (t) => Math.floor(t / BEAT) % 2 === 0;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const SCR = "!<>-_/[]{}=+*^?#01ABCDEFGHJKLMNPQRSTUVXYZ";
const scrChar = (k, t) => SCR[Math.floor(hr(k, Math.floor(t * 18)) * SCR.length)];
const RAMP = ".:-=+*#%@";

// Decode: each character scrambles, then locks in, left to right.
function decodeRuns(lines, t, start, dur, seed = 1) {
  const total = lines.flat().reduce((n, [s]) => n + s.length, 0);
  let k = 0;
  return lines.map((line) => line.map(([text, cls]) => {
    let out = "";
    for (const ch of text) {
      const lock = start + dur * (0.6 * (k / total) + 0.4 * hr(k, seed));
      if (t < start + dur * 0.5 * (k / total)) out += " ";
      else if (ch === " " || t >= lock) out += esc(ch);
      else out += '<span class="scr">' + esc(scrChar(k + seed * 97, t)) + "</span>";
      k++;
    }
    return '<span class="' + cls + '">' + out + "</span>";
  }).join(""));
}
const decodeText = (text, t, start, dur, seed) => decodeRuns([[[text, ""]]], t, start, dur, seed)[0];
// Type runs character by character, with a caret after the last one.
function typeRuns(lines, t, start, cps) {
  let budget = Math.max(0, Math.floor((t - start) * cps));
  const total = lines.flat().reduce((n, [s]) => n + s.length, 0);
  const done = budget >= total;
  let placed = false;
  const out = [];
  for (const [li, line] of lines.entries()) {
    let html = "";
    for (const [text, cls] of line) {
      const take = text.slice(0, Math.max(0, budget)); budget -= text.length;
      if (take) html += '<span class="' + cls + '">' + esc(take) + "</span>";
    }
    if (!placed && (budget < 0 || (done && li === lines.length - 1))) {
      placed = true;
      if (!done || blink(t)) html += '<span class="caret"></span>';
    }
    if (html || li === 0) out.push(html);
    if (budget < 0) break;
  }
  return out.join("\\n");
}
// The redacted name: yellow blocks that leak a letter now and then.
function redaction(t, hint) {
  const tick = Math.floor(t * 14);
  return [...NAME].map((ch, i) => {
    const r = hr(i * 7 + 1, tick);
    const c = r < hint ? ch : r < hint + 0.3 ? SCR[Math.floor(hr(i, tick + 3) * SCR.length)] : "";
    return "<span>" + esc(c) + "</span>";
  }).join("");
}

// ── Ambient rain of code characters ──
const RAIN = "01{}[]<>/=+*#;:.()";
function drawRain(t, alpha) {
  const canvas = $("rain"), ctx = canvas.getContext("2d");
  if (canvas.width !== W) { canvas.width = W; canvas.height = H; }
  ctx.clearRect(0, 0, W, H);
  if (alpha <= 0) return;
  ctx.font = "500 18px GeistMono"; ctx.textBaseline = "top";
  const step = 30, rows = 16;
  for (let c = 0; c * step < W; c++) {
    if (hr(c, 3) < 0.38) continue;
    const speed = 70 + hr(c, 1) * 170, span = H + rows * 22;
    const y0 = ((hr(c, 2) * span + t * speed) % span) - rows * 22;
    for (let r = 0; r < rows; r++) {
      const y = y0 - r * 22; if (y < -22 || y > H) continue;
      const a = alpha * (1 - r / rows);
      ctx.fillStyle = r === 0 ? "rgba(252,209,22," + (a * 2).toFixed(3) + ")" : "rgba(233,228,212," + a.toFixed(3) + ")";
      ctx.fillText(RAIN[Math.floor(hr(c * 31 + r, Math.floor(t * 12 + c)) * RAIN.length)], c * step + 8, y);
    }
  }
}

// ── Wipe: a sweep of flag cells, each carrying a glyph ──
const CELL = 48, COLS = Math.ceil(W / CELL), ROWS = Math.ceil(H / CELL);
const WIPES = [T.build, T.hype, T.tba, T.close];
const wipeCells = Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = i % COLS, r = Math.floor(i / COLS), k = hr(i, 5);
  const axis = W < H ? r / ROWS : c / COLS;
  return { c, r, d: axis * 0.62 + hr(i, 6) * 0.38,
    fill: k < 0.8 ? "#003893" : k < 0.9 ? "#fcd116" : k < 0.95 ? "#ce1126" : "#f3efe3",
    ink: k < 0.8 ? "#9fb8ff" : k < 0.9 ? "#0d0b01" : k < 0.95 ? "#f3efe3" : "#0d0b01" };
});
function drawWipe(t) {
  const ctx = $("wipe").getContext("2d");
  ctx.clearRect(0, 0, W, H);
  ctx.font = "500 28px GeistMono"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (const mid of WIPES) {
    const u = (t - (mid - 0.32)) / 0.32;
    if (u <= 0 || u >= 2) continue;
    for (const [i, cell] of wipeCells.entries()) {
      if (!(u < 1 ? u > cell.d : u - 1 < cell.d)) continue;
      ctx.fillStyle = cell.fill; ctx.fillRect(cell.c * CELL, cell.r * CELL, CELL, CELL);
      ctx.fillStyle = cell.ink; ctx.fillText(SCR[Math.floor(hr(i, Math.floor(t * 20)) * SCR.length)], cell.c * CELL + CELL / 2, cell.r * CELL + CELL / 2 + 1);
    }
  }
}

// ── The logo, built from characters ──
const lg = {};
async function prepareLogo(src) {
  const img = new Image(); img.src = src; await img.decode();
  const w = L.logo.w, h = Math.round((w * img.naturalHeight) / img.naturalWidth);
  const font = L.logo.font, cw = font * 0.6, ch = font;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(img, 0, 0, w, h);
  const d = x.getImageData(0, 0, w, h).data;
  const left = L.logo.cx - w / 2, top = L.logo.cy - h / 2;
  const cells = [];
  for (let r = 0; r * ch < h; r++) for (let k = 0; k * cw < w; k++) {
    const x0 = Math.floor(k * cw), x1 = Math.min(w, Math.floor((k + 1) * cw)), y0 = r * ch, y1 = Math.min(h, (r + 1) * ch);
    let s = 0, n = 0;
    for (let y = y0; y < y1; y++) for (let xx = x0; xx < x1; xx++) { s += d[(y * w + xx) * 4 + 3]; n++; }
    const cov = n ? s / n / 255 : 0;
    if (cov < 0.12) continue;
    const q = hr(k * 13 + 7, r * 31 + 3);
    cells.push({ x: left + k * cw, y: top + r * ch, glyph: RAMP[Math.min(RAMP.length - 1, Math.floor(cov * RAMP.length))],
      lock: ((k * cw) / w) * 0.6 + hr(k, r) * 0.4,
      dx: (hr(r, k + 11) - 0.5) * W * 0.5, dy: (hr(k + 5, r) - 0.5) * H * 0.3,
      color: q < 0.02 ? "#ff6b7a" : q < 0.05 ? "#fcd116" : q < 0.08 ? "#8fb0ff" : "#f3efe3" });
  }
  Object.assign(lg, { img, w, h, left, top, cells, font });
}
const lgOff = document.createElement("canvas");
// p: 0→1 glyphs fly in and lock; scan: 0→1 the crisp logo replaces them; glitch: px.
function drawLogo(t, p, scan, glitch) {
  const canvas = $("logo");
  if (canvas.width !== W) { canvas.width = W; canvas.height = H; lgOff.width = W; lgOff.height = H; }
  const ctx = lgOff.getContext("2d"); ctx.clearRect(0, 0, W, H);
  const scanY = lg.top + scan * lg.h;
  if (scan > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, scanY); ctx.clip(); ctx.drawImage(lg.img, lg.left, lg.top, lg.w, lg.h); ctx.restore(); }
  ctx.font = "500 " + lg.font + "px GeistMono"; ctx.textBaseline = "top";
  for (const [i, c] of lg.cells.entries()) {
    if (scan > 0 && c.y + lg.font <= scanY) continue;
    const q = clamp((p - c.lock * 0.55) / 0.45);
    if (q <= 0) continue;
    const e = out3(q);
    ctx.globalAlpha = Math.min(1, q * 2.2);
    ctx.fillStyle = scan > 0 && c.y < scanY + lg.font * 2 ? "#8fb0ff" : c.color;
    ctx.fillText(q >= 1 ? c.glyph : SCR[Math.floor(hr(i, Math.floor(t * 20)) * SCR.length)], c.x + (1 - e) * c.dx, c.y + (1 - e) * c.dy);
  }
  ctx.globalAlpha = 1;
  if (scan > 0 && scan < 1) { ctx.fillStyle = "#8fb0ff"; ctx.fillRect(lg.left - 40, scanY - 1, lg.w + 80, 2); }
  const out = canvas.getContext("2d"); out.clearRect(0, 0, W, H);
  if (!glitch) { out.drawImage(lgOff, 0, 0); return; }
  // Glitch: horizontal slices of the logo band shifted on the downbeat.
  const y0 = lg.top - 24, span = lg.h + 48, slices = 10;
  for (let s = 0; s < slices; s++) {
    const sy = Math.floor(y0 + (s * span) / slices), sh = Math.ceil(span / slices);
    out.drawImage(lgOff, 0, sy, W, sh, (hr(s, Math.floor(t * 30)) - 0.5) * 2 * glitch, sy, W, sh);
  }
}

// ── The route: Silicon Valley → LATAM, with a packet launched every beat ──
function drawRoute(t, a) {
  const canvas = $("route"), ctx = canvas.getContext("2d");
  if (canvas.width !== W) { canvas.width = W; canvas.height = H; }
  ctx.clearRect(0, 0, W, H);
  const { y, x0, x1 } = L.hype.route;
  const drawn = a + 0.25 + 2 * BEAT, grow = out3(prog(t, a + 0.25, drawn));
  ctx.strokeStyle = "rgba(243,239,227,0.32)"; ctx.lineWidth = 2; ctx.setLineDash([10, 10]);
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + (x1 - x0) * grow, y); ctx.stroke(); ctx.setLineDash([]);
  const node = (x, color) => { ctx.fillStyle = color; ctx.fillRect(x - 8, y - 8, 16, 16); };
  if (grow > 0) node(x0, "#f3efe3");
  if (grow < 1) return;
  node(x1, "#fcd116");
  ctx.font = "600 18px GeistMono"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  // Each packet crosses in one bar and lands on a beat; the arrival pings.
  for (let launch = snap(drawn - BAR); launch < t; launch += BEAT) {
    const u = (t - launch) / BAR;
    if (u < 0) continue;
    if (u >= 1) {
      const ping = (t - (launch + BAR)) / 0.35;
      if (ping < 1) { ctx.strokeStyle = "rgba(252,209,22," + (1 - ping).toFixed(3) + ")"; ctx.lineWidth = 2;
        ctx.strokeRect(x1 - 8 - ping * 26, y - 8 - ping * 26, 16 + ping * 52, 16 + ping * 52); }
      continue;
    }
    const hx = x0 + (x1 - x0) * u;
    for (let k = 1; k <= 8; k++) {
      const gx = hx - k * 20; if (gx < x0) break;
      ctx.fillStyle = "rgba(143,176,255," + (0.85 * (1 - k / 9)).toFixed(3) + ")";
      ctx.fillText(hr(k, Math.floor(launch * 10)) < 0.5 ? "0" : "1", gx, y - 1);
    }
    ctx.fillStyle = "#fcd116"; ctx.fillRect(hx - 6, y - 6, 12, 12);
  }
}

// ── The pending panel: prompts type, answers appear ──
const PANEL = [
  [[[">>> ", "prompt"], ["openai", "t"], [".", "dim"], ["speakers", "fn"]], [["[pendiente] ", "warn"], ["por anunciar", "t"]], true],
  [[[">>> ", "prompt"], ["openai", "t"], [".", "dim"], ["charla", "fn"]], [["[pendiente] ", "warn"], ["por anunciar", "t"]], true],
  [[[">>> ", "prompt"], ["evento", "t"], [".", "dim"], ["fecha", "fn"]], [["'19.11.2026 · Bogotá'", "ok"]], false],
];
function drawPanel(t, a) {
  const lines = [];
  let start = a + 0.3;
  for (const [prompt, answer, live] of PANEL) {
    if (t < start) break;
    const len = prompt.reduce((n, [s]) => n + s.length, 0);
    const typedEnd = start + len / 34;
    lines.push(typeRuns([prompt], t, start, 34).replace('<span class="caret"></span>', t < typedEnd ? '<span class="caret"></span>' : ""));
    if (t >= typedEnd + 0.12) lines.push(answer.map(([s, c]) => '<span class="' + c + '">' + esc(s) + "</span>").join("")
      + (live ? ' <span class="live" style="opacity:' + (blink(t) ? 1 : 0.15) + '"></span>' : ""));
    start = typedEnd + 0.4;
  }
  $("tba-panel").innerHTML = lines.join("\\n");
}

const STRIPE = $("stripe").offsetHeight;
const SCENES = [["s-term", 0, T.build], ["s-head", T.build, T.hype], ["s-hype", T.hype, T.tba], ["s-tba", T.tba, T.close], ["s-close", T.close, 999]];
const centred = {};

window.render = (t) => {
  const black = t >= T.black && t < T.drop, term = t < T.build;
  for (const [id, a, b] of SCENES) $(id).style.visibility = t >= a && t < b && !black ? "visible" : "hidden";
  $("blackout").style.visibility = black ? "visible" : "hidden";
  $("blackout").firstElementChild.style.opacity = Math.floor(t / (BEAT / 2)) % 2 === 0 ? 1 : 0;
  document.querySelectorAll(".chrome").forEach((el) => {
    const onClose = t >= T.close && (el.id === "header" || el.id === "url");
    el.style.opacity = black || onClose ? 0 : term ? (el.classList.contains("rail") ? 1 : 0) : 1;
  });
  drawRain(t, black ? 0 : term ? 0.16 : t >= T.close ? 0.06 : 0.1);
  // The flag stripe kicks on every beat, harder on the downbeat.
  const ph = (t / BEAT) % 1, down = Math.floor(t / BEAT + 1e-6) % 4 === 0;
  $("stripe").style.height = Math.round(STRIPE * (1 + (down ? 1.4 : 0.7) * Math.exp(-ph * 6))) + "px";
  const downbeat = t % BAR < 0.07;
  $("flash").style.opacity = t >= T.drop && t < T.drop + 0.3 ? (0.85 * (1 - (t - T.drop) / 0.3)).toFixed(3) : 0;

  // 1 · Terminal: a guest is being declassified.
  if (term) {
    let html = typeRuns(L.terminal, t, 0.2, 30);
    if (t >= 1.75) html += '\\n<span class="warn">[!] </span><span class="t">nuevo anuncio en camino</span>';
    if (t >= 2.05) html += '\\n<span class="warn">[!] </span><span class="t">invitado: </span><span class="redact" style="font-size:1em">' + redaction(t, 0) + "</span>";
    if (t >= 2.4) {
      const fill = Math.round(16 * out3(prog(t, 2.5, 3.6)));
      const segs = Array.from({ length: 16 }, (_, i) => i < fill ? '<span class="' + (i < 8 ? "y" : i < 12 ? "bl" : "r") + '">█</span>' : '<span class="dim">░</span>').join("");
      html += '\\n<span class="dim">desclasificando </span>[' + segs + '] <span class="t">' + Math.round((fill / 16) * 100) + "%</span>";
    }
    $("term").innerHTML = html;
  }
  // 2 · The headline builds around a redacted name; 3 · the drop completes it.
  if (t >= T.build && t < T.hype && !black) {
    const a = T.build, revealed = t >= T.drop;
    if ($("lead")) $("lead").innerHTML = revealed ? centred.lead : decodeText(centred.leadText, t, a + 0.1, 0.8, 3);
    $("pre").innerHTML = revealed ? centred.pre : decodeText(centred.preText, t, a + 0.55, 0.8, 5);
    for (let i = 0; i < L.post; i++)
      $("post" + i).innerHTML = revealed ? centred["post" + i] : decodeText(centred["post" + i + "Text"], t, a + 1.1 + i * 0.25, 0.9, 7 + i);
    // A subliminal flash of the name on the downbeat of bar 3.
    const tease = t >= T.build + BAR && t < T.build + BAR + 0.07;
    $("redact").style.visibility = revealed ? "hidden" : "";
    if (!revealed) $("redact").innerHTML = redaction(t, tease ? 1 : 0.05 + 0.3 * prog(t, a, T.black));
    pop($("redact"), t, a + 0.9, 0, "-50%");
    $("redact").style.translate = "-50% -50%";
    // "" inherits the scene's visibility; "visible" would override a hidden parent.
    $("logo").style.visibility = revealed ? "" : "hidden";
    if (revealed) drawLogo(t, prog(t, T.drop, T.drop + 1.3), out3(prog(t, T.drop + 1.7, T.drop + 2.5)), downbeat && t > T.drop + 0.4 ? 16 : 0);
    $("soon").style.opacity = revealed && t >= snap(T.drop + 2.6) ? 1 : 0;
  }
  // 4 · The hype line, with data crossing from Silicon Valley to LATAM.
  if (t >= T.hype && t < T.tba) {
    const a = T.hype;
    $("hype-title").innerHTML = decodeRuns([[["Conocimiento", ""]], [["desde ", ""], ["Silicon Valley", "fn"]], [["hasta ", ""], ["LATAM.", "accent"]]], t, a + 0.1, 1.1, 41)
      .map((l) => '<span style="display:block">' + l + "</span>").join("");
    drawRoute(t, a);
    pop($("route-from"), t, a + 0.3, 12); pop($("route-to"), t, a + 0.25 + 2 * BEAT, 12);
  }
  // 5 · What is still to be announced.
  if (t >= T.tba && t < T.close) {
    const a = T.tba;
    pop($("tba-tag"), t, a + 0.05, 12);
    $("tba-title").innerHTML = decodeRuns([[["Nombres y temas:", ""]], [["por anunciar.", "accent"]]], t, a + 0.1, 1.0, 13)
      .map((l) => '<span style="display:block">' + l + "</span>").join("");
    pop($("tba-panel"), t, a + 0.2, 18);
    drawPanel(t, a);
    pop($("tba-note"), t, a + 2.6, 12);
  }
  // 6 · Close.
  if (t >= T.close) {
    const a = T.close;
    const lines = decodeRuns(L.word, t, a + 0.1, 1.0, 29);
    $("close-word").innerHTML = lines.map((l, i) => '<span style="display:block">' + l
      + (i === lines.length - 1 ? '<span class="cursor"' + (blink(t) ? "" : ' style="opacity:0"') + "></span>" : "") + "</span>").join("");
    $("close-with-text").innerHTML = decodeText("con parte del equipo de", t, a + 0.8, 0.6, 31);
    pop($("close-with"), t, a + 0.75, 18);
    $("close-facts").innerHTML = decodeText("19.11.2026 · 10 a. m. – 4 p. m. · Bogotá", t, a + 1.1, 0.7, 33);
    pop($("close-tag"), t, a + 1.4, 14); pop($("close-cta"), t, a + 1.6, 24); pop($("close-foot"), t, a + 1.9, 12);
  }
  drawWipe(t);
};

window.prepare = async (logoSrc) => {
  await document.fonts.load("500 18px GeistMono");
  await document.fonts.load("500 40px GeistPixel");
  // Fix every centred line at its final width so decoding never shifts it.
  const fix = (id, key) => { const el = $(id); if (!el) return;
    centred[key + "Text"] = el.textContent; centred[key] = esc(el.textContent);
    el.style.left = Math.round((W - el.offsetWidth) / 2) + "px"; };
  fix("lead", "lead"); fix("pre", "pre");
  for (let i = 0; i < L.post; i++) fix("post" + i, "post" + i);
  const word = $("close-word");
  word.innerHTML = L.word.map((l) => '<span style="display:block">' + l.map(([s, c]) => '<span class="' + c + '">' + s + "</span>").join("") + '<span class="cursor"></span></span>').join("");
  word.style.left = Math.round((W - word.offsetWidth) / 2) + "px";
  const hype = $("hype-title");
  hype.innerHTML = "<span style='display:block'>Conocimiento</span><span style='display:block'>desde Silicon Valley</span><span style='display:block'>hasta LATAM.</span>";
  const size = parseFloat(hype.style.fontSize);
  if (hype.offsetWidth > L.hype.maxW) hype.style.fontSize = Math.floor((size * L.hype.maxW) / hype.offsetWidth) + "px";
  await prepareLogo(logoSrc);
};`;

const args = process.argv.slice(2);
const names = Object.keys(LAYOUTS).filter((n) => !args.length || args.includes(n));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
  for (const name of names) {
    const L = LAYOUTS[name];
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${css}
html, body { width: ${L.w}px; height: ${L.h}px; }</style></head><body>${body(L)}<script>${scriptFor(L)}</script></body></html>`;
    const page = await browser.newPage();
    await page.setViewport({ width: L.w, height: L.h, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate((src) => window.prepare(src), openai);
    if (process.env.STILLS) {
      const dir = process.env.STILLS_DIR || "marketing";
      await mkdir(dir, { recursive: true });
      for (const t of process.env.STILLS.split(",").map(Number)) {
        await page.evaluate((t) => window.render(t), t);
        await writeFile(`${dir}/openai-${name}-${t.toFixed(2)}.png`, await page.screenshot({ type: "png" }));
      }
      console.log(`${name} stills → ${dir}`);
      await page.close();
      continue;
    }
    const out = `marketing/bogota-forward-openai${name === "vertical" ? "-vertical" : ""}${MUSIC ? "-music" : ""}.mp4`;
    const end = T.end;
    const audio = MUSIC
      ? ["-ss", String(MUSIC.start), "-t", String(end), "-i", MUSIC.path, "-map", "0:v", "-map", "1:a",
         "-af", `afade=t=in:d=0.08,afade=t=out:st=${(end - 2.2).toFixed(3)}:d=2.2,loudnorm=I=-14:TP=-1.5:LRA=11`,
         "-c:a", "aac", "-b:a", "192k", "-ar", "48000"]
      : [];
    const ffmpeg = spawn("ffmpeg", [
      "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
      ...audio, "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
      "-t", String(end), new URL(out, root).pathname,
    ], { stdio: ["pipe", "inherit", "inherit"] });
    const done = new Promise((resolve, reject) => ffmpeg.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)))));
    const frames = Math.round(end * FPS);
    for (let f = 0; f < frames; f++) {
      await page.evaluate((t) => window.render(t), f / FPS);
      const jpg = await page.screenshot({ type: "jpeg", quality: 95, optimizeForSpeed: true });
      if (!ffmpeg.stdin.write(jpg)) await new Promise((r) => ffmpeg.stdin.once("drain", r));
      if (f % 150 === 0) console.log(`${name}: frame ${f}/${frames}`);
    }
    ffmpeg.stdin.end();
    await done;
    await page.close();
    console.log(`${out}: ${L.w}×${L.h}, ${FPS} fps, ${end.toFixed(2)}s`);
  }
} finally {
  await browser.close();
}
