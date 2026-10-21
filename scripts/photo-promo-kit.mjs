// Shared by the photo promos (generate-dinner-promo, generate-lineup-promo):
// people cut out with Vision person masks and set on Bogotá at golden hour,
// warm black, cream type, the flag only as light.
import { readFile, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

export const root = new URL("../", import.meta.url);
const CHROME =
  process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
export const file = (path) => readFile(new URL(path, root));
export const dataUrl = async (path, type) => `data:${type};base64,${(await file(path)).toString("base64")}`;
export const icon = (Icon, size) => renderToStaticMarkup(h(Icon, { size, strokeWidth: 2, "aria-hidden": true }));

export const COLORS = {
  bg: "#0e0c09", cream: "#f3ecdc", muted: "#a39a86", yellow: "#fcd116", red: "#e8394a",
  line: "rgb(243 236 220 / 0.18)",
};

// Small sources are enlarged here (Lanczos plus a light sharpen) rather than
// left to the browser's softer scaling.
const photoUrl = async (path, n) => {
  const buf = n > 1
    ? await sharp(await file(path)).resize({ width: Math.round(n * (await sharp(await file(path)).metadata()).width), kernel: "lanczos3" })
      .sharpen({ sigma: 1.1, m1: 0.6, m2: 2.2 }).jpeg({ quality: 94 }).toBuffer()
    : await file(path);
  const type = n > 1 ? "image/jpeg" : path.endsWith(".png") ? "image/png" : path.endsWith(".webp") ? "image/webp" : "image/jpeg";
  return `data:${type};base64,${buf.toString("base64")}`;
};

// A white image whose alpha is the person mask, so CSS can mask with it; a
// median pass drops the specks Vision leaves and a slight blur softens the cut.
// `feather` (a fraction of the size) fades the body out where the photo ends
// at the sides and bottom, instead of a straight cut. `choke` (source pixels)
// pulls the edge in, for photos whose light backdrop leaves a halo.
const alphaMask = async (path, n = 1, feather = 0, choke = 0) => {
  const source = await file(path);
  const { width } = await sharp(source).metadata();
  const scaled = await sharp(source).resize({ width: width * n, kernel: "lanczos3" }).toBuffer();
  const meta = await sharp(scaled).metadata();
  const soft = sharp(scaled).greyscale().median(5).blur(Math.max(0.8, choke) * n);
  const alpha = await (choke ? soft.linear(2.2, -1.2 * 255) : soft).toColourspace("b-w").raw().toBuffer();
  if (feather) {
    const fw = feather * meta.width, fh = feather * meta.height;
    const ease = (t) => t * t * (3 - 2 * t);
    for (let y = 0; y < meta.height; y++) for (let x = 0; x < meta.width; x++) {
      const f = Math.min(1, x / fw, (meta.width - 1 - x) / fw, (meta.height - 1 - y) / fh);
      alpha[y * meta.width + x] = Math.round(alpha[y * meta.width + x] * ease(Math.max(0, f)));
    }
  }
  const png = await sharp({ create: { width: meta.width, height: meta.height, channels: 3, background: "#fff" } })
    .joinChannel(alpha, { raw: { width: meta.width, height: meta.height, channels: 1 } }).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
};

// Load a person: photo and mask as data URLs, enlarged by `upscale` if set.
export const loadPerson = async (person) => ({
  ...person,
  src: await photoUrl(person.photo, person.upscale || 1),
  alpha: await alphaMask(person.mask, person.upscale || 1, person.feather, person.choke),
});

// Size and offset that put a person's face at `face` (centre as fractions of
// the card, height in CSS pixels). Face boxes come from Apple's Vision
// framework, in source pixels. Warns if the body ends above `floor`.
export function place(person, card, floor = card.h) {
  const n = person.upscale || 1, k = person.face.h / (person.box.h * n);
  const [iw, ih] = person.size.map((v) => v * n);
  const box = Object.fromEntries(Object.entries(person.box).map(([key, v]) => [key, v * n]));
  const x = person.face.x * card.w - (box.x + box.w / 2) * k;
  const y = person.face.y * card.h - (box.y + box.h / 2) * k;
  if (y + ih * k < floor) console.warn(`${person.name}: the photo ends above the card's label`);
  return `background-size:${iw * k}px ${ih * k}px; background-position:${x}px ${y}px; mask-size:${iw * k}px ${ih * k}px; mask-position:${x}px ${y}px;`;
}

export const city = () => dataUrl("public/images/photos/bogota-golden-hour.webp", "image/webp");

// Fine film grain over everything, so the photos (some of them small) and the
// flat colour sit in the same material.
const grain = `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">
<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 0.95  0 0 0 0 0.85  0 0 0 0.55 0"/></filter>
<rect width="240" height="240" filter="url(#n)"/></svg>`).toString("base64")}`;

const fonts = "node_modules/geist/dist/fonts/";
// Fonts, page reset and the pieces both promos share: cards with Bogotá behind
// a cut-out person, a label strip, corner markers and the cream CTA bar.
export async function baseCss({ width, height }) {
  const [sans, pixel, mono] = await Promise.all([
    dataUrl(`${fonts}geist-sans/Geist-Variable.woff2`, "font/woff2"),
    dataUrl(`${fonts}geist-pixel/GeistPixel-Square.woff2`, "font/woff2"),
    dataUrl(`${fonts}geist-mono/GeistMono-Variable.woff2`, "font/woff2"),
  ]);
  const c = COLORS;
  return /* css */ `
