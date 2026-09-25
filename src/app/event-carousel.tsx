"use client";

import Image from "next/image";
import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { pastEvents } from "./past-events";

// Endless horizontal marquee: the photo set is rendered twice and the track
// slides by half its width, so the loop has no visible seam.
export function EventCarousel() {
  const [paused, setPaused] = useState(false);
  return (
    <div
      className="lp-carousel"
      role="region"
      aria-label="Fotos de nuestros eventos anteriores"
    >
      <div className="lp-carousel-window" tabIndex={0}>
        <div className="lp-carousel-track" data-paused={paused}>
          {[false, true].map((duplicate) => (
            <ul
              className="lp-carousel-group"
              key={String(duplicate)}
              aria-hidden={duplicate || undefined}
            >
              {pastEvents.map((event) => (
                <li key={event.image}>
                  <Image
                    src={event.image}
                    alt={duplicate ? "" : event.alt}
                    fill
                    sizes="(max-width: 640px) 280px, 420px"
                    quality={86}
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="lp-carousel-toggle"
        onClick={() => setPaused(!paused)}
        aria-label={paused ? "Reanudar carrusel" : "Pausar carrusel"}
      >
        {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
      </button>
    </div>
  );
}
