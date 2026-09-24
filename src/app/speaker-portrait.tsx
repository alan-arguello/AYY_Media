"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const GLYPHS = " .:;+=xX#%@";

export function SpeakerPortrait({
  src,
  name,
  featured,
}: {
  src: string;
  name: string;
  featured: boolean;
}) {
  const photo = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const image = photo.current;
    const output = canvas.current;
    if (!image || !output) return;
    const context = output.getContext("2d");
    const sample = document.createElement("canvas");
    const pixels = sample.getContext("2d", { willReadFrequently: true });
    if (!context || !pixels) return;
    let frame = 0;
    output.dataset.ready = "false";

    function draw() {
      if (!image || !output || !context || !pixels || !image.naturalWidth)
        return;
      const { width, height } = output.getBoundingClientRect();
      if (!width || !height) return;

      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      output.width = Math.round(width * ratio);
      output.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const columns = Math.round(width / (featured ? 4 : 3.5));
      const cell = width / columns;
      const line = cell * 1.4;
      const rows = Math.ceil(height / line);
      sample.width = columns;
      sample.height = rows;

      // Match the original photo's cover crop and 50% 12% object position.
      const scale = Math.max(
        width / image.naturalWidth,
        height / image.naturalHeight,
      );
      const cropWidth = width / scale;
      const cropHeight = height / scale;
      pixels.drawImage(
        image,
        (image.naturalWidth - cropWidth) * 0.5,
        (image.naturalHeight - cropHeight) * 0.12,
        cropWidth,
        cropHeight,
        0,
        0,
        columns,
        rows,
      );

      try {
        const data = pixels.getImageData(0, 0, columns, rows).data;
        // Keep the original photograph underneath; only add a sampled ASCII texture.
        context.clearRect(0, 0, width, height);
        context.font = `${cell * 1.55}px monospace`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        for (let row = 0; row < rows; row++) {
          for (let column = 0; column < columns; column++) {
            const index = (row * columns + column) * 4;
            const light =
              (data[index] * 0.2126 +
                data[index + 1] * 0.7152 +
                data[index + 2] * 0.0722) /
              255;
            const glyph =
              GLYPHS[
                Math.min(
                  GLYPHS.length - 1,
                  Math.floor((1 - light) * GLYPHS.length),
                )
              ];
            const tone = Math.round(light * 255);
            context.fillStyle = `rgba(${tone}, ${tone}, ${tone}, 0.22)`;
            context.fillRect(column * cell, row * line, cell, line);
            const ink = Math.round(Math.max(0, tone - 95));
            context.fillStyle = `rgba(${ink}, ${ink}, ${ink}, 0.8)`;
            context.fillText(glyph, (column + 0.5) * cell, (row + 0.5) * line);
          }
        }
        output.dataset.ready = "true";
      } catch {
        // The real portrait remains visible if pixel sampling is unavailable.
        output.dataset.ready = "false";
      }
    }

    function scheduleDraw() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    }
    image.addEventListener("load", scheduleDraw);
    const resize = new ResizeObserver(scheduleDraw);
    resize.observe(output);
    if (image.complete) scheduleDraw();
    return () => {
      image.removeEventListener("load", scheduleDraw);
      resize.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [src, featured]);

  return (
    <div className="cs-portrait">
      <Image
        ref={photo}
        src={src}
        alt={name}
        fill
        sizes={
          featured
            ? "(max-width: 900px) 104px, (max-width: 1150px) 132px, 156px"
            : "(max-width: 1150px) 72px, 88px"
        }
        quality={90}
      />
      <canvas ref={canvas} className="cs-portrait-ascii" aria-hidden="true" />
    </div>
  );
}
