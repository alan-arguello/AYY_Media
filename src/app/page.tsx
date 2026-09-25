import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, CirclePlay } from "lucide-react";
import { colombiaSummit } from "@/lib/colombia-summit";
import { siteUrl, isPublicSite } from "@/lib/site-url";
import { Button, LogoMark, Pill, SectionHeading } from "@/components/ui";
import { SummitInterestForm } from "./interest-form";
import { speakers, type SummitSpeaker } from "./speakers";
import { pastEventSupporters } from "./past-events";
import { EventCarousel } from "./event-carousel";
import { EventOrganizer, EventSponsors } from "./event-branding";
import { Countdown } from "./countdown";

export const runtime = "nodejs";

const HERO_PHOTO = "/images/photos/bogota-golden-hour.webp";
const SKY_PHOTO = "/images/photos/bogota-sky.webp";
const OG_IMAGE = "/images/colombia-summit/opengraph.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  robots: { index: isPublicSite, follow: isPublicSite },
  title: "Accelerating LATAM Summit | 19 de noviembre de 2026, Bogotá",
  description:
    "IA, empresas y lo que viene. Nos encontramos en Bogotá con Alexander Torrenegra, Tania Zapata y más speakers. 19 de noviembre de 2026.",
  alternates: { canonical: colombiaSummit.path },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: colombiaSummit.path,
    siteName: colombiaSummit.name,
    title: "Accelerating LATAM Summit · Bogotá, 19 de noviembre",
    description:
      "Una conversación sobre IA, empresas y lo que viene. Súmate a la lista de interés.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Accelerating LATAM Summit. Bogotá, 19 de noviembre de 2026. Organiza AIYaiYai. Sponsors: Torrenegra & Co, Torre.ai y Worder.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE],
  },
};

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

const comingSoon = [
  { name: "OpenAI", image: "/images/logos/collaborations/openai.png", ratio: 3.68 },
  { name: "Google", image: "/images/colombia-summit/google.png", ratio: 2.96 },
  {
    name: "Microsoft",
    image: "/images/colombia-summit/microsoft-wordmark.svg",
    ratio: 4.69,
  },
];

function Speaker({ speaker }: { speaker: SummitSpeaker }) {
  return (
    <li className="lp-speaker">
      <a
        href={speaker.linkedin}
        className="lp-speaker-link"
        {...external}
        aria-label={`Perfil de ${speaker.name} en LinkedIn (nueva pestaña)`}
      >
        <div className="lp-speaker-media">
          <Image
            src={speaker.image}
            alt={speaker.name}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1100px) 30vw, 220px"
            quality={90}
          />
        </div>
        <div className="lp-speaker-head">
          <h3>
            {speaker.name}
            <ArrowUpRight aria-hidden="true" />
          </h3>
          <p>{speaker.role}</p>
        </div>
      </a>
      <ul
        className="lp-credentials"
        aria-label={`Trayectoria de ${speaker.name}`}
      >
        {speaker.credentials.map((credential) => (
          <li key={credential.name}>
            <a
              href={credential.source}
              className="lp-credential"
              {...external}
              aria-label={`${credential.name}: ${credential.detail} (nueva pestaña)`}
            >
              <Image
                src={credential.image}
                alt={credential.name}
                width={96}
                height={28}
              />
              <span className="lp-tooltip" aria-hidden="true">
                {credential.detail}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </li>
  );
}

const eventSchema = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: colombiaSummit.name,
  description: "IA, empresas y lo que viene.",
  startDate: colombiaSummit.date,
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  inLanguage: "es",
  image: [`${siteUrl}${OG_IMAGE}`],
  location: {
    "@type": "Place",
    name: "Bogotá",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bogotá",
      addressCountry: "CO",
    },
  },
  organizer: {
    "@type": "Organization",
    name: colombiaSummit.organizer,
    url: colombiaSummit.channel,
  },
  performer: speakers.map((speaker) => ({ "@type": "Person", name: speaker.name })),
};

