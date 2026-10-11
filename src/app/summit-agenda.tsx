import Image from "next/image";
import { ArrowRight, Plus } from "lucide-react";
import { colombiaSummit } from "@/lib/colombia-summit";
import { speakers } from "./speakers";
import "./summit-agenda.css";

function agendaSpeaker(name: string) {
  const speaker = speakers.find((person) => person.name === name);
  if (!speaker) throw new Error(`Missing agenda speaker: ${name}`);
  return speaker;
}

const sessions = [
  {
    format: "Charla",
    speakers: [agendaSpeaker("Alexander Torrenegra")],
    title: "Cómo predecir el futuro",
  },
  {
    format: "Fireside chat",
    speakers: [agendaSpeaker("Tania Zapata")],
    title: "Reinventar tu compañía cuando es disrumpida",
  },
  {
    format: "Workshop",
    speakers: [agendaSpeaker("Alan Argüello")],
    title: "Cómo volverte un 10X Operator",
    description: "Así uso Claude y Codex para operar yo solo.",
  },
  {
    format: "Charla",
    speakers: [agendaSpeaker("Juan Pablo Rodríguez"), agendaSpeaker("Catalina Morales")],
    title: "Lecciones de Growth en Torre.ai para la era de IA",
  },
];

export function SummitAgenda() {
  return (
    <section className="ds-section agenda" id="agenda" aria-labelledby="agenda-title">
      <div className="ds-container">
        <div className="agenda-program">
          <header className="agenda-header">
            <div className="agenda-heading">
              <p>La agenda</p>
              <h2 id="agenda-title">Del futuro<br />a la acción.</h2>
            </div>
            <div className="agenda-day">
              <p><time dateTime={colombiaSummit.date}>19 de noviembre de 2026</time></p>
              <div className="agenda-hours" role="group" aria-label="De 10 de la mañana a 4 de la tarde">
                <time dateTime={colombiaSummit.startDate}>10:00<span>a. m.</span></time>
                <ArrowRight aria-hidden="true" />
                <time dateTime={colombiaSummit.endDate}>4:00<span>p. m.</span></time>
              </div>
              <p>Hora de Bogotá · Presencial</p>
            </div>
          </header>

          <ol className="agenda-sessions" role="list" aria-label="Sesiones del summit">
            {sessions.map((session, index) => (
              <li className="agenda-session" key={session.title}>
                <div className="agenda-portraits" data-pair={session.speakers.length > 1 || undefined}>
                  {session.speakers.map((speaker) => (
                    <div className="agenda-portrait" data-speaker={speaker.name} key={speaker.name}>
                      <Image
                        src={speaker.image}
                        alt={speaker.name}
                        fill
                        sizes="(max-width: 600px) 80px, 112px"
                        quality={90}
                      />
                    </div>
                  ))}
                  <span className="agenda-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="agenda-topic">
                  <span className="agenda-format">{session.format}</span>
                  <h3>{session.title}</h3>
                  {session.description && <p>{session.description}</p>}
                  <div className="agenda-speaker">
                    {session.speakers.map((speaker, speakerIndex) => (
                      <span key={speaker.name}>
                        {speakerIndex > 0 && <span className="agenda-speaker-join"> y </span>}
                        {speaker.name}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="agenda-coming">
            <span className="agenda-number" aria-hidden="true"><Plus /></span>
            <div>
              <h3>Más por anunciar.</h3>
              <p>Nuevas sesiones y horarios de cada charla, próximamente.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
