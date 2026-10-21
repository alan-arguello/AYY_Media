// Generates the ASCII / coder promo for bogota.forward() summit, featuring
// Alexander Torrenegra and Tania Zapata:
//   marketing/bogota-forward-ascii.mp4           1920×1080
//   marketing/bogota-forward-ascii-vertical.mp4  1080×1920
// The story "runs": a dark terminal calls bogota.forward(), a wave of
// characters turns it into the site's paper, the speakers decode as ASCII
// portraits and resolve into photos under a scan line, then the VIP dinner
// with both and the call to action.
// Every frame comes from one deterministic render(t); Chrome captures frames
// and ffmpeg encodes H.264. Scenes sit on a 132.5 BPM bar grid, so the same
// cut works with or without music.
//   npm run promo:ascii                   both formats, silent
//   npm run promo:ascii -- vertical       one format
//   MUSIC=track.mp3 MUSIC_START=233.052 npm run promo:ascii   → "-music" files
//   OUT_SUFFIX=-name                      appended to output file names
//   STILLS=4,8.5 STILLS_DIR=/tmp/x        render only those seconds as PNGs
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArrowRight } from "lucide-react";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const FPS = 30;
const BPM = Number(process.env.BPM || 132.5);
const BAR = 240 / BPM;
const MUSIC = process.env.MUSIC ? { path: process.env.MUSIC, start: Number(process.env.MUSIC_START || 0) } : null;
const CHROME =
  process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// Scene starts, in bars.
const BARS = { terminal: 0, title: 2, alex: 4, tania: 7, vip: 10, close: 12, end: 15 };
const T = Object.fromEntries(Object.entries(BARS).map(([k, v]) => [k, Number((v * BAR).toFixed(4))]));

const file = (path) => readFile(new URL(path, root));
const dataUrl = async (path, type) => `data:${type};base64,${(await file(path)).toString("base64")}`;
const icon = (Icon, size) => renderToStaticMarkup(h(Icon, { size, strokeWidth: 2.2, "aria-hidden": true }));
const logo = (name) => dataUrl(`public/images/colombia-summit/${name}`, "image/png");
async function solidLogo(path) {
  const source = await file(path);
  const { width, height } = await sharp(source).metadata();
  const raw = await sharp(source).ensureAlpha().extractChannel(3).raw().toBuffer();
  const alpha = await sharp(raw, { raw: { width, height, channels: 1 } }).normalise().toColourspace("b-w").raw().toBuffer();
  const png = await sharp({ create: { width, height, channels: 3, background: "#0d0b01" } })
    .joinChannel(alpha, { raw: { width, height, channels: 1 } }).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}
// A median pass drops stray specks the person mask leaves behind.
const cleanMask = async (path) =>
  `data:image/png;base64,${(await sharp(await file(path)).median(17).png().toBuffer()).toString("base64")}`;

const fonts = "node_modules/geist/dist/fonts/";
const [sans, pixel, mono, aiyaiyai, torre, worder, shark, endeavor, bunny, stanford, torrenegraTsx] = await Promise.all([
  dataUrl(`${fonts}geist-sans/Geist-Variable.woff2`, "font/woff2"),
  dataUrl(`${fonts}geist-pixel/GeistPixel-Square.woff2`, "font/woff2"),
  dataUrl(`${fonts}geist-mono/GeistMono-Variable.woff2`, "font/woff2"),
  logo("aiyaiyai.png"),
  solidLogo("public/images/colombia-summit/credential-torre-ai.png"),
  logo("worder.png"),
  logo("credential-shark-tank.png"),
  logo("credential-endeavor.png"),
  logo("credential-bunnyinc.png"),
  logo("credential-stanford.png"),
  file("src/components/torrenegra-mark.tsx"),
]);
const torrenegra = `<svg viewBox="0 0 48 28.364" width="1.7em" height="1em"><path d="${
  torrenegraTsx.toString().match(/d="([^"]+)"/)[1]
}" fill="currentColor"/></svg>`;

// Face boxes from Apple's Vision framework; masks from scripts/person-mask.swift.
const SPEAKERS = [
  { id: "alex", photo: "public/images/speakers/alexander-torrenegra.webp", mask: "marketing/masks/alexander-torrenegra.png",
    face: { x: 315, y: 167, w: 195, h: 195 } },
  { id: "tania", photo: "public/images/speakers/tania-zapata.webp", mask: "marketing/masks/tania-zapata.png",
    face: { x: 361, y: 175, w: 248, h: 248 } },
];
const speakers = await Promise.all(
  SPEAKERS.map(async (s) => ({ ...s, photo: await dataUrl(s.photo, "image/webp"), mask: await cleanMask(s.mask) })),
);

