"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const SOURCE = "/images/colombia-summit/bogota-hero.webp";
const GLYPHS = " .,:;+=xX#%@";

export function BogotaAscii() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const context = element.getContext("2d");
    if (!context) return;
    const photo = new window.Image();
    const sample = document.createElement("canvas");
    const sampleContext = sample.getContext("2d", { willReadFrequently: true });
    if (!sampleContext) return;
    let frame = 0;
    let disposed = false;

    function draw() {
      if (
        !element ||
        !context ||
        !sampleContext ||
        !photo.naturalWidth ||
        disposed
      )
        return;
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.fillStyle = "#090909";
      context.fillRect(0, 0, width, height);
      const cell = width < 600 ? 5 : 7;
      const line = cell * 1.5;
      const columns = Math.ceil(width / cell);
      const rows = Math.ceil(height / line);
      sample.width = columns;
      sample.height = rows;
      // Cover without stretching the skyline or its landmarks.
      const scale = Math.max(
        width / photo.naturalWidth,
        height / photo.naturalHeight,
      );
      const cropWidth = width / scale;
      const cropHeight = height / scale;
      sampleContext.drawImage(
        photo,
        (photo.naturalWidth - cropWidth) * 0.55,
        (photo.naturalHeight - cropHeight) * 0.5,
        cropWidth,
        cropHeight,
        0,
        0,
        columns,
        rows,
      );
      const pixels = sampleContext.getImageData(0, 0, columns, rows).data;
      context.font = `${cell + 2}px monospace`;
      context.textBaseline = "top";
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const index = (row * columns + col) * 4;
          const light =
            (pixels[index] * 0.2126 +
              pixels[index + 1] * 0.7152 +
              pixels[index + 2] * 0.0722) /
            255;
          const x = col / columns;
          const y = row / rows;
          const density = Math.pow(light, 0.65);
          const glyph =
            GLYPHS[
              Math.min(GLYPHS.length - 1, Math.floor(density * GLYPHS.length))
            ];
          // Protect the title's contrast while revealing the architecture to the right.
          const reveal =
            width < 700
              ? 0.06 + Math.max(0, (y - 0.45) / 0.55) * 1.2
              : 0.1 + Math.pow(x, 2) * 1.9 + Math.max(0, y - 0.76) * 0.9;
          const sky = y < 0.32 && light > 0.65 ? 0.08 : 1;
          const alpha = Math.min(0.88, (0.2 + light * 0.85) * reveal * sky);
          context.fillStyle = `rgba(214,214,214,${alpha.toFixed(3)})`;
          context.fillText(glyph, col * cell, row * line);
        }
      }
      element.dataset.ready = "true";
    }
    photo.onload = draw;
    photo.src = SOURCE;
    const resize = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    });
    resize.observe(element);
    return () => {
      disposed = true;
      photo.onload = null;
      resize.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="cs-city" aria-hidden="true">
      <Image
        className="cs-city-fallback"
        src={SOURCE}
        alt=""
        fill
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        unoptimized
      />
      <canvas ref={canvas} />
    </div>
  );
}
