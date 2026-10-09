// Generates marketing/accelerating-latam-summit-square.png: a 1:1 promo post
// (2160×2160, i.e. 1080 at 2×) in the website's design system.
// Run with `npm run social`.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";
import sharp from "sharp";
import {
  abs,
  asset,
  blackLogo,
  box,
  dataUrl,
  fonts,
  frame,
  header,
  img,
  ink,
  ink2,
  line,
  muted,
  paper,
  pill,
  px,
  size,
  words,
} from "./promo-kit.mjs";

const [aiyaiyai, torre, worder] = await Promise.all([
  blackLogo("public/images/colombia-summit/aiyaiyai.png"),
  blackLogo("public/images/colombia-summit/credential-torre-ai.png"),
  blackLogo("public/images/colombia-summit/worder.png"),
]);
const torrenegra = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 28.364"><path fill="${ink}" d="M15.49 26.794c-.829.995-2.057 1.57-3.352 1.57H8.727a8.728 8.728 0 0 1-6.171-2.556A8.728 8.728 0 0 1 0 19.636v-4.363A8.728 8.728 0 0 1 2.556 9.1a8.728 8.728 0 0 1 6.171-2.555H26.32c1.295 0 2.523-.575 3.352-1.57L32.51 1.57C33.339.575 34.567 0 35.862 0h3.41C44.093 0 48 3.907 48 8.727v4.364c0 4.82-3.907 8.727-8.727 8.727H21.68c-1.295 0-2.523.575-3.352 1.57l-2.838 3.406ZM41.455 8.728c0-.579-.23-1.134-.639-1.544a2.183 2.183 0 0 0-1.543-.639H32.59c-1.295 0-2.523.575-3.352 1.57L26.4 11.52c-.829.995-2.057 1.57-3.352 1.57H8.727a2.182 2.182 0 0 0-2.182 2.182v4.364a2.182 2.182 0 0 0 2.182 2.182h6.684c1.295 0 2.523-.575 3.352-1.57l2.838-3.405c.829-.995 2.057-1.57 3.352-1.57h14.32a2.182 2.182 0 0 0 2.181-2.182V8.727Z"/></svg>`,
);

// The hero photograph, cropped to the card; keep Monserrate's summit.
const CARD = { x: 72, y: 486, w: 936, h: 386, r: 28 };
const photo = await sharp(
  await readFile(asset("public/images/photos/bogota-golden-hour.webp")),
)
  .resize(px(CARD.w), px(CARD.h), { fit: "cover", position: "top" })
  .jpeg({ quality: 92 })
  .toBuffer();

const RULE_TOP = 118;
const RULE_BOTTOM = 918;

const image = new ImageResponse(
  box(
    { width: size, height: size, position: "relative", background: paper, fontFamily: "Host Grotesk", color: ink },
    ...frame(RULE_TOP, RULE_BOTTOM),
    header(aiyaiyai),

    // Title and tagline.
    abs(
      { left: px(68), top: px(146), flexDirection: "column" },
      words("Accelerating", { fontWeight: 300, fontSize: px(128), lineHeight: 1, letterSpacing: px(-4.8) }),
      words("LATAM Summit", { gap: px(26), fontWeight: 300, fontSize: px(128), lineHeight: 1, letterSpacing: px(-4.8), marginTop: px(4) }),
    ),
    abs(
      { left: px(72), top: px(428), alignItems: "center", gap: px(16) },
      h("span", { style: { fontFamily: "Inter", fontSize: px(24), color: ink2 } }, "IA, empresas y lo que viene."),
    ),

    // Photo card with date and city.
    abs(
      { left: px(CARD.x), top: px(CARD.y), width: px(CARD.w), height: px(CARD.h), borderRadius: px(CARD.r), overflow: "hidden" },
      h("img", { src: dataUrl(photo, "image/jpeg"), width: px(CARD.w), height: px(CARD.h), style: { position: "absolute", top: 0, left: 0 } }),
      abs({ left: 0, top: 0, width: px(CARD.w), height: px(CARD.h), background: "linear-gradient(180deg, rgba(20,12,8,0) 55%, rgba(20,12,8,0.35) 100%)" }),
      abs(
        { left: px(18), top: px(18), width: px(CARD.w - 36), justifyContent: "space-between" },
        pill("Jueves 19 de noviembre, 2026"),
        pill("Bogotá, Colombia", { dot: true }),
      ),
    ),

    // Sponsors.
    abs(
      { left: px(72), top: px(RULE_BOTTOM), width: px(936), height: px(1080 - RULE_BOTTOM), alignItems: "center" },
      h("span", { style: { fontFamily: "Inter", fontSize: px(15), color: muted, width: px(118) } }, "Sponsors"),
      box(
        { flex: 1, alignItems: "center", justifyContent: "space-between" },
        box(
          { alignItems: "center", gap: px(12) },
          img(torrenegra, 44, 26, "image/svg+xml"),
          words("Torrenegra & Co", { gap: px(5), fontWeight: 500, fontSize: px(24), letterSpacing: px(-0.4) }),
        ),
        box({ width: px(1), height: px(44), background: line }),
        img(torre, 132, 28),
        box({ width: px(1), height: px(44), background: line }),
        img(worder, 139, 32),
      ),
    ),
  ),
  { width: size, height: size, fonts },
);

await mkdir(asset("marketing/"), { recursive: true });
const out = asset("marketing/accelerating-latam-summit-square.png");
await writeFile(out, Buffer.from(await image.arrayBuffer()));
console.log(`Generated ${out.pathname}`);
