import { ArrowRight, Plus } from "lucide-react";
import { colombiaSummit } from "@/lib/colombia-summit";
import "./summit-agenda.css";

const sessions = [
  {
    format: "Charla",
    speaker: "Alexander Torrenegra",
    title: "Cómo predecir el futuro",
  },
  {
    format: "Fireside chat",
    speaker: "Tania Zapata",
    title: "Reinventar tu compañía cuando es disrumpida",
  },
  {
    format: "Workshop",
    speaker: "Alan Argüello",
    title: "Cómo volverte un 10X Operator",
    description: "Así uso Claude y Codex para operar yo solo.",
  },
  {
    format: "Charla",
    speaker: "Juan Pablo Rodríguez y Catalina Morales",
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
                <span className="agenda-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="agenda-speaker">
                  <span className="agenda-format">{session.format}</span>
                  <p>{session.speaker}</p>
                </div>
                <div className="agenda-topic">
                  <h3>{session.title}</h3>
                  {session.description && <p>{session.description}</p>}
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
