import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { colombiaSummit } from "@/lib/colombia-summit";
import { siteUrl, isPublicSite } from "@/lib/site-url";
import { Button } from "@/components/ui";
import { Partners } from "../partners";
import { SiteFooter, SiteNav } from "../site-chrome";

export const runtime = "nodejs";

const OG_IMAGE = "/images/colombia-summit/opengraph.png";
const OG_ALT =
  "bogota.forward(): evento de IA y cena privada para founders, managers y C-levels. Bogotá, 19 de noviembre de 2026.";
const title = "Aliados y sponsors del evento de IA en Bogotá | bogota.forward()";
const description =
  "Propuesta para aliados y sponsors de bogota.forward(), el evento de IA y cena privada con Alexander Torrenegra y Tania Zapata: un lugar en la cena, tu marca en todo lo que hacemos y +640K seguidores.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  robots: { index: isPublicSite, follow: isPublicSite },
  title,
  description,
  alternates: { canonical: "/partners" },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "/partners",
    siteName: colombiaSummit.name,
    title: "Aliados y sponsors · bogota.forward()",
    description,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aliados y sponsors · bogota.forward()",
    description,
    images: [{ url: OG_IMAGE, alt: OG_ALT }],
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: colombiaSummit.name, item: `${siteUrl}/` },
    { "@type": "ListItem", position: 2, name: "Aliados y sponsors", item: `${siteUrl}/partners` },
  ],
};

export default function PartnersPage() {
  return (
    <div className="lp" id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
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
