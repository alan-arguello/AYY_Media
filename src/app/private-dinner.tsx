import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { dinnerSeats } from "@/lib/summit-pricing";
import { PrivateDinnerCta } from "./private-dinner-cta";
// Companies and funds both hosts have invested in; marks from their official
// sites (see public/images/colombia-summit/CREDITS.md).
import portfolio from "./dinner-portfolio.json";
import "./private-dinner.css";

const photos = {
  session: {
    src: "/images/dinner/private-session.webp",
    alt: "Un grupo pequeño sigue una presentación en una sala privada, sentado en sofás.",
    caption: "Sesión privada, en grupo pequeño.",
  },
  fireside: {
    src: "/images/dinner/alexander-fireside.webp",
    alt: "Alexander Torrenegra ríe durante un fireside chat mientras el anfitrión habla al micrófono.",
    caption: "Alexander en un fireside chat.",
  },
  alexander: {
    src: "/images/dinner/alexander-torre.webp",
    alt: "Alexander Torrenegra, de brazos cruzados y sonriendo, frente a un fondo con logos de Torre.",
    caption: "Alexander Torrenegra.",
  },
  group: {
    src: "/images/dinner/small-group.webp",
    alt: "Una conversación en grupo pequeño: una persona habla sentada en un taburete frente a los asistentes.",
    caption: "Conversación en grupo pequeño.",
  },
};

// The private dinner: who it is with, how to get a seat, how many seats.
export function PrivateDinner() {
  return (
    <section className="ds-section dinner" id="mesa" aria-labelledby="dinner-title">
      <div className="ds-container">
        <div className="dinner-prompt" aria-hidden="true">
          <span className="dinner-prompt-line">
            <span className="dinner-prompt-mark">&gt;&gt;&gt;</span>
            <span>cena</span>
            <span className="dinner-prompt-dot">.</span>
            <span className="dinner-prompt-fn">privada</span>
            <span className="dinner-prompt-call">(</span>
            <span>alex, tania</span>
            <span className="dinner-prompt-call">)</span>
          </span>
          <span className="dinner-prompt-status">
            {dinnerSeats} lugares · solo VIP
          </span>
        </div>

        <div className="dinner-head">
          <h2 id="dinner-title" className="dinner-title">
            <span>El evento termina</span> <span>a las 3&nbsp;p.&nbsp;m.</span>{" "}
            <span className="dinner-accent">La conversación, no.</span>
          </h2>
          <div className="dinner-intro">
            <p className="dinner-lead">
              A las 7 p. m., {dinnerSeats} personas se sientan a cenar con
              Alexander Torrenegra y Tania Zapata.
            </p>
            <ol className="dinner-how" aria-label="Cómo se consigue un lugar">
              <li><strong>Eliges VIP.</strong> Incluye el evento y la cena.</li>
              <li><strong>Revisamos tu perfil.</strong> No todas las solicitudes son aceptadas.</li>
              <li><strong>Te confirmamos.</strong> Con los siguientes pasos y la ubicación.</li>
            </ol>
          </div>
        </div>

        <ul className="dinner-gallery" aria-label="Encuentros privados anteriores">
          <li className="dinner-photo" data-shot="session">
            <Image src={photos.session.src} alt={photos.session.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 64vw, 592px" quality={86} />
          </li>
          <li className="dinner-photo" data-shot="alexander">
            <Image src={photos.alexander.src} alt={photos.alexander.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 36vw, 320px" quality={86} />
          </li>
          <li className="dinner-photo" data-shot="fireside">
            <Image src={photos.fireside.src} alt={photos.fireside.alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1000px) 32vw, 290px" quality={86} />
          </li>
          <li className="dinner-photo" data-shot="group">
            <Image src={photos.group.src} alt={photos.group.alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1000px) 32vw, 290px" quality={86} />
          </li>
        </ul>

        <div className="dinner-portfolio">
          <p className="dinner-portfolio-head">
            Invierten en
          </p>
          <ul className="dinner-portfolio-logos" aria-label="Empresas y fondos en los que han invertido">
            {portfolio.map((company) => (
              <li key={company.name}>
                <Image
                  src={company.image}
                  alt={company.name}
                  width={company.width}
                  height={company.height}
                  data-mark={company.name.toLowerCase().replace(/\W+/g, "-")}
                />
                <span aria-hidden="true">{company.name}</span>
              </li>
            ))}
          </ul>
          <p className="dinner-portfolio-note">No son sponsors del evento.</p>
        </div>

        <div className="dinner-seats">
          <div className="dinner-seats-copy">
            <h3>{dinnerSeats} lugares.</h3>
            <div className="dinner-seat-row" role="img" aria-label={`${dinnerSeats} lugares en la cena`}>
              {Array.from({ length: dinnerSeats }, (_, index) => (
                <i key={index} />
              ))}
            </div>
            <p className="dinner-seats-for">Solo con entrada VIP · 7 a 10 p. m.</p>
          </div>
          <div className="dinner-seats-cta">
            <PrivateDinnerCta />
            <p className="dinner-seats-note">
              <a href="#entradas">
                Ver precios <ArrowDown aria-hidden="true" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
