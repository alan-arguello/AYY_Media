// Shared kit for the summit's promo images rendered with next/og: design
// tokens from src/app/design-system.css, fonts, layout helpers, the page
// frame, pills and logos. Everything is designed at 1080 and rendered at 2×.
import { readFile } from "node:fs/promises";
import { createElement as h } from "react";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
export const asset = (path) => new URL(path, root);
export const dataUrl = (buffer, type = "image/png") =>
  `data:${type};base64,${buffer.toString("base64")}`;

export const S = 2;
export const px = (value) => value * S;
export const size = px(1080);

export const paper = "#fdfcfc";
export const ink = "#000";
export const ink2 = "#2b2926";
export const muted = "#777169";
export const line = "rgba(0,0,0,0.08)";
const tick = "rgba(0,0,0,0.22)";
export const live = "#ff4f2b";

// Logos arrive white or in colour; recolour them as black silhouettes.
export async function blackLogo(path) {
  const source = await readFile(asset(path));
  const { width, height } = await sharp(source).metadata();
  // Some marks use semi-transparent ink; stretch the alpha to solid. Sharp
  // runs channel extraction last, so the stretch needs a second pipeline.
  const rawAlpha = await sharp(source).ensureAlpha().extractChannel(3).raw().toBuffer();
  const alpha = await sharp(rawAlpha, { raw: { width, height, channels: 1 } })
    .normalise()
    .toColourspace("b-w")
    .raw()
    .toBuffer();
  return sharp({ create: { width, height, channels: 3, background: ink } })
    .joinChannel(alpha, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();
}

// The summit mark: an accelerating curve that ends in a point.
export const MARK_PATH = "M1 18.5 C 11 18.5, 17 15, 23.5 2.5";
export const mark = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 20"><path d="${MARK_PATH}" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/><circle cx="23.5" cy="2.5" r="2.3" fill="${ink}"/></svg>`,
);

const font = (name) => readFile(asset(`scripts/fonts/${name}.ttf`));
const [displayLight, displayMedium, text, textMedium] = await Promise.all([
  font("HostGrotesk-300"),
  font("HostGrotesk-500"),
  font("Inter-400"),
  font("Inter-500"),
]);
export const fonts = [
  { name: "Host Grotesk", data: displayLight, weight: 300, style: "normal" },
  { name: "Host Grotesk", data: displayMedium, weight: 500, style: "normal" },
  { name: "Inter", data: text, weight: 400, style: "normal" },
  { name: "Inter", data: textMedium, weight: 500, style: "normal" },
];

export const box = (style, ...children) =>
  h("div", { style: { display: "flex", ...style } }, ...children);
export const abs = (style, ...children) => box({ position: "absolute", ...style }, ...children);
// Satori does not tighten word spaces with negative tracking; set words apart.
export const words = (value, style) =>
  box(style, ...value.split(" ").map((word) => h("span", null, word)));
export const img = (buffer, w, hgt, type) =>
  h("img", { src: dataUrl(buffer, type), width: px(w), height: px(hgt) });

export const pill = (label, { dot = false } = {}) =>
  box(
    {
      alignItems: "center",
      gap: px(9),
      height: px(40),
      padding: `0 ${px(16)}px`,
      borderRadius: 999,
      background: "#fff",
      boxShadow: `0 0 ${px(1)}px rgba(0,0,0,0.4), 0 ${px(2)}px ${px(4)}px rgba(0,0,0,0.06)`,
      fontFamily: "Inter",
      fontWeight: 500,
      fontSize: px(17),
      color: ink,
    },
    ...(dot
      ? [h("span", { style: { width: px(8), height: px(8), borderRadius: 999, background: live } })]
      : []),
    h("span", null, label),
  );

// Hairline crosshair where the rails meet a horizontal rule.
const cross = (x, y) =>
  abs(
    { left: px(x - 6), top: px(y - 6), width: px(13), height: px(13) },
    abs({ left: px(6), top: 0, width: px(1), height: px(13), background: tick }),
    abs({ left: 0, top: px(6), width: px(13), height: px(1), background: tick }),
  );
const rule = (y) => abs({ left: 0, top: px(y), width: size, height: px(1), background: line });

// Frame: rails, rules and crosshairs, as on the website.
export const RAIL_L = 48;
export const RAIL_R = 1032;
export const frame = (top, bottom) => [
  abs({ left: px(RAIL_L), top: 0, width: px(1), height: size, background: line }),
  abs({ left: px(RAIL_R), top: 0, width: px(1), height: size, background: line }),
  rule(top),
  rule(bottom),
  cross(RAIL_L, top),
  cross(RAIL_R, top),
  cross(RAIL_L, bottom),
  cross(RAIL_R, bottom),
];

// Header: the summit's brand on the left, the organiser on the right.
export const header = (aiyaiyai) =>
  abs(
    { left: px(72), top: px(40), width: px(936), height: px(48), alignItems: "center", justifyContent: "space-between" },
    box(
      { alignItems: "center", gap: px(12) },
      img(mark, 27, 21, "image/svg+xml"),
      words("Accelerating LATAM Summit", { gap: px(6), fontWeight: 500, fontSize: px(21), letterSpacing: px(-0.4) }),
    ),
    box(
      { alignItems: "center", gap: px(12) },
      h("span", { style: { fontFamily: "Inter", fontSize: px(15), color: muted } }, "Organiza"),
      img(aiyaiyai, 92, 28),
    ),
  );
