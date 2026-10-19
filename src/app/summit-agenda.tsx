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

// One short paragraph per session: the idea, why it matters to a founder or
// executive, and what they leave with.
const sessions = [
  {
    format: "Charla",
    speakers: [agendaSpeaker("Alexander Torrenegra")],
    title: "Cómo predecir el futuro",
    description:
      "Predecir el futuro no es adivinar: es hacerse la pregunta correcta. Para Alexander, esa pregunta es: si hoy empezaras tu empresa desde cero, con todo lo que ya sabes, ¿la construirías igual? Una charla para detectar qué partes de tu negocio responden a otra época y cómo replantearlas.",
  },
  {
    format: "Fireside chat",
    speakers: [agendaSpeaker("Tania Zapata")],
    title: "Reinventar tu compañía cuando es disrumpida",
    description:
      "Tania pasó más de veinte años construyendo un negocio de voces humanas. Después llegó la voz sintética. En esta conversación cuenta cómo se ve la disrupción desde adentro: cuándo defender el negocio, cuándo canibalizarlo y cómo mover a un equipo sin perderlo en el camino. Para quienes saben que su turno puede llegar.",
  },
  {
    format: "Workshop",
    speakers: [agendaSpeaker("Alan Argüello")],
    title: "Cómo volverte un 10X Operator",
    description:
      "Los agentes de IA ya no son solo para equipos de ingeniería. En este workshop Alan muestra, con su propio día a día, cómo una sola persona opera con Claude y Codex lo que antes hacía un equipo, y qué debería estar haciendo ya cada área de tu empresa. Sales con un plan para empezar el lunes.",
  },
  {
    format: "Charla",
    speakers: [agendaSpeaker("Juan Pablo Rodríguez"), agendaSpeaker("Catalina Morales")],
    title: "Lecciones de Growth en Torre.ai para la era de IA",
    description:
      "Torre lleva casi siete años creciendo a punta de experimentos: líneas de ingreso que escalaron, otras que apagaron a tiempo, y una “inteligencia artificial” que al principio eran personas detrás de la cortina. Juan Pablo, desde growth, y Catalina, desde operaciones, cuentan qué cambia ahora que los agentes hacen el trabajo, y qué lecciones siguen vigentes.",
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
                  <p>{session.description}</p>
                  <ul className="agenda-speakers" aria-label="Speakers de la sesión">
                    {session.speakers.map((speaker) => (
                      <li key={speaker.name}>
                        <span className="agenda-speaker">{speaker.name}</span>
                        <span className="agenda-role">{speaker.role}</span>
                      </li>
                    ))}
                  </ul>
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
