import type { Metadata } from "next";
import { people, site } from "./site";

export const ogLocale = "es_LA";

const image = {
  url: "/images/og.jpg",
  width: 1200,
  height: 630,
  alt: `${site.title}. Con ${people.map((person) => person.name).join(" y ")}.`,
};

/** A page without its own share image. Leave `title` out for the site's title. */
export function pageMetadata({
  title,
  description = site.description,
  path,
}: {
  title?: string;
  description?: string;
  path: string;
}): Metadata {
  const shared = title ?? site.title;
  return {
    title: title ?? { absolute: site.title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: ogLocale,
      siteName: site.fullName,
      url: path,
      title: shared,
      description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title: shared, description, images: [image] },
  };
}
