// Generates marketing/bogota-forward-ascii-cover.png (1080×1080, rendered at
// 2×): the magazine-cover square with the speakers redrawn as ASCII.
// The portraits use glyph density for tone (glyphs ranked by how much ink
// they put down in Geist Mono, measured in the page) and Sobel edges for
// contour: where an edge is strong, a directional glyph (| / - \) draws it, so
// faces stay recognisable instead of turning into texture.
// Photos and masks live in marketing/photos/ (git-ignored).
//   npm run promo:ascii-cover
//   GALLERY=1 npm run promo:ascii-cover   → marketing/ascii-gallery.png, every
//                                            candidate photo side by side
//   npm run promo:ascii-horizontal        → marketing/bogota-forward-ascii-horizontal.{png,jpg}
//                                            (1200×627 at 2×, for LinkedIn)
//   npm run promo:ascii-lineup            → marketing/bogota-forward-ascii-lineup.{png,jpg}
//                                            every speaker and session, all in ASCII
//   npm run promo:ascii-dinner            → marketing/bogota-forward-ascii-dinner.{png,jpg}
//                                            the private dinner with Alex and Tania (square)
import { readFile, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArrowRight } from "lucide-react";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const CHROME =
  process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const file = (path) => readFile(new URL(path, root));
const dataUrl = async (path, type) => `data:${type};base64,${(await file(path)).toString("base64")}`;
const icon = (Icon, size) => renderToStaticMarkup(h(Icon, { size, strokeWidth: 2.2, "aria-hidden": true }));
const cleanMask = async (path) =>
  `data:image/png;base64,${(await sharp(await file(path)).median(9).png().toBuffer()).toString("base64")}`;

// Every photo we have of each speaker; face boxes from Apple's Vision framework.
const CANDIDATES = {
  "alex-studio": { photo: "marketing/photos/alex-torrenegra-studio.jpg", mask: "marketing/photos/masks/alex-torrenegra-studio.png", face: { x: 1220, y: 515, w: 856, h: 856 } },
  "alex-site": { photo: "public/images/speakers/alexander-torrenegra.webp", mask: "marketing/masks/alexander-torrenegra.png", face: { x: 315, y: 167, w: 195, h: 195 } },
  "tania-editorial": { photo: "marketing/photos/tania-zapata-editorial.jpg", mask: "marketing/photos/masks/tania-zapata-editorial.png", face: { x: 404, y: 178, w: 150, h: 150 } },
  "tania-site": { photo: "public/images/speakers/tania-zapata.webp", mask: "marketing/masks/tania-zapata.png", face: { x: 361, y: 175, w: 248, h: 248 } },
  "alan-fireside": { photo: "marketing/photos/alan-arguello-fireside-crop.jpg", mask: "marketing/photos/masks/alan-arguello-fireside-crop.png", face: { x: 692, y: 543, w: 336, h: 336 }, clipX: 1330 },
  "alan-site": { photo: "public/images/speakers/alan-arguello-sf.webp", mask: "marketing/masks/alan-arguello-sf.png", face: { x: 343, y: 191, w: 230, h: 230 } },
  "alan-glasses": { photo: "marketing/photos/alan-arguello-glasses.png", mask: "marketing/photos/masks/alan-arguello-glasses.png", face: { x: 100, y: 134, w: 242, h: 242 } },
  "tania-stairs": { photo: "marketing/photos/tania-zapata-stairs.png", mask: "marketing/photos/masks/tania-zapata-stairs.png", face: { x: 195, y: 82, w: 71, h: 71 } },
  "catalina-site": { photo: "public/images/colombia-summit/catalina-morales.webp", mask: "marketing/masks/catalina-morales.png", face: { x: 87, y: 89, w: 131, h: 131 } },
  "jp-site": { photo: "public/images/colombia-summit/juan-pablo-rodriguez.webp", mask: "marketing/masks/juan-pablo-rodriguez.png", face: { x: 192, y: 227, w: 184, h: 184 } },
};
const type = (path) => (path.endsWith(".png") ? "image/png" : path.endsWith(".webp") ? "image/webp" : "image/jpeg");
const load = async (id) => {
  const c = CANDIDATES[id];
  return { id, face: c.face, clipX: c.clipX || 0, photo: await dataUrl(c.photo, type(c.photo)), mask: await cleanMask(c.mask) };
};

const fonts = "node_modules/geist/dist/fonts/";
const [sans, pixel, mono, aiyaiyai] = await Promise.all([
  dataUrl(`${fonts}geist-sans/Geist-Variable.woff2`, "font/woff2"),
  dataUrl(`${fonts}geist-pixel/GeistPixel-Square.woff2`, "font/woff2"),
  dataUrl(`${fonts}geist-mono/GeistMono-Variable.woff2`, "font/woff2"),
  dataUrl("public/images/colombia-summit/aiyaiyai.png", "image/png"),
]);

