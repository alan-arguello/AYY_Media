import { CirclePlay } from "lucide-react";
import { colombiaSummit } from "@/lib/colombia-summit";
import { Button, LogoMark } from "@/components/ui";
import { EventOrganizer } from "./event-branding";

// The floating nav and the footer, shared by the home page and /partners.
// `home` is "" on the home page, where the links scroll, and "/" elsewhere.

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

const sections = [
  { href: "#anfitriones", label: "Anfitriones" },
  { href: "#agenda", label: "La tarde" },
  { href: "#mesa", label: "La mesa" },
  { href: "#entradas", label: "Lugares" },
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
          Solicitar lugar
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
              Comida privada con Alexander Torrenegra y Tania Zapata. Bogotá, 19 de noviembre de 2026.
            </p>
            <EventOrganizer />
          </div>
          <nav className="lp-footer-nav" aria-label="Pie de página">
            <div>
              <h2>Evento</h2>
              <a href={`${home}#anfitriones`}>Anfitriones</a>
              <a href={`${home}#agenda`}>La tarde</a>
              <a href={`${home}#mesa`}>La mesa</a>
              <a href={`${home}#entradas`}>Lugares y precios</a>
              <a href={`${home}#comunidad`}>Comunidad</a>
              <a href="/partners">Aliados y sponsors</a>
              <a href={`${home}#faq`}>Preguntas</a>
              <a href={`${home}#lista`}>Solicitar lugar</a>
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
  );
}
