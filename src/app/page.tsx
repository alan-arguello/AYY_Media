import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight as ArrowRightIcon, CirclePlay } from "lucide-react";
import { colombiaSummit } from "@/lib/colombia-summit";
import { siteUrl, isPublicSite } from "@/lib/site-url";
import { SummitInterestForm } from "./interest-form";
import { BogotaAscii } from "./bogota-ascii";
import { mainSpeakers, guestSpeakers, type SummitSpeaker } from "./speakers";
import { SpeakerPortrait } from "./speaker-portrait";
import { pastEventSupporters } from "./past-events";
import { EventCarousel } from "./event-carousel";
import { EventOrganizer, EventSponsors } from "./event-branding";

export const runtime = "nodejs";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  robots: { index: isPublicSite, follow: isPublicSite },
  title: "Back to the Future Summit | 19 de noviembre de 2026, Bogotá",
  description:
    "IA, empresas y lo que viene. Nos encontramos en Bogotá con Alexander Torrenegra, Tania Zapata y más speakers. 19 de noviembre de 2026.",
  alternates: { canonical: colombiaSummit.path },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: colombiaSummit.path,
    title: "Back to the Future Summit · Bogotá, 19 de noviembre",
    description:
      "Una conversación sobre IA, empresas y lo que viene. Súmate a la lista de interés.",
    images: [
      {
        url: "/images/colombia-summit/opengraph.png",
        width: 1200,
        height: 630,
        alt: "Back to the Future Summit. Bogotá, 19 de noviembre de 2026. Organiza AIYaiYai. Sponsors: Torrenegra & Co, Torre.ai y Worder.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/colombia-summit/opengraph.png"],
  },
};