// ── The ASCII engine (runs in the page) ─────────────────────────────────────
const engine = /* js */ `
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const hr = (a, b) => { let x = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35);
  x ^= x >>> 15; x = Math.imul(x, 0x2c1b3c6d); x ^= x >>> 12; return (x >>> 0) / 4294967296; };
// Rank glyphs by the ink they leave in Geist Mono and keep an even ramp.
function buildRamp(levels = 18) {
  const set = " .'\`,:;-~^=+*!ilrcvxnuozsaeJCLYUXZ0OQmwqpdbkhAMW#%&8@";
  const c = document.createElement("canvas"); c.width = 40; c.height = 60;
  const x = c.getContext("2d", { willReadFrequently: true });
  const ink = [...new Set(set)].map((ch) => {
    x.clearRect(0, 0, 40, 60); x.fillStyle = "#000"; x.font = "500 40px GeistMono"; x.textBaseline = "top"; x.fillText(ch, 4, 4);
    const d = x.getImageData(0, 0, 40, 60).data; let s = 0; for (let i = 3; i < d.length; i += 4) s += d[i]; return [ch, s];
  }).sort((a, b) => a[1] - b[1]);
  const max = ink[ink.length - 1][1];
  const ramp = [];
  for (let l = 0; l < levels; l++) {
    const target = (l / (levels - 1)) * max;
    ramp.push(ink.reduce((best, cur) => (Math.abs(cur[1] - target) < Math.abs(best[1] - target) ? cur : best))[0]);
  }
  return ramp;
}
let RAMP;
const loadImg = async (src) => { const i = new Image(); i.src = src; await i.decode(); return i; };
// Draw one speaker as ASCII into canvas (CSS size W×H).
async function asciiPortrait(canvas, sp, o) {
  RAMP = RAMP || buildRamp();
  const dpr = window.devicePixelRatio, W = o.W, H = o.H;
  const cols = Math.floor(W / o.cellW), rows = Math.floor(H / o.cellH), SS = 4;
  const [img, msk] = await Promise.all([loadImg(sp.photo), loadImg(sp.mask)]);
  const f = sp.face, k = o.faceH / f.h;
  const sw = W / k, sh = H / k, sx = f.x + f.w / 2 - sw / 2, sy = f.y + f.h / 2 - (o.faceY * H) / k;
  const GW = cols * SS, GH = rows * SS;
  const read = (source) => { const c = document.createElement("canvas"); c.width = GW; c.height = GH;
    const x = c.getContext("2d", { willReadFrequently: true }); x.imageSmoothingQuality = "high";
    x.drawImage(source, sx, sy, sw, sh, 0, 0, GW, GH); return x.getImageData(0, 0, GW, GH).data; };
  const rgb = read(img), mask = read(msk);
  const n = GW * GH, lum = new Float32Array(n), alpha = new Float32Array(n);
  const clipGX = sp.clipX ? ((sp.clipX - sx) / sw) * GW : Infinity;
  for (let i = 0; i < n; i++) {
    lum[i] = (0.299 * rgb[i * 4] + 0.587 * rgb[i * 4 + 1] + 0.114 * rgb[i * 4 + 2]) / 255;
    alpha[i] = (i % GW) >= clipGX ? 0 : (mask[i * 4] / 255) * (rgb[i * 4 + 3] / 255);
  }
  // Levels from the face so every photo lands on the same tonal range.
  const fx0 = Math.round(GW / 2 - (f.w * k * GW) / W / 2), fy0 = Math.round(o.faceY * GH - (f.h * k * GH) / H / 2);
  const fs = Math.round((f.w * k * GW) / W), face = [];
  for (let y = fy0; y < fy0 + fs; y++) for (let x = fx0; x < fx0 + fs; x++) if (y >= 0 && y < GH && x >= 0 && x < GW) face.push(lum[y * GW + x]);
  face.sort((a, b) => a - b);
  const lo = face[Math.floor(face.length * 0.03)], hi = face[Math.floor(face.length * 0.97)];
  const tone = (l) => Math.pow(clamp((l - lo) / (hi - lo)), o.gamma || 0.95);
  // Sobel on the supersampled grid; the structure tensor per cell gives edge
  // strength and orientation.
  // Local contrast (unsharp mask on a box blur) so eyes, brows and mouth read.
  const T0 = new Float32Array(n); for (let i = 0; i < n; i++) T0[i] = tone(lum[i]);
  const R = Math.max(2, Math.round(SS * (o.blur ?? 2.5)));
  const tmp = new Float32Array(n), blur = new Float32Array(n);
  for (let y = 0; y < GH; y++) { let acc = 0; for (let x = -R; x <= R; x++) acc += T0[y * GW + clamp(x, 0, GW - 1)];
    for (let x = 0; x < GW; x++) { tmp[y * GW + x] = acc / (2 * R + 1); acc += T0[y * GW + Math.min(GW - 1, x + R + 1)] - T0[y * GW + Math.max(0, x - R)]; } }
  for (let x = 0; x < GW; x++) { let acc = 0; for (let y = -R; y <= R; y++) acc += tmp[clamp(y, 0, GH - 1) * GW + x];
    for (let y = 0; y < GH; y++) { blur[y * GW + x] = acc / (2 * R + 1); acc += tmp[Math.min(GH - 1, y + R + 1) * GW + x] - tmp[Math.max(0, y - R) * GW + x]; } }
  const L = new Float32Array(n);
  for (let i = 0; i < n; i++) L[i] = clamp(T0[i] + (o.local ?? 0.9) * (T0[i] - blur[i]));
  const cells = [];
  let maxE = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    let sl = 0, sa = 0, gxx = 0, gyy = 0, gxy = 0;
    for (let y = r * SS; y < (r + 1) * SS; y++) for (let x = c * SS; x < (c + 1) * SS; x++) {
      const i = y * GW + x, a = alpha[i]; sl += L[i] * a; sa += a;
      if (x > 0 && y > 0 && x < GW - 1 && y < GH - 1) {
        const p = (dx, dy) => L[i + dy * GW + dx];
        const gx = p(1, -1) + 2 * p(1, 0) + p(1, 1) - p(-1, -1) - 2 * p(-1, 0) - p(-1, 1);
        const gy = p(-1, 1) + 2 * p(0, 1) + p(1, 1) - p(-1, -1) - 2 * p(0, -1) - p(1, -1);
        gxx += gx * gx * a; gyy += gy * gy * a; gxy += gx * gy * a;
      }
    }
    const cover = sa / (SS * SS), v = sa ? sl / sa : 1, e = Math.sqrt(gxx + gyy) / (SS * SS);
    if (cover > 0.45) maxE = Math.max(maxE, e);
    cells.push({ r, c, cover, v, e, ang: 0.5 * Math.atan2(2 * gxy, gxx - gyy) });
  }
  const ctx = canvas.getContext("2d");
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
  ctx.font = "500 " + o.font + "px GeistMono"; ctx.textBaseline = "top";
  // Where the source photo ends, the figure dissolves glyph by glyph instead
  // of stopping on a hard line.
  const photoBottomRow = Math.min(((img.naturalHeight - sy) * k) / o.cellH, rows - (o.bottomMargin ?? 0) / o.cellH);
  const photoLeftCol = Math.max(0, (-sx * k) / o.cellW), photoRightCol = Math.min(cols, ((img.naturalWidth - sx) * k) / o.cellW);
  const fadeRows = o.fadeRows ?? 14, fadeCols = o.fadeCols ?? 10;
  const keep = (cell) => {
    if (cell.cover < 0.4) return false;
    const u = Math.max((cell.r - (photoBottomRow - fadeRows)) / fadeRows,
      sp.clipX ? 0 : (photoLeftCol + fadeCols - cell.c) / fadeCols,
      (cell.c - (photoRightCol - fadeCols)) / fadeCols);
    return !(u > 0 && hr(cell.c, cell.r) < u);
  };
  // Paper behind the figure, so a figure in front hides what is behind it.
  if (o.paper) {
    ctx.fillStyle = o.paper;
    for (const cell of cells) if (keep(cell)) ctx.fillRect(cell.c * o.cellW - 0.5, cell.r * o.cellH - 0.5, o.cellW + 1, o.cellH + 1);
  }
  for (const cell of cells) {
    if (!keep(cell)) continue;
    // On dark, light is ink: bright skin gets the dense glyphs.
    const chinY = o.faceY * H + 0.7 * o.faceH, cy = (cell.r + 0.5) * o.cellH;
    const dim = o.dark && cy > chinY ? Math.max(o.bodyLight ?? 0.5, 1 - (cy - chinY) / (H * 0.45)) : 1;
    const d = o.dark ? cell.v * dim : 1 - cell.v;
    let ch = RAMP[Math.round(d * (RAMP.length - 1))];
    const strong = cell.e > maxE * (o.edge ?? 0.42);
    if (strong) {
      const a = (cell.ang * 180) / Math.PI;
      ch = Math.abs(a) < 22.5 ? "|" : Math.abs(a) > 67.5 ? "-" : a > 0 ? "/" : "\\\\";
    }
    if (ch === " ") ch = cell.cover > 0.8 ? "." : " ";
    if (ch === " ") continue;
    const k2 = hr(cell.r * 31 + 7, cell.c);
    if (o.dark) {
      // Spotlight: below the chin the figure dims, so the face leads.
      const chin = o.faceY * H + 0.7 * o.faceH, y = (cell.r + 0.5) * o.cellH;
      const lit = y > chin ? Math.max(o.bodyLight ?? 0.5, 1 - (y - chin) / (H * 0.45)) : 1;
      const b = Math.min(255, Math.round((84 + 171 * Math.pow(cell.v, 0.7)) * lit * (o.lift || 1)));
      // Accent glyphs and the green/blue tint of the light are tunable per format.
      const A = o.accents || ["#ff5a6a", "#fcd116", "#8fb0ff"], T = o.tint || [0.97, 0.88];
      ctx.fillStyle = k2 < 0.01 ? A[0] : k2 < 0.03 ? A[1] : k2 < 0.05 ? A[2]
        : strong ? (o.edgeColor || "#ffffff") : "rgb(" + b + "," + Math.round(b * T[0]) + "," + Math.round(b * T[1]) + ")";
      ctx.fillText(ch, cell.c * o.cellW, cell.r * o.cellH);
      continue;
    }
    const shade = Math.round(13 + (o.shadeRange ?? 120) * Math.pow(cell.v, 1.6));
    ctx.fillStyle = k2 < 0.012 ? "#ce1126" : k2 < 0.03 ? "#d9a800" : k2 < 0.05 ? "#003893"
      : strong ? "#0b1230" : "rgb(" + Math.round(shade * 0.82) + "," + Math.round(shade * 0.86) + "," + Math.min(255, Math.round(shade * 1.05 + 14)) + ")";
    ctx.fillText(ch, cell.c * o.cellW, cell.r * o.cellH);
  }
}`;

