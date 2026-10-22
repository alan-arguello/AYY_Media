import Image from "next/image";
import { colombiaSummit } from "@/lib/colombia-summit";
import { summitPartners } from "@/lib/summit-partners";
import { PixelArt, SectionHeading, Tag } from "@/components/ui";
import { EventSponsors } from "./event-branding";
import { pastEventSupporters } from "./past-events";
import { PartnerForm } from "./partner-form";
import { flag, mic, signal } from "./pixel-icons";
import "./partners.css";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

// What an ally gets. Three things, said plainly.
const offer = [
  {
    art: mic,
    title: "Un lugar en la mesa",
    body: "Alguien de tu equipo come con los 20 founders, managers y C-levels, y con Alexander y Tania.",
  },
  {
    art: flag,
    title: "Tu marca en todo lo que hacemos",
    body: "En el sitio, las promos, los videos, el newsletter y el día de la comida.",
  },
  {
    art: signal,
    title: "Una audiencia que ya existe",
    body: "Founders, C-levels y ejecutivos que siguen a Alexander, a Alan y a Torrenegra & Co, y la comunidad de AIYaiYai.",
  },
];

// Reach by channel. Counts as of October 2026; the headline total is their
// sum, so update both by changing `count` here.
const reach = [
  { who: "Alexander Torrenegra", channel: "Instagram", code: "ig", count: 288_000, href: "https://www.instagram.com/torrenegra/" },
  { who: "Alexander Torrenegra", channel: "LinkedIn", code: "in", count: 150_000, href: "https://www.linkedin.com/in/alextorrenegra/" },
  { who: "Alexander Torrenegra", channel: "X", code: "x", count: 126_700, href: "https://x.com/torrenegra" },
  { who: "Torrenegra & Co", channel: "Instagram", code: "ig", count: 32_000 },
  { who: "Torrenegra & Co", channel: "LinkedIn", code: "in", count: 25_000 },
  { who: "Alan Argüello", channel: "LinkedIn", code: "in", count: 14_000, href: "https://www.linkedin.com/in/alan-arguello/" },
  { who: "Newsletter", channel: "Suscriptores", code: "@", count: 5_100 },
  { who: "AIYaiYai", channel: "YouTube", code: "yt", count: 1_370, href: colombiaSummit.channel },
] as const;

const compact = (n: number) =>
  n >= 100_000
    ? `${Math.round(n / 1000)}K`
    : n >= 10_000
      ? `${(n / 1000).toFixed(n % 1000 ? 1 : 0)}K`
      : `${(n / 1000).toFixed(n % 100 ? 2 : 1)}K`;
const total = reach.reduce((sum, item) => sum + item.count, 0);
const totalLabel = `+${Math.floor(total / 1000)}K`;

// On /partners the section is the whole page: its heading is the h1 and it
// clears the floating nav.
export function Partners({ standalone = false }: { standalone?: boolean }) {
  return (
    <section
      className={standalone ? "ds-section partners partners-page" : "ds-section partners"}
      id="aliados"
      data-field={standalone || undefined}
      aria-labelledby="partners-title"
    >
      <div className="ds-container">
        <SectionHeading
          id="partners-title"
          level={standalone ? "h1" : "h2"}
          tag="Aliados"
          title={
            <>
              Tu marca, <span className="ds-accent">en todo lo que hacemos.</span>
            </>
          }
        >
          Una comida privada de 20 lugares con Alexander Torrenegra y Tania
          Zapata. Pocos aliados, con algo concreto: un lugar en la mesa, tu
          marca en todo lo que hacemos y una audiencia que ya nos sigue.
        </SectionHeading>

        <ul className="partners-offer">
          {offer.map((item, index) => (
            <li key={item.title} className="ds-card ds-in-view">
              <span className="partners-offer-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <PixelArt rows={item.art} size={54} />
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>

        <div className="ds-card partners-reach ds-in-view">
          <div className="partners-reach-total">
            <Tag dot>Alcance</Tag>
            <p className="partners-reach-number">
              <strong>{totalLabel}</strong>
              <span>seguidores y suscriptores</span>
            </p>
            <p className="partners-reach-note">
              Suma de los canales de la derecha, a octubre de 2026. Una persona
              puede seguirnos en varios.
            </p>
          </div>
          <ul className="partners-channels" aria-label="Alcance por canal">
            {reach.map((item) => {
              const inner = (
                <>
                  <span className="partners-channel-code" aria-hidden="true">
                    {item.code}
                  </span>
                  <span className="partners-channel-copy">
                    <strong>{compact(item.count)}</strong>
                    <span>
                      {item.who} · {item.channel}
                    </span>
                  </span>
                </>
              );
              return (
                <li key={`${item.who}-${item.channel}`} className="partners-channel">
                  {"href" in item ? (
                    <a
                      href={item.href}
                      {...external}
                      className="partners-channel-inner"
                      aria-label={`${item.who} en ${item.channel}, ${compact(item.count)} (nueva pestaña)`}
                    >
                      {inner}
                    </a>
                  ) : (
                    <span className="partners-channel-inner">{inner}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="partners-proof">
          <div>
            <div className="lp-supporters-head">
              <h3>Empresas con las que hemos colaborado</h3>
              <Tag>No son sponsors de este evento</Tag>
            </div>
            <ul className="lp-supporters">
              {pastEventSupporters.map((partner) => (
                <li key={partner.name} className="ds-card">
                  <Image
                    src={partner.image}
                    alt={partner.name}
                    width={160}
                    height={40}
                    className="lp-mono-logo"
                    data-compact={partner.name === "v0" || undefined}
                  />
                </li>
              ))}
            </ul>
          </div>
          <EventSponsors />
        </div>

        <div className="partners-apply" id="aliados-form">
          <div className="ds-card partners-pitch">
            <Tag dot>Quiero ser aliado</Tag>
            <h3>
              Cuéntanos quién eres <span className="ds-accent">y qué buscas.</span>
            </h3>
            <ol className="partners-steps" aria-label="Qué pasa después">
              <li>
                <strong>Nos escribes.</strong> Unas pocas preguntas cortas; dos minutos.
              </li>
              <li>
                <strong>Hablamos.</strong> Te respondemos en pocos días y armamos
                una propuesta a la medida: un lugar en la mesa, presencia de
                marca o las dos.
              </li>
              <li>
                <strong>Lo cerramos juntos.</strong> Pocos aliados por edición,
                para que cada marca tenga espacio.
              </li>
            </ol>
            <p className="partners-pitch-contact">
              ¿Prefieres escribirnos directo?{" "}
              <a href={`mailto:${summitPartners.contactEmail}`}>{summitPartners.contactEmail}</a>
            </p>
          </div>
          <div className="ds-card lp-form-card" data-accent>
            <PartnerForm />
          </div>
        </div>
      </div>
    </section>
  );
}
