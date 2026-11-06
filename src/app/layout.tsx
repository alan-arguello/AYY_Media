import type { Metadata, Viewport } from "next";
import { Inter, Spectral } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { isPublicSite, siteUrl } from "@/lib/site-url";
import { channels, people, site } from "@/lib/site";
import { JsonLd } from "./json-ld";
import "./globals.css";

const spectral = Spectral({
  subsets: ["latin"],
  weight: "300",
  variable: "--font-spectral",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  robots: {
    index: isPublicSite,
    follow: isPublicSite,
    googleBot: {
      index: isPublicSite,
      follow: isPublicSite,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // iOS Safari rewrites dates and numbers into links before React hydrates,
  // which breaks hydration. Next's formatDetection has no `date` key.
  other: { "format-detection": "telephone=no, date=no, address=no, email=no" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  colorScheme: "light",
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: site.fullName,
      alternateName: site.name,
      url: `${siteUrl}/`,
      logo: `${siteUrl}/images/logo.png`,
      description: site.description,
      email: site.contactEmail,
      sameAs: channels.map((channel) => channel.href),
      member: people.map((person) => ({
        "@type": "Person",
        name: person.name,
        jobTitle: person.role,
        image: `${siteUrl}${person.image}`,
        sameAs: person.linkedin,
      })),
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: site.fullName,
      alternateName: site.name,
      url: `${siteUrl}/`,
      inLanguage: "es",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${spectral.variable} ${inter.variable}`}>
      <body>
        <JsonLd data={schema} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
