"use client";

import { useEffect, useRef } from "react";

// A fine LED-style dot grid over the city. Dots are barely there until the
// pointer comes near, then they light up in the accent green; now and then a
// short signal runs along a row or a column, like data crossing the city.
// Without a pointer (phones) the light drifts on its own. Reduced motion
// keeps the still grid only. Purely decorative.
const STEP = 18; // px between dots
const RADIUS = 260; // px, reach of the light
const GREEN = [91, 200, 150]; // #5bc896

type Signal = { horizontal: boolean; line: number; pos: number; speed: number; length: number };

export function HeroField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let w = 0, h = 0, cols = 0, rows = 0;
    let dpr = 1;
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };
    const signals: Signal[] = [];
    let raf = 0;
    let visible = true;
    let t0 = performance.now();
    let nextSignal = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / STEP) + 1;
      rows = Math.ceil(h / STEP) + 1;
      if (still) draw(performance.now());
    };

    const spawn = () => {
      const horizontal = Math.random() < 0.6;
      signals.push({
        horizontal,
        line: Math.floor(Math.random() * (horizontal ? rows * 0.75 : cols)),
        pos: -10,
        speed: 0.28 + Math.random() * 0.3, // dots per frame-ish (scaled by dt)
        length: 14 + Math.floor(Math.random() * 18),
      });
    };

    function draw(now: number) {
      const dt = Math.min(now - t0, 50) / 16.7;
      t0 = now;
      ctx!.clearRect(0, 0, w, h);

      // Where the light is: the pointer, or a slow drift when there is none.
      if (!pointer.active) {
        const s = now / 1000;
        pointer.tx = w * (0.62 + 0.26 * Math.sin(s * 0.17));
        pointer.ty = h * (0.3 + 0.14 * Math.sin(s * 0.23 + 1.3));
      }
      pointer.x += (pointer.tx - pointer.x) * (still ? 1 : 0.08 * dt);
      pointer.y += (pointer.ty - pointer.y) * (still ? 1 : 0.08 * dt);
      if (pointer.x < -1000) { pointer.x = pointer.tx; pointer.y = pointer.ty; }

      // Signals: advance, then light the dots they cover.
      const lit = new Map<number, number>();
      if (!still) {
        if (now > nextSignal) {
          spawn();
          nextSignal = now + 350 + Math.random() * 900;
        }
        for (let i = signals.length - 1; i >= 0; i--) {
          const s = signals[i];
          s.pos += s.speed * dt;
          const max = s.horizontal ? cols : rows;
          if (s.pos - s.length > max) { signals.splice(i, 1); continue; }
          for (let k = 0; k < s.length; k++) {
            const p = Math.floor(s.pos) - k;
            if (p < 0 || p >= max) continue;
            const c = s.horizontal ? p : s.line;
            const r = s.horizontal ? s.line : p;
            const a = 1 - k / s.length;
            const key = r * cols + c;
            lit.set(key, Math.max(lit.get(key) ?? 0, a));
          }
        }
      }

      const r2 = RADIUS * RADIUS;
      for (let r = 0; r < rows; r++) {
        const y = r * STEP + STEP / 2;
        for (let c = 0; c < cols; c++) {
          const x = c * STEP + STEP / 2;
          const dx = x - pointer.x, dy = y - pointer.y;
          const d2 = dx * dx + dy * dy;
          const near = d2 < r2 ? 1 - Math.sqrt(d2) / RADIUS : 0;
          const signal = lit.get(r * cols + c) ?? 0;
          const glow = Math.max(near * Math.sqrt(near), signal);
          if (glow > 0.02) {
            ctx!.fillStyle = `rgba(${GREEN[0]},${GREEN[1]},${GREEN[2]},${(0.3 + glow * 0.7).toFixed(3)})`;
            const size = 2 + glow * 2;
            ctx!.fillRect(x - size / 2, y - size / 2, size, size);
          } else {
            ctx!.fillStyle = "rgba(244,245,242,0.16)";
            ctx!.fillRect(x - 1, y - 1, 2, 2);
          }
        }
      }
    }

    const loop = (now: number) => {
      if (visible && !document.hidden) draw(now);
      raf = requestAnimationFrame(loop);
    };

    const hero = canvas.closest("section") ?? canvas;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => { pointer.active = false; };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);
    resize();
    if (!still) {
      if (finePointer) {
        hero.addEventListener("pointermove", onMove as EventListener);
        hero.addEventListener("pointerleave", onLeave);
      }
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      hero.removeEventListener("pointermove", onMove as EventListener);
      hero.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className="hero-field" aria-hidden="true" />;
}
