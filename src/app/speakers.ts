export type SpeakerCredential = {
  name: string;
  image: string;
  detail: string;
  source: string;
};
export type SummitSpeaker = {
  name: string;
  role: string;
  image: string;
  linkedin: string;
  credentials: SpeakerCredential[];
};

const hosts = "/images/colombia-summit/credential-";
const torre = (detail: string, source: string): SpeakerCredential => ({
  name: "Torre.ai",
  image: `${hosts}torre-ai.png`,
  detail,
  source,
});

export const mainSpeakers: SummitSpeaker[] = [
  {
    name: "Alexander Torrenegra",
    role: "Cofundador de Torre.ai, Voice123 y Bunny Studio",
    image: "/images/speakers/alexander-torrenegra.webp",
    linkedin: "https://www.linkedin.com/in/alextorrenegra/",
    credentials: [
      torre("Cofundador de Torre.ai", "https://invest.torre.ai/"),
      {
        name: "Shark Tank",
        image: `${hosts}shark-tank.png`,
        detail: "Shark Tank Colombia y México",
        source: "https://invest.torre.ai/",
      },
      {
        name: "Endeavor",
        image: `${hosts}endeavor.png`,
        detail: "Endeavor Entrepreneur",
        source: "https://invest.torre.ai/",
      },
    ],
  },
  {
    name: "Tania Zapata",
    role: "Cofundadora de Voice123 · Chairwoman de Bunny Inc.",
    image: "/images/speakers/tania-zapata.webp",
    linkedin: "https://www.linkedin.com/in/taniazapata/",
    credentials: [
      {
        name: "Bunny Inc.",
        image: `${hosts}bunnyinc.png`,
        detail: "Cofundadora y Chairwoman",
        source: "https://taniazapata.com/",
      },
      {
        name: "Stanford",
        image: `${hosts}stanford.png`,
        detail: "Stanford–Endeavor Leadership Program",
        source: "https://torre.ai/taniazapata",
      },
      {
        name: "Endeavor",
        image: `${hosts}endeavor.png`,
        detail: "Endeavor Entrepreneur",
        source:
          "https://endeavor.org/entrepreneur-companies/?_search=bunny-studio",
      },
    ],
  },
];

export const guestSpeakers: SummitSpeaker[] = [
  {
    name: "Alan Argüello",
    role: "Ingeniero de software y emprendedor · Torrenegra & Co",
    image: "/images/speakers/alan-arguello-sf.webp",
    linkedin: "https://www.linkedin.com/in/alan-arguello/",
    credentials: [
      {
        name: "Georgia Tech",
        image: `${hosts}georgia.png`,
        detail: "Formación en Computer Science",
        source: "https://www.linkedin.com/in/alan-arguello/",
      },
      {
        name: "Platanus Ventures",
        image: `${hosts}platanus.png`,
        detail: "Emprendimiento respaldado por Platanus Ventures",
        source: "https://www.linkedin.com/in/alan-arguello/",
      },
    ],
  },
  {
    name: "Catalina Morales",
    role: "Head of Operations · Torre.ai",
    image: "/images/colombia-summit/catalina-morales.webp",
    linkedin: "https://www.linkedin.com/in/soycatamorales/",
    credentials: [
      torre("Head of Operations", "https://invest.torre.ai/"),
      {
        name: "Stanford",
        image: `${hosts}stanford.png`,
        detail: "Stanford–Endeavor Innovation & Growth Program",
        source:
          "https://www.linkedin.com/posts/soycatamorales_officially-a-graduate-of-the-stanford-endeavor-activity-7365084213819203584-7BhD",
      },
    ],
  },
  {
    name: "Juan Pablo Rodríguez",
    role: "Head of Marketing · Torre.ai",
    image: "/images/colombia-summit/juan-pablo-rodriguez.webp",
    linkedin: "https://www.linkedin.com/in/jprodmo/",
    credentials: [
      torre("Head of Marketing", "https://torre.ai/jprodmo"),
      {
        name: "DiDi",
        image: "/images/colombia-summit/didi.svg",
        detail: "Experiencia previa en Driver Operations",
        source: "https://torre.ai/jprodmo",
      },
    ],
  },
];
