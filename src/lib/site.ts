// What the page says about AIYaiYai. To update a follower count, change it here.

export type Channel = {
  id: "instagram" | "linkedin" | "substack" | "youtube";
  name: string;
  href: string;
  count: number;
  unit: "seguidores" | "suscriptores";
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

// Largest first.
export const channels: Channel[] = [
  {
    id: "instagram",
    name: "Instagram",
    href: "https://www.instagram.com/torrenegraconsulting/",
    count: 32_800,
    unit: "seguidores",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    href: "https://www.linkedin.com/school/torrenegraorg/posts/",
    count: 22_597,
    unit: "seguidores",
  },
  {
    id: "substack",
    name: "Substack",
    href: "https://substack.com/@aiyaiyaimedia",
    count: 5_100,
    unit: "suscriptores",
  },
  {
    id: "youtube",
    name: "YouTube",
    href: site.youtube,
    count: 1_520,
    unit: "suscriptores",
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

/** The audience in round thousands, rounded down: 62017 → 62. */
export const thousandsOfFollowers = (list: Channel[] = channels) =>
  Math.floor(list.reduce((sum, channel) => sum + channel.count, 0) / 1000);
