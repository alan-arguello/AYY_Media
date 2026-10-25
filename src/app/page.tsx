import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { colombiaSummit } from "@/lib/colombia-summit";
import { siteUrl, isPublicSite } from "@/lib/site-url";
import { Button, SectionHeading, Tag } from "@/components/ui";
import { SummitInterestForm } from "./interest-form";
import { speakers, type SummitSpeaker } from "./speakers";
import { EventCarousel } from "./event-carousel";
import { pastEventSupporters } from "./past-events";
import { SiteFooter, SiteNav } from "./site-chrome";
import { Countdown } from "./countdown";
import { TicketPricing } from "./ticket-pricing";
import { TicketSelectionProvider } from "./ticket-selection";
import { PrivateDinner } from "./private-dinner";
import { SummitAgenda } from "./summit-agenda";
import { Temas } from "./temas";
import { dinnerSeats, summitTickets, vakiFoundation } from "@/lib/summit-pricing";

export const runtime = "nodejs";

const CITY_PHOTO = "/images/photos/bogota-golden-hour.webp";
const SKY_PHOTO = "/images/photos/bogota-sky.webp";
const OG_IMAGE = "/images/colombia-summit/opengraph.png";
const OG_ALT =
  "bogota.forward(): evento de IA y cena privada para founders, managers y C-levels con Alexander Torrenegra, Tania Zapata y Alan Argüello. Bogotá, 19 de noviembre de 2026.";

// What search results and link previews show. The title leads with what
// people search for (IA, Bogotá, the date) and ends with the brand.
const seoTitle = "Evento de IA y cena privada en Bogotá, 19 de noviembre de 2026 | bogota.forward()";
const seoDescription =
  "Evento de IA en Bogotá para founders, managers y C-levels, con Alexander Torrenegra, Tania Zapata y Alan Argüello. Jueves 19 de noviembre de 2026. Cena privada de 20 lugares, por aplicación.";
const shareTitle = "bogota.forward() · Evento de IA y cena privada en Bogotá, 19 de noviembre de 2026";
const shareDescription =
  "Charlas, fireside chat y workshop con Alexander Torrenegra, Tania Zapata y Alan Argüello, y una cena privada de 20 lugares. Para founders, managers y C-levels.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  robots: { index: isPublicSite, follow: isPublicSite },
  title: seoTitle,
  description: seoDescription,
  alternates: { canonical: colombiaSummit.path },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: colombiaSummit.path,
    siteName: colombiaSummit.name,
    title: shareTitle,
    description: shareDescription,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle,
    description: shareDescription,
    images: [{ url: OG_IMAGE, alt: OG_ALT }],
  },
};

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

