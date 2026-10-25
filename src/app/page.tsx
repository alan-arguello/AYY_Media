import type { Metadata } from "next";
import { colombiaSummit } from "@/lib/colombia-summit";
import { siteUrl, isPublicSite } from "@/lib/site-url";
import { HomePage } from "./home";
import { OG_ALT, OG_IMAGE, seoDescription, seoTitle, shareDescription, shareTitle } from "./seo";

export const runtime = "nodejs";

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

export default function BogotaForwardSummitPage() {
  return <HomePage />;
}
