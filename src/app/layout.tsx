import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { colombiaSummit } from "@/lib/colombia-summit";
import { siteUrl } from "@/lib/site-url";

import "./globals.css";
import "./design-system.css";
import "./summit.css";

// Display: Newsreader (OFL, self-hosted). Text: Geist. Figures: Geist Mono.
const newsreader = localFont({
  src: "./fonts/newsreader-latin-400-normal.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-newsreader",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: colombiaSummit.name,
  authors: [{ name: colombiaSummit.organizer, url: siteUrl }],
  creator: colombiaSummit.organizer,
  publisher: colombiaSummit.organizer,
  category: "technology",
  // iOS Safari turns dates, times and numbers into links by rewriting the
  // DOM before React hydrates, which breaks hydration and misplaces nodes
  // (the agenda's "10:00 a. m. → 3:00 p. m." ended up mid-list). Next's
  // formatDetection has no `date` key, so the meta tag is written in full.
  other: { "format-detection": "telephone=no, date=no, address=no, email=no" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f5f2",
  colorScheme: "light",
};

// Who publishes the site, for search engines. The Event itself is described
// on the home page.
const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: colombiaSummit.organizer,
      url: siteUrl,
      logo: `${siteUrl}/icon.png`,
      email: colombiaSummit.contactEmail,
      sameAs: [colombiaSummit.channel],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: colombiaSummit.name,
      url: siteUrl,
      inLanguage: "es",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};

export default function SummitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Font variables live on <html> so :root tokens can resolve them.
  return (
    <html
      lang="es"
      className={`${GeistSans.variable} ${GeistMono.variable} ${newsreader.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
