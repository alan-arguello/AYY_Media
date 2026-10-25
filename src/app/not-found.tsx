import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { SiteFooter, SiteNav } from "./site-chrome";

export const metadata: Metadata = {
  title: "Página no encontrada | bogota.forward()",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="lp" id="top">
      <a className="lp-skip" href="#contenido">
        Ir al contenido
      </a>
      <SiteNav home="/" />
      <main id="contenido">
        <section className="lp-hero lp-not-found" aria-labelledby="not-found-title">
          <div className="ds-container">
            <div className="lp-hero-copy">
              <p className="lp-hero-eyebrow">Error 404</p>
              <h1 id="not-found-title" className="ds-display-l lp-hero-title">
                Esta página no existe.
              </h1>
              <p className="ds-lead">
                El enlace puede estar incompleto o la página cambió de lugar. El
                evento sigue en la página principal.
              </p>
              <div className="lp-actions">
                <Button href="/" icon={<ArrowRight aria-hidden="true" />}>
                  Ir al inicio
                </Button>
                <Button variant="secondary" href="/#entradas">
                  Ver entradas
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter home="/" />
    </div>
  );
}
