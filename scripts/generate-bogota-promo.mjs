// Generates marketing/nos-vemos-en-bogota.png: a 1:1 post (2160×2160) for the
// 19 November summit, in the summit's ASCII language and the spirit of the
// Napa badges: Alexander and Tania as large ASCII portraits, side by side,
// dissolving into black above their names, with the date and the CTA.
// Run with `npm run bogota`. The portraits need person masks from Apple's
// Vision framework, written once with:
//   swift scripts/person-mask.swift marketing/masks public/images/speakers/*.webp
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";
import sharp from "sharp";
import { abs, asset, box, dataUrl, fonts, img, live, MARK_PATH, px, size, words } from "./promo-kit.mjs";

// --- The character field ------------------------------------------------------
// Design units at 1080; one cell per character, fine enough that a face spans
// about 55 rows, like the badges' halftone.
const CELL = { w: 3.6, h: 6 };
const COLS = Math.round(1080 / CELL.w);
const ROWS = Math.round(1080 / CELL.h);
const GLYPHS = " .:-=+*#%@"; // classic ASCII ramp, evenly spaced in ink
const BACKGROUND = "#090909";
const INK = [246, 243, 234];

const clamp = (x, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
const smooth = (t) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

const value = new Float32Array(COLS * ROWS);
function put(col, row, v) {
  if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return;
  const i = row * COLS + col;
  value[i] = Math.max(value[i], v);
}

// --- Portraits -----------------------------------------------------------------
// Each fills half the square. The crop centres the face (boxes from Apple's
// Vision framework) at the same size and height; tone is measured on the
// face; the person mask removes the background; the body dissolves below the
// chin, as on the badges.
const REGION = { top: 180, h: 760, w: 540 };
const FACE = { h: 330, cy: 532 };
async function portrait(file, face, left) {
  const k = FACE.h / face.h; // units per source pixel
  const cy = (FACE.cy - REGION.top) / REGION.h; // face centre, 0–1 in the region
  const crop = {
    left: Math.round(face.x + face.w / 2 - REGION.w / 2 / k),
    top: Math.round(face.y + face.h / 2 - (cy * REGION.h) / k),
    width: Math.round(REGION.w / k),
    height: Math.round(REGION.h / k),
  };
  const cols = Math.round(REGION.w / CELL.w);
  const rows = Math.round(REGION.h / CELL.h);
  // Both layers come back as one 0–255 value per cell.
  const load = async (path, pipeline) => {
    const prepared = await pipeline(sharp(await readFile(asset(path))).extract(crop).removeAlpha().grayscale()).png().toBuffer();
    return sharp(prepared).resize(cols, rows, { fit: "fill", kernel: "lanczos3" }).grayscale().raw().toBuffer();
  };
  const [photo, mask] = await Promise.all([
    // Local contrast brings out eyes, glasses and beard at this resolution.
    load(`public/images/speakers/${file}`, (s) => s.clahe({ width: 48, height: 48, maxSlope: 3 })),
    load(`marketing/masks/${file.replace(/\.\w+$/, ".png")}`, (s) => s),
  ]);

  const fh = FACE.h / REGION.h;
  const fw = FACE.h / REGION.w;
  const faceCells = [];
  for (let r = Math.floor((cy - fh / 2) * rows); r < (cy + fh / 2) * rows; r++)
    for (let c = Math.floor((0.5 - fw / 2) * cols); c < (0.5 + fw / 2) * cols; c++)
      faceCells.push(photo[r * cols + c] / 255);
  faceCells.sort((a, b) => a - b);
  const lo = faceCells[Math.floor(faceCells.length * 0.03)] * 0.85;
  const hi = Math.min(1, faceCells[Math.floor(faceCells.length * 0.97)] * 1.04);

  const chin = cy + fh / 2;
  const col0 = Math.round(left / CELL.w);
  const row0 = Math.round(REGION.top / CELL.h);
  for (let r = 0; r < rows; r++) {
    const fr = r / rows;
    const fade = (1 - smooth((fr - (chin - 0.04)) / 0.2)) * smooth(fr / 0.1);
    for (let c = 0; c < cols; c++) {
      const fc = c / cols;
      // Quiet the far sides so the two portraits never touch.
      const sides = 1 - smooth((Math.abs(fc - 0.5) - 0.36) / 0.14);
      const t = smooth((photo[r * cols + c] / 255 - lo) / Math.max(0.01, hi - lo));
      put(col0 + c, row0 + r, t * (mask[r * cols + c] / 255) * fade * sides);
    }
  }
}
await portrait("alexander-torrenegra.webp", { x: 316, y: 168, w: 196, h: 196 }, 0);
await portrait("tania-zapata.webp", { x: 361, y: 175, w: 248, h: 248 }, 540);

// --- Render the field as monospaced text ----------------------------------------
const cells = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const v = value[r * COLS + c];
    const x = px(c * CELL.w).toFixed(1);
    const y = px(r * CELL.h + CELL.h * 0.8).toFixed(1);
    const glyph = GLYPHS[Math.min(GLYPHS.length - 1, Math.floor(Math.pow(v, 0.95) * GLYPHS.length))];
    if (glyph === " ") {
      // A faint dot matrix behind everything, like a terminal at rest.
      if (c % 3 === 0 && r % 2 === 0) cells.push(`<text x="${x}" y="${y}" fill="rgb(34,34,34)">.</text>`);
      continue;
    }
    const shade = 0.34 + 0.66 * Math.pow(v, 0.8);
    const fill = INK.map((ch) => Math.round(9 + (ch - 9) * shade)).join(",");
    cells.push(`<text x="${x}" y="${y}" fill="rgb(${fill})">${glyph}</text>`);
  }
}
const field = await sharp(
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="${BACKGROUND}"/><g font-family="Menlo, monospace" font-size="${px(CELL.w * 1.62)}">${cells.join("")}</g></svg>`,
  ),
)
  .png()
  .toBuffer();

// --- Type ------------------------------------------------------------------------
const organizer = await readFile(asset("public/images/colombia-summit/aiyaiyai.png")); // white
const markWhite = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 20"><path d="${MARK_PATH}" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="23.5" cy="2.5" r="2.3" fill="#fff"/></svg>`,
);