// Syntax-coloured lines: [text, class] runs per line.
const STR = "str", KEY = "key", PUN = "pun", KW = "kw";
const codeFor = (nombre, rol, formato) => [
  [["const ", KW], ["speaker", KEY], [" = {", PUN]],
  [["  nombre", KEY], [": ", PUN], [`"${nombre}"`, STR], [",", PUN]],
  [["  rol", KEY], [": ", PUN], [`"${rol}"`, STR], [",", PUN]],
  [["  formato", KEY], [": ", PUN], [`"${formato}"`, STR], [",", PUN]],
  [["};", PUN]],
];
const CONTENT = {
  alex: {
    index: "speaker[0]", kind: "Charla", title: "Cómo predecir el futuro",
    code: codeFor("Alexander Torrenegra", "Cofundador de Torre.ai", "Charla"),
    logos: [torre, shark, endeavor],
  },
  tania: {
    index: "speaker[1]", kind: "Fireside chat", title: "Reinventar tu compañía cuando es disrumpida",
    code: codeFor("Tania Zapata", "Cofundadora de Voice123", "Fireside chat"),
    logos: [bunny, stanford, endeavor],
  },
};
const TERMINAL = {
  horizontal: [
    [["~/bogota $ ", "prompt"], ["python3", "t"]],
    [[">>> ", "prompt"], ["from ", "kw"], ["latam ", "t"], ["import ", "kw"], ["ia, empresas", "t"]],
    [[">>> ", "prompt"], ["bogota", "t"], [".", "dim"], ["forward", "fn"], ["()", "call"]],
    [["[ok] ", "ok"], ["speakers: Alexander Torrenegra, Tania Zapata", "t"]],
    [["[ok] ", "ok"], ["19.11.2026 · 10 a. m. – 4 p. m. · Bogotá, Colombia", "t"]],
  ],
  vertical: [
    [["~/bogota $ ", "prompt"], ["python3", "t"]],
    [[">>> ", "prompt"], ["from ", "kw"], ["latam ", "t"], ["import ", "kw"], ["ia", "t"]],
    [[">>> ", "prompt"], ["bogota", "t"], [".", "dim"], ["forward", "fn"], ["()", "call"]],
    [["[ok] ", "ok"], ["Alexander Torrenegra", "t"]],
    [["[ok] ", "ok"], ["Tania Zapata", "t"]],
    [["[ok] ", "ok"], ["19.11.2026 · Bogotá", "t"]],
  ],
};

const css = /* css */ `
@font-face { font-family: Geist; src: url(${sans}) format("woff2"); font-weight: 100 900; }
@font-face { font-family: GeistPixel; src: url(${pixel}) format("woff2"); font-weight: 500; }
@font-face { font-family: GeistMono; src: url(${mono}) format("woff2"); font-weight: 100 900; }
:root { --bg: #fcfbf6; --ink: #0d0b01; --muted: #6d685a; --subtle: #9b9584; --line: #d8d2c1; --line2: #b5ae99;
  --blue: #003893; --navy: #0a1f4d; --tint: #e2e8f5; --yellow: #fcd116; --red: #ce1126;
  --flag: linear-gradient(var(--yellow) 0 50%, var(--blue) 50% 75%, var(--red) 75%);
  --flag-h: linear-gradient(90deg, var(--yellow) 0 50%, var(--blue) 50% 75%, var(--red) 75%); }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { position: relative; overflow: hidden; background: var(--bg); color: var(--ink);
  font: 400 24px/1.35 Geist, sans-serif; letter-spacing: -0.008em; -webkit-font-smoothing: antialiased; }
.abs { position: absolute; }
.layer { position: absolute; inset: 0; }
#dark { background: #0d0b01; }
canvas { display: block; }
.pixel { font-family: GeistPixel, GeistMono, monospace; font-weight: 500; letter-spacing: -0.03em; }
.mono { font-family: GeistMono, monospace; letter-spacing: -0.01em; }
.blue { color: var(--blue); } .muted { color: var(--muted); }
.obj { color: var(--ink); } .dot { color: var(--subtle); } .fn { color: var(--blue); } .call { color: var(--red); }
.scr { color: var(--blue); opacity: 0.55; }
.cursor { display: inline-block; width: 0.5em; height: 0.8em; margin-left: 0.08em; vertical-align: -0.04em;
  background: var(--yellow); box-shadow: inset 0 0 0 1px rgb(13 11 1 / 0.12); }
.rail { position: absolute; top: 0; width: 1px; height: 100%;
  background: repeating-linear-gradient(to bottom, var(--line) 0 6px, transparent 6px 12px); }
.stripe { position: absolute; left: 0; top: 0; width: 100%; background: var(--flag-h); }
.scene { position: absolute; inset: 0; visibility: hidden; }
.flag { display: inline-block; width: 1.05em; height: 0.7em; flex-shrink: 0; background: var(--flag);
  box-shadow: 0 0 0 1px rgb(13 11 1 / 0.1); }
.tag { display: inline-flex; align-items: center; gap: 0.6em; padding: 0.35em 0.7em; border: 1px dashed var(--line2);
  background: var(--bg); color: var(--muted); white-space: nowrap; }
.header { display: flex; align-items: center; gap: 14px; }
.header .right { margin-left: auto; }
/* Terminal */
.term { font-family: GeistMono, monospace; color: #e9e4d4; white-space: pre; }
.term .prompt { color: var(--yellow); } .term .kw { color: #ff6b7a; } .term .t { color: #f3efe3; }
.term .dim { color: #8a8371; } .term .fn { color: #7fa2ff; } .term .call { color: #ff6b7a; } .term .ok { color: #9be38f; }
.term .caret { display: inline-block; width: 0.6em; height: 1.05em; vertical-align: -0.18em; background: var(--yellow); }
.bar { font-family: GeistMono, monospace; white-space: pre; color: #8a8371; }
.bar b { font-weight: 400; } .bar .y { color: var(--yellow); } .bar .bl { color: #7fa2ff; } .bar .r { color: #ff6b7a; }
/* Code card */
.code { font-family: GeistMono, monospace; white-space: pre; line-height: 1.55; }
.code .kw { color: var(--red); } .code .key { color: var(--ink); } .code .pun { color: var(--subtle); } .code .str { color: var(--blue); }
.code .caret { display: inline-block; width: 0.6em; height: 1.05em; vertical-align: -0.18em; background: var(--yellow); }
.panel { position: absolute; border: 1px dashed var(--line2); background: rgb(252 251 246 / 0.9); }
.panel::before, .panel::after { content: ""; position: absolute; width: 6px; height: 6px; background: var(--blue); }
.panel::before { top: -3px; left: -3px; } .panel::after { right: -3px; bottom: -3px; }
.logos { display: flex; align-items: center; gap: 34px; }
.logos img { height: 32px; width: auto; filter: grayscale(1); opacity: 0.75; }
.cta { display: inline-flex; align-items: center; gap: 0.6em; padding: 0 1.1em; background: var(--blue); color: #fff; white-space: nowrap; }
.cta b { font-weight: 400; color: var(--yellow); font-family: GeistMono, monospace; }
.foot { display: flex; align-items: center; gap: 22px; color: var(--muted); font-size: 21px; white-space: nowrap; }
.foot img { display: block; filter: brightness(0); }
.foot .tn { display: inline-flex; align-items: center; gap: 0.45em; color: var(--ink); font-weight: 500; letter-spacing: -0.02em; }
#wipe { position: absolute; inset: 0; z-index: 50; }
`;

