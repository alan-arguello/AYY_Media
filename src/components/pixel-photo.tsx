"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type PixelPhotoProps = {
  src: string;
  alt: string;
  sizes: string;
  quality?: number;
  preload?: boolean;
  /** Cell size in CSS pixels. */
  cell?: number;
  /** Fraction of the height (from the top) where the photo becomes solid. */
  solidFrom?: number;
  /** How much darker areas resist dissolving (0 = only height matters). */
  silhouette?: number;
  /** CSS filter applied to the photo and its pixels, e.g. a sepia tone. */
  filter?: string;
  className?: string;
  children?: React.ReactNode;
};

// A real photograph whose upper part dissolves into a dot-matrix of its own
// colours. The <Image> is the source and the no-JS fallback; a canvas on top
// draws the photo plus the pixel cells, builds them up when the photo first
// scrolls into view, then lets a few cells near the edge flicker.
export function PixelPhoto({
  src,
  alt,
  sizes,
  quality = 90,
  preload = false,
  cell = 14,
  solidFrom = 0.6,
  silhouette = 0,
  filter = "none",
  className,
  children,
}: PixelPhotoProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const photo = imgRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !photo || !ctx) {
      wrap?.setAttribute("data-mode", "image");
      return;
    }

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const paper = getComputedStyle(wrap).getPropertyValue("--ds-bg").trim() || "#fcfbf6";
    const line = getComputedStyle(wrap).getPropertyValue("--ds-line").trim() || "#d8d2c1";
    const base = document.createElement("canvas");
    const sample = document.createElement("canvas");
    // With srcset, naturalWidth is density-corrected while drawImage reads the
    // file's real pixels, so draw from a plain copy of the chosen source.
    let source: HTMLImageElement | undefined;
    let disposed = false;

    let cols = 0;
    let rows = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let colors = new Uint8ClampedArray(0);
    let noise = new Float32Array(0);
    let flick = new Float32Array(0);
    let progress = reduce ? 1 : 0;
    let started = reduce;
    let visible = false;
    let raf = 0;
    let tick: ReturnType<typeof setInterval> | undefined;

    // Deterministic noise so the pattern is the same on every visit.
    let seed = 1911;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };

    function layout() {
      if (!wrap || !source) return false;
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      if (!w || !h) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);

      // object-fit: cover, honouring the image's CSS object-position (in %),
      // which can change per breakpoint.
      const [px = 0.5, py = 0.5] = getComputedStyle(photo!)
        .objectPosition.split(" ")
        .map((v) => (v.endsWith("%") ? parseFloat(v) / 100 : 0.5));
      const iw = source.naturalWidth;
      const ih = source.naturalHeight;
      const scale = Math.max(w / iw, h / ih);
      const sw = w / scale;
      const sh = h / scale;
      const sx = (iw - sw) * px;
      const sy = (ih - sh) * py;

      base.width = canvas!.width;
      base.height = canvas!.height;
      const b = base.getContext("2d")!;
      b.imageSmoothingQuality = "high";
      b.filter = filter;
      b.drawImage(source, sx, sy, sw, sh, 0, 0, base.width, base.height);

      cols = Math.ceil(w / cell);
      rows = Math.ceil(h / cell);
      sample.width = cols;
      sample.height = rows;
      const s = sample.getContext("2d", { willReadFrequently: true })!;
      s.imageSmoothingQuality = "high";
      s.filter = filter;
      s.drawImage(source, sx, sy, sw, sh, 0, 0, w / cell, h / cell);
      colors = s.getImageData(0, 0, cols, rows).data;

      seed = 1911;
      noise = new Float32Array(cols * rows).map(() => random());
      flick = new Float32Array(cols * rows);
      return true;
    }

    function render() {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.drawImage(base, 0, 0);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const lift = (1 - progress) * 1.25;
      ctx!.lineWidth = 1;
      for (let r = 0; r < rows; r++) {
        const t = (r + 0.5) / rows / solidFrom;
        const y = r * cell;
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const o = i * 4;
          // Bright sky gives way first; dark ridges hold on as pixels.
          const lum =
            (0.299 * colors[o] + 0.587 * colors[o + 1] + 0.114 * colors[o + 2]) / 255;
          const v =
            t + (0.45 - lum) * silhouette + (noise[i] - 0.5) * 0.45 - lift + flick[i];
          if (v >= 1) continue;
          const x = c * cell;
          const rgb = `${colors[o]},${colors[o + 1]},${colors[o + 2]}`;
          if (v >= 0.45) {
            // A solid pixel of the photo's own colour, on a faint ink grid.
            ctx!.fillStyle = `rgb(${rgb})`;
            ctx!.fillRect(x, y, cell, cell);
            ctx!.strokeStyle = "rgba(13,11,1,0.16)";
            ctx!.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
            continue;
          }
          ctx!.fillStyle = paper;
          ctx!.fillRect(x, y, cell, cell);
          if (v >= 0.3) {
            ctx!.fillStyle = `rgba(${rgb},0.3)`;
            ctx!.fillRect(x + 1, y + 1, cell - 1, cell - 1);
          } else if (v >= 0.18) {
            ctx!.strokeStyle = line;
            ctx!.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
          }
        }
      }
    }

    function twinkle() {
      if (!visible) return;
      for (let i = 0; i < flick.length; i++) flick[i] *= 0.6;
      const count = Math.round(flick.length * 0.012);
      for (let n = 0; n < count; n++) {
        flick[Math.floor(Math.random() * flick.length)] =
          (Math.random() - 0.5) * 0.5;
      }
      render();
    }

    function reveal() {
      const start = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / 1800);
        progress = 1 - Math.pow(1 - k, 3);
        render();
        if (k < 1) raf = requestAnimationFrame(step);
        else if (!reduce) tick = setInterval(twinkle, 140);
      };
      raf = requestAnimationFrame(step);
    }

    async function ready() {
      const copy = document.createElement("img");
      copy.src = photo!.currentSrc || photo!.src;
      try {
        await copy.decode();
      } catch {
        onError();
        return;
      }
      if (disposed) return;
      source = copy;
      if (!layout()) return;
      wrap!.setAttribute("data-mode", "canvas");
      render();
      if (visible && !started) {
        started = true;
        reveal();
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !started && colors.length) {
          started = true;
          reveal();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(wrap);

    const ro = new ResizeObserver(() => {
      if (colors.length && layout()) render();
    });
    ro.observe(wrap);

    function onError() {
      wrap!.setAttribute("data-mode", "image");
    }
    if (photo.complete && photo.naturalWidth) ready();
    else {
      photo.addEventListener("load", ready, { once: true });
      photo.addEventListener("error", onError, { once: true });
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearInterval(tick);
      io.disconnect();
      ro.disconnect();
      photo.removeEventListener("load", ready);
      photo.removeEventListener("error", onError);
    };
  }, [cell, solidFrom, silhouette, filter]);

  return (
    <div
      ref={wrapRef}
      className={["px-photo", className].filter(Boolean).join(" ")}
    >
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        preload={preload}
        style={{ filter }}
      />
      <canvas ref={canvasRef} aria-hidden="true" />
      <noscript>
        <style>{`.px-photo > img { opacity: 1 !important; }`}</style>
      </noscript>
      {children}
    </div>
  );
}
