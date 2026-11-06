// Generates public/images/people/*.webp: each person cut out, in black and
// white, on the same deep green studio backdrop. Sources (git-ignored) live in
// marketing/photos/, with Vision masks from scripts/person-mask.swift.
//   npm run portraits
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const W = 800;
const H = 960;

// `face` is the Vision face box in source pixels (centre and height); `at`
// places that centre in the frame and sizes it, as fractions of the height.
// `tone` is the contrast and offset that bring both sources to the same range.
const PEOPLE = [
  {
    out: "alex-torrenegra",
    photo: "marketing/photos/alex-torrenegra-studio.jpg",
    mask: "marketing/photos/masks/alex-torrenegra-studio.png",
    face: { x: 1648, y: 943, h: 856 },
    at: { x: 0.5, y: 0.455, h: 0.39 },
    choke: 6,
    tone: [1.14, -14],
  },
  {
    out: "alan-arguello",
    photo: "marketing/photos/alan-arguello-fireside-crop.jpg",
    mask: "marketing/photos/masks/alan-arguello-fireside-crop.png",
    face: { x: 860, y: 711, h: 336 },
    at: { x: 0.45, y: 0.42, h: 0.345 },
    choke: 6,
    tone: [1.3, -38],
  },
];

const backdrop = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><radialGradient id="g" cx="50%" cy="42%" r="78%">
    <stop offset="0" stop-color="#13a560"/><stop offset="0.46" stop-color="#0b7a46"/><stop offset="1" stop-color="#053a22"/>
  </radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`);

async function portrait({ out, photo, mask, face, at, choke, tone }) {
  const { width, height } = await sharp(photo).metadata();
  const k = (at.h * H) / face.h;
  const w = Math.round(width * k);
  const h = Math.round(height * k);
  const left = Math.round(at.x * W - face.x * k);
  const top = Math.round(at.y * H - face.y * k);
  if (top + h < H) console.warn(`${out}: the photo ends ${H - top - h}px above the bottom`);

  // The part of the scaled photo that lands inside the frame.
  const crop = {
    left: Math.max(0, -left),
    top: Math.max(0, -top),
    width: Math.min(w - Math.max(0, -left), W - Math.max(0, left)),
    height: Math.min(h - Math.max(0, -top), H - Math.max(0, top)),
  };

  const person = await sharp(photo)
    .resize(w, h, { kernel: "lanczos3" })
    .extract(crop)
    .greyscale()
    .linear(...tone)
    .sharpen({ sigma: 0.6 })
    .toColourspace("srgb")
    .raw()
    .toBuffer({ resolveWithObject: true });

  // A median drops Vision's specks; the choke pulls the edge in to lose halos.
  const alpha = await sharp(mask)
    .resize(w, h, { kernel: "lanczos3" })
    .extract(crop)
    .greyscale()
    .median(3)
    .blur(Math.max(0.6, choke * k))
    .linear(2.2, -1.2 * 255)
    .toColourspace("b-w")
    .raw()
    .toBuffer();

  const cutout = await sharp(person.data, { raw: person.info })
    .removeAlpha()
    .joinChannel(alpha, { raw: { width: crop.width, height: crop.height, channels: 1 } })
    .png()
    .toBuffer();

  await sharp(backdrop)
    .composite([{ input: cutout, left: Math.max(0, left), top: Math.max(0, top) }])
    .webp({ quality: 86 })
    .toFile(`public/images/people/${out}.webp`);
  // The same frame without the backdrop, for the share image.
  await sharp({ create: { width: W, height: H, channels: 4, background: "#0000" } })
    .composite([{ input: cutout, left: Math.max(0, left), top: Math.max(0, top) }])
    .png()
    .toFile(`marketing/photos/cutouts/${out}.png`);
  console.log(`public/images/people/${out}.webp`);
}

await mkdir("public/images/people", { recursive: true });
await mkdir("marketing/photos/cutouts", { recursive: true });
await Promise.all(PEOPLE.map(portrait));
