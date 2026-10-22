import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  MapPin,
  UserCheck,
  Users,
} from "lucide-react";
import { colombiaSummit } from "@/lib/colombia-summit";
import { siteUrl, isPublicSite } from "@/lib/site-url";
import { Button, PixelArt, SectionHeading, Tag } from "@/components/ui";
import { PixelPhoto } from "@/components/pixel-photo";
import { SummitInterestForm } from "./interest-form";
import { speakers, type SummitSpeaker } from "./speakers";
import { EventCarousel } from "./event-carousel";
import { SiteFooter, SiteNav } from "./site-chrome";
import { Countdown } from "./countdown";
import { TicketPricing } from "./ticket-pricing";
import { TicketSelectionProvider } from "./ticket-selection";
import { PrivateDinner } from "./private-dinner";
import { SummitAgenda } from "./summit-agenda";
import { summitTickets, totalSeats } from "@/lib/summit-pricing";
import { flag, mic, signal, skyline } from "./pixel-icons";

export const runtime = "nodejs";

const HERO_PHOTO = "/images/photos/bogota-golden-hour.webp";
const SKY_PHOTO = "/images/photos/bogota-sky.webp";
const OG_IMAGE = "/images/colombia-summit/opengraph.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  robots: { index: isPublicSite, follow: isPublicSite },
  title: "Almuerzo privado con Alexander Torrenegra y Tania Zapata | bogota.forward()",
  description:
    "Una tarde a puerta cerrada en Bogotá, el 19 de noviembre de 2026, de 1:30 a 6:00 p. m. 20 lugares por aplicación para founders, managers y C-levels: charla privada, feedback 1 a 1 y happy hour.",
  alternates: { canonical: colombiaSummit.path },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: colombiaSummit.path,
    siteName: colombiaSummit.name,
    title: "Almuerzo privado con Alexander Torrenegra y Tania Zapata · Bogotá, 19 de noviembre",
    description:
      "20 lugares por aplicación para founders, managers y C-levels. Charla privada, feedback 1 a 1 y happy hour.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "bogota.forward() summit. Bogotá, 19 de noviembre de 2026. Organiza AIYaiYai. Sponsors: Torrenegra & Co, Torre.ai y Worder.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE],
  },
};

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

// Why the format is small, in three lines.
const pillars = [
  {
    art: skyline,
    title: `${totalSeats} lugares`,
    body: "Un grupo elegido a mano. Todos los asistentes son founders, managers o C-levels.",
  },
  {
    art: signal,
    title: "A puerta cerrada",
    body: "Sin escenario ni público: una conversación privada, con espacio para tus preguntas.",
  },
  {
    art: mic,
    title: "Feedback 1 a 1",
    body: "Dos horas y media para recibir feedback directo de Alexander y Tania sobre tu empresa.",
  },
];

