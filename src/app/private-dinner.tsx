import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { dinnerSeats, summitTickets } from "@/lib/summit-pricing";
import { speakers } from "./speakers";
import { PrivateDinnerCta } from "./private-dinner-cta";
// Companies and funds both hosts have invested in; marks from their official
// sites (see public/images/colombia-summit/CREDITS.md).
import portfolio from "./dinner-portfolio.json";
import "./private-dinner.css";

const ticket = (id: (typeof summitTickets)[number]["id"]) => {
  const found = summitTickets.find((item) => item.id === id);
  if (!found?.capacity) throw new Error(`Dinner ticket without seats: ${id}`);
  return found;
};
const vip = ticket("vip");
const vipPlus = ticket("vip-plus");

const portrait = (name: string) => {
  const speaker = speakers.find((person) => person.name === name);
  if (!speaker) throw new Error(`Missing dinner host: ${name}`);
  return speaker.image;
};

// Who sits at the table: a short record, then what each one is worth asking.
// Facts come from the hosts' own sites (taniazapata.com, invest.torre.ai)
// and public coverage; keep them verifiable.
const hosts = [
  {
    name: "Alexander Torrenegra",
    role: "Cofundador y CEO de Torre.ai · Shark en Shark Tank Colombia y México",
    bio: "Cofundador de Voice123 (adquirida en 2021 por Backstage), Bunny Studio y Torre.ai, donde la IA entrevista y conecta talento con empresas. Shark en Shark Tank Colombia y México, Innovador menor de 35 del MIT Technology Review y autor de Remoter. Está acostumbrado a decidir en minutos qué le falta a un negocio para escalar.",
    topics: ["IA en tu empresa", "Levantar capital", "Equipos remotos", "Qué construirías hoy desde cero"],
  },
  {
    name: "Tania Zapata",
    role: "Cofundadora de Voice123 · Chairwoman de Bunny Inc.",
    bio: "Cofundó Voice123 en 2003 y lo hizo autosostenible en seis meses; en 2021 fue adquirido por Backstage. Construyó Bunny Studio, hoy con más de 50.000 clientes, y lo dirigió como CEO hasta 2025. Ha invertido o asesorado a más de 25 startups, y cuenta sus cinco apuestas fallidas con la misma franqueza con la que da feedback.",
    topics: ["Reinventar un negocio disrumpido", "Escalar operaciones", "Liderar un equipo en el cambio", "Talento humano e IA"],
  },
];

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

// Seats as a row of pixels: VIP first, VIP Plus lit in yellow.
const seats = [
  ...Array.from({ length: vip.capacity }, () => vip.id),
  ...Array.from({ length: vipPlus.capacity }, () => vipPlus.id),
];

