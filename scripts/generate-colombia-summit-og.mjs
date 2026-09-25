// Generates public/images/colombia-summit/opengraph.png (1200×630) and
// src/app/icon.png. Run with `npm run og` after changing the photo or copy.
import { readFile, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const asset = (path) => new URL(path, root);
const dataUrl = (buffer, type = "image/png") =>
  `data:${type};base64,${buffer.toString("base64")}`;
const width = 1200;
const height = 630;

// The plane crossing Bogotá's sunset clouds, cropped so it sits upper right.
const photo = await sharp(
  await readFile(asset("public/images/photos/bogota-sky.webp")),
)
  .resize(1320, 743)
  .extract({ left: 40, top: 30, width, height })
  .jpeg({ quality: 90 })
  .toBuffer();

// Same geometry as <LogoMark />.
const markPaths = (color) =>
  `<path d="M1 18.5 C 11 18.5, 17 15, 23.5 2.5" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/><circle cx="23.5" cy="2.5" r="2.3" fill="${color}"/>`;
const mark = (color) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 20">${markPaths(color)}</svg>`;

// The organiser's logo is white; keep it white on the photograph.
const organizer = await readFile(
  asset("public/images/colombia-summit/aiyaiyai.png"),
);

const font = (name) => readFile(asset(`scripts/fonts/${name}.ttf`));
const [displayLight, displayMedium, text, textMedium] = await Promise.all([
  font("HostGrotesk-300"),
  font("HostGrotesk-500"),
  font("Inter-400"),
  font("Inter-500"),
]);

const row = (style, ...children) =>
  h("div", { style: { display: "flex", ...style } }, ...children);
// Satori does not tighten spaces with tracking, so words are set apart.
const words = (value, style) =>
  row(style, ...value.split(" ").map((word) => h("span", null, word)));
const pill = (children, solid = false) =>
  row(
    {
      alignItems: "center",
      gap: 10,
      height: 42,
      padding: "0 18px",
      borderRadius: 999,
      fontFamily: "Inter",
      fontWeight: 500,
      fontSize: 18,
      color: solid ? "#000" : "#fff",
      background: solid ? "#fff" : "rgba(255,255,255,0.14)",
      border: solid ? "none" : "1px solid rgba(255,255,255,0.3)",
    },
    ...children,
  );

const image = new ImageResponse(
  row(
    { width, height, position: "relative", fontFamily: "Host Grotesk", color: "#fff" },
    h("img", {
      src: dataUrl(photo, "image/jpeg"),
      width,
      height,
      style: { position: "absolute", top: 0, left: 0 },
    }),
    h("div", {
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        background:
          "linear-gradient(180deg, rgba(20,10,30,0.2) 0%, rgba(20,10,30,0) 28%, rgba(12,6,24,0.35) 62%, rgba(8,4,18,0.78) 100%)",
      },
    }),
    row(
      {
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "44px 56px 48px",
      },
      row(
        { justifyContent: "space-between", alignItems: "center" },
        row(
          { alignItems: "center", gap: 12 },
          h("img", {
            src: dataUrl(Buffer.from(mark("#fff")), "image/svg+xml"),
            width: 30,
            height: 23,
          }),
          words("Accelerating LATAM Summit", {
            gap: 6,
            fontWeight: 500,
            fontSize: 25,
            letterSpacing: -0.4,
          }),
        ),
        pill([h("span", null, "Bogotá · 19.11.2026")], true),
      ),
      row(
        { flexDirection: "column" },
        words("Accelerating", {
          fontWeight: 300,
          fontSize: 108,
          lineHeight: 1,
          letterSpacing: -4,
        }),
        words("LATAM Summit", {
          gap: 22,
          fontWeight: 300,
          fontSize: 108,
          lineHeight: 1,
          letterSpacing: -4,
          marginTop: 4,
        }),
        h(
          "span",
          {
            style: {
              fontFamily: "Inter",
              fontSize: 25,
              marginTop: 22,
              color: "rgba(255,255,255,0.88)",
            },
          },
          "IA, empresas y lo que viene · Jueves 19 de noviembre, 2026",
        ),
        row(
          { gap: 10, marginTop: 28, alignItems: "center" },
          pill([
            h("span", { style: { color: "rgba(255,255,255,0.75)" } }, "Organiza"),
            h("img", { src: dataUrl(organizer), width: 69, height: 21 }),
          ]),
          pill([h("span", null, "Torrenegra & Co · Torre.ai · Worder")]),
        ),
      ),
    ),
  ),
  {
    width,
    height,
    fonts: [
      { name: "Host Grotesk", data: displayLight, weight: 300, style: "normal" },
      { name: "Host Grotesk", data: displayMedium, weight: 500, style: "normal" },
      { name: "Inter", data: text, weight: 400, style: "normal" },
      { name: "Inter", data: textMedium, weight: 500, style: "normal" },
    ],
  },
);
const og = asset("public/images/colombia-summit/opengraph.png");
await writeFile(og, Buffer.from(await image.arrayBuffer()));
console.log(`Generated ${og.pathname}`);

// Favicon: the curve in white on a black rounded tile.
const icon = asset("src/app/icon.png");
await sharp(
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#000"/><g transform="translate(12 16.5) scale(1.54)">${markPaths("#fff")}</g></svg>`,
  ),
  { density: 600 },
)
  .resize(256, 256)
  .png()
  .toFile(icon.pathname);
console.log(`Generated ${icon.pathname}`);