const typeEngine = /* js */ `
// Type set as glyphs: draw the text at full size, then give each cell a
// glyph by how much ink falls in it (dense inside strokes, light on edges),
// in its segment's colour.
function asciiText(canvas, segments, o) {
  const dpr = window.devicePixelRatio, W = canvas.clientWidth, H = canvas.clientHeight;
  const cols = Math.floor(W / o.cellW), rows = Math.floor(H / o.cellH);
  const g = document.createElement("canvas"); g.width = W; g.height = H;
  const x = g.getContext("2d", { willReadFrequently: true });
  x.font = o.weight + " 100px " + o.family; x.textBaseline = "alphabetic";
  const total = segments.reduce((a, [t]) => a + x.measureText(t).width, 0);
  const size = o.size || Math.min((100 * W * 0.99) / total, H * 1.15);
  x.font = o.weight + " " + size + "px " + o.family;
  let cx = 0;
  const m = x.measureText("bdfhkl"), base = (H + m.actualBoundingBoxAscent) / 2;
  for (const [t, color] of segments) { x.fillStyle = color; x.fillText(t, cx, base); cx += x.measureText(t).width; }
  const d = x.getImageData(0, 0, W, H).data;
  const ctx = canvas.getContext("2d");
  canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // A faint wash of the letterforms under the glyphs, so the word reads at
  // feed size while staying made of characters.
  if (o.wash) { ctx.globalAlpha = o.wash; ctx.drawImage(g, 0, 0, W, H); ctx.globalAlpha = 1; }
  ctx.font = "700 " + o.font + "px GeistMono"; ctx.textBaseline = "top";
  const dense = "#@&%8", light = "+*=";
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    let a = 0, rgb = [0, 0, 0], n = 0;
    for (let yy = Math.floor(r * o.cellH); yy < (r + 1) * o.cellH; yy++) for (let xx = Math.floor(c * o.cellW); xx < (c + 1) * o.cellW; xx++) {
      const i = (yy * W + xx) * 4; n++; a += d[i + 3];
      if (d[i + 3] > 128) { rgb[0] = d[i]; rgb[1] = d[i + 1]; rgb[2] = d[i + 2]; }
    }
    a /= n * 255;
    if (a < 0.28) { if (o.dust && hr(c, r) < 0.01) { ctx.fillStyle = "rgba(143,176,255,0.3)"; ctx.fillText(".", c * o.cellW, r * o.cellH); } continue; }
    const ch = a > 0.55 ? dense[Math.floor(hr(r, c) * dense.length)] : light[Math.floor(hr(c, r) * light.length)];
    ctx.fillStyle = "rgb(" + rgb.join(",") + ")";
    ctx.fillText(ch, c * o.cellW, r * o.cellH);
  }
  return size;
}
`;

const css = /* css */ `
@font-face { font-family: Geist; src: url(${sans}) format("woff2"); font-weight: 100 900; }
@font-face { font-family: GeistPixel; src: url(${pixel}) format("woff2"); font-weight: 500; }
@font-face { font-family: GeistMono; src: url(${mono}) format("woff2"); font-weight: 100 900; }
:root { --bg: #fcfbf6; --ink: #0d0b01; --muted: #6d685a; --subtle: #9b9584; --line: #d8d2c1; --line2: #b5ae99;
  --blue: #003893; --tint: #e3e9f6; --yellow: #fcd116; --red: #ce1126;
  --flag: linear-gradient(var(--yellow) 0 50%, var(--blue) 50% 75%, var(--red) 75%);
  --flag-h: linear-gradient(90deg, var(--yellow) 0 50%, var(--blue) 50% 75%, var(--red) 75%); }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { position: relative; overflow: hidden; background: var(--bg); color: var(--ink);
  font: 400 20px/1.3 Geist, sans-serif; letter-spacing: -0.01em; -webkit-font-smoothing: antialiased; }
.abs { position: absolute; }
canvas { display: block; }
.pixel { font-family: GeistPixel, GeistMono, monospace; font-weight: 500; }
.mono { font-family: GeistMono, monospace; }
`;