// Credential logos, the same ones the website shows for each speaker, turned
// white. Light details inside a mark (Bunny's rabbit, Stanford's tree) are
// cut out rather than filled, so the marks stay legible.
async function whiteLogo(file) {
  const { data, info } = await sharp(await readFile(asset(`public/images/colombia-summit/${file}`)))
    .ensureAlpha()
    .trim()
    .raw()
    .toBuffer({ resolveWithObject: true });
  // Some marks (torre.ai) use semi-transparent ink; stretch alpha to solid.
  let peak = 1;
  for (let i = 3; i < data.length; i += 4) peak = Math.max(peak, data[i]);
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const max = Math.max(r, g, b);
    const light = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const saturation = max ? (max - Math.min(r, g, b)) / max : 0;
    const whiteness = smooth((light - 0.78) / 0.15) * (1 - smooth((saturation - 0.15) / 0.2));
    data[i] = data[i + 1] = data[i + 2] = 255;
    data[i + 3] = Math.round(Math.min(255, (data[i + 3] * 255) / peak) * (1 - whiteness));
  }
  const png = await sharp(data, { raw: info }).png().toBuffer();
  return { png, ratio: info.width / info.height };
}
const logo = async (file, height) => {
  const { png, ratio } = await whiteLogo(file);
  return img(png, height * ratio, height);
};
const credentials = {
  alexander: await Promise.all([logo("credential-torre-ai.png", 24), logo("credential-shark-tank.png", 20), logo("credential-endeavor.png", 17)]),
  tania: await Promise.all([logo("credential-bunnyinc.png", 27), logo("credential-stanford.png", 30), logo("credential-endeavor.png", 17)]),
};

// Names set like the badges: first name over surname, large and light, with
// each speaker's credentials underneath.
const name = (first, last, marks, left) =>
  abs(
    { left: px(left), top: px(790), flexDirection: "column" },
    box(
      { flexDirection: "column", fontWeight: 300, fontSize: px(46), lineHeight: 1, letterSpacing: px(-1.8) },
      h("span", null, first),
      h("span", null, last),
    ),
    box({ alignItems: "center", gap: px(24), marginTop: px(20), opacity: 0.9 }, ...marks),
  );

const image = new ImageResponse(
  box(
    { width: size, height: size, position: "relative", background: BACKGROUND, fontFamily: "Host Grotesk", color: "#fff" },
    h("img", { src: dataUrl(field), width: size, height: size, style: { position: "absolute", top: 0, left: 0 } }),

    abs(
      { left: px(64), top: px(44), width: px(952), height: px(44), alignItems: "center", justifyContent: "space-between" },
      box(
        { alignItems: "center", gap: px(12) },
        img(markWhite, 27, 21, "image/svg+xml"),
        words("Accelerating LATAM Summit", { gap: px(6), fontWeight: 500, fontSize: px(21), letterSpacing: px(-0.4) }),
      ),
      box(
        { alignItems: "center", gap: px(12) },
        h("span", { style: { fontFamily: "Inter", fontSize: px(15), color: "rgba(255,255,255,0.6)" } }, "Organiza"),
        img(organizer, 92, 28),
      ),
    ),

    abs(
      { left: px(62), top: px(120), flexDirection: "column", fontWeight: 300, fontSize: px(66), lineHeight: 1.02, letterSpacing: px(-2.6) },
      words("Nos vemos el 19 de noviembre", { gap: px(16) }),
      box({ alignItems: "baseline" }, words("en Bogotá", { gap: px(16) }), h("span", { style: { color: live } }, ".")),
    ),

    name("Alexander", "Torrenegra", credentials.alexander, 64),
    name("Tania", "Zapata", credentials.tania, 604),

    abs(
      { left: px(64), top: px(972), width: px(952), height: px(60), alignItems: "center", justifyContent: "flex-end" },
      box(
        { alignItems: "center", gap: px(10), height: px(56), padding: `0 ${px(24)}px 0 ${px(28)}px`, borderRadius: 999, background: "#fff", color: "#000", fontFamily: "Inter", fontSize: px(19), fontWeight: 500 },
        h("span", null, "Conoce más en aiyaiyai.io"),
        h(
          "svg",
          { width: px(18), height: px(18), viewBox: "0 0 24 24", fill: "none" },
          h("path", { d: "M6 18 18 6M8 6h10v10", stroke: "#000", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }),
        ),
      ),
    ),
  ),
  { width: size, height: size, fonts },
);

await mkdir(asset("marketing/"), { recursive: true });
const out = asset("marketing/nos-vemos-en-bogota.png");
await writeFile(out, Buffer.from(await image.arrayBuffer()));
console.log(`Generated ${out.pathname}`);
