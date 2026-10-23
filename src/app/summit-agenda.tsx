import Image from "next/image";
import { ArrowRight, Lock } from "lucide-react";
import { colombiaSummit } from "@/lib/colombia-summit";
import { dinnerSeats } from "@/lib/summit-pricing";
import { speakers, type SummitSpeaker } from "./speakers";
import "./summit-agenda.css";

function agendaSpeaker(name: string) {
  const speaker = speakers.find((person) => person.name === name);
  if (!speaker) throw new Error(`Missing agenda speaker: ${name}`);
  return speaker;
}

// The event, one line per session: the idea and what you leave with.
const sessions = [
  {
    format: "Charla",
    speakers: [agendaSpeaker("Alexander Torrenegra")],
    title: "Cómo predecir el futuro",
    description:
      "Si hoy empezaras tu empresa desde cero, con todo lo que ya sabes, ¿la construirías igual?",
  },
  {
    format: "Fireside chat",
    speakers: [agendaSpeaker("Tania Zapata")],
    title: "Reinventar tu compañía cuando es disrumpida",
    description:
      "Cuándo defender tu negocio y cuándo canibalizarlo, contado desde adentro.",
  },
  {
    format: "Workshop",
    speakers: [agendaSpeaker("Alan Argüello")],
    title: "Cómo volverte un 10X Operator",
    description:
      "Cómo una persona opera con agentes de IA lo que antes hacía un equipo. Sales con un plan para el lunes.",
  },
];
const hosts = [agendaSpeaker("Alexander Torrenegra"), agendaSpeaker("Tania Zapata")];

function Portraits({ people, number }: { people: SummitSpeaker[]; number?: number }) {
  return (
    <div className="agenda-portraits" data-pair={people.length > 1 || undefined}>
      {people.map((speaker) => (
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
      {number && (
        <span className="agenda-number" aria-hidden="true">
          {String(number).padStart(2, "0")}
        </span>
      )}
    </div>
  );
}

// The day in two parts: the event in the morning, the private dinner at night.
export function SummitAgenda() {
  return (
    <section className="ds-section agenda" id="agenda" aria-labelledby="agenda-title">
      <div className="ds-container">
        <div className="agenda-program">
          <header className="agenda-header">
            <div className="agenda-heading">
              <p>El día</p>
              <h2 id="agenda-title">Del evento<br />a la cena.</h2>
            </div>
            <div className="agenda-day">
              <p><time dateTime={colombiaSummit.date}>Jueves 19 de noviembre de 2026</time></p>
              <dl className="agenda-ranges">
                <div>
                  <dt>Evento</dt>
                  <dd aria-label="De 10 de la mañana a 3 de la tarde">
                    <time dateTime={colombiaSummit.startDate}>10:00<small>a. m.</small></time>
                    <ArrowRight aria-hidden="true" />
                    <time dateTime={colombiaSummit.endDate}>3:00<small>p. m.</small></time>
                  </dd>
                </div>
                <div>
                  <dt>Cena</dt>
                  <dd aria-label="De 7 a 10 de la noche">
                    <time dateTime={colombiaSummit.dinnerStartDate}>7:00<small>p. m.</small></time>
                    <ArrowRight aria-hidden="true" />
                    <time dateTime={colombiaSummit.dinnerEndDate}>10:00<small>p. m.</small></time>
                  </dd>
                </div>
              </dl>
              <p>Hora de Bogotá · Presencial</p>
            </div>
          </header>

          <div className="agenda-part">
            <div className="agenda-part-head">
              <span className="agenda-part-num">01</span>
              <h3>El evento</h3>
              <span className="agenda-part-time">10:00 a. m. – 3:00 p. m.</span>
            </div>
            <ol className="agenda-sessions" role="list" aria-label="Sesiones del evento">
              {sessions.map((session, index) => (
                <li className="agenda-session" key={session.title}>
                  <Portraits people={session.speakers} number={index + 1} />
                  <div className="agenda-topic">
                    <span className="agenda-format">
                      {session.format} · {session.speakers.map((speaker) => speaker.name).join(" y ")}
                    </span>
                    <h4>{session.title}</h4>
                    <p>{session.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="agenda-part" data-part="dinner">
            <div className="agenda-part-head">
              <span className="agenda-part-num">02</span>
              <h3>La cena privada</h3>
              <span className="agenda-part-time">7:00 – 10:00 p. m.</span>
            </div>
            <div className="agenda-sessions">
              <div className="agenda-session">
                <Portraits people={hosts} />
                <div className="agenda-topic">
                  <span className="agenda-format">
                    Solo VIP · {dinnerSeats} lugares · Por aplicación
                  </span>
                  <h4>Cena con Alexander y Tania</h4>
                  <p>Una mesa pequeña para seguir la conversación del día.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="agenda-coming">
            <span className="agenda-number" aria-hidden="true"><Lock /></span>
            <div>
              <h3>Lugar y horarios, próximamente.</h3>
              <p>La dirección de la cena llega con tu confirmación.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