export default function AcceleratingLatamSummitPage() {
  return (
    <div className="lp" id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <a className="lp-skip" href="#contenido">
        Ir al contenido
      </a>

      <header className="lp-nav">
        <div className="ds-frame lp-nav-inner">
          <a href="#top" aria-label="Accelerating LATAM Summit, inicio">
            <LogoMark />
          </a>
          <nav className="lp-nav-links" aria-label="Secciones">
            <a href="#speakers">Speakers</a>
            <a href="#sponsors">Sponsors</a>
            <a href="#comunidad">Comunidad</a>
          </nav>
          <div className="lp-nav-actions">
            <Button href="#lista" icon={<ArrowRight aria-hidden="true" />}>
              Únete a la lista
            </Button>
          </div>
        </div>
      </header>

      <main id="contenido">
        <section className="ds-band lp-hero-band" aria-labelledby="summit-title">
          <div className="ds-frame lp-hero">
            <div className="lp-hero-copy">
              <Pill tone="white">
                <span className="lp-live-dot" aria-hidden="true" />
                Próximamente · Bogotá, Colombia
              </Pill>
              <h1 id="summit-title" className="ds-display-xl">
                Accelerating
                <br /> LATAM Summit
              </h1>
            </div>
            <div className="lp-hero-aside">
              <p>
                La IA está cambiando las reglas. La próxima conversación sobre
                IA, empresas y lo que viene empieza en Bogotá.
              </p>
              <div className="lp-actions">
                <Button
                  size="lg"
                  href="#lista"
                  icon={<ArrowRight aria-hidden="true" />}
                >
                  Quiero enterarme primero
                </Button>
                <Button size="lg" variant="secondary" href="#speakers">
                  Ver speakers
                </Button>
              </div>
            </div>

            <figure className="lp-stage ds-media">
              <Image
                src={HERO_PHOTO}
                alt="Bogotá al atardecer frente a los cerros de Monserrate y Guadalupe."
                fill
                priority
                quality={90}
                sizes="(max-width: 1248px) 100vw, 1200px"
              />
              <div className="lp-stage-top">
                <Pill tone="white">
                  <time dateTime={colombiaSummit.date}>
                    Jueves 19 de noviembre, 2026
                  </time>
                </Pill>
                <Pill tone="white">
                  <Countdown />
                </Pill>
              </div>
              <dl className="lp-stage-facts">
                <div>
                  <dt>Ciudad</dt>
                  <dd>Bogotá, Colombia</dd>
                </div>
                <div>
                  <dt>Organiza</dt>
                  <dd>AIYaiYai</dd>
                </div>
                <div>
                  <dt>Sponsors</dt>
                  <dd>Torrenegra &amp; Co · Torre.ai · Worder</dd>
                </div>
                <div>
                  <dt>Registro</dt>
                  <dd>Lista de interés abierta</dd>
                </div>
              </dl>
            </figure>
          </div>
        </section>

        <EventSponsors />

        <section className="ds-band" id="speakers" aria-labelledby="speakers-title">
          <div className="ds-frame ds-section">
            <SectionHeading
              id="speakers-title"
              eyebrow="Speakers"
              title="Las primeras voces"
            >
              <p>
                Fundadores, operadores y nuevas perspectivas sobre cómo la IA
                está transformando las empresas de la región.
              </p>
            </SectionHeading>
            <ul className="lp-speakers">
              {speakers.map((speaker) => (
                <Speaker key={speaker.name} speaker={speaker} />
              ))}
            </ul>
            <p className="lp-note">
              Logos de trayectoria profesional y formación de los speakers. No
              representan patrocinios del evento.
            </p>
          </div>
        </section>

        <section className="ds-band" aria-labelledby="coming-title">
          <div className="ds-frame lp-wall">
            <div className="lp-wall-head">
              <h2 id="coming-title">Y esto apenas empieza. Próximamente, speakers de</h2>
              <p>Participaciones por confirmar</p>
            </div>
            <ul className="lp-wall-grid lp-coming">
              {comingSoon.map((company) => (
                <li key={company.name}>
                  <Image
                    src={company.image}
                    alt={company.name}
                    width={Math.round(30 * company.ratio)}
                    height={30}
                    className="lp-mono-logo"
                  />
                  <span className="lp-wall-caption">Por confirmar</span>
                </li>
              ))}
              <li className="lp-wall-note">
                <p>Agenda y nombres, muy pronto.</p>
              </li>
            </ul>
          </div>
        </section>

        <section className="ds-band" id="comunidad" aria-labelledby="community-title">
          <div className="ds-frame ds-section">
            <SectionHeading
              id="community-title"
              eyebrow="La comunidad"
              title="Desde Silicon Valley hasta Latinoamérica"
            >
              <p>
                Reunimos a quienes construyen lo que viene. Ahora, la
                conversación sigue en Bogotá.
              </p>
            </SectionHeading>
            <EventCarousel />
          </div>
          <div className="ds-frame lp-wall lp-wall-flush">
            <div className="lp-wall-head">
              <h2>Empresas que han apoyado nuestros eventos anteriores</h2>
              <p>No son sponsors de este evento</p>
            </div>
            <ul className="lp-wall-grid lp-supporters">
              {pastEventSupporters.map((partner) => (
                <li key={partner.name}>
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
        </section>

        <section className="ds-band" id="lista" aria-labelledby="registration-title">
          <div className="ds-frame ds-section">
            <div className="lp-register ds-media">
              <Image
                src={SKY_PHOTO}
                alt=""
                fill
                sizes="(max-width: 1248px) 100vw, 1200px"
                quality={86}
              />
              <div className="lp-register-copy">
                <p className="ds-eyebrow">Lista de interés</p>
                <h2 id="registration-title" className="ds-display-l">
                  Nos vemos en Bogotá
                </h2>
                <p className="lp-register-lead">
                  Recibe los nuevos speakers, la agenda y la apertura de
                  inscripciones antes que nadie.
                </p>
                <dl className="lp-register-facts">
                  <div>
                    <dt>Cuándo</dt>
                    <dd>Jueves 19 de noviembre, 2026</dd>
                  </div>
                  <div>
                    <dt>Dónde</dt>
                    <dd>Bogotá, Colombia</dd>
                  </div>
                </dl>
              </div>
              <div className="lp-form-card">
                <SummitInterestForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="ds-band lp-footer">
        <div className="ds-frame lp-footer-inner">
          <div className="lp-footer-brand">
            <LogoMark />
            <p>
              IA, empresas y lo que viene. Bogotá, 19 de noviembre de 2026.
            </p>
            <EventOrganizer />
          </div>
          <nav className="lp-footer-nav" aria-label="Pie de página">
            <div>
              <h2>Evento</h2>
              <a href="#speakers">Speakers</a>
              <a href="#sponsors">Sponsors</a>
              <a href="#comunidad">Comunidad</a>
              <a href="#lista">Lista de interés</a>
            </div>
            <div>
              <h2>Organiza</h2>
              <a href={colombiaSummit.channel} {...external} className="lp-footer-icon">
                <CirclePlay aria-hidden="true" /> AIYaiYai en YouTube
              </a>
            </div>
            <div>
              <h2>Contacto</h2>
              <a href={`mailto:${colombiaSummit.contactEmail}`}>Hablemos</a>
            </div>
          </nav>
        </div>
        <div className="ds-frame lp-footer-base">
          <p>© 2026 Accelerating LATAM Summit · Bogotá, Colombia</p>
          <p>
            Fotos:{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Bogot%C3%A1_y_Cerros_Orientales.jpg"
              {...external}
            >
              Felipeortegag
            </a>{" "}
            (CC BY-SA 4.0) y{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:El_cielo_del_atardecer_sobre_Bogot%C3%A1,_Colombia,_2015,_por_Cristian_Baron_(Unsplash).jpg"
              {...external}
            >
              Cristian Baron
            </a>{" "}
            (CC0).
          </p>
        </div>
      </footer>

      <Button
        href="#lista"
        size="lg"
        className="lp-mobile-cta"
        icon={<ArrowRight aria-hidden="true" />}
      >
        Únete a la lista · 19 de noviembre
      </Button>
    </div>
  );
}