const footer = (style) => `
  <div class="foot" style="${style}">
    <span>Organiza</span><img src="${aiyaiyai}" style="height:30px" alt="">
    <span style="margin-left:auto">Con el apoyo de</span>
    <span class="tn">${torrenegra}Torrenegra &amp; Co</span>
    <img src="${torre}" style="height:27px; filter:none" alt="">
    <img src="${worder}" style="height:29px" alt="">
  </div>`;
const chrome = (rails, headerStyle, urlStyle, stripe) => `
<canvas id="rain" class="layer"></canvas>
<div id="dark" class="layer"></div>
<canvas id="rainDark" class="layer"></canvas>
${rails.map((x) => `<div class="rail chrome" style="left:${x}px"></div>`).join("")}
<div class="stripe chrome" id="stripe" style="height:${stripe}px"></div>
<div class="abs header chrome" id="header" style="${headerStyle}">
  <span class="pixel"><span class="obj">bogota</span><span class="dot">.</span><span class="fn">forward</span><span class="call">()</span> <span class="muted">summit</span></span>
  <span class="right mono muted">19.11.2026 · Bogotá</span>
</div>
<div class="abs mono muted chrome" id="url" style="${urlStyle}">aiyaiyai.io</div>`;

const LAYOUTS = {
  horizontal: {
    w: 1920, h: 1080,
    portrait: { w: 780, h: 960, cellW: 10, cellH: 17, font: 16.5 },
    mini: { w: 400, h: 500, cellW: 7, cellH: 12, font: 11.6 },
    body: /* html */ `
${chrome([96, 192, 1727, 1823], "left:192px; top:50px; width:1536px; font-size:26px", "right:192px; bottom:44px; font-size:22px", 8)}
<section class="scene" id="s1">
  <div class="abs term" id="term" style="left:192px; top:250px; font-size:44px; line-height:1.62"></div>
  <div class="abs bar" id="bar" style="left:192px; top:840px; font-size:30px"></div>
</section>
<section class="scene" id="s2">
  <span class="abs tag" id="s2-tag" style="left:50%; top:250px; font-size:24px"><span class="flag"></span><span id="s2-tagtext"></span></span>
  <h1 class="abs pixel" id="s2-word" style="top:318px; font-size:196px; line-height:1.02; white-space:nowrap"></h1>
  <p class="abs" id="s2-lead" style="left:0; right:0; top:762px; text-align:center; font-size:40px; color:var(--muted)"></p>
  <p class="abs mono" id="s2-meta" style="left:0; right:0; top:836px; text-align:center; font-size:26px; color:var(--subtle)"></p>
</section>
${["alex", "tania"].map((id, i) => {
  const mirror = i === 1;
  return `<section class="scene" id="s-${id}">
  <canvas id="p-${id}" class="abs" style="left:${mirror ? 1000 : 140}px; top:120px; width:780px; height:960px"></canvas>
  <div class="abs" id="${id}-copy" style="left:${mirror ? 192 : 960}px; top:206px; width:${mirror ? 820 : 770}px">
    <div class="mono" id="${id}-index" style="font-size:24px; color:var(--blue)"></div>
    <h2 class="pixel" id="${id}-title" style="margin-top:22px; font-size:${mirror ? 72 : 80}px; line-height:1.04; min-height:${mirror ? 226 : 168}px"></h2>
    <div class="panel code" id="${id}-code" style="position:relative; margin-top:34px; padding:22px 26px; font-size:27px; min-height:236px"></div>
    <div class="logos" id="${id}-logos" style="margin-top:34px">${CONTENT[id].logos.map((src) => `<img src="${src}" alt="">`).join("")}</div>
  </div>
</section>`;
}).join("")}
<section class="scene" id="s-vip">
  <div class="abs" style="left:192px; top:190px; width:860px">
    <span class="tag" id="vip-tag" style="font-size:23px"><span class="flag"></span>VIP · 20 cupos · Sujeto a aceptación</span>
    <div class="mono" id="vip-code" style="margin-top:34px; font-size:28px"></div>
    <h2 class="pixel" id="vip-title" style="margin-top:18px; font-size:96px; line-height:1.02; min-height:196px"></h2>
    <p id="vip-sub" style="margin-top:22px; font-size:32px; color:var(--muted)"></p>
<div id="vip-price" class="panel" style="position:relative; margin-top:48px; padding:18px 24px; display:grid; gap:8px; width:fit-content">
      <span class="mono" style="font-size:34px"><span style="color:var(--red)">&gt;&gt;&gt;</span> vip<span class="dot">.</span><span class="fn">solicitar</span><span class="call">()</span></span>
      <span class="muted" style="font-size:24px">Cupos limitados · Solicítalo en aiyaiyai.io</span>
    </div>
  </div>
  <canvas id="m-alex" class="abs" style="left:1060px; top:230px; width:400px; height:500px"></canvas>
  <canvas id="m-tania" class="abs" style="left:1330px; top:230px; width:400px; height:500px"></canvas>
  <div class="abs mono" id="vip-names" style="left:1100px; top:752px; width:620px; display:flex; justify-content:space-between; font-size:22px; color:var(--muted)">
    <span>alex.torrenegra</span><span>tania.zapata</span></div>
</section>
<section class="scene" id="s-close">
  <h1 class="abs pixel" id="close-word" style="top:206px; font-size:176px; line-height:1.02; white-space:nowrap"></h1>
  <div class="abs mono" id="close-facts" style="left:0; right:0; top:618px; text-align:center; font-size:32px"></div>
  <div class="abs" id="close-cta" style="left:0; right:0; top:704px; display:flex; justify-content:center">
    <span class="cta" style="height:96px; font-size:40px">Conoce más en <b>aiyaiyai.io</b>${icon(ArrowRight, 38)}</span>
  </div>
  <div class="abs" id="close-foot" style="left:192px; right:192px; top:930px; padding-top:28px; border-top:1px dashed var(--line2)">${footer("")}</div>
</section>
<canvas id="wipe" width="1920" height="1080"></canvas>`,
    word: [[["bogota", "obj"], [".", "dot"], ["forward", "fn"], ["()", "call"]], [["summit", "obj"]]],
  },
  vertical: {
    w: 1080, h: 1920,
    portrait: { w: 900, h: 900, cellW: 10, cellH: 17, font: 16.5 },
    mini: { w: 420, h: 520, cellW: 7, cellH: 12, font: 11.6 },
    body: /* html */ `
${chrome([40, 80, 999, 1039], "left:96px; top:150px; width:888px; font-size:24px", "left:96px; top:1652px; font-size:22px", 10)}
<section class="scene" id="s1">
  <div class="abs term" id="term" style="left:80px; top:560px; font-size:38px; line-height:1.62"></div>
  <div class="abs bar" id="bar" style="left:80px; top:1180px; font-size:27px"></div>
</section>
<section class="scene" id="s2">
  <span class="abs tag" id="s2-tag" style="left:50%; top:520px; font-size:24px"><span class="flag"></span><span id="s2-tagtext"></span></span>
  <h1 class="abs pixel" id="s2-word" style="top:600px; font-size:168px; line-height:1.02; white-space:nowrap"></h1>
  <p class="abs" id="s2-lead" style="left:0; right:0; top:1190px; text-align:center; font-size:40px; color:var(--muted)"></p>
  <p class="abs mono" id="s2-meta" style="left:0; right:0; top:1262px; text-align:center; font-size:25px; color:var(--subtle)"></p>
</section>
${["alex", "tania"].map((id) => `<section class="scene" id="s-${id}">
  <canvas id="p-${id}" class="abs" style="left:90px; top:206px; width:900px; height:900px"></canvas>
  <div class="abs" id="${id}-copy" style="left:96px; top:1128px; width:888px">
    <div class="mono" id="${id}-index" style="font-size:22px; color:var(--blue)"></div>
    <h2 class="pixel" id="${id}-title" style="margin-top:14px; font-size:${id === "tania" ? 56 : 64}px; line-height:1.04; min-height:${id === "tania" ? 118 : 70}px"></h2>
    <div class="panel code" id="${id}-code" style="position:relative; margin-top:22px; padding:16px 20px; font-size:24px; min-height:200px"></div>
    <div class="logos" id="${id}-logos" style="margin-top:22px">${CONTENT[id].logos.map((src) => `<img src="${src}" alt="" style="height:28px">`).join("")}</div>
  </div>
</section>`).join("")}
<section class="scene" id="s-vip">
  <div class="abs" style="left:96px; top:250px; width:888px">
    <span class="tag" id="vip-tag" style="font-size:22px"><span class="flag"></span>VIP · 20 cupos · Sujeto a aceptación</span>
    <div class="mono" id="vip-code" style="margin-top:26px; font-size:26px"></div>
    <h2 class="pixel" id="vip-title" style="margin-top:14px; font-size:84px; line-height:1.02; min-height:172px"></h2>
  </div>
  <canvas id="m-alex" class="abs" style="left:96px; top:620px; width:420px; height:520px"></canvas>
  <canvas id="m-tania" class="abs" style="left:564px; top:620px; width:420px; height:520px"></canvas>
  <div class="abs mono" id="vip-names" style="left:96px; top:1150px; width:888px; display:flex; justify-content:space-around; font-size:22px; color:var(--muted)">
    <span>alex.torrenegra</span><span>tania.zapata</span></div>
  <div class="abs" style="left:96px; top:1220px; width:888px">
    <p id="vip-sub" style="font-size:30px; color:var(--muted)"></p>
<div id="vip-price" class="panel" style="position:relative; margin-top:30px; padding:18px 24px; display:grid; gap:8px; width:fit-content">
      <span class="mono" style="font-size:32px"><span style="color:var(--red)">&gt;&gt;&gt;</span> vip<span class="dot">.</span><span class="fn">solicitar</span><span class="call">()</span></span>
      <span class="muted" style="font-size:23px">Cupos limitados · Solicítalo en aiyaiyai.io</span>
    </div>
  </div>
</section>
<section class="scene" id="s-close">
  <h1 class="abs pixel" id="close-word" style="top:420px; font-size:150px; line-height:1.02; white-space:nowrap"></h1>
  <div class="abs mono" id="close-facts" style="left:0; right:0; top:930px; text-align:center; font-size:34px; line-height:1.5"></div>
  <div class="abs" id="close-cta" style="left:0; right:0; top:1126px; display:flex; justify-content:center">
    <span class="cta" style="height:90px; font-size:35px">Conoce más en <b>aiyaiyai.io</b>${icon(ArrowRight, 34)}</span>
  </div>
  <div class="abs" id="close-foot" style="left:96px; right:96px; top:1290px; padding-top:30px; border-top:1px dashed var(--line2); display:grid; gap:24px">
    <div class="foot" style="justify-content:center"><span>Organiza</span><img src="${aiyaiyai}" style="height:30px" alt=""></div>
    <div class="foot" style="justify-content:center"><span>Con el apoyo de</span><span class="tn">${torrenegra}Torrenegra &amp; Co</span>
      <img src="${torre}" style="height:26px; filter:none" alt=""><img src="${worder}" style="height:28px" alt=""></div>
  </div>
</section>
<canvas id="wipe" width="1080" height="1920"></canvas>`,
    word: [[["bogota", "obj"]], [[".", "dot"], ["forward", "fn"], ["()", "call"]], [["summit", "obj"]]],
  },
};

