import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { colombiaSummit } from "@/lib/colombia-summit";
import { siteUrl, isPublicSite } from "@/lib/site-url";
import { Button } from "@/components/ui";
import { Partners } from "../partners";
import { SiteFooter, SiteNav } from "../site-chrome";

export const runtime = "nodejs";

const OG_IMAGE = "/images/colombia-summit/opengraph.png";
const description =
  "Propuesta para aliados y sponsors del evento y la cena privada con Alexander Torrenegra y Tania Zapata: un lugar en la cena, tu marca en todo lo que hacemos y +640K seguidores. Bogotá, 19 de noviembre de 2026.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  robots: { index: isPublicSite, follow: isPublicSite },
  title: "Aliados y sponsors | bogota.forward()",
  description,
  alternates: { canonical: "/partners" },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "/partners",
    siteName: colombiaSummit.name,
    title: "Aliados y sponsors · bogota.forward()",
    description,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Evento y cena privada para founders, managers y C-levels con Alexander Torrenegra y Tania Zapata. Bogotá, 19 de noviembre de 2026.",
      },
    ],
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE] },
};

export default function PartnersPage() {
  return (
    <div className="lp" id="top">
      <div className="ds-rails" aria-hidden="true" />
      <a className="lp-skip" href="#contenido">
        Ir al contenido
      </a>
      <SiteNav home="/" current="partners" />
      <main id="contenido">
        <Partners standalone />
      </main>
      <SiteFooter home="/" />
      <Button
        href="#aliados-form"
        className="lp-mobile-cta"
        icon={<ArrowRight aria-hidden="true" />}
      >
        Quiero ser aliado
      </Button>
    </div>
  );
}
