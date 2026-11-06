// What the page says about AIYaiYai. To update a follower count, change it here.

export type Channel = {
  id: "instagram" | "linkedin" | "substack" | "youtube";
  name: string;
  href: string;
  count: number;
  unit: "seguidores" | "suscriptores";
  views: number;
  viewsUnit: "vistas" | "impresiones";
};

export type Person = {
  name: string;
  role: string;
  image: string;
  linkedin: string;
};

export const site = {
  name: "AIYaiYai",
  fullName: "AIYaiYai Media",
  title: "AIYaiYai Media: tecnología, emprendimiento e IA",
  tagline: "Tecnología, emprendimiento e inteligencia artificial",
  description:
    "AIYaiYai es una media company. Compartimos conocimiento sobre tecnología, emprendimiento e inteligencia artificial en video, newsletter y redes sociales.",
  contactEmail: "support@torrenegra.ai",
  youtube: "https://www.youtube.com/@aiyaiyaimedia",
  substack: "https://aiyaiyaimedia.substack.com",
};

// Largest first. `views` are the organic views of the last 90 days, copied from
// each platform's analytics on `viewsMeasured`.
export const viewsMeasured = "5 de noviembre de 2026";

export const channels: Channel[] = [
  {
    id: "instagram",
    name: "Instagram",
    href: "https://www.instagram.com/torrenegraconsulting/",
    count: 32_865,
    unit: "seguidores",
    views: 1_070_847,
    viewsUnit: "vistas",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    href: "https://www.linkedin.com/school/torrenegraorg/posts/",
    count: 22_597,
    unit: "seguidores",
    views: 379_850,
    viewsUnit: "impresiones",
  },
  {
    id: "youtube",
    name: "YouTube",
    href: site.youtube,
    count: 1_523,
    unit: "suscriptores",
    views: 105_905,
    viewsUnit: "vistas",
  },
  {
    id: "substack",
    name: "Substack",
    href: "https://substack.com/@aiyaiyaimedia",
    count: 5_125,
    unit: "suscriptores",
    views: 34_600,
    viewsUnit: "vistas",
  },
];

export const people: Person[] = [
  {
    name: "Alex Torrenegra",
    role: "Emprendedor e inversor",
    image: "/images/people/alex-torrenegra.webp",
    linkedin: "https://www.linkedin.com/in/alextorrenegra/",
  },
  {
    name: "Alan Arguello",
    role: "Emprendedor e ingeniero de software",
    image: "/images/people/alan-arguello.webp",
    linkedin: "https://www.linkedin.com/in/alan-arguello/",
  },
];

const longDate = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "long",
  timeZone: "America/Bogota",
});

/** "6 de noviembre de 2026" */
export const formatDate = (iso: string) => longDate.format(new Date(iso));

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** 22597 → "22.6K" */
export const formatCount = (count: number) => compact.format(count);

/** Cuts instead of rounding, like YouTube does: 6554 → "6.5K". */
export const formatViews = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
  roundingMode: "trunc",
}).format;

/** Four digits at most, never rounded up: 1070847 → "1.07M", 379850 → "379.8K". */
export const formatReach = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumSignificantDigits: 4,
  roundingMode: "trunc",
}).format;

/** Total reach in millions, one decimal, rounded down: 1605352 → 1.6. */
export const millionsOfViews = (list: Channel[] = channels) =>
  Math.floor(list.reduce((sum, channel) => sum + channel.views, 0) / 100_000) / 10;

/** The audience in round thousands, rounded down: 62017 → 62. */
export const thousandsOfFollowers = (list: Channel[] = channels) =>
  Math.floor(list.reduce((sum, channel) => sum + channel.count, 0) / 1000);