export function PrivateDinner() {
  return (
    <section className="ds-section dinner" id="cena" aria-labelledby="dinner-title">
      <div className="ds-container">
        <div className="dinner-prompt" aria-hidden="true">
          <span className="dinner-prompt-line">
            <span className="dinner-prompt-mark">&gt;&gt;&gt;</span>
            <span>vip</span>
            <span className="dinner-prompt-dot">.</span>
            <span className="dinner-prompt-fn">cena</span>
            <span className="dinner-prompt-call">(</span>
            <span>alex, tania</span>
            <span className="dinner-prompt-call">)</span>
          </span>
          <span className="dinner-prompt-status">
            {dinnerSeats} lugares · sujeto a aceptación
          </span>
        </div>

        <div className="dinner-head">
          <h2 id="dinner-title" className="dinner-title">
            <span>El summit termina</span> <span>a las 4 p. m.</span>{" "}
            <span className="dinner-accent">La conversación, no.</span>
          </h2>
          <div className="dinner-intro">
            <p className="dinner-lead">
              Después del summit, {dinnerSeats} personas se sientan a cenar con
              Alexander Torrenegra y Tania Zapata. Sin escenario ni micrófonos:
              preguntas directas y feedback de primera mano sobre lo que estás
              construyendo.
            </p>
            <ol className="dinner-how" aria-label="Cómo funciona la cena privada">
              <li>
                <strong>Pocas sillas.</strong> {vip.capacity} lugares VIP y{" "}
                {vipPlus.capacity} VIP Plus, sujetos a aceptación.
              </li>
              <li>
                <strong>Llega con tu pregunta.</strong> La decisión que tienes
                atascada, el producto que no despega, el equipo que hay que
                mover. Sales con una respuesta de quienes ya pasaron por ahí.
              </li>
              <li>
                <strong>VIP Plus: 45 minutos a solas con Alexander.</strong>{" "}
                Una sesión 1 a 1 después del summit, enfocada en tu empresa.
              </li>
            </ol>
          </div>
        </div>

        <ul className="dinner-gallery" aria-label="Encuentros privados anteriores">
          <li className="dinner-photo" data-shot="session">
            <Image src={photos.session.src} alt={photos.session.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 64vw, 592px" quality={86} />
            <span className="dinner-caption">{photos.session.caption}</span>
          </li>
          <li className="dinner-photo" data-shot="alexander">
            <Image src={photos.alexander.src} alt={photos.alexander.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 36vw, 320px" quality={86} />
            <span className="dinner-caption">{photos.alexander.caption}</span>
          </li>
          <li className="dinner-photo" data-shot="fireside">
            <Image src={photos.fireside.src} alt={photos.fireside.alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1000px) 32vw, 290px" quality={86} />
            <span className="dinner-caption">{photos.fireside.caption}</span>
          </li>
          <li className="dinner-photo" data-shot="group">
            <Image src={photos.group.src} alt={photos.group.alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1000px) 32vw, 290px" quality={86} />
            <span className="dinner-caption">{photos.group.caption}</span>
          </li>
        </ul>

        <div className="dinner-hosts-head">
          <h3>En la mesa</h3>
          <p>De quiénes vas a aprender y recibir feedback de primera mano.</p>
        </div>
        <ul className="dinner-hosts">
          {hosts.map((host) => (
            <li key={host.name} className="ds-card dinner-host">
              <div className="dinner-host-portrait" data-speaker={host.name}>
                <Image src={portrait(host.name)} alt={host.name} fill sizes="96px" quality={90} />
              </div>
              <div className="dinner-host-copy">
                <h4>{host.name}</h4>
                <p className="dinner-host-role">{host.role}</p>
                <p className="dinner-host-bio">{host.bio}</p>
                <p className="dinner-host-ask">Pregúntale sobre</p>
                <ul className="dinner-topics" aria-label={`Temas para ${host.name}`}>
                  {host.topics.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>

        <div className="dinner-portfolio">
          <p className="dinner-portfolio-head">
            Ambos invierten en empresas y fondos como
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
          <p className="dinner-portfolio-note">
            Logos de empresas y fondos en los que han invertido. No son sponsors
            del evento.
          </p>
        </div>

        <div className="dinner-seats">
          <div className="dinner-seats-copy">
            <h3>{dinnerSeats} lugares.</h3>
            <div
              className="dinner-seat-row"
              role="img"
              aria-label={`${dinnerSeats} lugares: ${vip.capacity} VIP y ${vipPlus.capacity} VIP Plus`}
            >
              {seats.map((tier, index) => (
                <i key={index} data-tier={tier} />
              ))}
            </div>
            <dl className="dinner-legend">
              <div data-tier="vip">
                <dt>{vip.capacity}</dt>
                <dd>VIP · Summit + cena privada</dd>
              </div>
              <div data-tier="vip-plus">
                <dt>{vipPlus.capacity}</dt>
                <dd>VIP Plus · Cena + 1 a 1 con Alexander</dd>
              </div>
            </dl>
          </div>
          <div className="dinner-seats-cta">
            <PrivateDinnerCta />
            <p className="dinner-seats-note">
              Sujeto a aceptación. La solicitud no confirma una entrada.{" "}
              <a href="#entradas">
                Ver precios por fase <ArrowDown aria-hidden="true" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
