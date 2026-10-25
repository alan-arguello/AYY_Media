"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

// A horizontal, swipeable rail with scroll-snap. The arrows and the progress
// line are an enhancement: without JS it is still a native scroller.
export function TemasRail({
  children,
  count,
}: {
  children: React.ReactNode;
  count: number;
}) {
  const railRef = useRef<HTMLUListElement>(null);
  const [state, setState] = useState({ start: true, end: false, progress: 0 });

  const update = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    const x = rail.scrollLeft;
    setState({
      start: x <= 2,
      end: x >= max - 2,
      progress: max > 0 ? x / max : 1,
    });
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    update();
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      rail.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const step = (direction: 1 | -1) => {
    const rail = railRef.current;
    const card = rail?.querySelector("li");
    if (!rail || !card) return;
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    rail.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
  };

  return (
    <div className="lp-rail">
      <ul ref={railRef} className="lp-rail-track" aria-label={`${count} temas`}>
        {children}
      </ul>
      <div className="ds-container lp-rail-controls">
        <span className="lp-rail-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.max(0.12, state.progress)})` }} />
        </span>
        <button type="button" onClick={() => step(-1)} disabled={state.start} aria-label="Tema anterior">
          <ArrowLeft aria-hidden="true" />
        </button>
        <button type="button" onClick={() => step(1)} disabled={state.end} aria-label="Siguiente tema">
          <ArrowRight aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