// ── The page: drawing and the timeline ──────────────────────────────────────
const scriptFor = (name, L) => /* js */ `
const W = ${L.w}, H = ${L.h}, BEAT = ${60 / BPM}, BAR = ${BAR};
const T = ${JSON.stringify(T)};
const WORD = ${JSON.stringify(L.word)};
const TERM = ${JSON.stringify(TERMINAL[name])};
const CONTENT = ${JSON.stringify(Object.fromEntries(Object.entries(CONTENT).map(([k, v]) => [k, { ...v, logos: undefined }])))};
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

// Decode text: each character scrambles, then locks in, left to right.
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
// Type runs character by character, with a caret.
function typeRuns(lines, t, start, cps, caret = "caret") {
  let budget = Math.max(0, Math.floor((t - start) * cps));
  const total = lines.flat().reduce((n, [s]) => n + s.length, 0);
  const done = budget >= total;
  let placed = false;
  return lines.map((line) => {
    let html = "", lineHas = false;
    for (const [text, cls] of line) {
      const take = text.slice(0, Math.max(0, budget)); budget -= text.length;
      if (take) { html += '<span class="' + cls + '">' + esc(take) + "</span>"; lineHas = true; }
    }
    if (!placed && (budget < 0 || (done && line === lines[lines.length - 1]))) {
      placed = true;
      if (!done || blink(t)) html += '<span class="' + caret + '"></span>';
    }
    return lineHas || html ? html : "";
  }).filter((l, i, all) => l || i === 0).join("\\n");
}

// ── Ambient rain of code characters ──
const RAIN = "01{}[]<>/=+*#;:.()";
function drawRain(canvas, t, ink, head, alpha) {
  const ctx = canvas.getContext("2d");
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
      ctx.fillStyle = r === 0 ? head.replace("A", (a * 2).toFixed(3)) : ink.replace("A", a.toFixed(3));
      ctx.fillText(RAIN[Math.floor(hr(c * 31 + r, Math.floor(t * 12 + c)) * RAIN.length)], c * step + 8, y);
    }
  }
}

// ── Wipe: a sweep of code-blue cells, each carrying a glyph ──
const CELL = 48, COLS = Math.ceil(W / CELL), ROWS = Math.ceil(H / CELL);
const WIPES = [T.title, T.alex, T.tania, T.vip, T.close];
const wipeCells = Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = i % COLS, r = Math.floor(i / COLS), k = hr(i, 5);
  const axis = W < H ? r / ROWS : c / COLS;
  return { c, r, d: axis * 0.62 + hr(i, 6) * 0.38,
    fill: k < 0.8 ? "#003893" : k < 0.9 ? "#fcd116" : k < 0.95 ? "#ce1126" : "#0d0b01",
    ink: k < 0.8 ? "#9fb8ff" : k < 0.9 ? "#0d0b01" : "#fcfbf6" };
});
function drawWipe(t) {
  const canvas = $("wipe"), ctx = canvas.getContext("2d");
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

// ── ASCII portraits ──
const RAMP = " .:-=+*#%@";
async function prepareAscii(sp, size) {
  const { w: PW, h: PH, cellW, cellH } = size;
  const load = async (src) => { const i = new Image(); i.src = src; await i.decode(); return i; };
  const [img, msk] = await Promise.all([load(sp.photo), load(sp.mask)]);
  const f = sp.face, k = (0.22 * PH) / f.h;
  const sw = PW / k, sh = PH / k, sx = f.x + f.w / 2 - sw / 2, sy = f.y + f.h / 2 - (0.27 * PH) / k;
  const read = (source) => { const c = document.createElement("canvas"); c.width = PW; c.height = PH;
    const x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(source, sx, sy, sw, sh, 0, 0, PW, PH);
    return x.getImageData(0, 0, PW, PH).data; };
  const rgb = read(img), mask = read(msk);
  const n = PW * PH, lum = new Float32Array(n), alpha = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    lum[i] = (0.299 * rgb[i * 4] + 0.587 * rgb[i * 4 + 1] + 0.114 * rgb[i * 4 + 2]) / 255;
    alpha[i] = (mask[i * 4] / 255) * (rgb[i * 4 + 3] / 255);
  }
  const fx0 = Math.round(PW / 2 - (f.w * k) / 2), fy0 = Math.round(0.27 * PH - (f.h * k) / 2), fs = Math.round(f.w * k);
  const face = []; for (let y = fy0; y < fy0 + fs; y += 2) for (let x = fx0; x < fx0 + fs; x += 2) face.push(lum[y * PW + x]);
  face.sort((a, b) => a - b);
  const lo = face[Math.floor(face.length * 0.02)] * 0.6, hi = Math.min(1, face[Math.floor(face.length * 0.985)] * 1.08);
  const tone = (l) => Math.pow(clamp((l - lo) / (hi - lo)), 1.05);
  // The resolved photo: ink-navy duotone, masked.
  const photo = document.createElement("canvas"); photo.width = PW; photo.height = PH;
  const pc = photo.getContext("2d"), pd = pc.createImageData(PW, PH);
  for (let i = 0; i < n; i++) { const v = tone(lum[i]);
    pd.data[i * 4] = 12 + 232 * v; pd.data[i * 4 + 1] = 17 + 223 * v; pd.data[i * 4 + 2] = 38 + 191 * v; pd.data[i * 4 + 3] = alpha[i] * 255; }
  pc.putImageData(pd, 0, 0);
  const bottom = Math.min(PH, (img.naturalHeight - sy) * k);
  const cells = [];
  for (let cy = 0; cy + cellH <= PH; cy += cellH) for (let cx = 0; cx + cellW <= PW; cx += cellW) {
    let sl = 0, sa = 0, cnt = 0;
    for (let y = cy; y < cy + cellH; y += 2) for (let x = cx; x < cx + cellW; x += 2) { const i = y * PW + x; sl += tone(lum[i]) * alpha[i]; sa += alpha[i]; cnt++; }
    const cover = sa / cnt; if (cover < 0.3) continue;
    const v = sl / sa;
    // Thin out toward the bottom of the photo so the body trails off.
    const fade = clamp(((cy + cellH / 2) / bottom - 0.7) / 0.28);
    if (hr(cx * 7 + 1, cy * 13 + 3) < fade) continue;
    // Covered cells always get at least a ":" so light clothing keeps its shape.
    const ch = RAMP[2 + Math.min(7, Math.floor((1 - v) * 8))];
    const kk = hr(cx, cy);
    cells.push({ x: cx, y: cy, ch, lock: (cy / PH) * 0.55 + hr(cy, cx) * 0.45,
      color: kk < 0.012 ? "#ce1126" : kk < 0.04 ? "#e0b400" : kk < 0.07 ? "#003893" : "#0c1126" });
  }
  return { photo, cells, size };
}
const off = document.createElement("canvas");
// p: 0→1 decode; scan: 0→1 how far the photo has replaced the ASCII; glitch: px.
function drawAscii(canvas, data, t, p, scan, glitch) {
  const { w: PW, h: PH, cellW, cellH, font } = data.size;
  if (canvas.width !== PW) { canvas.width = PW; canvas.height = PH; }
  if (off.width !== PW || off.height !== PH) { off.width = PW; off.height = PH; }
  const ctx = off.getContext("2d"); ctx.clearRect(0, 0, PW, PH);
  const scanY = scan * PH * 0.66;
  if (scanY > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, PW, scanY); ctx.clip(); ctx.drawImage(data.photo, 0, 0); ctx.restore(); }
  ctx.font = "500 " + font + "px GeistMono"; ctx.textBaseline = "top";
  for (const [i, c] of data.cells.entries()) {
    if (c.y + cellH <= scanY) continue;
    const start = c.lock * 0.7;
    if (p < start * 0.6) continue;
    const locked = p >= start + 0.3;
    const near = scanY > 0 && c.y < scanY + cellH * 2;
    ctx.fillStyle = near ? "#003893" : c.color;
    ctx.globalAlpha = locked ? 1 : 0.45;
    ctx.fillText(locked ? c.ch : SCR[Math.floor(hr(i, Math.floor(t * 20)) * SCR.length)], c.x, c.y);
  }
  ctx.globalAlpha = 1;
  if (scanY > 0 && scan < 1) { ctx.fillStyle = "#003893"; ctx.fillRect(0, scanY - 1, PW, 2); }
  const out = canvas.getContext("2d"); out.clearRect(0, 0, PW, PH);
  if (!glitch) { out.drawImage(off, 0, 0); return; }
  // Glitch: horizontal slices shifted for a frame or two on the downbeat.
  const slices = 9;
  for (let s = 0; s < slices; s++) {
    const y0 = Math.floor((s / slices) * PH), hgt = Math.ceil(PH / slices);
    const dx = (hr(s, Math.floor(t * 30)) - 0.5) * 2 * glitch;
    out.drawImage(off, 0, y0, PW, hgt, dx, y0, PW, hgt);
  }
}

const ascii = {};
const STRIPE = $("stripe").offsetHeight;
const SCENES = [["s1", 0, T.title], ["s2", T.title, T.alex], ["s-alex", T.alex, T.tania], ["s-tania", T.tania, T.vip],
  ["s-vip", T.vip, T.close], ["s-close", T.close, 999]];

window.render = (t) => {
  for (const [id, a, b] of SCENES) $(id).style.visibility = t >= a && t < b ? "visible" : "hidden";
  const dark = t < T.title;
  $("dark").style.opacity = dark ? 1 : 0;
  document.querySelectorAll(".chrome").forEach((el) => (el.style.opacity = dark || t >= T.close ? (el.id === "stripe" ? 1 : 0) : 1));
  if (t < T.title) $("stripe").style.opacity = 0;
  drawRain($("rain"), t, "rgba(13,11,1,A)", "rgba(0,56,147,A)", dark ? 0 : t >= T.close ? 0.05 : 0.09);
  drawRain($("rainDark"), t, "rgba(233,228,212,A)", "rgba(252,209,22,A)", dark ? 0.16 : 0);
  // The flag stripe kicks on every beat, harder on the downbeat.
  const ph = (t / BEAT) % 1, down = Math.floor(t / BEAT + 1e-6) % 4 === 0;
  $("stripe").style.height = Math.round(STRIPE * (1 + (down ? 1.4 : 0.7) * Math.exp(-ph * 6))) + "px";
  const downbeat = (t % BAR) < 0.07;

  // 1 · Terminal
  if (t < T.title) {
    const lines = TERM, typed = lines.slice(0, 3), outputs = lines.slice(3);
    let html = typeRuns(typed, t, 0.25, 30);
    const shown = outputs.filter((_, i) => t >= 1.95 + i * 0.3);
    if (shown.length) html += "\\n" + shown.map((l) => l.map(([s, c]) => '<span class="' + c + '">' + esc(s) + "</span>").join("")).join("\\n");
    $("term").innerHTML = html;
    const fill = Math.round(24 * out3(prog(t, 2.5, 3.35)));
    const segs = Array.from({ length: 24 }, (_, i) => i < fill ? '<b class="' + (i < 12 ? "y" : i < 18 ? "bl" : "r") + '">█</b>' : "░").join("");
    $("bar").innerHTML = t >= 2.4 ? "cargando summit  [" + segs + "]  " + Math.round((fill / 24) * 100) + "%" : "";
  }
  // 2 · Title decodes
  if (t >= T.title && t < T.alex) {
    const a = T.title;
    $("s2-tagtext").innerHTML = decodeText("Próximamente · Bogotá, Colombia", t, a + 0.15, 0.7, 3);
    pop($("s2-tag"), t, a + 0.1, 12, "-50%");
    const word = $("s2-word");
    const lines = decodeRuns(WORD, t, a + 0.2, 1.4, 5);
    word.innerHTML = lines.map((l, i) => '<span style="display:block">' + l + (i === lines.length - 1 ? '<span class="cursor"' + (blink(t) ? "" : ' style="opacity:0"') + "></span>" : "") + "</span>").join("");
    $("s2-lead").innerHTML = decodeText("IA, empresas y lo que viene.", t, a + 1.3, 0.8, 9);
    $("s2-meta").innerHTML = decodeText("19.11.2026 · 10 a. m. – 4 p. m. · Bogotá, Colombia", t, a + 1.7, 0.9, 11);
  }
  // 3, 4 · Speakers
  for (const id of ["alex", "tania"]) {
    const a = id === "alex" ? T.alex : T.tania, b = id === "alex" ? T.tania : T.vip;
    if (t < a || t >= b) continue;
    const c = CONTENT[id];
    const glitch = downbeat && t > a + 0.3 ? 14 : 0;
    drawAscii($("p-" + id), ascii[id], t, out3(prog(t, a, a + 1.6)), out3(prog(t, a + 2.3, a + 3.3)), glitch);
    $(id + "-index").innerHTML = decodeText(c.index + "  ·  " + c.kind, t, a + 0.15, 0.6, 13);
    $(id + "-title").innerHTML = decodeText(c.title, t, a + 0.3, 1.1, 17);
    $(id + "-code").innerHTML = typeRuns(c.code, t, a + 1.0, 48);
    pop($(id + "-code"), t, a + 0.95, 18);
    pop($(id + "-logos"), t, a + 2.6, 14);
    $(id + "-copy").style.opacity = 1 - prog(t, b - 0.3, b);
  }
  // 5 · VIP: the dinner with both
  if (t >= T.vip && t < T.close) {
    const a = T.vip;
    pop($("vip-tag"), t, a + 0.05, 14);
    $("vip-code").innerHTML = typeRuns([[["vip", "obj"], [".", "dot"], ["cena", "fn"], ["(", "call"], ["alex, tania", "obj"], [")", "call"]]], t, a + 0.2, 40);
    $("vip-title").innerHTML = decodeRuns([[["La conversación", ""]], [["sigue ", ""], ["en la mesa.", "blue"]]], t, a + 0.35, 1.0, 21)
      .map((l) => '<span style="display:block">' + l + "</span>").join("");
    $("vip-sub").innerHTML = decodeText("Cena privada con Alex Torrenegra y Tania Zapata.", t, a + 0.9, 0.9, 23);
    pop($("vip-price"), t, a + 1.1, 16);
    drawAscii($("m-alex"), ascii["m-alex"], t, out3(prog(t, a + 0.1, a + 1.3)), out3(prog(t, a + 1.6, a + 2.5)), downbeat && t > a + 0.3 ? 8 : 0);
    drawAscii($("m-tania"), ascii["m-tania"], t, out3(prog(t, a + 0.3, a + 1.5)), out3(prog(t, a + 1.75, a + 2.65)), downbeat && t > a + 0.3 ? 8 : 0);
    pop($("vip-names"), t, a + 1.4, 10);
  }
  // 6 · Close
  if (t >= T.close) {
    const a = T.close;
    const lines = decodeRuns(WORD, t, a + 0.1, 1.0, 29);
    $("close-word").innerHTML = lines.map((l, i) => '<span style="display:block">' + l + (i === lines.length - 1 ? '<span class="cursor"' + (blink(t) ? "" : ' style="opacity:0"') + "></span>" : "") + "</span>").join("");
    $("close-facts").innerHTML = (W > H
      ? decodeText("19.11.2026 · 10 a. m. a 4 p. m. · Bogotá, Colombia", t, a + 0.9, 0.8, 31)
      : ["19.11.2026", "10 a. m. a 4 p. m.", "Bogotá, Colombia"].map((s, i) => decodeText(s, t, a + 0.9 + i * 0.1, 0.7, 31 + i)).join("<br>"));
    pop($("close-cta"), t, a + 1.35, 26); pop($("close-foot"), t, a + 1.7, 14);
  }
  drawWipe(t);
};

window.prepare = async (people) => {
  await document.fonts.load("500 18px GeistMono");
  // Centre the wordmarks on their final width so decoding never shifts them.
  for (const id of ["s2-word", "close-word"]) {
    const el = $(id); el.innerHTML = WORD.map((l) => '<span style="display:block">' + l.map(([s, c]) => '<span class="' + c + '">' + s + "</span>").join("") + '<span class="cursor"></span></span>').join("");
    el.style.left = Math.round((W - el.offsetWidth) / 2) + "px";
  }
  for (const p of people) {
    ascii[p.id] = await prepareAscii(p, ${JSON.stringify(L.portrait)});
    ascii["m-" + p.id] = await prepareAscii(p, ${JSON.stringify(L.mini)});
  }
};`;

const args = process.argv.slice(2);
const names = Object.keys(LAYOUTS).filter((n) => !args.length || args.includes(n));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
  for (const name of names) {
    const L = LAYOUTS[name];
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${css}
html, body { width: ${L.w}px; height: ${L.h}px; }</style></head><body>${L.body}<script>${scriptFor(name, L)}</script></body></html>`;
    const page = await browser.newPage();
    await page.setViewport({ width: L.w, height: L.h, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate((people) => window.prepare(people), speakers.map(({ id, photo, mask, face }) => ({ id, photo, mask, face })));
    if (process.env.STILLS) {
      const dir = process.env.STILLS_DIR || "marketing";
      await mkdir(dir, { recursive: true });
      for (const t of process.env.STILLS.split(",").map(Number)) {
        await page.evaluate((t) => window.render(t), t);
        await writeFile(`${dir}/ascii-${name}-${t.toFixed(2)}.png`, await page.screenshot({ type: "png" }));
      }
      console.log(`${name} stills → ${dir}`);
      await page.close();
      continue;
    }
    const out = `marketing/bogota-forward-ascii${name === "vertical" ? "-vertical" : ""}${MUSIC ? "-music" : ""}${process.env.OUT_SUFFIX || ""}.mp4`;
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
