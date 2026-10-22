import Image from "next/image";
import { ArrowRight, Lock } from "lucide-react";
import { colombiaSummit } from "@/lib/colombia-summit";
import { speakers } from "./speakers";
import "./summit-agenda.css";

function agendaSpeaker(name: string) {
  const speaker = speakers.find((person) => person.name === name);
  if (!speaker) throw new Error(`Missing agenda speaker: ${name}`);
  return speaker;
}
const hosts = [agendaSpeaker("Alexander Torrenegra"), agendaSpeaker("Tania Zapata")];

// The afternoon, hour by hour. Each step says what happens and what the
// person in the room gets from it.
const schedule = [
  {
    time: "1:30",
    kind: "Llegada",
    title: "Bienvenida",
    description: "Te recibimos en el lugar del almuerzo. La dirección la compartimos solo con las personas aceptadas.",
  },
  {
    time: "2:00",
    until: "a 2:30 p. m.",
    kind: "Almuerzo",
    title: "Almuerzo y presentaciones",
    description: "Comemos juntos y cada participante se presenta ante el grupo: quién es, qué está construyendo y qué lo trae a la mesa.",
  },
  {
    time: "2:30",
    until: "a 3:00 p. m.",
    kind: "Charla privada",
    title: "A puerta cerrada con Alexander y Tania",
    description: "Una conversación sobre IA, empresas y lo que viene, sin escenario ni público. Las preguntas las pone el grupo.",
    hosts,
  },
  {
    time: "3:00",
    until: "a 5:30 p. m.",
    kind: "Feedback 1 a 1",
    title: "Tu turno con Alexander y Tania",
    description: "Llevas tu empresa, la decisión que tienes atascada o tu plan con IA, y te vas con feedback directo de quienes ya pasaron por ahí.",
    hosts,
  },
  {
    time: "5:30",
    until: "en adelante",
    kind: "Happy hour",
    title: "La conversación sigue",
    description: "Sin agenda. Para seguir hablando con el grupo y con los anfitriones.",
  },
];

export function SummitAgenda() {
  return (
    <section className="ds-section agenda" id="agenda" aria-labelledby="agenda-title">
      <div className="ds-container">
        <div className="agenda-program">
          <header className="agenda-header">
            <div className="agenda-heading">
              <p>La tarde</p>
              <h2 id="agenda-title">Del almuerzo<br />al happy hour.</h2>
            </div>
            <div className="agenda-day">
              <p><time dateTime={colombiaSummit.date}>Jueves 19 de noviembre de 2026</time></p>
              <div className="agenda-hours" role="group" aria-label="De 1:30 a 6 de la tarde">
                <time dateTime={colombiaSummit.startDate}>1:30<span>p. m.</span></time>
                <ArrowRight aria-hidden="true" />
                <time dateTime={colombiaSummit.endDate}>6:00<span>p. m.</span></time>
              </div>
              <p>Hora de Bogotá · Presencial</p>
            </div>
          </header>

          <ol className="agenda-sessions" role="list" aria-label="Programa de la tarde">
            {schedule.map((slot) => (
              <li className="agenda-slot" key={slot.time}>
                <div className="agenda-when">
                  <time>{slot.time}<span>p. m.</span></time>
                  {slot.until && <span className="agenda-until">{slot.until}</span>}
                </div>
                <div className="agenda-topic">
                  <span className="agenda-format">{slot.kind}</span>
                  <h3>{slot.title}</h3>
                  <p>{slot.description}</p>
                </div>
                {slot.hosts && (
                  <div className="agenda-portraits" data-pair aria-label="Con Alexander Torrenegra y Tania Zapata">
                    {slot.hosts.map((speaker) => (
                      <div className="agenda-portrait" data-speaker={speaker.name} key={speaker.name}>
                        <Image src={speaker.image} alt={speaker.name} fill sizes="88px" quality={90} />
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>

          <div className="agenda-coming">
            <span className="agenda-number" aria-hidden="true"><Lock /></span>
            <div>
              <h3>Ubicación privada.</h3>
              <p>La dirección llega con tu confirmación. Horarios aproximados.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
