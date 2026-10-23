// Generates marketing/evento-y-cena-bogota.{png,jpg} (1080×1080, rendered at
// 2×): the summit and the private dinner, for social posts. All five speakers
// cut out and standing together in front of one Bogotá panorama at golden
// hour, Alexander Torrenegra and Tania Zapata (the dinner's hosts) in the
// middle. The sources mix colour, black and white, studio and selfie, so the
// people share one warm monochrome grade, as on the site's speaker cards.
// Photos and masks live in marketing/photos/ and marketing/masks/ (git-ignored).
//   npm run promo:hosts              (PROMO_COLOR=1 keeps the photos in colour)
import { ArrowRight } from "lucide-react";
import { baseCss, city, COLORS, icon, loadPerson, place, render } from "./photo-promo-kit.mjs";
import { dinnerSeats } from "../src/lib/summit-pricing.ts";

const W = 1080, H = 1080;
const { cream: CREAM, muted: MUTED, yellow: YELLOW, red: RED, line: LINE } = COLORS;
// The panorama, and the strip at its foot that names each speaker.
const FRAME = { x: 36, y: 92, w: 1008, h: 430 };
const STRIP = 78;

// Left to right. `face` places the face centre in the panorama (fractions) at
// a height in CSS pixels; face boxes come from Apple's Vision framework, in
// source pixels. Heights differ because each box is cut differently.
const SPEAKERS = [
  {
    name: "Alan Argüello", role: "Torrenegra & Co",
    photo: "public/images/speakers/alan-arguello-sf.webp", mask: "marketing/masks/alan-arguello-sf.png",
    size: [900, 900], box: { x: 343, y: 191, w: 230, h: 230 }, face: { x: 0.1, y: 0.47, h: 112 }, feather: 0.06, z: 2,
  },
  {
    name: "Tania Zapata", role: "Voice123 · Bunny Inc.",
    photo: "marketing/photos/tania-zapata-stairs.png", mask: "marketing/photos/masks/tania-zapata-stairs.png",
    size: [452, 442], box: { x: 195, y: 82, w: 71, h: 71 }, face: { x: 0.3, y: 0.465, h: 108 }, upscale: 4, z: 3,
  },
  {
    name: "Alexander Torrenegra", role: "Torre.ai · Shark Tank",
    photo: "marketing/photos/alex-torrenegra-studio.jpg", mask: "marketing/photos/masks/alex-torrenegra-studio.png",
    size: [3840, 2160], box: { x: 1220, y: 515, w: 856, h: 856 }, face: { x: 0.5, y: 0.455, h: 130 }, feather: 0.03, choke: 6, z: 4,
  },
  {
    name: "Catalina Morales", role: "Operaciones · Torre.ai",
    photo: "public/images/colombia-summit/catalina-morales.webp", mask: "marketing/masks/catalina-morales.png",
    size: [296, 296], box: { x: 87, y: 89, w: 131, h: 131 }, face: { x: 0.7, y: 0.53, h: 120 }, upscale: 2, feather: 0.05, choke: 1, z: 3,
  },
  {
    name: "Juan Pablo Rodríguez", role: "Marketing · Torre.ai",
    photo: "public/images/colombia-summit/juan-pablo-rodriguez.webp", mask: "marketing/masks/juan-pablo-rodriguez.png",
    size: [600, 600], box: { x: 192, y: 227, w: 184, h: 184 }, face: { x: 0.9, y: 0.47, h: 112 }, feather: 0.07, choke: 2.5, z: 2,
  },
];

const color = Boolean(process.env.PROMO_COLOR);
const [css, bogota, ...speakers] = await Promise.all([baseCss({ width: W, height: H }), city(), ...SPEAKERS.map(loadPerson)]);

