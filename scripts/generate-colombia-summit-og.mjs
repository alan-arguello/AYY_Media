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
const columns = 150;
const rows = 53;
const glyphs = " .,:;+=xX#%@";
const photo = await sharp(
  await readFile(asset("public/images/colombia-summit/bogota-hero.webp")),
)
  .resize(columns, rows, { fit: "cover" })
  .removeAlpha()
  .raw()
  .toBuffer();

// Derive the ASCII landscape from the same real Bogota photograph as the page.
const cells = [];
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < columns; col++) {
    const i = (row * columns + col) * 3;
    const light =
      (photo[i] * 0.2126 + photo[i + 1] * 0.7152 + photo[i + 2] * 0.0722) / 255;
    const glyph =
      glyphs[
        Math.min(
          glyphs.length - 1,
          Math.floor(Math.pow(light, 0.65) * glyphs.length),
        )
      ];
    const reveal = 0.12 + Math.pow(col / columns, 2) * 1.2;
    const sky = row / rows < 0.32 && light > 0.65 ? 0.12 : 1;
    const shade = Math.round(9 + Math.min(0.75, light * reveal * sky) * 175);
    cells.push(
      `<text x="${col * 8}" y="${row * 12 + 10}" fill="rgb(${shade},${shade},${shade})">${glyph}</text>`,
    );
  }
}
const background = await sharp(
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#090909"/><g font-family="monospace" font-size="10">${cells.join("")}</g></svg>`,
  ),
)
  .png()
  .toBuffer();

// Existing Torrenegra mark, unchanged from the site's icon component.
const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 28.364"><path fill="white" d="M15.49 26.794c-.829.995-2.057 1.57-3.352 1.57H8.727a8.728 8.728 0 0 1-6.171-2.556A8.728 8.728 0 0 1 0 19.636v-4.363A8.728 8.728 0 0 1 2.556 9.1a8.728 8.728 0 0 1 6.171-2.555H26.32c1.295 0 2.523-.575 3.352-1.57L32.51 1.57C33.339.575 34.567 0 35.862 0h3.41C44.093 0 48 3.907 48 8.727v4.364c0 4.82-3.907 8.727-8.727 8.727H21.68c-1.295 0-2.523.575-3.352 1.57l-2.838 3.406ZM41.455 8.728c0-.579-.23-1.134-.639-1.544a2.183 2.183 0 0 0-1.543-.639H32.59c-1.295 0-2.523.575-3.352 1.57L26.4 11.52c-.829.995-2.057 1.57-3.352 1.57H8.727a2.182 2.182 0 0 0-2.182 2.182v4.364a2.182 2.182 0 0 0 2.182 2.182h6.684c1.295 0 2.523-.575 3.352-1.57l2.838-3.405c.829-.995 2.057-1.57 3.352-1.57h14.32a2.182 2.182 0 0 0 2.181-2.182V8.727Z"/></svg>`;
const torreSource = await readFile(
  asset("public/images/colombia-summit/credential-torre-ai.png"),
);
const worder = await readFile(
  asset("public/images/colombia-summit/worder.png"),
);
const organizer = await readFile(
  asset("public/images/colombia-summit/aiyaiyai.png"),
);
const torreSize = await sharp(torreSource).metadata();
const torreAlpha = await sharp(torreSource).extractChannel("alpha").toBuffer();
const torre = await sharp({
  create: {
    width: torreSize.width,
    height: torreSize.height,
    channels: 3,
    background: "#fff",
  },
})
  .joinChannel(torreAlpha)
  .png()
  .toBuffer();
const font = await readFile(
  asset("node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf"),
);
const mono = await readFile(
  asset("node_modules/geist/dist/fonts/geist-mono/GeistMono-Bold.ttf"),
);
const row = (style, ...children) =>
  h("div", { style: { display: "flex", ...style } }, ...children);

const image = new ImageResponse(
  row(
    {
      width,
      height,
      position: "relative",
      background: "#090909",
      color: "#f5f5f5",
      fontFamily: "Geist",
      letterSpacing: 0,
    },
    h("img", {
      src: dataUrl(background),
      width,
      height,
      style: { position: "absolute", inset: 0 },
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
        padding: "50px 64px 42px",
      },
      row(
        { justifyContent: "space-between", alignItems: "center" },
        row(
          { alignItems: "center", gap: 16 },
          h("img", {
            src: dataUrl(organizer),
            width: 125,
            height: 40,
            style: { objectFit: "contain" },
          }),
          row(
            { flexDirection: "column", gap: 3 },
            h("span", { style: { fontSize: 14, color: "#999" } }, "Organiza"),
            h("span", { style: { fontSize: 23 } }, "AIYaiYai"),
          ),
        ),
        h(
          "span",
          { style: { fontSize: 19, color: "#bbb" } },
          "Bogotá, Colombia",
        ),
      ),
      row(
        { flexDirection: "column", marginTop: 26 },
        h("span", { style: { fontSize: 55, lineHeight: 1.2 } }, "Back to the"),
        h(
          "span",
          {
            style: {
              fontFamily: "Geist Mono",
              fontWeight: 700,
              fontSize: 88,
              lineHeight: 1.2,
              marginTop: 8,
            },
          },
          "Future Summit_",
        ),
        h(
          "span",
          { style: { fontSize: 25, color: "#bbb", marginTop: 28 } },
          "IA, empresas y lo que viene.",
        ),
      ),
      row(
        {
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #555",
          paddingTop: 26,
        },
        h("span", { style: { fontSize: 23 } }, "19 de noviembre, 2026"),
        row(
          { alignItems: "center", gap: 20, width: 520, flexShrink: 0 },
          h(
            "span",
            {
              style: { fontSize: 13, color: "#999", width: 65, flexShrink: 0 },
            },
            "Sponsors",
          ),
          h("img", {
            src: dataUrl(Buffer.from(mark), "image/svg+xml"),
            width: 28,
            height: 18,
          }),
          h(
            "span",
            { style: { fontSize: 17, width: 146, flexShrink: 0 } },
            "Torrenegra & Co",
          ),
          h("img", { src: dataUrl(torre), width: 80, height: 18 }),
          h("img", {
            src: dataUrl(worder),
            width: 94,
            height: 23,
            style: { objectFit: "contain" },
          }),
        ),
      ),
    ),
  ),
  {
    width,
    height,
    fonts: [
      { name: "Geist", data: font, weight: 400, style: "normal" },
      { name: "Geist Mono", data: mono, weight: 700, style: "normal" },
    ],
  },
);
const output = asset("public/images/colombia-summit/opengraph.png");
await writeFile(output, Buffer.from(await image.arrayBuffer()));
console.log(`Generated ${output.pathname} (${width}x${height})`);
