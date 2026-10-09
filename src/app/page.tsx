import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  CirclePlay,
  ListChecks,
  MapPin,
} from "lucide-react";
import { colombiaSummit } from "@/lib/colombia-summit";
import { siteUrl, isPublicSite } from "@/lib/site-url";
import { Button, LogoMark, PixelArt, SectionHeading, Tag } from "@/components/ui";
import { PixelPhoto } from "@/components/pixel-photo";
import { SummitInterestForm } from "./interest-form";
import { speakers, type SummitSpeaker } from "./speakers";
import { pastEventSupporters } from "./past-events";
import { EventCarousel } from "./event-carousel";
import { EventOrganizer, EventSponsors } from "./event-branding";
import { Countdown } from "./countdown";
import { chip, rocket, skyline } from "./pixel-icons";

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

const pillars = [
  {
    art: chip,
    title: "Inteligencia artificial",
    body: "Cómo la IA está cambiando las reglas del trabajo y de los negocios.",
  },
  {
    art: skyline,
    title: "Empresas de la región",
    body: "Fundadores y operadores que están transformando sus empresas en Latinoamérica.",
  },
  {
    art: rocket,
    title: "Lo que viene",
    body: "La próxima conversación sobre hacia dónde va todo esto empieza en Bogotá.",
  },
];

const speakerNames = new Intl.ListFormat("es", {
  style: "long",
  type: "conjunction",
}).format(speakers.map((speaker) => speaker.name));

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "¿Cuándo y dónde es?",
    a: "El jueves 19 de noviembre de 2026, en Bogotá, Colombia. La agenda y los detalles los compartiremos primero con la lista de interés.",
  },
  {
    q: "¿Ya puedo comprar mi entrada?",
    a: "Todavía no. Las entradas aún no están a la venta; por ahora puedes unirte a la lista de interés.",
  },
  {
    q: "¿Qué pasa cuando me uno a la lista?",
    a: "Te avisaremos por correo cuando anunciemos nuevos speakers y abramos las inscripciones. Es un registro de interés, no una reserva de entrada.",
  },
  {
    q: "¿Quién organiza el summit?",
    a: "AIYaiYai, con el apoyo de Torrenegra & Co, Torre.ai y Worder.",
  },
  {
    q: "¿Quiénes son los speakers?",
    a: `Hasta ahora, ${speakerNames}. Agenda y nombres nuevos, muy pronto.`,
  },
  {
    q: "¿Cómo los contacto?",
    a: (
      <>
        Escríbenos a{" "}
        <a href={`mailto:${colombiaSummit.contactEmail}`}>
          {colombiaSummit.contactEmail}
        </a>
        .
      </>
    ),
  },
];

