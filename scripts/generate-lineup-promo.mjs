// Generates marketing/bogota-forward-lineup.{png,jpg} (1080×1080, rendered at
// 2×): the summit's four sessions with photos of all five speakers, each cut
// out and set on Bogotá at golden hour. Same language as the dinner promo:
// warm black, cream type, the wordmark's syntax colours as light.
// Photos and masks live in marketing/photos/ and marketing/masks/ (git-ignored).
//   npm run promo:lineup
import { ArrowRight } from "lucide-react";
import { baseCss, city, COLORS, icon, loadPerson, place, render } from "./photo-promo-kit.mjs";

const W = 1080, H = 1080;
const { cream: CREAM, muted: MUTED, yellow: YELLOW, red: RED, line: LINE } = COLORS;
const ROW1 = { top: 300, h: 286, w: 498 };
const ROW2 = { top: 598, h: 240 };
const GAP = 12;
const LABEL = 76;

// Face boxes from Apple's Vision framework, in source pixels; `face` places
// the face centre in its card (fractions) at a height in CSS pixels.
const person = {
  alexander: {
    name: "Alexander Torrenegra",
    photo: "marketing/photos/alex-torrenegra-studio.jpg", mask: "marketing/photos/masks/alex-torrenegra-studio.png",
    size: [3840, 2160], box: { x: 1220, y: 515, w: 856, h: 856 }, face: { x: 0.5, y: 0.385, h: 114 },
  },
  tania: {
    name: "Tania Zapata",
    photo: "marketing/photos/tania-zapata-stairs.png", mask: "marketing/photos/masks/tania-zapata-stairs.png",
    size: [452, 442], box: { x: 195, y: 82, w: 71, h: 71 }, face: { x: 0.5, y: 0.33, h: 94 }, upscale: 4,
  },
  alan: {
    name: "Alan Argüello",
    photo: "public/images/speakers/alan-arguello-sf.webp", mask: "marketing/masks/alan-arguello-sf.png",
    size: [900, 900], box: { x: 343, y: 191, w: 230, h: 230 }, face: { x: 0.5, y: 0.37, h: 78 }, feather: 0.06,
  },
  juanPablo: {
    name: "Juan Pablo Rodríguez",
    photo: "public/images/colombia-summit/juan-pablo-rodriguez.webp", mask: "marketing/masks/juan-pablo-rodriguez.png",
    size: [600, 600], box: { x: 192, y: 227, w: 184, h: 184 }, face: { x: 0.36, y: 0.39, h: 76 }, feather: 0.07, choke: 2.5,
    // The only black-and-white source: warmed so it sits with the others.
    filter: "sepia(0.32) saturate(1.25) contrast(1.06)",
  },
  catalina: {
    name: "Catalina Morales",
    photo: "public/images/colombia-summit/catalina-morales.webp", mask: "marketing/masks/catalina-morales.png",
    size: [296, 296], box: { x: 87, y: 89, w: 131, h: 131 }, face: { x: 0.65, y: 0.41, h: 78 }, upscale: 2, feather: 0.05, choke: 1,
  },
};

// The four sessions, as on the site's agenda. `city` is the part of the
// Bogotá photo behind each card.
const SESSIONS = [
  { n: "01", format: "Charla", title: "Cómo predecir el futuro", people: ["alexander"], city: "18% 30%" },
  { n: "02", format: "Fireside chat", title: "Reinventar tu compañía cuando es disrumpida", people: ["tania"], city: "88% 78%" },
  { n: "03", format: "Workshop", title: "Cómo volverte un 10X Operator", people: ["alan"], city: "60% 70%" },
  { n: "04", format: "Charla", title: "Lecciones de Growth en Torre.ai para la era de IA", people: ["juanPablo", "catalina"], city: "40% 55%" },
];

// Card boxes: two headliners on the first row, then the workshop and the
// shared Torre.ai session.
const boxes = [
  { left: 36, top: ROW1.top, w: ROW1.w, h: ROW1.h },
  { left: 36 + ROW1.w + GAP, top: ROW1.top, w: ROW1.w, h: ROW1.h },
  { left: 36, top: ROW2.top, w: 328, h: ROW2.h },
  { left: 36 + 328 + GAP, top: ROW2.top, w: 1008 - 328 - GAP, h: ROW2.h },
];

const keys = Object.keys(person);
const [css, bogota, ...loaded] = await Promise.all([baseCss({ width: W, height: H }), city(), ...keys.map((k) => loadPerson(person[k]))]);
const people = Object.fromEntries(keys.map((k, i) => [k, loaded[i]]));

const card = (session, box) => {
  const names = session.people.map((k) => people[k].name).join(" y ");
  return `<div class="card" style="left:${box.left}px; top:${box.top}px; width:${box.w}px; height:${box.h}px">
    <div class="city" style="background-image:url(${bogota}); background-position:${session.city}"></div>
    ${session.people.map((k) => {
      const p = people[k];
      return `<div class="person" style="background-image:url(${p.src}); mask-image:url(${p.alpha}); -webkit-mask-image:url(${p.alpha}); ${place(p, box, box.h - LABEL)}${p.filter ? ` filter:${p.filter};` : ""}"></div>`;
    }).join("")}
    <span class="num">${session.n}</span>
    <div class="label"><b>${session.title}</b><span><em>${names}</em> · ${session.format.toLowerCase()}</span></div>
  </div>`;
};

