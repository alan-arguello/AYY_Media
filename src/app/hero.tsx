import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { colombiaSummit } from "@/lib/colombia-summit";
import { dinnerSeats, vakiFoundation } from "@/lib/summit-pricing";
import { Button } from "@/components/ui";
import { HeroField } from "./hero-field";
import { NavScrollState } from "./nav-scroll-state";
import "./hero.css";

// The city under the sunbeams, seen from the cerros (Reza Madani, Unsplash),
// cropped so the frame opens on blue sky rather than white cloud. The focal
// point differs between the wide frame and the phone's narrow one.
const PHOTO = {
  src: "/images/photos/bogota-rayos.webp",
  alt: "Rayos de sol entre las nubes sobre Bogotá, vista desde los cerros.",
  desktop: "58% 50%",
  phone: "50% 50%",
};

const TITLE = "Evento y cena privada para founders, managers y C-levels";

// The day in three facts under the headline; the last, wider one says
// where the dinner's profits go.
function Facts() {
  return (
    <dl className="hero-facts" aria-label="Datos del evento">
      <div>
        <dt>Evento</dt>
        <dd>10 a. m. a 3 p. m.</dd>
      </div>
      <div>
        <dt>Cena privada</dt>
        <dd>7 a 10 p. m. · {dinnerSeats} lugares</dd>
      </div>
      <div className="hero-fact-cause">
        <dt>Ganancias de la cena</dt>
        <dd>
          <a href={vakiFoundation.url} target="_blank" rel="noopener noreferrer">
            Se donan a
            <Image src="/images/dinner/portfolio/vaki.png" alt="Vaki" width={195} height={120} />
            Foundation
          </a>
        </dd>
      </div>
    </dl>
  );
}

/* The city, full-bleed, and the copy on top of it. The nav sits transparent
   over the photograph and turns solid once the hero scrolls away. */
export function Hero() {
  return (
    <section
      className="hero"
      style={{ "--hero-pos": PHOTO.desktop, "--hero-pos-phone": PHOTO.phone } as React.CSSProperties}
      aria-labelledby="summit-title"
    >
      <div className="hero-media">
        <Image src={PHOTO.src} alt={PHOTO.alt} fill sizes="100vw" quality={82} preload />
      </div>
      <HeroField />
      <div className="hero-body">
        {/* Once the copy reaches the nav, the nav turns solid so nothing scrolls under it. */}
        <NavScrollState />
        <div className="ds-container hero-copy">
          <p className="hero-eyebrow">
            <time dateTime={colombiaSummit.date}>Jueves 19 de noviembre de 2026</time>
            <span aria-hidden="true"> · </span>Bogotá
          </p>
          <h1 id="summit-title" className="hero-title">
            {TITLE}
          </h1>
          <div className="lp-actions hero-actions">
            <Button href="#entradas" icon={<ArrowRight aria-hidden="true" />}>
              Ver entradas
            </Button>
            <Button variant="secondary" href="#agenda">
              Ver el día
            </Button>
          </div>
        </div>
        <div className="ds-container">
          <Facts />
        </div>
      </div>
    </section>
  );
}