// The day, in three cards.
const seatsFor = (id: "vip" | "vip-plus") =>
  summitTickets.find((ticket) => ticket.id === id)?.capacity ?? 0;

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "¿Cuándo y dónde es?",
    a: "Jueves 19 de noviembre de 2026 en Bogotá. El evento es de 10 a. m. a 3 p. m. y la cena privada, de 7 a 10 p. m. El lugar del evento se anuncia pronto; la dirección de la cena la reciben solo las personas aceptadas.",
  },
  {
    q: "¿Para quién es?",
    a: "Founders, managers y C-levels.",
  },
  {
    q: "¿Qué diferencia hay entre General, VIP y VIP Plus?",
    a: `General incluye el evento. VIP suma la cena privada con Alexander y Tania. VIP Plus suma, además, una sesión 1 a 1 online de 60 minutos con Alexander. La cena tiene ${dinnerSeats} lugares: ${seatsFor("vip")} VIP y ${seatsFor("vip-plus")} VIP Plus, por aplicación.`,
  },
  {
    q: "¿Cuándo es la sesión 1 a 1 de VIP Plus?",
    a: "Después del evento, online. Es una sesión individual de 60 minutos con Alexander Torrenegra; la fecha y la hora se coordinan por separado.",
  },
  {
    q: "¿A dónde van las ganancias de la cena?",
    a: (
      <>
        Después de cubrir los gastos de la cena, las ganancias serán donadas a{" "}
        <a href={vakiFoundation.url} target="_blank" rel="noopener noreferrer">
          Vaki Foundation
        </a>
        , el fondo de Vaki que apoya emergencias como el terremoto en Colombia y
        otras causas sociales.
      </>
    ),
  },
  {
    q: "¿Cómo me registro?",
    a: "Eliges General, VIP o VIP Plus y nos dejas tus datos, tu empresa y tu LinkedIn. Te escribimos con los siguientes pasos y el pago; las solicitudes VIP y VIP Plus pasan por revisión. El registro no confirma una entrada ni garantiza el precio de una fase.",
  },
  {
    q: "¿Cómo funcionan las fases de precios?",
    a: "Fase 1 hasta el 31 de octubre, fase 2 hasta el 14 de noviembre y fase 3 hasta el 19 de noviembre, hora de Bogotá. Precios en USD por persona.",
  },
  {
    q: "¿Quién organiza?",
    a: "AIYaiYai, con el apoyo de Torrenegra & Co, Torre.ai y Worder.",
  },
  {
    q: "¿Mi empresa puede ser aliada o sponsor?",
    a: (
      <>
        Sí. <a href="/partners">Conoce la propuesta para aliados</a>.
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
            sizes="(max-width: 640px) 112px, (max-width: 1000px) 45vw, 360px"
            quality={86}
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

// Prices across the three phases, so the offer stays true all season.
const allPrices = summitTickets.flatMap((ticket) => ticket.prices);
const eventSchema = {
  "@context": "https://schema.org",
  "@type": "Event",
  "@id": `${siteUrl}/#event`,
  name: "bogota.forward() · Evento de IA y cena privada para founders, managers y C-levels",
  description: seoDescription,
  url: `${siteUrl}/`,
  startDate: colombiaSummit.startDate,
  endDate: colombiaSummit.endDate,
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  inLanguage: "es",
  isAccessibleForFree: false,
  image: [
    `${siteUrl}${OG_IMAGE}`,
    `${siteUrl}/images/colombia-summit/opengraph-4x3.png`,
    `${siteUrl}/images/colombia-summit/opengraph-1x1.png`,
  ],
  location: {
    "@type": "Place",
    name: "Bogotá",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bogotá",
      addressRegion: "Bogotá D.C.",
      addressCountry: "CO",
    },
  },
  organizer: {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: colombiaSummit.organizer,
    url: siteUrl,
  },
  performer: speakers.map((speaker) => ({
    "@type": "Person",
    name: speaker.name,
    jobTitle: speaker.role,
    sameAs: speaker.linkedin,
  })),
  offers: {
    "@type": "AggregateOffer",
    url: `${siteUrl}/#entradas`,
    priceCurrency: "USD",
    lowPrice: Math.min(...allPrices),
    highPrice: Math.max(...allPrices),
    offerCount: summitTickets.length,
    availability: "https://schema.org/InStock",
    validFrom: "2026-10-01T00:00:00-05:00",
  },
  subEvent: {
    "@type": "Event",
    name: "Cena privada con Alexander Torrenegra y Tania Zapata",
    description: `Cena de ${dinnerSeats} lugares para VIP y VIP Plus, por aplicación.`,
    startDate: colombiaSummit.dinnerStartDate,
    endDate: colombiaSummit.dinnerEndDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    maximumAttendeeCapacity: dinnerSeats,
    location: {
      "@type": "Place",
      name: "Bogotá",
      address: { "@type": "PostalAddress", addressLocality: "Bogotá", addressRegion: "Bogotá D.C.", addressCountry: "CO" },
    },
  },
};

export default function BogotaForwardSummitPage() {
  return (
    <div className="lp" id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <a className="lp-skip" href="#contenido">
        Ir al contenido
      </a>

      <SiteNav />

      <TicketSelectionProvider>
      <main id="contenido">
        <section className="lp-hero" aria-labelledby="summit-title">
          <div className="ds-container">
            <div className="lp-hero-copy">
              <p className="lp-hero-eyebrow">
                <time dateTime={colombiaSummit.date}>Jueves 19 de noviembre de 2026</time> · Bogotá
              </p>
              <h1 id="summit-title" className="ds-display-xl lp-hero-title">
                Evento y cena privada para founders, managers y C-levels
              </h1>
              <div className="lp-actions">
                <Button href="#entradas" icon={<ArrowRight aria-hidden="true" />}>
                  Ver entradas
                </Button>
                <Button variant="secondary" href="#agenda">
                  Ver el día
                </Button>
              </div>
            </div>
            <figure className="lp-hero-photo">
              <Image
                src={CITY_PHOTO}
                alt="Bogotá frente a los cerros de Monserrate y Guadalupe."
                fill
                sizes="(max-width: 900px) 100vw, 820px"
                quality={86}
                preload
              />
            </figure>
            <dl className="lp-facts" aria-label="Datos del evento">
              <div>
                <dt>Evento</dt>
                <dd>10 a. m. a 3 p. m.</dd>
              </div>
              <div>
                <dt>Cena privada</dt>
                <dd>7 a 10 p. m. · {dinnerSeats} lugares</dd>
              </div>
              <div>
                <dt>Entradas</dt>
                <dd>General, VIP y VIP Plus</dd>
              </div>
              <div>
                <dt>Cuenta regresiva</dt>
                <dd>
                  <Countdown />
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="ds-section" id="speakers" aria-labelledby="speakers-title">
          <div className="ds-container">
            <SectionHeading
              id="speakers-title"
              tag="Speakers"
              title={
                <>
                  De quién vas a aprender.
                </>
              }
            />
            <ul className="lp-speakers">
              {speakers.map((speaker) => (
                <Speaker key={speaker.name} speaker={speaker} />
              ))}
            </ul>
            <p className="lp-note">
              Logos de trayectoria y formación de los speakers, no de
              patrocinios.
            </p>
          </div>
        </section>

        <hr className="ds-divider" />

        <SummitAgenda />

        <hr className="ds-divider" />

        <Temas />

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
            />
          </div>
          <EventCarousel />
          <div className="ds-container lp-community-collabs">
            <div className="lp-supporters-head">
              <h3>Empresas con las que hemos colaborado antes en Silicon Valley</h3>
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

        <section className="lp-partners-band" aria-labelledby="partners-band-title">
          <div className="ds-container">
            <a href="/partners" className="ds-card lp-partners-cta" data-accent>
              <div className="lp-partners-art" aria-hidden="true">
                <strong>+642K</strong>
                <small>seguidores</small>
              </div>
              <div className="lp-partners-copy">
                <Tag dot>Aliados y sponsors</Tag>
                <h2 id="partners-band-title">
                  ¿Te interesa ser sponsor o aliado?
                </h2>
                <p>Un lugar en la cena y tu marca en todo lo que hacemos.</p>
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
                  Preguntas frecuentes.
                </>
              }
            />
            <div className="lp-faq ds-offset">
              {faqs.map((faq) => (
                <details key={faq.q} className="lp-faq-item" name="faq">
                  <summary>
                    {faq.q}
                    <Plus aria-hidden="true" />
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
              tag="Registro"
              title={
                <>
                  Nos vemos en Bogotá.
                </>
              }
            >
              Elige tu entrada y déjanos tus datos. Te escribimos con los
              siguientes pasos.
            </SectionHeading>
            <div className="lp-register">
              <div className="ds-card lp-register-media">
                <div className="lp-register-photo">
                  <Image
                    src={SKY_PHOTO}
                    alt="Un avión cruza el cielo de Bogotá al atardecer."
                    fill
                    sizes="(max-width: 1000px) 100vw, 560px"
                    quality={86}
                  />
                </div>
                <dl className="lp-register-facts">
                  <div>
                    <dt>Cuándo</dt>
                    <dd>Jueves 19 de noviembre, 2026</dd>
                  </div>
                  <div>
                    <dt>Horario</dt>
                    <dd>Evento 10 a. m. a 3 p. m. · Cena 7 a 10 p. m.</dd>
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
      </TicketSelectionProvider>

      <SiteFooter />

      <Button
        href="#entradas"
        className="lp-mobile-cta"
        icon={<ArrowRight aria-hidden="true" />}
      >
        Ver entradas · 19 de noviembre
      </Button>
    </div>
  );
}