// ── The navy "screen" rendering the speakers in ASCII, shared by the cover
// and the horizontal; s scales its chrome (1 = the 1080 cover).
const NAVY = "#0a1430";
const screenCss = (SCREEN, s = 1) => /* css */ `
.rail { position: absolute; top: 0; bottom: 0; width: 1px;
  background: repeating-linear-gradient(to bottom, var(--line) 0 5px, transparent 5px 10px); }
.flag { display: inline-block; width: 1.05em; height: 0.7em; background: var(--flag); box-shadow: 0 0 0 1px rgb(13 11 1 / 0.1); }
.tag { display: inline-flex; align-items: center; gap: 0.6em; padding: 0.35em 0.7em; border: 1px dashed var(--line2);
  background: var(--bg); color: var(--muted); white-space: nowrap; }
.dot { color: var(--subtle); } .fn { color: var(--blue); } .call { color: var(--red); }
.cursor { display: inline-block; width: 0.5em; height: 0.8em; margin-left: 0.08em; vertical-align: -0.04em;
  background: var(--yellow); box-shadow: inset 0 0 0 1px rgb(13 11 1 / 0.12); }
.screen { position: absolute; left: ${SCREEN.x}px; top: ${SCREEN.y}px; width: ${SCREEN.w}px; height: ${SCREEN.h}px; overflow: hidden;
  background: radial-gradient(ellipse 70% 55% at 50% 38%, #10204a, ${NAVY} 72%); }
.screen::after { content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 8;
  background: repeating-linear-gradient(to bottom, rgb(255 255 255 / 0.025) 0 1px, transparent 1px 3px); }
.corner { position: absolute; width: ${Math.round(7 * s)}px; height: ${Math.round(7 * s)}px; background: var(--yellow); z-index: 9; }
.bar { position: absolute; left: 0; right: 0; top: 0; height: ${46 * s}px; display: flex; align-items: center; gap: ${12 * s}px; padding: 0 ${18 * s}px;
  border-bottom: 1px dashed rgb(255 255 255 / 0.14); font: 400 ${15 * s}px GeistMono, monospace; color: #9aa6c8; z-index: 9; }
.bar .p { color: var(--yellow); } .bar .k { color: #ff6b7a; } .bar .f { color: #8fb0ff; } .bar .s { color: #e8e2cf; }
.names { position: absolute; left: 0; right: 0; bottom: 0; height: ${74 * s}px; display: grid; grid-template-columns: repeat(3, 1fr);
  border-top: 1px dashed rgb(255 255 255 / 0.14); background: rgb(10 20 48 / 0.92); z-index: 9; }
.names > div { display: grid; align-content: center; justify-items: center; gap: ${4 * s}px; text-align: center; }
.names > div + div { border-left: 1px dashed rgb(255 255 255 / 0.12); }
.names b { font-weight: 560; font-size: ${20 * s}px; letter-spacing: -0.02em; color: #f6f2e6; }
.names span { font: 400 ${13 * s}px GeistMono, monospace; color: #9aa6c8; }
.cta { display: flex; align-items: center; height: ${62 * s}px; padding: 0 ${20 * s}px; background: var(--blue); color: #fff; }
.cta b { font-weight: 400; color: var(--yellow); font-family: GeistMono, monospace; }
`;
const screenHtml = (SCREEN, people, top, H, s = 1) => {
  const c = Math.round(7 * s);
  return `
<div class="screen">
  <div class="bar"><span class="p">&gt;&gt;&gt;</span><span><span class="s">speakers</span><span>.</span><span class="f">render</span><span class="k">(</span><span class="s">ascii</span>=<span class="k">True</span><span class="k">)</span></span>
    <span style="margin-left:auto">3 / 3 · ok</span></div>
  ${people.map((p) => `<canvas id="c-${p.id}" class="abs" style="left:${p.cx - p.w / 2 - SCREEN.x}px; top:${top - SCREEN.y}px; width:${p.w}px; height:${H}px; z-index:${p.z}"></canvas>`).join("")}
  <div class="names">${people.map((p) => `<div><b>${p.name}</b><span>${p.session}</span></div>`).join("")}</div>
</div>
<div class="corner" style="left:${SCREEN.x - (c - 1) / 2}px; top:${SCREEN.y - (c - 1) / 2}px"></div>
<div class="corner" style="left:${SCREEN.x + SCREEN.w - (c + 1) / 2}px; top:${SCREEN.y + SCREEN.h - (c + 1) / 2}px"></div>`;
};
const drawPortraits = async (page, people, top, H, s = 1) => {
  for (const p of people)
    await page.evaluate((p, H, top, s) => asciiPortrait(document.getElementById("c-" + p.id), p,
      { W: p.w, H, faceH: p.faceH, faceY: (p.cy - top) / H, cellW: 3.2 * s, cellH: 5.4 * s, font: 5.4 * s, edge: 0.6,
        dark: true, gamma: 0.95, bodyLight: 0.2, paper: "#0b1633", fadeRows: 30, fadeCols: 8, bottomMargin: 30 * s, local: 1.1 }), p, H, top, s);
};

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
  const page = await browser.newPage();
  if (process.env.GALLERY) {
    const ids = Object.keys(CANDIDATES);
    const people = await Promise.all(ids.map(load));
    const cellW = 480, cellH = 640, perRow = 4, rowsN = Math.ceil(ids.length / perRow);
    await page.setViewport({ width: cellW * perRow, height: cellH * rowsN, deviceScaleFactor: 2 });
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css}
      html,body{width:${cellW * perRow}px;height:${cellH * rowsN}px} ${process.env.DARK ? "body{background:#0a1430;color:#fcfbf6}" : ""}</style></head><body>
      ${ids.map((id, i) => `<canvas id="c-${id}" class="abs" style="left:${(i % perRow) * cellW}px; top:${Math.floor(i / perRow) * cellH}px; width:${cellW}px; height:${cellH - 30}px"></canvas>
      <div class="abs mono" style="left:${(i % perRow) * cellW + 12}px; top:${Math.floor(i / perRow) * cellH + cellH - 28}px; font-size:15px">${id}</div>`).join("")}
      <script>${engine}</script></body></html>`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.load("500 20px GeistMono"));
    const dark = !!process.env.DARK;
    for (const p of people)
      await page.evaluate((p, W, H, dark) => asciiPortrait(document.getElementById("c-" + p.id), p,
        { W, H, faceH: 230, faceY: 0.34, cellW: 4.2, cellH: 7, font: 7, edge: 0.62, local: 0.9, dark: dark, gamma: dark ? 1.0 : 0.95 }), p, cellW, cellH - 30, dark);
    await writeFile(new URL("marketing/ascii-gallery.png", root), await page.screenshot({ type: "png" }));
    console.log("marketing/ascii-gallery.png");
  }
  else if (process.env.FORMAT === "dinner") {
    // ── Cena privada en Bogotá, square: warm black, candle-coloured glyphs ──
    const W = 1080, H = 1080, SEATS = 12;
    const BG = "#0e0c09", CREAM = "#f3ecdc", MUTED = "#a39a86", YELLOW = "#fcd116", RED = "#e8394a", LINE = "rgb(243 236 220 / 0.18)";
    const FRAME = { x: 36, y: 454, w: 1008, h: 362 };
    const NAMES_H = 58, PORTRAIT_TOP = FRAME.y + 4, PORTRAIT_H = FRAME.h - 4;
    const PEOPLE = [
      { id: "alex-studio", name: "Alexander Torrenegra", role: "Torre.ai · Shark Tank", cx: 296, cy: FRAME.y + 152, faceH: 170, w: 500, z: 2 },
      { id: "tania-stairs", name: "Tania Zapata", role: "Voice123 · Bunny Inc.", cx: 784, cy: FRAME.y + 150, faceH: 150, w: 500, z: 1 },
    ];
    const people = await Promise.all(PEOPLE.map(async (p) => ({ ...p, ...(await load(p.id)) })));
    await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
    await page.setContent(`<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${css}
