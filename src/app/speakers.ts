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
    bio: "Cofundador de Voice123 (adquirida en 2021 por Backstage), Bunny Studio y Torre.ai, donde la IA entrevista y conecta talento con empresas. Innovador menor de 35 del MIT Technology Review y autor de Remoter. Está acostumbrado a decidir en minutos qué le falta a un negocio para escalar.",
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
    bio: "Cofundó Voice123 en 2003 y lo hizo autosostenible en seis meses; en 2021 fue adquirido por Backstage. Construyó Bunny Studio, hoy con más de 50.000 clientes, y lo dirigió como CEO hasta 2025. Ha invertido o asesorado a más de 25 startups, y da feedback con la franqueza de quien también ha fallado.",
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
