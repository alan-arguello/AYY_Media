// Writes public/images/pixel-field.svg: the faint dot-matrix mosaic that sits
// behind section headings. Seeded, so re-running it yields the same file.
import { writeFileSync } from "node:fs";

const CELL = 24;
const COLS = 60;
const ROWS = 36;
const palette = ["#fcd116", "#fcd116", "#fcd116", "#003893", "#003893", "#ce1126", "#0d0b01"];

let seed = 19112026;
const random = () => {
  seed = (seed * 1664525 + 1013904223) % 2 ** 32;
  return seed / 2 ** 32;
};

const rects = [];
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    // Denser and warmer toward the top, like light leaking through a grid.
    const density = 0.62 - (row / ROWS) * 0.3;
    if (random() > density) continue;
    const color = palette[Math.floor(random() * palette.length)];
    const alpha =
      color === "#fcd116" ? 0.05 + random() * 0.09 // yellow is light; it needs more
      : color === "#ce1126" ? 0.015 + random() * 0.025
      : 0.012 + random() * 0.03;
    rects.push(
      `<rect x="${col * CELL}" y="${row * CELL}" width="${CELL}" height="${CELL}" fill="${color}" fill-opacity="${alpha.toFixed(3)}"/>`,
    );
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${COLS * CELL}" height="${ROWS * CELL}" viewBox="0 0 ${COLS * CELL} ${ROWS * CELL}" shape-rendering="crispEdges">${rects.join("")}</svg>\n`;
writeFileSync(new URL("../public/images/pixel-field.svg", import.meta.url), svg);
console.log(`pixel-field.svg: ${rects.length} cells, ${(svg.length / 1024).toFixed(1)} KB`);