html, body { width: ${W}px; height: ${H}px; }
body { background: ${BG}; color: ${CREAM}; }
body::after { content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 9;
  background: repeating-linear-gradient(to bottom, rgb(255 255 255 / 0.018) 0 1px, transparent 1px 3px); }
.m { font-family: GeistMono, monospace; }
.p { color: ${YELLOW}; } .k { color: ${RED}; } .f { color: #f0b35a; } .s { color: ${CREAM}; } .c { color: #6e6655; }
.rule { position: absolute; left: 36px; right: 36px; height: 0; border-top: 1px dashed ${LINE}; }
.frame { position: absolute; left: ${FRAME.x}px; top: ${FRAME.y}px; width: ${FRAME.w}px; height: ${FRAME.h}px; border: 1px dashed ${LINE}; }
.corner { position: absolute; width: 7px; height: 7px; background: ${YELLOW}; z-index: 4; }
.names { position: absolute; left: ${FRAME.x + 1}px; width: ${FRAME.w - 2}px; top: ${FRAME.y + FRAME.h - NAMES_H - 1}px; height: ${NAMES_H}px; z-index: 3;
  display: grid; grid-template-columns: 1fr 1fr; border-top: 1px dashed ${LINE}; background: rgb(14 12 9 / 0.95); }
.names > div { display: grid; align-content: center; justify-items: center; gap: 3px; }
.names > div + div { border-left: 1px dashed ${LINE}; }
.names b { font: 560 19px Geist, sans-serif; letter-spacing: -0.02em; }
.names span { font: 400 12px GeistMono, monospace; color: ${MUTED}; }
.label { font: 400 13px GeistMono, monospace; color: ${MUTED}; letter-spacing: 0.02em; }
.label b { font-weight: 400; color: ${YELLOW}; }
.date { font: 500 92px/0.9 GeistPixel, monospace; letter-spacing: -0.045em; white-space: nowrap; }
.date span { color: ${MUTED}; }
.seats { display: flex; gap: 7px; }
.seats i { width: 23px; height: 23px; background: ${YELLOW}; box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.25); }
.cta { position: absolute; left: 36px; right: 36px; top: 974px; height: 70px; display: flex; align-items: center; padding: 0 22px;
  background: ${CREAM}; color: ${BG}; }
</style></head><body>
<div class="abs m" style="left:36px; right:36px; top:32px; display:flex; font-size:15px; color:${MUTED}">
  <span><span class="p">&gt;&gt;&gt;</span> <span class="s">cena</span><span class="c">.</span><span class="f">privada</span><span class="k">(</span><span class="s">alex, tania</span><span class="k">)</span></span>
  <span style="margin-left:auto">${SEATS} lugares <span class="c">·</span> sujeto a aceptación</span>
</div>
<div class="rule" style="top:66px"></div>
<canvas id="line1" class="abs" style="left:28px; top:52px; width:1024px; height:176px"></canvas>
<canvas id="line2" class="abs" style="left:28px; top:200px; width:1024px; height:176px"></canvas>
<div class="abs" style="left:36px; top:392px; width:1008px; font: 500 33px/1.15 Geist, sans-serif; letter-spacing:-0.03em">
  con Alexander Torrenegra <span style="color:${MUTED}">y</span> Tania Zapata.</div>
<div class="frame"></div>
${people.map((p) => `<canvas id="c-${p.id}" class="abs" style="left:${p.cx - p.w / 2}px; top:${PORTRAIT_TOP}px; width:${p.w}px; height:${PORTRAIT_H}px; z-index:${p.z}"></canvas>`).join("")}
<div class="names">${people.map((p) => `<div><b>${p.name}</b><span>${p.role}</span></div>`).join("")}</div>
<div class="corner" style="left:${FRAME.x - 3}px; top:${FRAME.y - 3}px"></div>
<div class="corner" style="left:${FRAME.x + FRAME.w - 4}px; top:${FRAME.y + FRAME.h - 4}px"></div>
<div class="abs" style="left:36px; top:842px">
  <div class="label"><b>//</b> jueves</div>
  <div class="date" style="margin-top:12px">19.11<span>.2026</span></div>
</div>
<div class="abs" style="left:620px; top:842px; height:104px; border-left:1px dashed ${LINE}"></div>
<div class="abs" style="right:36px; top:842px; display:grid; justify-items:end">
  <div class="label"><b>//</b> mesa para ${SEATS}</div>
  <div class="seats" style="margin-top:16px">${Array.from({ length: SEATS }, () => "<i></i>").join("")}</div>
  <div class="m" style="margin-top:16px; font-size:15px; color:${CREAM}">${SEATS} lugares <span style="color:${MUTED}">· sujeto a aceptación</span></div>
