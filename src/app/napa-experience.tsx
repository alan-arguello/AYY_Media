import Image from "next/image";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import "./napa-experience.css";

export function NapaExperience() {
  return (
    <section
      className="ds-section napa"
      id="napa"
      aria-labelledby="napa-title"
    >
      <div className="ds-container">
        <div className="napa-panel">
          <div className="napa-intro">
            <div className="napa-heading">
              <h2 id="napa-title">De Napa a Bogotá.</h2>
              <p>La conversación continúa.</p>
              <ArrowDownRight className="napa-direction" aria-hidden="true" />
            </div>

            <div className="napa-story">
              <p>
                En <strong>Becoming AI Native</strong> nos reunimos en Napa
                Valley, California, para conversar sobre inteligencia artificial
                y lo que viene. Ese espíritu de encuentro llega ahora a Bogotá.
              </p>
              <div className="napa-event">
                <Image
                  src="/images/napa/becoming-ai-native.webp"
                  alt="Pantalla de bienvenida de Becoming AI Native con un paisaje de viñedos"
                  width={420}
                  height={433}
                  sizes="88px"
                />
                <div>
                  <span>Becoming AI Native</span>
                  <span>Napa Valley, California</span>
                </div>
              </div>
            </div>
          </div>

          <figure className="napa-memories">
            <div className="napa-gallery">
              <div className="napa-photo napa-photo-community">
                <Image
                  src="/images/napa/napa-community.webp"
                  alt="Foto grupal de los participantes del encuentro Becoming AI Native en Napa"
                  width={1440}
                  height={1080}
                  sizes="(max-width: 640px) calc(100vw - 64px), (max-width: 1000px) 56vw, 532px"
                  quality={86}
                />
              </div>
              <div className="napa-photo napa-photo-gathering">
                <Image
                  src="/images/napa/napa-gathering.webp"
                  alt="Participantes conversando en una terraza durante Becoming AI Native"
                  fill
                  sizes="(max-width: 640px) calc((100vw - 76px) / 2), (max-width: 1000px) 35vw, 328px"
                  quality={86}
                />
              </div>
              <div className="napa-photo napa-photo-conversations">
                <Image
                  src="/images/napa/napa-conversations.webp"
                  alt="Conversaciones en grupos pequeños durante el encuentro en Napa"
                  fill
                  sizes="(max-width: 640px) calc((100vw - 76px) / 2), (max-width: 1000px) 35vw, 328px"
                  quality={86}
                />
              </div>
            </div>
            <figcaption className="napa-caption">
              <span>Momentos de nuestro encuentro en Napa.</span>
              <span className="napa-next">
                Próxima parada <ArrowRight aria-hidden="true" /> Bogotá
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
