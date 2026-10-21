// Generates marketing/cena-privada-bogota.{png,jpg} (1080×1080, rendered at
// 2×): the private dinner with Alexander Torrenegra and Tania Zapata, with
// photos instead of ASCII. Each host is cut out and set against Bogotá at
// golden hour: the Cerros Orientales behind Alexander, the city behind Tania.
// Photos and masks live in marketing/photos/ (git-ignored).
//   npm run promo:dinner
import { ArrowRight } from "lucide-react";
import { baseCss, city, COLORS, icon, loadPerson, place, render } from "./photo-promo-kit.mjs";

const SEATS = 12;
const W = 1080, H = 1080;
const CARD = { top: 432, w: 498, h: 390, gap: 12 };
const { cream: CREAM, muted: MUTED, yellow: YELLOW, red: RED, line: LINE } = COLORS;

// `face` places the face centre in the card (fractions) at a height in CSS
// pixels; `city` is the part of the Bogotá photo behind each host.
const HOSTS = [
  {
    name: "Alexander Torrenegra", role: "Torre.ai · Shark Tank",
    photo: "marketing/photos/alex-torrenegra-studio.jpg", mask: "marketing/photos/masks/alex-torrenegra-studio.png",
    size: [3840, 2160], box: { x: 1220, y: 515, w: 856, h: 856 }, face: { x: 0.5, y: 0.37, h: 162 },
    city: "18% 30%",
  },
  {
    name: "Tania Zapata", role: "Voice123 · Bunny Inc.",
    photo: "marketing/photos/tania-zapata-stairs.png", mask: "marketing/photos/masks/tania-zapata-stairs.png",
    size: [452, 442], box: { x: 195, y: 82, w: 71, h: 71 }, face: { x: 0.5, y: 0.335, h: 126 }, upscale: 4,
    city: "88% 78%",
  },
];

const [css, bogota, ...hosts] = await Promise.all([baseCss({ width: W, height: H }), city(), ...HOSTS.map(loadPerson)]);

const html = /* html */ `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${css}
.title { font: 500 134px/0.96 GeistPixel, monospace; letter-spacing: -0.05em; white-space: nowrap; }
.title .b { color: ${YELLOW}; } .title .d { color: ${RED}; }
.card { top: ${CARD.top}px; width: ${CARD.w}px; height: ${CARD.h}px; }
.city { background-image: url(${bogota}); }
.label { position: absolute; left: 0; right: 0; bottom: 0; padding: 14px 18px 15px; display: flex; align-items: baseline; justify-content: space-between;
  background: rgb(14 12 9 / 0.86); border-top: 1px solid rgb(243 236 220 / 0.14); }
.label b { font: 600 20px Geist, sans-serif; letter-spacing: -0.02em; }
.label span { font: 400 12.5px GeistMono, monospace; color: ${MUTED}; }
.date { font: 500 96px/0.9 GeistPixel, monospace; letter-spacing: -0.05em; white-space: nowrap; }
.date span { color: ${MUTED}; }
.seats { display: flex; gap: 7px; }
.seats i { width: 23px; height: 23px; background: ${YELLOW}; }
.cta { top: 974px; }
</style></head><body>
<div class="abs m" style="left:36px; right:36px; top:32px; display:flex; font-size:15px; color:${MUTED}">
  <span style="color:${CREAM}"><span class="flag"></span>Cena privada · Bogotá</span>
  <span style="margin-left:auto">${SEATS} lugares · sujeto a aceptación</span>
</div>
<div class="rule" style="top:66px"></div>
<div class="abs title" style="left:32px; top:96px">Cena privada<br>en <span class="b">Bogotá</span><span class="d">.</span></div>
<div class="abs" style="left:36px; top:370px; font: 500 33px/1.15 Geist, sans-serif; letter-spacing:-0.03em">
  con Alexander Torrenegra <span style="color:${MUTED}">y</span> Tania Zapata.</div>
${hosts.map((host, i) => {
  const left = 36 + i * (CARD.w + CARD.gap);
  return `<div class="card" style="left:${left}px">
    <div class="city" style="background-position:${host.city}"></div>
    <div class="person" style="background-image:url(${host.src}); mask-image:url(${host.alpha}); -webkit-mask-image:url(${host.alpha}); ${place(host, CARD, CARD.h - 60)}"></div>
    <div class="label"><b>${host.name}</b><span>${host.role}</span></div>
  </div>`;
}).join("")}
<div class="corner" style="left:33px; top:${CARD.top - 3}px"></div>
<div class="corner" style="left:${36 + 2 * CARD.w + CARD.gap - 4}px; top:${CARD.top + CARD.h - 4}px"></div>
<div class="abs" style="left:36px; top:846px">
  <div class="kicker"><b>//</b> jueves</div>
  <div class="date" style="margin-top:12px">19.11<span>.2026</span></div>
</div>
<div class="abs" style="left:620px; top:846px; height:100px; border-left:1px dashed ${LINE}"></div>
<div class="abs" style="right:36px; top:846px; display:grid; justify-items:end">
  <div class="kicker"><b>//</b> mesa para ${SEATS}</div>
  <div class="seats" style="margin-top:16px">${Array.from({ length: SEATS }, () => "<i></i>").join("")}</div>
  <div class="m" style="margin-top:16px; font-size:15px">${SEATS} lugares <span style="color:${MUTED}">· sujeto a aceptación</span></div>
</div>
<div class="cta">
  <span class="m" style="font-size:14px; color:#4a443a">Sin escenario: preguntas directas y feedback de primera mano.</span>
  <span style="margin-left:auto; display:flex; align-items:center; gap:10px; font: 500 21px Geist, sans-serif">Solicita tu lugar en
    <span class="m cta-link">aiyaiyai.io</span>${icon(ArrowRight, 21)}</span>
</div>
</body></html>`;

await render(html, { width: W, height: H, out: "marketing/cena-privada-bogota" });