</div>
<div class="cta">
  <span class="m" style="font-size:14px; color:#4a443a">Sin escenario: preguntas directas y feedback de primera mano.</span>
  <span style="margin-left:auto; display:flex; align-items:center; gap:10px; font: 500 21px Geist, sans-serif">Solicita tu lugar en
    <span class="m" style="text-decoration: underline; text-decoration-color:${RED}; text-decoration-thickness:2px; text-underline-offset:5px">aiyaiyai.io</span>${icon(ArrowRight, 21)}</span>
</div>
<script>${engine}
${typeEngine}</script></body></html>`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => Promise.all([document.fonts.load("500 20px GeistMono"), document.fonts.load("800 20px Geist"), document.fonts.load("500 20px GeistPixel")]));
    // Two lines at one scale: "Cena privada" / "en Bogotá." with Bogotá lit.
    await page.evaluate(({ cream, yellow, red }) => {
      const o = { cellW: 3.3, cellH: 5.4, font: 5.9, family: "Geist", weight: 800, wash: 0.2, size: 152 };
      asciiText(document.getElementById("line1"), [["Cena privada", cream]], o);
      asciiText(document.getElementById("line2"), [["en ", cream], ["Bogotá", yellow], [".", red]], o);
    }, { cream: CREAM, yellow: YELLOW, red: RED });
    for (const p of people)
      await page.evaluate((p, H, top, bg, namesH) => asciiPortrait(document.getElementById("c-" + p.id), p,
        { W: p.w, H, faceH: p.faceH, faceY: (p.cy - top) / H, cellW: 3.1, cellH: 5.2, font: 5.2, edge: 0.6,
          dark: true, gamma: 1.15, bodyLight: 0.3, lift: 1.3, paper: bg, fadeRows: 22, fadeCols: 8, bottomMargin: namesH + 8, local: 1.6, blur: 3,
          accents: ["#ff5a6a", "#fcd116", "#f0b35a"], tint: [0.94, 0.82], edgeColor: "#fff6e4" }), p, PORTRAIT_H, PORTRAIT_TOP, BG, NAMES_H);
    const out = "marketing/bogota-forward-ascii-dinner";
    const png = await page.screenshot({ type: "png" });
    await writeFile(new URL(`${out}.png`, root), png);
    await writeFile(new URL(`${out}.jpg`, root), await sharp(png).jpeg({ quality: 92, mozjpeg: true }).toBuffer());
    console.log(`${out}.{png,jpg}: 2160×2160`);
  }
  else if (process.env.FORMAT === "lineup") {
    // ── Horizontal lineup: the wordmark and every session, all drawn in glyphs ──
    const W = 1200, H = 627;
    const CARD = { top: 196, h: 330, gap: 12, left: 36 };
    CARD.w = (W - 2 * CARD.left - 3 * CARD.gap) / 4;
    const PORTRAIT = { top: CARD.top + 30, h: 214 };
    const SESSIONS = [
      { format: "charla", title: "Cómo predecir el futuro", people: [{ id: "alex-studio", name: "Alexander Torrenegra", faceH: 92 }] },
      { format: "fireside", title: "Reinventar tu compañía cuando es disrumpida", people: [{ id: "tania-editorial", name: "Tania Zapata", faceH: 96 }] },
      { format: "workshop", title: "Cómo volverte un 10X Operator", people: [{ id: "alan-glasses", name: "Alan Argüello", faceH: 104 }] },
      { format: "charla", title: "Lecciones de Growth en Torre.ai para la era de IA",
        people: [{ id: "jp-site", name: "Juan Pablo Rodríguez", faceH: 66 }, { id: "catalina-site", name: "Catalina Morales", faceH: 66 }] },
    ];
    const people = [];
    for (const [i, session] of SESSIONS.entries()) {
      const x = CARD.left + i * (CARD.w + CARD.gap), n = session.people.length, w = CARD.w / n;
      for (const [j, person] of session.people.entries())
        people.push({ ...person, ...(await load(person.id)), x: x + j * w, w, cy: PORTRAIT.top + (n > 1 ? 96 : 88) });
    }
    const names = (s) => s.people.map((p) => p.name).join(" + ");
    await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
    await page.setContent(`<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${css}