const seatsFor = (id: "vip" | "vip-plus") =>
  summitTickets.find((ticket) => ticket.id === id)?.capacity ?? 0;

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "¿Cuándo y dónde es?",
    a: "El jueves 19 de noviembre de 2026, de 1:30 a 6:00 p. m., hora de Bogotá. La dirección exacta la compartimos solo con las personas aceptadas.",
  },
  {
    q: "¿Quién puede asistir?",
    a: `Founders, managers y C-levels. Revisamos cada solicitud a mano y no todas son aceptadas: buscamos un grupo de ${totalSeats} personas donde cada una aporte a la conversación.`,
  },
  {
    q: "¿Cómo funciona la solicitud?",
    a: "Eliges General o VIP y nos dejas tus datos, tu empresa y tu LinkedIn. Revisamos tu perfil y, si hay un lugar para ti, te escribimos por correo o WhatsApp con los siguientes pasos y el pago. Enviar la solicitud no reserva un lugar ni garantiza el precio de una fase.",
  },
  {
    q: "¿Qué diferencia hay entre General y VIP?",
    a: `Las dos incluyen la tarde completa: almuerzo, charla privada, feedback 1 a 1 con Alexander y Tania, y happy hour. VIP suma una sesión 1 a 1 de 45 minutos con Alexander Torrenegra, posterior al evento. Hay ${seatsFor("vip")} lugares General y ${seatsFor("vip-plus")} VIP.`,
  },
  {
    q: "¿Cómo funcionan las fases de precios?",
    a: "La primera fase termina el 31 de octubre; la segunda, el 14 de noviembre; y la tercera, el 19 de noviembre de 2026. Cada fecha incluye el día completo, hasta las 11:59 p. m., hora de Bogotá. Todos los precios están expresados en USD por persona.",
  },
  {
    q: "¿Quién organiza?",
    a: "AIYaiYai, con el apoyo de Torrenegra & Co, Torre.ai y Worder.",
  },
  {
    q: "¿Mi empresa puede ser aliada o sponsor?",
    a: (
      <>
        Sí. Proponemos que tu marca esté en todo lo que hacemos, con el
        alcance de nuestros canales.{" "}
        <a href="/partners">Conoce la propuesta para aliados</a> y envíanos tus
        datos; te respondemos en pocos días.
      </>
    ),
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
          <p className="lp-speaker-bio">{speaker.bio}</p>
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
  name: "Almuerzo privado con Alexander Torrenegra y Tania Zapata",
  description: `Una tarde a puerta cerrada en Bogotá. ${totalSeats} lugares por aplicación para founders, managers y C-levels.`,
  startDate: colombiaSummit.startDate,
  endDate: colombiaSummit.endDate,
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

export default function BogotaForwardSummitPage() {
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

      <SiteNav />

      <TicketSelectionProvider>
      <main id="contenido">
        <section className="ds-section lp-hero" data-field aria-labelledby="summit-title">
          <div className="ds-container lp-hero-copy">
            <span className="ds-reveal">
              <Tag live>Almuerzo privado · Por aplicación</Tag>
            </span>
            <h1 id="summit-title" className="ds-display-xl lp-hero-title">
              <span className="ds-reveal" style={step(1)}>
                Almuerzo privado con
              </span>{" "}
              <span className="ds-reveal ds-accent" style={step(2)}>
                Alexander Torrenegra y Tania Zapata
                <span className="ds-cursor" aria-hidden="true" />
              </span>
            </h1>
            <p className="ds-lead lp-hero-lead ds-reveal" style={step(3)}>
              {totalSeats} lugares para founders, managers y C-levels. Una tarde
              a puerta cerrada en Bogotá, con charla privada, feedback 1 a 1 y
              happy hour.
            </p>
            <div className="lp-actions ds-reveal" style={step(4)}>
              <Button href="#entradas" icon={<ArrowRight aria-hidden="true" />}>
                Solicitar mi lugar
              </Button>
              <Button variant="secondary" href="#agenda">
                Ver la tarde
              </Button>
            </div>
            <p className="lp-hero-note ds-reveal" style={step(5)}>
              Por aplicación · {seatsFor("vip")} General · {seatsFor("vip-plus")} VIP
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
                Bogotá · Privado
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
                <span>Jueves · 1:30 a 6:00 p. m.</span>
              </li>
              <li className="ds-card">
                <Users aria-hidden="true" />
                <strong>{totalSeats} lugares</strong>
                <span>{seatsFor("vip")} General · {seatsFor("vip-plus")} VIP</span>
              </li>
              <li className="ds-card">
                <UserCheck aria-hidden="true" />
                <strong>Por aplicación</strong>
                <span>Founders, managers y C-levels</span>
              </li>
            </ul>
          </div>
        </section>

        <hr className="ds-divider" />

        <section className="ds-section" data-field aria-labelledby="pillars-title">
          <div className="ds-container">
            <SectionHeading
              id="pillars-title"
              tag="El formato"
              title={
                <>
                  Menos gente, <span className="ds-accent">más conversación.</span>
                </>
              }
            >
              Pequeño a propósito: para que cada persona hable, pregunte y se
              lleve algo concreto sobre su empresa.
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

        <section className="ds-section" id="anfitriones" aria-labelledby="speakers-title">
          <div className="ds-container">
            <SectionHeading
              id="speakers-title"
              tag="Anfitriones"
              title={
                <>
                  Con quién te vas <span className="ds-accent">a sentar.</span>
                </>
              }
            >
              Emprendedores e inversionistas que han vivido de primera mano lo
              que la IA está cambiando en sus empresas.
            </SectionHeading>
            <ul className="lp-speakers">
              {speakers.map((speaker) => (
                <Speaker key={speaker.name} speaker={speaker} />
              ))}
            </ul>
            <p className="lp-note">
              Logos de trayectoria profesional y formación de los anfitriones.
              No representan patrocinios del evento.
            </p>
          </div>
        </section>

        <hr className="ds-divider" />

        <SummitAgenda />

        <hr className="ds-divider" />

        <PrivateDinner />

        <TicketPricing />

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
        </section>

        <section className="lp-partners-band" aria-labelledby="partners-band-title">
          <div className="ds-container">
            <a href="/partners" className="ds-card lp-partners-cta" data-accent>
              <PixelArt rows={flag} size={64} className="lp-partners-art" />
              <div className="lp-partners-copy">
                <Tag dot>Aliados y sponsors</Tag>
                <h2 id="partners-band-title">
                  ¿Te interesa ser sponsor <span className="ds-accent">o aliado?</span>
                </h2>
                <p>Tu marca en todo lo que hacemos y +642K de alcance.</p>
              </div>
              <span className="ds-button lp-partners-button" data-variant="primary" data-size="md">
                Revisa la propuesta
                <ArrowRight aria-hidden="true" />
              </span>
            </a>
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
              tag="Solicitud"
              title={
                <>
                  Solicita tu <span className="ds-accent">lugar.</span>
                </>
              }
            >
              Revisamos cada solicitud a mano. Si tu perfil encaja con la mesa,
              te escribimos con los siguientes pasos y la ubicación.
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
                    <dt>Horario</dt>
                    <dd>1:30 a 6:00 p. m. · Hora de Bogotá</dd>
                  </div>
                  <div>
                    <dt>Dónde</dt>
                    <dd>Bogotá · Ubicación privada</dd>
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
      </TicketSelectionProvider>

      <SiteFooter />

      <Button
        href="#entradas"
        className="lp-mobile-cta"
        icon={<ArrowRight aria-hidden="true" />}
      >
        Solicitar lugar · {totalSeats} lugares
      </Button>
    </div>
  );
}
