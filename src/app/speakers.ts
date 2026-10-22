export type SpeakerCredential = {
  name: string;
  image: string;
  detail: string;
  source: string;
};
export type SummitSpeaker = {
  name: string;
  role: string;
  /** A short record: who they are and why their feedback is worth having. */
  bio: string;
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

// The lunch's hosts.
export const speakers: SummitSpeaker[] = [
  {
    name: "Alexander Torrenegra",
    role: "Cofundador y CEO de Torre.ai · Shark en Shark Tank Colombia y México",
    bio: "Cofundador de Voice123, Bunny Studio y Torre.ai. Innovador menor de 35 del MIT Technology Review.",
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
    bio: "Cofundó Voice123 y construyó Bunny Studio. Ha invertido o asesorado a más de 25 startups.",
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