html, body { width: ${W}px; height: ${H}px; }
body { background: radial-gradient(ellipse 70% 60% at 30% 10%, #13285a, ${NAVY} 70%); color: #f6f2e6; }
body::after { content: ""; position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(to bottom, rgb(255 255 255 / 0.025) 0 1px, transparent 1px 3px); }
.m { font-family: GeistMono, monospace; }
.p { color: #fcd116; } .k { color: #ff6b7a; } .f { color: #8fb0ff; } .s { color: #e8e2cf; } .c { color: #6f7ea6; }
.card { position: absolute; top: ${CARD.top}px; width: ${CARD.w}px; height: ${CARD.h}px; border: 1px dashed rgb(255 255 255 / 0.18); overflow: hidden; }
.card-head { position: absolute; left: 0; right: 0; top: 0; height: 30px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 10px; border-bottom: 1px dashed rgb(255 255 255 / 0.14); font: 400 10.5px GeistMono, monospace; color: #9aa6c8; }
.card-foot { position: absolute; left: 0; right: 0; bottom: 0; padding: 10px 11px 11px; background: rgb(10 20 48 / 0.94);
  border-top: 1px dashed rgb(255 255 255 / 0.14); }
.card-foot b { display: block; font: 500 14.5px/1.22 Geist, sans-serif; letter-spacing: -0.02em; color: #fcfbf6; min-height: 36px; }
.card-foot span { display: block; margin-top: 6px; font: 400 10px GeistMono, monospace; color: #8fb0ff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.corner { position: absolute; width: 5px; height: 5px; background: #fcd116; z-index: 3; }
.cta { position: absolute; left: 36px; right: 36px; top: 548px; height: 46px; display: flex; align-items: center; gap: 14px;
  padding: 0 14px; background: #003893; font: 400 12px GeistMono, monospace; color: #dfe6f5; }
.cta b { font: 400 15px Geist, sans-serif; color: #fff; } .cta b i { font-style: normal; font-family: GeistMono, monospace; color: #fcd116; }
</style></head><body>
<div class="abs" style="left:0; top:0; width:100%; height:6px; background:var(--flag-h)"></div>
<div class="abs m" style="left:36px; right:36px; top:20px; display:flex; font-size:12px; color:#9aa6c8">
  <span><span class="p">&gt;&gt;&gt;</span> <span class="k">from</span> <span class="s">bogota</span> <span class="k">import</span> <span class="f">forward</span></span>
  <span style="margin-left:auto"><span class="c"># </span>19.11.2026 · 10:00–16:00 · Bogotá, Colombia</span>
</div>
<canvas id="word" class="abs" style="left:30px; top:44px; width:880px; height:126px"></canvas>
<canvas id="kind" class="abs" style="left:922px; top:104px; width:242px; height:62px"></canvas>
<div class="abs m" style="left:36px; right:36px; top:172px; display:flex; font-size:12px; color:#9aa6c8">
  <span><span class="p">&gt;&gt;&gt;</span> <span class="s">summit</span>.<span class="f">agenda</span><span class="k">()</span> <span class="c"># 4 sesiones · 5 speakers</span></span>
  <span style="margin-left:auto; color:#c7cfe4"><span class="c">#</span> IA, empresas y lo que viene <span class="c">·</span> cena privada con Alex y Tania: <span class="p">20 lugares</span></span>
</div>
${SESSIONS.map((s, i) => {
  const x = CARD.left + i * (CARD.w + CARD.gap);
  return `<div class="card" style="left:${x}px"><div class="card-head"><span><span class="p">${String(i + 1).padStart(2, "0")}</span> // ${s.format}</span><span>${s.people.length > 1 ? "torre.ai" : "ok"}</span></div>
    <div class="card-foot"><b>${s.title}</b><span>${names(s)}</span></div></div>
    <div class="corner" style="left:${x - 2}px; top:${CARD.top - 2}px"></div>`;
}).join("")}
${people.map((p) => `<canvas id="c-${p.id}" class="abs" style="left:${p.x}px; top:${PORTRAIT.top}px; width:${p.w}px; height:${PORTRAIT.h}px; z-index:1"></canvas>`).join("")}
<div class="cta"><span>General · VIP · VIP Plus</span><span class="c" style="color:#8fa3d1">//</span><span>Organiza AIYaiYai</span>
  <b style="margin-left:auto; display:flex; align-items:center; gap:8px">Conoce más en <i>aiyaiyai.io</i>${icon(ArrowRight, 15)}</b></div>
<script>${engine}
${typeEngine}
</script></body></html>`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => Promise.all([document.fonts.load("500 20px GeistMono"), document.fonts.load("500 20px GeistPixel")]));
    await page.evaluate(() => {
      asciiText(document.getElementById("word"), [["bogota", "#f6f2e6"], [".", "#7f8db0"], ["forward", "#8fb0ff"], ["()", "#ff5a6a"]],
        { cellW: 2.6, cellH: 4.3, font: 4.6, family: "Geist", weight: 800, dust: true, wash: 0.16 });
      asciiText(document.getElementById("kind"), [["summit", "#f6f2e6"], ["_", "#fcd116"]], { cellW: 2.2, cellH: 3.6, font: 3.9, family: "Geist", weight: 800, wash: 0.16 });
    });
    for (const p of people)
      await page.evaluate((p, H, top) => asciiPortrait(document.getElementById("c-" + p.id), p,
        { W: p.w, H, faceH: p.faceH, faceY: (p.cy - top) / H, cellW: 2.5, cellH: 4.2, font: 4.2, edge: 0.6,
          dark: true, gamma: 0.95, bodyLight: 0.2, paper: null, fadeRows: 22, fadeCols: 6, bottomMargin: 0, local: 1.1 }), p, PORTRAIT.h, PORTRAIT.top);
    const out = "marketing/bogota-forward-ascii-lineup";
    const png = await page.screenshot({ type: "png" });
    await writeFile(new URL(`${out}.png`, root), png);
    await writeFile(new URL(`${out}.jpg`, root), await sharp(png).jpeg({ quality: 92, mozjpeg: true }).toBuffer());
    console.log(`${out}.{png,jpg}: 2400×1254`);
  }
  else if (process.env.FORMAT === "horizontal") {
    // ── LinkedIn horizontal: the hook on the left, the same screen on the right ──
    const s = 0.74;
    const SCREEN = { x: 560, y: 60, w: 604, h: 472 };
    const PORTRAIT_TOP = 102, PORTRAIT_H = 397;
    const COLUMN = { left: 33, right: 524 };
    const PEOPLE = [
      { id: "alan-glasses", name: "Alan Argüello", session: "Workshop · 10X Operator", cx: 664, cy: 240, faceH: 132, w: 280, z: 1 },
      { id: "alex-studio", name: "Alexander Torrenegra", session: "Charla · Cómo predecir el futuro", cx: 862, cy: 232, faceH: 150, w: 310, z: 3 },
      { id: "tania-editorial", name: "Tania Zapata", session: "Fireside · Reinventar tu compañía", cx: 1060, cy: 240, faceH: 128, w: 280, z: 2 },
    ];
    const people = await Promise.all(PEOPLE.map(async (p) => ({ ...p, ...(await load(p.id)) })));
    await page.setViewport({ width: 1200, height: 627, deviceScaleFactor: 2 });
    await page.setContent(`<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${css}${screenCss(SCREEN, s)}
html, body { width: 1200px; height: 627px; }
.hook { font-weight: 600; font-size: 64px; line-height: 0.98; letter-spacing: -0.045em; }
.hook > span { display: block; }
.hook > span + span { margin-top: 0.14em; color: var(--blue); }
</style></head><body>
<div class="rail" style="left:36px"></div><div class="rail" style="left:1163px"></div>
<div class="abs" style="left:0; top:0; width:100%; height:6px; background:var(--flag-h)"></div>
<div class="abs" style="left:36px; right:36px; top:22px; display:flex; align-items:center; gap:10px">
  <span class="tag" style="font-size:11.5px"><span class="flag"></span>Para founders, C-levels y ejecutivos</span>
  <span style="margin-left:auto; display:flex; align-items:center; gap:8px; color:var(--muted); font-size:11.5px">Organiza
    <img src="${aiyaiyai}" style="height:16px; filter:brightness(0)" alt=""></span>
</div>
<h1 class="abs hook" id="hook" style="left:34px; top:66px"><span>Las respuestas<br>ya son gratis.</span><span>Las buenas<br>preguntas, no.</span></h1>
<p class="abs" id="sub" style="left:36px; width:480px; font-size:15px; line-height:1.4; color:var(--muted); text-wrap:balance">Un día para hacernos las preguntas que la IA no va a hacer por nosotros.</p>
${screenHtml(SCREEN, people, PORTRAIT_TOP, PORTRAIT_H, s)}
<div class="abs pixel" id="word" style="left:${COLUMN.left}px; line-height:1; letter-spacing:-0.04em; white-space:nowrap">
  <span class="obj">bogota</span><span class="dot">.</span><span class="fn">forward</span><span class="call">()</span></div>
<div class="abs pixel" id="kind" style="left:${COLUMN.left + 2}px; line-height:1; letter-spacing:-0.035em; white-space:nowrap">summit<span class="cursor"></span></div>
<div class="abs pixel" id="date" style="right:${1200 - COLUMN.right}px; line-height:1; letter-spacing:-0.02em">19.11.2026</div>
<div class="abs cta" style="left:36px; right:36px; top:552px">
  <span class="mono" style="font-size:12.5px">Jueves · 10 a. m. – 4 p. m. · Bogotá, Colombia</span>
  <span style="margin-left:auto; display:flex; align-items:center; gap:8px; font-size:15px">Conoce más en <b>aiyaiyai.io</b>${icon(ArrowRight, 15)}</span>
</div>
<script>${engine}</script></body></html>`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => document.fonts.load("500 20px GeistMono"));
    // The line sits under the hook; the wordmark fills the column and rests on
    // the screen's bottom edge, with the date level with "summit".
    await page.evaluate((column, bottom) => {
      const box = (id) => document.getElementById(id).getBoundingClientRect();
      const [sub, word, kind, date] = ["sub", "word", "kind", "date"].map((id) => document.getElementById(id));
      sub.style.top = box("hook").bottom + 16 + "px";
      word.style.fontSize = "100px";
      word.style.fontSize = (100 * (column.right - column.left)) / box("word").width + "px";
      kind.style.fontSize = Math.round(parseFloat(word.style.fontSize) * 0.56) + "px";
      kind.style.top = bottom - box("kind").height + "px";
      word.style.top = parseFloat(kind.style.top) - 4 - box("word").height + "px";
      date.style.fontSize = kind.style.fontSize;
      date.style.top = kind.style.top;
    }, COLUMN, SCREEN.y + SCREEN.h);
    await drawPortraits(page, people, PORTRAIT_TOP, PORTRAIT_H, s);
    const out = "marketing/bogota-forward-ascii-horizontal";
    const png = await page.screenshot({ type: "png" });
    await writeFile(new URL(`${out}.png`, root), png);
    await writeFile(new URL(`${out}.jpg`, root), await sharp(png).jpeg({ quality: 92, mozjpeg: true }).toBuffer());
    console.log(`${out}.{png,jpg}: 2400×1254`);
  }
  else {
    // ── The cover: a navy "screen" rendering the speakers in ASCII ──
    const SCREEN = { x: 30, y: 92, w: 1020, h: 590 };
    const PORTRAIT_TOP = 150, PORTRAIT_H = 470;
    const PEOPLE = [
      { id: "alan-glasses", name: "Alan Argüello", session: "Workshop · 10X Operator", cx: 206, cy: 322, faceH: 178, w: 400, z: 1 },
      { id: "alex-studio", name: "Alexander Torrenegra", session: "Charla · Cómo predecir el futuro", cx: 540, cy: 312, faceH: 200, w: 440, z: 3 },
      { id: "tania-editorial", name: "Tania Zapata", session: "Fireside chat · Reinventar tu compañía", cx: 872, cy: 322, faceH: 172, w: 400, z: 2 },
    ];
    const people = await Promise.all(PEOPLE.map(async (p) => ({ ...p, ...(await load(p.id)) })));
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
    await page.setContent(`<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${css}${screenCss(SCREEN)}
html, body { width: 1080px; height: 1080px; }
</style></head><body>
<div class="rail" style="left:30px"></div><div class="rail" style="left:1049px"></div>
<div class="abs" style="left:0; top:0; width:100%; height:8px; background:var(--flag-h)"></div>
<div class="abs" style="left:30px; right:30px; top:30px; display:flex; align-items:center; gap:14px">
  <span class="tag" style="font-size:15px"><span class="flag"></span>Próximamente · Bogotá, Colombia</span>
  <span style="margin-left:auto; display:flex; align-items:center; gap:10px; color:var(--muted); font-size:15px">Organiza
    <img src="${aiyaiyai}" style="height:22px; filter:brightness(0)" alt=""></span>
</div>

${screenHtml(SCREEN, people, PORTRAIT_TOP, PORTRAIT_H)}

<div class="abs pixel" id="word" style="left:24px; top:704px; line-height:1; letter-spacing:-0.04em; white-space:nowrap">
  <span class="obj">bogota</span><span class="dot">.</span><span class="fn">forward</span><span class="call">()</span></div>
<div class="abs pixel" id="kind" style="left:26px; line-height:1; letter-spacing:-0.035em; white-space:nowrap">summit<span class="cursor"></span></div>
<div class="abs" id="facts" style="right:30px; text-align:right">
  <div class="mono" style="font-size:16px; color:var(--muted)">IA · Empresas · Lo que viene</div>
  <div class="pixel" style="margin-top:8px; font-size:40px; letter-spacing:-0.02em">19.11.2026</div>
</div>
<div class="abs cta" style="left:30px; right:30px; top:988px">
  <span class="mono" style="font-size:17px">Jueves · 10 a. m. – 4 p. m. · Bogotá, Colombia</span>
  <span style="margin-left:auto; display:flex; align-items:center; gap:10px; font-size:20px">Conoce más en <b>aiyaiyai.io</b>${icon(ArrowRight, 20)}</span>
</div>
<script>${engine}</script></body></html>`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => document.fonts.load("500 20px GeistMono"));
    // Fit the wordmark to the canvas width; "summit" and the facts sit under it.
    await page.evaluate(() => {
      const word = document.getElementById("word");
      word.style.fontSize = "100px";
      word.style.fontSize = (100 * 1030) / word.getBoundingClientRect().width + "px";
      const wb = word.getBoundingClientRect();
      const kind = document.getElementById("kind");
      kind.style.fontSize = Math.round(parseFloat(word.style.fontSize) * 0.56) + "px";
      kind.style.top = wb.bottom + 6 + "px";
      const facts = document.getElementById("facts");
      facts.style.top = wb.bottom + 14 + "px";
    });
    await drawPortraits(page, people, PORTRAIT_TOP, PORTRAIT_H);
    const out = "marketing/bogota-forward-ascii-cover.png";
    await writeFile(new URL(out, root), await page.screenshot({ type: "png" }));
    console.log(`${out}: 2160×2160`);
  }
} finally {
  await browser.close();
}