function Speaker({
  speaker,
  featured = false,
}: {
  speaker: SummitSpeaker;
  featured?: boolean;
}) {
  return (
    <article className={`cs-speaker${featured ? " cs-speaker-featured" : ""}`}>
      <a
        href={speaker.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="cs-speaker-link"
        aria-label={`Perfil de ${speaker.name} en LinkedIn (nueva pestaña)`}
      >
        <SpeakerPortrait
          src={speaker.image}
          name={speaker.name}
          featured={featured}
        />
        <div className="cs-speaker-caption">
          <h3>{speaker.name}</h3>
          <p>{speaker.role}</p>
          <span className="cs-profile-arrow" aria-hidden="true">
            <ArrowRightIcon />
          </span>
        </div>
      </a>
      <div
        className="cs-credentials"
        aria-label={`Trayectoria de ${speaker.name}`}
      >
        {speaker.credentials.map((credential) => (
          <a
            key={credential.name}
            href={credential.source}
            target="_blank"
            rel="noopener noreferrer"
            className="cs-credential"
            aria-label={`${credential.name}: ${credential.detail} (nueva pestaña)`}
          >
            <Image
              src={credential.image}
              alt={credential.name}
              width={120}
              height={36}
            />
            <span className="cs-credential-tooltip">{credential.detail}</span>
          </a>
        ))}
      </div>
    </article>
  );
}

export default function ColombiaSummitPage() {
  return (
    <div className="cs-page">
      <a className="cs-skip" href="#contenido">
        Ir al contenido
      </a>
      <header className="cs-header cs-shell">
        <EventOrganizer />
        <nav aria-label="Navegación del evento">
          <a className="cs-nav-speakers" href="#speakers">
            Speakers
          </a>
          <a className="cs-nav-cta" href="#lista">
            Únete a la lista <ArrowRightIcon />
          </a>
        </nav>
      </header>
      <main id="contenido">
        <section className="cs-hero" aria-labelledby="summit-title">
          <BogotaAscii />
          <div className="cs-hero-content cs-shell">
            <div className="cs-hero-top">
              <span className="cs-status">
                <span aria-hidden="true" />
                Coming soon
              </span>
              <span className="cs-hero-location">
                Bogotá, Colombia <span aria-hidden="true">[ 4.7110° N ]</span>
              </span>
            </div>
            <div className="cs-hero-title">
              <h1 id="summit-title">
                <span className="cs-title-intro">Back to the</span>
                <span className="cs-title-main">
                  Future Summit
                  <span className="cs-title-cursor" aria-hidden="true">
                    _
                  </span>
                </span>
              </h1>
              <p>
                La IA está cambiando las reglas.
                <br />
                La próxima conversación empieza en Bogotá.
              </p>
            </div>
            <div className="cs-hero-bottom">
              <div className="cs-event-details">
                <time dateTime={colombiaSummit.date}>
                  19 de noviembre, 2026
                </time>
                <span>Bogotá, Colombia</span>
              </div>
              <a href="#lista" className="cs-button cs-button-accent">
                Quiero enterarme primero <ArrowRightIcon />
              </a>
            </div>
          </div>
        </section>
        <EventSponsors />
        <section
          className="cs-speakers cs-shell"
          id="speakers"
          aria-labelledby="speakers-title"
        >
          <div className="cs-section-heading">
            <h2 id="speakers-title">Las primeras voces.</h2>
            <p>Fundadores, operadores y nuevas perspectivas.</p>
          </div>
          <div className="cs-speaker-grid">
            {mainSpeakers.map((speaker) => (
              <Speaker key={speaker.name} speaker={speaker} featured />
            ))}
          </div>
          <h3 className="cs-guests-heading">También en la conversación</h3>
          <div className="cs-guest-grid">
            {guestSpeakers.map((speaker) => (
              <Speaker key={speaker.name} speaker={speaker} />
            ))}
          </div>
          <p className="cs-track-record-note">
            Logos de trayectoria profesional y formación de los speakers. No
            representan patrocinios del evento.
          </p>
          <div className="cs-coming">
            <div>
              <h3>Y esto apenas empieza.</h3>
              <p>Próximamente, speakers de:</p>
            </div>
            <div
              className="cs-company-list"
              aria-label="Participaciones por confirmar"
            >
              <Image
                src="/images/logos/collaborations/openai.png"
                alt="OpenAI"
                width={132}
                height={36}
              />
              <Image
                src="/images/colombia-summit/google.png"
                alt="Google"
                width={112}
                height={36}
              />
              <Image
                src="/images/colombia-summit/microsoft-wordmark.svg"
                alt="Microsoft"
                width={132}
                height={36}
              />
            </div>
            <p className="cs-coming-note">
              Participaciones por confirmar. Agenda y nombres próximamente.
            </p>
          </div>
        </section>
        <section
          className="cs-community cs-shell"
          aria-labelledby="community-title"
        >
          <div className="cs-section-heading cs-community-heading">
            <h2 id="community-title">
              Desde Silicon Valley
              <br /> hasta Latinoamérica.
            </h2>
            <p>
              Reunimos a quienes construyen lo que viene. <br />
              Ahora, la conversación sigue en Bogotá.
            </p>
          </div>
          <EventCarousel />
          <div className="cs-event-partners">
            <p>Empresas que han apoyado nuestros eventos anteriores</p>
            <ul
              className="cs-partner-grid"
              aria-label="Colaboraciones en eventos anteriores"
            >
              {pastEventSupporters.map((partner) => (
                <li key={partner.name}>
                  <Image
                    src={partner.image}
                    alt={partner.name}
                    width={160}
                    height={40}
                    className={
                      partner.name === "v0" ? "cs-partner-compact" : undefined
                    }
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section
          className="cs-registration"
          id="lista"
          aria-labelledby="registration-title"
        >
          <div className="cs-shell cs-registration-grid">
            <div className="cs-registration-copy">
              <span className="cs-registration-marker" aria-hidden="true">
                [ + ]
              </span>
              <h2 id="registration-title">
                Nos vemos
                <br />
                en el <span>futuro.</span>
              </h2>
              <p>
                Recibe los nuevos speakers, la agenda y la apertura de
                inscripciones antes que nadie.
              </p>
              <div className="cs-registration-date">
                <time dateTime={colombiaSummit.date}>19.11.2026</time>
                <span>Bogotá, Colombia</span>
              </div>
            </div>
            <SummitInterestForm />
          </div>
        </section>
      </main>
      <footer className="cs-footer cs-shell">
        <div className="cs-footer-main">
          <EventOrganizer />
          <p>Back to the Future Summit · 2026</p>
          <a
            className="cs-youtube"
            href={colombiaSummit.channel}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CirclePlay aria-hidden="true" /> AIYaiYai en YouTube
          </a>
          <a href={`mailto:${colombiaSummit.contactEmail}`}>
            Hablemos <ArrowRightIcon />
          </a>
        </div>
        <p className="cs-photo-credit">
          Fotografía de Bogotá:{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Monserrate_y_centro_de_Bogota.jpg"
            target="_blank"
            rel="noopener noreferrer"
          >
            JosCuevasc · CC BY-SA 4.0
          </a>
        </p>
      </footer>
    </div>
  );
}