const html = /* html */ `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${css}
.word { font: 500 100px/1 GeistPixel, monospace; letter-spacing: -0.045em; white-space: nowrap; }
.word .dot { color: #6e6655; } .word .fn { color: ${YELLOW}; } .word .call { color: ${RED}; }
.kind { font: 500 50px/1 GeistPixel, monospace; letter-spacing: -0.04em; white-space: nowrap; }
.cursor { display: inline-block; width: 0.5em; height: 0.8em; margin-left: 0.1em; vertical-align: -0.04em; background: ${YELLOW}; }
.num { position: absolute; top: 12px; left: 12px; z-index: 2; padding: 3px 7px 2px; background: rgb(14 12 9 / 0.78);
  font: 500 15px GeistPixel, monospace; color: ${YELLOW}; letter-spacing: 0.02em; }
.label { position: absolute; left: 0; right: 0; bottom: 0; height: ${LABEL}px; padding: 12px 16px 0; display: grid; align-content: start; gap: 6px;
  background: rgb(14 12 9 / 0.88); border-top: 1px solid rgb(243 236 220 / 0.14); }
.label b { font: 600 18px/1.2 Geist, sans-serif; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.label span { font: 400 12.5px GeistMono, monospace; color: ${MUTED}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.label em { font-style: normal; color: ${CREAM}; }
.date { font: 500 84px/0.9 GeistPixel, monospace; letter-spacing: -0.05em; white-space: nowrap; }
.date span { color: ${MUTED}; }
.cta { top: 974px; }
</style></head><body>
<div class="abs m" style="left:36px; right:36px; top:32px; display:flex; font-size:15px; color:${MUTED}">
  <span style="color:${CREAM}"><span class="flag"></span>Bogotá, Colombia · Presencial</span>
  <span style="margin-left:auto">IA, empresas y lo que viene</span>
</div>
<div class="rule" style="top:66px"></div>
<div id="word" class="abs word" style="left:32px; top:84px">bogota<span class="dot">.</span><span class="fn">forward</span><span class="call">()</span></div>
<div id="kind" class="abs kind" style="left:34px">summit<span class="cursor"></span></div>
<div id="meta" class="abs m" style="right:36px; text-align:right; font-size:14px; line-height:1.55; color:${MUTED}">
  <div><span style="color:${YELLOW}">//</span> 4 sesiones · 5 speakers</div>
  <div>Charlas, fireside chat y workshop</div>
</div>
${SESSIONS.map((s, i) => card(s, boxes[i])).join("")}
<div class="corner" style="left:33px; top:${ROW1.top - 3}px"></div>
<div class="corner" style="left:${36 + 1008 - 4}px; top:${ROW2.top + ROW2.h - 4}px"></div>
<div class="abs" style="left:36px; top:858px">
  <div class="kicker"><b>//</b> jueves · 10:00 – 16:00</div>
  <div class="date" style="margin-top:10px">19.11<span>.2026</span></div>
</div>
<div class="abs" style="left:620px; top:858px; height:92px; border-left:1px dashed ${LINE}"></div>
<div class="abs" style="right:36px; top:858px; display:grid; justify-items:end; gap:10px">
  <div class="kicker"><b>//</b> entradas</div>
  <div style="font: 500 26px Geist, sans-serif; letter-spacing:-0.025em">General · VIP · VIP Plus</div>
  <div class="m" style="font-size:13.5px; color:${MUTED}">VIP y VIP Plus: cena privada con Alex y Tania</div>
</div>
<div class="cta">
  <span class="m" style="font-size:14px; color:#4a443a">Para founders, C-levels y ejecutivos.</span>
  <span style="margin-left:auto; display:flex; align-items:center; gap:10px; font: 500 21px Geist, sans-serif">Conoce más en
    <span class="m cta-link">aiyaiyai.io</span>${icon(ArrowRight, 21)}</span>
</div>
</body></html>`;

await render(html, {
  width: W, height: H, out: "marketing/bogota-forward-lineup",
  // The wordmark fills the measure; "summit" and the session count sit under it.
  prepare: () => {
    const word = document.getElementById("word"), kind = document.getElementById("kind"), meta = document.getElementById("meta");
    word.style.fontSize = (100 * 1012) / word.getBoundingClientRect().width + "px";
    const bottom = word.getBoundingClientRect().bottom;
    kind.style.fontSize = parseFloat(word.style.fontSize) * 0.5 + "px";
    kind.style.top = bottom + 2 + "px";
    // The session count sits level with "summit", right-aligned.
    const kb = kind.getBoundingClientRect();
    meta.style.top = kb.top + (kb.height - meta.getBoundingClientRect().height) / 2 + "px";
  },
});