@font-face { font-family: Geist; src: url(${sans}) format("woff2"); font-weight: 100 900; }
@font-face { font-family: GeistPixel; src: url(${pixel}) format("woff2"); font-weight: 500; }
@font-face { font-family: GeistMono; src: url(${mono}) format("woff2"); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${width}px; height: ${height}px; }
body { position: relative; overflow: hidden; background: ${c.bg}; color: ${c.cream};
  font: 400 20px/1.3 Geist, sans-serif; letter-spacing: -0.01em; -webkit-font-smoothing: antialiased; }
body::after { content: ""; position: absolute; inset: 0; z-index: 20; pointer-events: none;
  background: url("${grain}"); opacity: 0.11; mix-blend-mode: overlay; }
.abs { position: absolute; }
.m { font-family: GeistMono, monospace; }
.rule { position: absolute; left: 36px; right: 36px; border-top: 1px dashed ${c.line}; }
.flag { display: inline-block; width: 15px; height: 10px; margin-right: 10px; vertical-align: -1px;
  background: linear-gradient(${c.yellow} 0 50%, #003893 50% 75%, #ce1126 75%); }
.card { position: absolute; overflow: hidden; border: 1px solid rgb(243 236 220 / 0.22); background: #1a140c; }
/* Bogotá behind each person, softened and dimmed so the person leads. */
.city { position: absolute; inset: -12px; background-repeat: no-repeat; background-size: 230% auto;
  filter: blur(2.5px) brightness(0.62) saturate(1.15) contrast(1.05); }
.person { position: absolute; inset: 0; background-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;
  filter: saturate(0.92) contrast(1.04) sepia(0.08); }
.corner { position: absolute; width: 7px; height: 7px; background: ${c.yellow}; z-index: 5; }
.kicker { font: 400 13px GeistMono, monospace; color: ${c.muted}; letter-spacing: 0.02em; }
.kicker b { font-weight: 400; color: ${c.yellow}; }
.cta { position: absolute; left: 36px; right: 36px; height: 70px; display: flex; align-items: center; padding: 0 22px;
  background: ${c.cream}; color: ${c.bg}; }
.cta-link { text-decoration: underline; text-decoration-color: ${c.red}; text-decoration-thickness: 2px; text-underline-offset: 5px; }
`;
}

// Render the page at 2× and write `${out}.png` and `${out}.jpg`.
export async function render(html, { width, height, out, prepare }) {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    if (prepare) await page.evaluate(prepare);
    const png = await page.screenshot({ type: "png" });
    await writeFile(new URL(`${out}.png`, root), png);
    await writeFile(new URL(`${out}.jpg`, root), await sharp(png).jpeg({ quality: 92, mozjpeg: true }).toBuffer());
    console.log(`${out}.{png,jpg}: ${width * 2}×${height * 2}`);
  } finally {
    await browser.close();
  }
}
