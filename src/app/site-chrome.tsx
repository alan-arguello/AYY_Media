import { CirclePlay } from "lucide-react";
import { colombiaSummit } from "@/lib/colombia-summit";
import { Button, LogoMark } from "@/components/ui";
import { EventOrganizer } from "./event-branding";

// The floating nav and the footer, shared by the home page and /partners.
// `home` is "" on the home page, where the links scroll, and "/" elsewhere.

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

const sections = [
  { href: "#speakers", label: "Speakers" },
  { href: "#agenda", label: "El día" },
  { href: "#mesa", label: "La cena" },
  { href: "#entradas", label: "Entradas" },
  { href: "#comunidad", label: "Comunidad" },
];

export function SiteNav({ home = "", current }: { home?: string; current?: "partners" }) {
  return (
    <header className="lp-nav">
      <div className="lp-nav-inner">
        <a href={home || "#top"} aria-label="bogota.forward(), inicio">
          <LogoMark />
        </a>
        <nav className="lp-nav-links" aria-label="Secciones">
          {sections.map((section) => (
            <a key={section.href} href={`${home}${section.href}`}>
              {section.label}
            </a>
          ))}
          <a href="/partners" aria-current={current === "partners" ? "page" : undefined}>
            Aliados
          </a>
        </nav>
        <Button href={`${home}#lista`} size="sm" className="lp-nav-cta">
          Registrarme
        </Button>
      </div>
    </header>
  );
}

export function SiteFooter({ home = "" }: { home?: string }) {
  return (
    <footer className="lp-footer">
      <div className="ds-container">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <LogoMark />
            <p>
              Evento y cena privada para founders, managers y C-levels. Bogotá, 19 de noviembre de 2026.
            </p>
            <EventOrganizer />
          </div>
          <nav className="lp-footer-nav" aria-label="Pie de página">
            <div>
              <h2>Evento</h2>
              <a href={`${home}#speakers`}>Speakers</a>
              <a href={`${home}#agenda`}>El día</a>
              <a href={`${home}#mesa`}>La cena privada</a>
              <a href={`${home}#entradas`}>Entradas y precios</a>
              <a href={`${home}#comunidad`}>Comunidad</a>
              <a href="/partners">Aliados y sponsors</a>
              <a href={`${home}#faq`}>Preguntas</a>
              <a href={`${home}#lista`}>Registro</a>
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
          <p>© 2026 bogota.forward() · Bogotá, Colombia</p>
          <p>
            Grabado y semitono creados a partir de fotos de{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Bogot%C3%A1_y_Cerros_Orientales.jpg"
              {...external}
            >
              Felipeortegag
            </a>{" "}
            (CC BY-SA 4.0; el grabado se comparte con la misma licencia) y{" "}
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
  );
}