const html = /* html */ `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${css}
.frame { position: absolute; left: ${FRAME.x}px; top: ${FRAME.y}px; width: ${FRAME.w}px; height: ${FRAME.h}px; overflow: hidden;
  border: 1px solid rgb(243 236 220 / 0.22); background: #1a140c; }
/* One continuous Bogotá behind everyone: the Cerros Orientales and the city. */
.frame .city { background-image: url(${bogota}); background-size: cover; background-position: 50% 58%;
  filter: blur(2.5px) brightness(0.56) saturate(1.15) contrast(1.05); }
${color ? "" : ".frame .person { filter: grayscale(1) sepia(0.2) contrast(1.08) brightness(1.04); }"}
.names { position: absolute; left: 0; right: 0; bottom: 0; height: ${STRIP}px; display: grid; grid-template-columns: repeat(${SPEAKERS.length}, 1fr);
  background: rgb(14 12 9 / 0.92); border-top: 1px solid rgb(243 236 220 / 0.14); z-index: 6; }
.names > div { display: grid; align-content: center; justify-items: center; gap: 5px; padding: 0 6px; text-align: center; }
.names > div + div { border-left: 1px solid rgb(243 236 220 / 0.12); }
.names b { font: 600 16.5px Geist, sans-serif; letter-spacing: -0.02em; white-space: nowrap; }
.names span { font: 400 11.5px GeistMono, monospace; color: ${MUTED}; white-space: nowrap; }
.headline { font: 600 60px/1.02 Geist, sans-serif; letter-spacing: -0.045em; text-wrap: balance; }
.headline em { font-style: normal; color: ${YELLOW}; } .headline i { font-style: normal; color: ${RED}; }
.sub { margin-top: 18px; font: 400 18px/1.5 Geist, sans-serif; color: #cfc7b4; text-wrap: pretty; }
.sub b { font-weight: 500; color: ${CREAM}; }
.date { font: 500 132px/0.86 GeistPixel, monospace; letter-spacing: -0.05em; white-space: nowrap; }
.plan { display: grid; grid-template-columns: 1fr 1fr; border: 1px dashed ${LINE}; }
.plan > div { display: grid; gap: 7px; padding: 16px 20px; }
.plan > div + div { border-left: 1px dashed ${LINE}; }
.plan b { font: 600 18px Geist, sans-serif; letter-spacing: -0.015em; }
.plan span { font: 400 13px GeistMono, monospace; color: ${MUTED}; }
.cta { top: 974px; }
</style></head><body>
<div class="abs m" style="left:36px; right:36px; top:32px; display:flex; font-size:15px; color:${MUTED}">
  <span style="color:${CREAM}"><span class="flag"></span>bogota.forward() summit</span>
  <span style="margin-left:auto">Evento + cena privada · Bogotá</span>
</div>
<div class="rule" style="top:66px"></div>

<div class="frame">
  <div class="city"></div>
  ${speakers.map((p) => `<div class="person" style="z-index:${p.z}; background-image:url(${p.src}); mask-image:url(${p.alpha}); -webkit-mask-image:url(${p.alpha}); ${place(p, FRAME, FRAME.h - STRIP)}"></div>`).join("")}
  <div class="names">${speakers.map((p) => `<div><b>${p.name}</b><span>${p.role}</span></div>`).join("")}</div>
</div>
<div class="corner" style="left:${FRAME.x - 3}px; top:${FRAME.y - 3}px"></div>
<div class="corner" style="left:${FRAME.x + FRAME.w - 4}px; top:${FRAME.y + FRAME.h - 4}px"></div>

<div class="abs" style="left:36px; top:562px; width:640px">
  <div class="headline">Un evento y una cena privada en <em>Bogotá</em><i>.</i></div>
  <p class="sub">Cinco speakers que viven de primera mano lo que la IA está cambiando en sus empresas, y una cena privada con <b>Alexander Torrenegra</b> y <b>Tania Zapata</b>.</p>
</div>
<div class="abs" style="right:36px; top:562px; display:grid; justify-items:end; gap:14px">
  <div class="kicker"><b>//</b> jueves</div>
  <div class="date">19.11</div>
  <div class="m" style="font-size:14px; color:${MUTED}">noviembre · 2026</div>
</div>

<div class="abs plan" style="left:36px; right:36px; top:824px">
  <div><b>Summit</b><span>10:00 a 16:00 · Charlas, fireside chat y workshop</span></div>
  <div><b>Cena privada</b><span>Con Alexander y Tania · ${dinnerSeats} lugares · Sujeto a aceptación</span></div>
</div>

<div class="cta">
  <span class="m" style="font-size:14px; color:#4a443a">Para founders, C-levels y ejecutivos.</span>
  <span style="margin-left:auto; display:flex; align-items:center; gap:10px; font: 500 21px Geist, sans-serif">Conoce más en
    <span class="m cta-link">aiyaiyai.io</span>${icon(ArrowRight, 21)}</span>
</div>
</body></html>`;

await render(html, { width: W, height: H, out: color ? "marketing/evento-y-cena-bogota-color" : "marketing/evento-y-cena-bogota" });
