"use client";

import { useState, useSyncExternalStore } from "react";
import { ArrowRight, Check } from "lucide-react";
import {
  formatTicketPrice,
  getCurrentPricingPhase,
  pricingPhases,
  summitTickets,
} from "@/lib/summit-pricing";

// What every seat includes; anything beyond it is shown in bold.
const base = new Set<string>(summitTickets[0].benefits);
import { useTicketSelection } from "./ticket-selection";
import "./ticket-pricing.css";

function subscribeToPhaseChange(onChange: () => void) {
  const interval = window.setInterval(onChange, 30_000);
  window.addEventListener("focus", onChange);
  return () => {
    window.clearInterval(interval);
    window.removeEventListener("focus", onChange);
  };
}

const currentPhaseSnapshot = () => getCurrentPricingPhase(new Date());
// The static HTML shows the full schedule without claiming a phase is current.
const serverPhaseSnapshot = () => null;

export function TicketPricing() {
  const { selectTicket } = useTicketSelection();
  const currentPhase = useSyncExternalStore(
    subscribeToPhaseChange,
    currentPhaseSnapshot,
    serverPhaseSnapshot,
  );
  const [chosenPhase, setChosenPhase] = useState<number | null>(null);
  const closed = currentPhase === -1;
  const selectedPhase = chosenPhase ?? (closed ? 2 : currentPhase ?? 0);
  const phase = pricingPhases[selectedPhase];
  const isPast = currentPhase !== null && (closed || selectedPhase < currentPhase);
  const phaseStatus = currentPhase === null
    ? "Consulta los precios de cada fase"
    : closed
      ? "Las fases de inscripción han finalizado"
      : isPast
        ? "Fase finalizada · Precio de referencia"
        : selectedPhase === currentPhase
          ? `Fase vigente · Hasta el ${phase.deadline}`
          : `Próxima fase · Hasta el ${phase.deadline}`;

  return (
    <section className="ds-section lp-pricing" id="entradas" aria-labelledby="pricing-title">
      <div className="ds-container">
        <header className="lp-pricing-heading">
          <h2 id="pricing-title" className="ds-display-l">
            Dos formas de sentarte <span className="ds-accent">a la mesa.</span>
          </h2>
          <p>Diez lugares en cada una, por aplicación.</p>
        </header>

        <div className="lp-phases" role="group" aria-label="Comparar precios por fase">
          {pricingPhases.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className="lp-phase"
              aria-pressed={index === selectedPhase}
              aria-controls="ticket-options"
              onClick={() => setChosenPhase(index)}
            >
              <span className="lp-phase-name">{item.name}</span>
              <span className="lp-phase-date">Hasta el <time dateTime={item.date}>{item.shortDeadline}</time></span>
              <span className="lp-phase-status">
                {currentPhase === null ? "2026" : index === currentPhase ? "Vigente" : closed || index < currentPhase ? "Finalizada" : "Próximamente"}
              </span>
            </button>
          ))}
        </div>

        <p className="lp-phase-caption" role="status" aria-atomic="true">{phaseStatus}</p>

        <div className="lp-ticket-grid" id="ticket-options">
          {summitTickets.map((ticket) => {
            return (
              <article key={ticket.id} className="lp-ticket" data-tier={ticket.id} aria-labelledby={`ticket-${ticket.id}`}>
                <div className="lp-ticket-head">
                  <h3 id={`ticket-${ticket.id}`}>{ticket.name}</h3>
                  <p className="lp-ticket-description">{ticket.description}</p>
                  <p className="lp-ticket-admission">
                    <strong>{ticket.capacity} lugares</strong> · Por aplicación
                  </p>
                </div>

                <div className="lp-ticket-price-block" aria-live="polite" aria-atomic="true">
                  <p className="lp-ticket-price">
                    <span>{formatTicketPrice(ticket.prices[selectedPhase])}</span>
                    <span className="lp-ticket-currency">USD</span>
                  </p>
                  <p className="lp-ticket-deadline">{phase.name} · Hasta el {phase.deadline}</p>
                </div>

                <ul className="lp-ticket-benefits" aria-label={`Incluye ${ticket.name}`}>
                  {ticket.benefits.map((benefit) => (
                    <li key={benefit} data-extra={!base.has(benefit) || undefined}>
                      <Check aria-hidden="true" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>


                <div className="lp-ticket-bottom">
                  <dl className="lp-ticket-schedule" aria-label={`Todas las fases de ${ticket.name}, precios en USD`}>
                    {pricingPhases.map((item, index) => (
                      <div key={item.id} data-selected={index === selectedPhase || undefined}>
                        <dt>Hasta el <time dateTime={item.date}>{item.shortDeadline}</time></dt>
                        <dd>{formatTicketPrice(ticket.prices[index])}</dd>
                      </div>
                    ))}
                  </dl>
                  {!closed && (
                    <a
                      href="#lista"
                      className="ds-button lp-ticket-cta"
                      data-variant={ticket.id === "vip" ? "secondary" : "primary"}
                      data-size="md"
                      onClick={() => selectTicket(ticket.id)}
                      aria-label={`Solicitar un lugar ${ticket.name} y completar el formulario`}
                    >
                      {`Solicitar lugar ${ticket.name}`}
                      <ArrowRight aria-hidden="true" />
                    </a>
                  )}
                  <p className="lp-ticket-cta-note">
                    {closed ? "Fases finalizadas" : "Por aplicación"}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="lp-pricing-footnote">
          <p>Precios por persona en USD. La solicitud no confirma un lugar ni garantiza el precio de una fase.</p>
        </div>
      </div>
    </section>
  );
}
