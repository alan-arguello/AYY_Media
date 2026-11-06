// The AYY mark from the channel's avatar, drawn solid so it holds at nav size.
// Shared by the page (logo.tsx) and the image generator.
export const logo = {
  viewBox: "0 0 700 154",
  clip: { x: 0, y: 0, width: 560, height: 154 },
  strokes: [
    { d: "M7 169L64 17H110L167 169", width: 34 },
    { d: "M38 106H136", width: 24 },
    { d: "M176-12L256 86L336-12M256 86V164", width: 34 },
    { d: "M368-12L448 86L528-12M448 86V164", width: 34 },
  ],
  triangle: "M572 24L688 74L572 124Z",
  green: "#2bf58a",
};

/** The same mark as a standalone SVG, for images generated outside the page. */
export const logoSvg = (ink: string, triangle: string = logo.green) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${logo.viewBox}"><clipPath id="c"><rect width="${logo.clip.width}" height="${logo.clip.height}"/></clipPath><g clip-path="url(#c)" fill="none" stroke="${ink}" stroke-linejoin="bevel">${logo.strokes.map((s) => `<path d="${s.d}" stroke-width="${s.width}"/>`).join("")}</g><path d="${logo.triangle}" fill="${triangle}"/></svg>`;