function Speaker({ speaker }: { speaker: SummitSpeaker }) {
  return (
    <li className="ds-card lp-speaker ds-in-view">
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
            sizes="(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 300px"
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

const step = (i: number) => ({ "--i": i }) as React.CSSProperties;

export default function AcceleratingLatamSummitPage() {
  return (
    <div className="lp" id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <div className="ds-rails" aria-hidden="true" />
      <a className="lp-skip" href="#contenido">
        Ir al contenido
      </a>

      <header className="lp-nav">
        <div className="lp-nav-inner">
          <a href="#top" aria-label="Accelerating LATAM Summit, inicio">
            <LogoMark />
          </a>
          <nav className="lp-nav-links" aria-label="Secciones">
            <a href="#speakers">Speakers</a>
            <a href="#sponsors">Sponsors</a>
            <a href="#comunidad">Comunidad</a>
          </nav>
          <Button href="#lista" size="sm" className="lp-nav-cta">
            Únete a la lista
          </Button>
        </div>
      </header>

      <main id="contenido">
        <section className="ds-section lp-hero" data-field aria-labelledby="summit-title">
          <div className="ds-container lp-hero-copy">
            <span className="ds-reveal">
              <Tag live>Próximamente · Bogotá, Colombia</Tag>
            </span>
            <h1 id="summit-title" className="ds-display-xl">
              <span className="ds-reveal" style={step(1)}>
                Accelerating
              </span>{" "}
              <span className="ds-accent ds-reveal" style={step(2)}>
                LATAM Summit.
              </span>
            </h1>
            <p className="ds-lead lp-hero-lead ds-reveal" style={step(3)}>
              La IA está cambiando las reglas. La próxima conversación sobre
              IA, empresas y lo que viene empieza en Bogotá.
            </p>
            <div className="lp-actions ds-reveal" style={step(4)}>
              <Button href="#lista" icon={<ArrowRight aria-hidden="true" />}>
                Quiero enterarme primero
              </Button>
              <Button variant="secondary" href="#speakers">
                Ver speakers
              </Button>
            </div>
            <p className="lp-hero-note ds-reveal" style={step(5)}>
              *Lista de interés. Las entradas aún no están a la venta.
            </p>
          </div>

          <div className="ds-container">
            <figure className="lp-stage">
              <div className="ds-card lp-stage-frame">
                <PixelPhoto
                  src={HERO_PHOTO}
                  alt="Bogotá al atardecer frente a los cerros de Monserrate y Guadalupe."
                  sizes="(max-width: 1000px) 100vw, 924px"
                  preload
                  cell={16}
                  solidFrom={0.44}
                  silhouette={0.35}
                  className="lp-stage-photo"
                />
              </div>
              <Tag dot className="lp-float lp-float-place">
                Bogotá, Colombia
              </Tag>
              <Tag live className="lp-float lp-float-count">
                <Countdown />
              </Tag>
              <span className="ds-icon-tile lp-float lp-float-pin" aria-hidden="true">
                <MapPin />
              </span>
              <span className="ds-icon-tile lp-float lp-float-cal" aria-hidden="true">
                <CalendarDays />
              </span>
            </figure>

            <ul className="lp-facts" aria-label="Datos del evento">
              <li className="ds-card">
                <CalendarDays aria-hidden="true" />
                <strong>
                  <time dateTime={colombiaSummit.date}>19.11.2026</time>
                </strong>
                <span>Jueves 19 de noviembre</span>
              </li>
              <li className="ds-card">
                <MapPin aria-hidden="true" />
                <strong>Bogotá</strong>
                <span>Colombia</span>
              </li>
              <li className="ds-card">
                <ListChecks aria-hidden="true" />
                <strong>Lista abierta</strong>
                <span>Registro de interés</span>
              </li>
            </ul>
          </div>
        </section>

        <EventSponsors />

        <hr className="ds-divider" />

        <section className="ds-section" data-field aria-labelledby="pillars-title">
          <div className="ds-container">
            <SectionHeading
              id="pillars-title"
              tag="El summit"
              title={
                <>
                  IA, empresas <span className="ds-accent">y lo que viene.</span>
                </>
              }
            >
              Una conversación sobre cómo la inteligencia artificial está
              cambiando las reglas, con quienes la usan para construir empresas
              en la región.
            </SectionHeading>
            <ul className="lp-pillars">
              {pillars.map((pillar) => (
                <li key={pillar.title} className="ds-card ds-in-view">
                  <div className="lp-pillar-art">
                    <PixelArt rows={pillar.art} size={126} />
                  </div>
                  <div className="lp-pillar-copy">
                    <h3>{pillar.title}</h3>
                    <p>{pillar.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <hr className="ds-divider" />

        <section className="ds-section" id="speakers" aria-labelledby="speakers-title">
          <div className="ds-container">
            <SectionHeading
              id="speakers-title"
              tag="Speakers"
              title={
                <>
                  Las primeras <span className="ds-accent">voces.</span>
                </>
              }
            >
              Fundadores, operadores y nuevas perspectivas sobre cómo la IA
              está transformando las empresas de la región.
            </SectionHeading>
            <ul className="lp-speakers">
              {speakers.map((speaker) => (
                <Speaker key={speaker.name} speaker={speaker} />
              ))}
              <li className="ds-card lp-coming ds-in-view" aria-labelledby="coming-title">
                <Tag dot>Por confirmar</Tag>
                <h3 id="coming-title">
                  Y esto apenas <span className="ds-accent">empieza.</span>
                </h3>
                <p>Próximamente, speakers de</p>
                <ul className="lp-coming-logos">
                  {comingSoon.map((company) => (
                    <li key={company.name}>
                      <Image
                        src={company.image}
                        alt={company.name}
                        width={Math.round(24 * company.ratio)}
                        height={24}
                        className="lp-mono-logo"
                      />
                      <span>Por confirmar</span>
                    </li>
                  ))}
                </ul>
                <p className="lp-coming-foot">Agenda y nombres, muy pronto.</p>
              </li>
            </ul>
            <p className="lp-note">
              Logos de trayectoria profesional y formación de los speakers. No
              representan patrocinios del evento.
            </p>
          </div>
        </section>

        <hr className="ds-divider" />

        <section className="ds-section" id="comunidad" data-field aria-labelledby="community-title">
          <div className="ds-container">
            <SectionHeading
              id="community-title"
              tag="Comunidad"
              title={
                <>
                  Desde Silicon Valley{" "}
                  <span className="ds-accent">hasta Latinoamérica.</span>
                </>
              }
            >
              Reunimos a quienes construyen lo que viene. Ahora, la
              conversación sigue en Bogotá.
            </SectionHeading>
          </div>
          <EventCarousel />
          <div className="ds-container">
            <div className="lp-supporters-head">
              <h3>Empresas que han apoyado nuestros eventos anteriores</h3>
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
        </section>

        <hr className="ds-divider" />

        <section className="ds-section" id="faq" aria-labelledby="faq-title">
          <div className="ds-container">
            <SectionHeading
              id="faq-title"
              tag="FAQ"
              title={
                <>
                  Preguntas <span className="ds-accent">frecuentes.</span>
                </>
              }
            />
            <div className="lp-faq">
              {faqs.map((faq) => (
                <details key={faq.q} className="lp-faq-item" name="faq">
                  <summary>
                    {faq.q}
                    <ChevronDown aria-hidden="true" />
                  </summary>
                  <p>{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <hr className="ds-divider" />

        <section className="ds-section" id="lista" data-field aria-labelledby="registration-title">
          <div className="ds-container">
            <SectionHeading
              id="registration-title"
              tag="Lista de interés"
              title={
                <>
                  Nos vemos en <span className="ds-accent">Bogotá.</span>
                </>
              }
            >
              Recibe los nuevos speakers, la agenda y la apertura de
              inscripciones antes que nadie.
            </SectionHeading>
            <div className="lp-register">
              <div className="ds-card lp-register-media">
                <PixelPhoto
                  src={SKY_PHOTO}
                  alt=""
                  sizes="(max-width: 1000px) 100vw, 460px"
                  quality={86}
                  cell={12}
                  solidFrom={0.27}
                  filter="saturate(0.85) brightness(1.04)"
                  className="lp-register-photo"
                />
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
              <div className="ds-card lp-form-card" data-accent>
                <SummitInterestForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="ds-container">
          <div className="lp-footer-inner">
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
                <a href="#faq">Preguntas</a>
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
          <div className="lp-footer-base">
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
        </div>
      </footer>

      <Button
        href="#lista"
        className="lp-mobile-cta"
        icon={<ArrowRight aria-hidden="true" />}
      >
        Únete a la lista · 19 de noviembre
      </Button>
    </div>
  );
}
