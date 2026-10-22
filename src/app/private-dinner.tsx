import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { summitTickets, totalSeats } from "@/lib/summit-pricing";
import { PrivateDinnerCta } from "./private-dinner-cta";
// Companies and funds both hosts have invested in; marks from their official
// sites (see public/images/colombia-summit/CREDITS.md).
import portfolio from "./dinner-portfolio.json";
import "./private-dinner.css";

const ticket = (id: (typeof summitTickets)[number]["id"]) => {
  const found = summitTickets.find((item) => item.id === id);
  if (!found?.capacity) throw new Error(`Ticket without seats: ${id}`);
  return found;
};
const general = ticket("vip");
const vip = ticket("vip-plus");

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

// Seats as a row of pixels: General first, VIP lit in yellow.
const seats = [
  ...Array.from({ length: general.capacity }, () => general.id),
  ...Array.from({ length: vip.capacity }, () => vip.id),
];

// The heart of the page: why the format is small, how people get a seat,
// and how many seats there are.
export function PrivateDinner() {
  return (
    <section className="ds-section dinner" id="mesa" aria-labelledby="dinner-title">
      <div className="ds-container">
        <div className="dinner-prompt" aria-hidden="true">
          <span className="dinner-prompt-line">
            <span className="dinner-prompt-mark">&gt;&gt;&gt;</span>
            <span>mesa</span>
            <span className="dinner-prompt-dot">.</span>
            <span className="dinner-prompt-fn">privada</span>
            <span className="dinner-prompt-call">(</span>
            <span>alex, tania</span>
            <span className="dinner-prompt-call">)</span>
          </span>
          <span className="dinner-prompt-status">
            {totalSeats} lugares · por aplicación
          </span>
        </div>

        <div className="dinner-head">
          <h2 id="dinner-title" className="dinner-title">
            <span>No es una conferencia.</span>{" "}
            <span className="dinner-accent">Es una mesa.</span>
          </h2>
          <div className="dinner-intro">
            <p className="dinner-lead">
              Tú y otras {totalSeats - 1} personas, elegidas una por una, con
              Alexander Torrenegra y Tania Zapata.
            </p>
            <ol className="dinner-how" aria-label="Cómo se consigue un lugar">
              <li><strong>Aplicas.</strong> Dos minutos.</li>
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
            <h3>{totalSeats} lugares.</h3>
            <div
              className="dinner-seat-row"
              role="img"
              aria-label={`${totalSeats} lugares: ${general.capacity} General y ${vip.capacity} VIP`}
            >
              {seats.map((tier, index) => (
                <i key={index} data-tier={tier} />
              ))}
            </div>
            <dl className="dinner-legend">
              <div data-tier="vip">
                <dt>{general.capacity}</dt>
                <dd>General</dd>
              </div>
              <div data-tier="vip-plus">
                <dt>{vip.capacity}</dt>
                <dd>VIP · + 45 min con Alexander</dd>
              </div>
            </dl>
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
