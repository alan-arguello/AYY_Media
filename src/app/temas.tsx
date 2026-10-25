import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui";
import { TemasRail } from "./temas-rail";

// Essays from the Super Intelligence Society blog: some of the subjects we
// write about (not the event's agenda). Each card opens the article on SIS.
const SIS_BLOG = "https://society.aiyaiyai.io/blog";

export const temas = [
  {
    slug: "agentes-always-on",
    tag: "Agentes",
    date: "Octubre 2026",
    title: "Agentes always-on: qué son y cómo empezar",
    dek: "La nueva categoría de agentes que trabajan en segundo plano, y por qué el contexto de tu empresa es lo que más importa.",
  },
  {
    slug: "modelos-mas-alla-de-nosotros",
    tag: "Investigación",
    date: "Mayo 2026",
    title: "Los modelos generativos de IA tienen un enemigo: los humanos",
    dek: "Los LLMs aprendieron de nosotros. El reto ahora es que aprendan más allá de nosotros.",
  },
  {
    slug: "un-llm-no-es-todo-tu-sistema",
    tag: "Arquitectura",
    date: "Mayo 2026",
    title: "Por qué un LLM no debería ser todo tu sistema de IA",
    dek: "En radiología, y en muchas industrias, el problema no es generar texto sino generar confianza verificable.",
  },
  {
    slug: "lo-que-viene-despues-de-los-llm",
    tag: "Physical AI",
    date: "Abril 2026",
    title: "Pocos están prestando atención a lo que viene después de ChatGPT y los LLM",
    dek: "Los modelos fundacionales están a punto de hacer con la robótica lo mismo que ChatGPT hizo con el lenguaje.",
  },
] as const;

export function Temas() {
  return (
    <section className="ds-section lp-temas" id="temas" aria-labelledby="temas-title">
      <div className="ds-container">
        <SectionHeading
          id="temas-title"
          tag="Temas"
          title={
            <>
              Algunas de <span className="ds-accent">nuestras temáticas.</span>
            </>
          }
        >
          Lo que escribimos en Super Intelligence Society, la comunidad de
          AiYaiYai: agentes, modelos, arquitectura y la IA que llega al mundo
          físico.
        </SectionHeading>
      </div>
      <TemasRail count={temas.length}>
        {temas.map((tema, index) => (
          <li key={tema.slug} className="lp-tema">
            <a
              href={`${SIS_BLOG}/${tema.slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${tema.title}. Leer en Super Intelligence Society (nueva pestaña)`}
            >
              <div className="lp-tema-cover">
                <Image
                  src={`/images/temas/${tema.slug}.webp`}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 84vw, 420px"
                  quality={90}
                />
              </div>
              <p className="lp-tema-meta">
                <span>{String(index + 1).padStart(2, "0")}</span>
                {tema.tag} · {tema.date}
              </p>
              <h3>{tema.title}</h3>
              <p className="lp-tema-dek">{tema.dek}</p>
              <span className="lp-tema-link">
                Leer el artículo
                <ArrowUpRight aria-hidden="true" />
              </span>
            </a>
          </li>
        ))}
      </TemasRail>
    </section>
  );
}
