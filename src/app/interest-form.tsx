"use client";

import { useActionState, useEffect, useRef } from "react";
import { ArrowRight as ArrowRightIcon } from "lucide-react";
import { initialSummitFormState, colombiaSummit } from "@/lib/colombia-summit";
import { summitTickets } from "@/lib/summit-pricing";
import { submitSummitInterest } from "./actions";
import { useTicketSelection } from "./ticket-selection";
import "./ticket-selection.css";

export function SummitInterestForm() {
  const [state, action, pending] = useActionState(
    submitSummitInterest,
    initialSummitFormState,
  );
  const { selectedTicket, selectTicket } = useTicketSelection();
  const ticketType = selectedTicket ?? state.values?.ticketType ?? "";
  const selectedExperience = summitTickets.find((ticket) => ticket.id === ticketType);
  const message = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status !== "idle") message.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="lp-success" ref={message} tabIndex={-1} role="status">
        <span className="lp-success-mark" aria-hidden="true">
          ✓
        </span>
        <h3>{state.message}</h3>
        <p>
          {state.detail ?? "Si hay un lugar para ti, te escribimos por correo o WhatsApp."}
        </p>
        <a className="lp-text-link" href="#agenda">
          Mira la agenda de la tarde <ArrowRightIcon />
        </a>
      </div>
    );
  }

  return (
    <form
      action={action}
      // Returned validation errors still resolve the action, which schedules a
      // native reset. Keep the draft intact; success replaces the form above.
      onReset={(event) => event.preventDefault()}
      className="lp-form"
      aria-label="Solicitud de lugar para la comida privada de bogota.forward()"
      aria-busy={pending}
    >
      <fieldset disabled={pending}>
        <legend className="lp-sr-only">Tu lugar y tus datos</legend>
        <fieldset
          className="lp-ticket-selection"
          role="radiogroup"
          aria-invalid={!!state.errors?.ticketType}
          aria-describedby={state.errors?.ticketType ? "summit-ticket-help summit-ticket-error" : "summit-ticket-help"}
        >
          <legend>¿Qué lugar te interesa?</legend>
          <p id="summit-ticket-help" className="lp-ticket-selection-help">
            Los dos incluyen la tarde completa.
          </p>
          <div className="lp-ticket-radio-options">
            {summitTickets.map((ticket) => (
              <label
                className="lp-ticket-radio"
                key={ticket.id}
                data-selected={ticketType === ticket.id || undefined}
                data-invalid={!!state.errors?.ticketType || undefined}
              >
                <input
                  type="radio"
                  name="ticketType"
                  value={ticket.id}
                  checked={ticketType === ticket.id}
                  onChange={() => selectTicket(ticket.id)}
                  required
                  aria-describedby={state.errors?.ticketType ? "summit-ticket-error" : undefined}
                />
                <span className="lp-ticket-radio-copy">
                  <span className="lp-ticket-radio-name">{ticket.name}</span>
                  <span className="lp-ticket-radio-description">
                    {ticket.id === "vip"
                      ? "Comida, charla privada, feedback 1 a 1 y happy hour"
                      : "Todo General + 45 min a solas con Alexander"}
                  </span>
                  <span className="lp-ticket-radio-admission">
                    {ticket.capacity} lugares · Por aplicación
                  </span>
                </span>
              </label>
            ))}
          </div>
          {state.errors?.ticketType && (
            <span id="summit-ticket-error" className="lp-field-error">
              {state.errors.ticketType}
            </span>
          )}
        </fieldset>
        <div className="lp-field">
          <label htmlFor="summit-name">Nombre completo</label>
          <input
            id="summit-name"
            name="fullName"
            defaultValue={state.values?.fullName}
            autoComplete="name"
            placeholder="Tu nombre y apellido"
            minLength={2}
            maxLength={120}
            required
            aria-invalid={!!state.errors?.fullName}
            aria-describedby={
              state.errors?.fullName ? "summit-name-error" : undefined
            }
          />
          {state.errors?.fullName && (
            <span id="summit-name-error" className="lp-field-error">
              {state.errors.fullName}
            </span>
          )}
        </div>
        <div className="lp-field">
          <label htmlFor="summit-email">Correo electrónico</label>
          <input
            id="summit-email"
            name="email"
            type="email"
            defaultValue={state.values?.email}
            autoComplete="email"
            placeholder="nombre@empresa.com"
            maxLength={254}
            required
            aria-invalid={!!state.errors?.email}
            aria-describedby={
              state.errors?.email ? "summit-email-error" : undefined
            }
          />
          {state.errors?.email && (
            <span id="summit-email-error" className="lp-field-error">
              {state.errors.email}
            </span>
          )}
        </div>
        <div className="lp-field">
          <label htmlFor="summit-whatsapp">WhatsApp</label>
          <input
            id="summit-whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            defaultValue={state.values?.whatsapp}
            autoComplete="tel"
            placeholder="+57 300 123 4567"
            maxLength={32}
            required
            aria-invalid={!!state.errors?.whatsapp}
            aria-describedby={
              state.errors?.whatsapp
                ? "summit-whatsapp-help summit-whatsapp-error"
                : "summit-whatsapp-help"
            }
          />
          <span id="summit-whatsapp-help" className="lp-field-help">
            Si tu número no es de Colombia, incluye el indicativo (+52, +1…).
          </span>
          {state.errors?.whatsapp && (
            <span id="summit-whatsapp-error" className="lp-field-error">
              {state.errors.whatsapp}
            </span>
          )}
        </div>
        <div className="lp-field">
          <label htmlFor="summit-company">Empresa</label>
          <input
            id="summit-company"
            name="company"
            defaultValue={state.values?.company}
            autoComplete="organization"
            placeholder="Dónde trabajas o qué estás construyendo"
            minLength={2}
            maxLength={160}
            required
            aria-invalid={!!state.errors?.company}
            aria-describedby={
              state.errors?.company ? "summit-company-error" : undefined
            }
          />
          {state.errors?.company && (
            <span id="summit-company-error" className="lp-field-error">
              {state.errors.company}
            </span>
          )}
        </div>
        <div className="lp-field">
          <label htmlFor="summit-linkedin">LinkedIn</label>
          <input
            id="summit-linkedin"
            name="linkedin"
            type="text"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            defaultValue={state.values?.linkedin}
            placeholder="linkedin.com/in/tu-perfil"
            maxLength={500}
            required
            aria-invalid={!!state.errors?.linkedin}
            aria-describedby={
              state.errors?.linkedin
                ? "summit-linkedin-help summit-linkedin-error"
                : "summit-linkedin-help"
            }
          />
          <span id="summit-linkedin-help" className="lp-field-help">
            Solo para revisar tu solicitud.
          </span>
          {state.errors?.linkedin && (
            <span id="summit-linkedin-error" className="lp-field-error">
              {state.errors.linkedin}
            </span>
          )}
        </div>
        <div className="lp-honeypot" aria-hidden="true">
          <label htmlFor="summit-website">Website</label>
          <input
            id="summit-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        <label className="lp-consent">
          <input
            name="consent"
            type="checkbox"
            defaultChecked={state.values?.consent}
            required
            aria-invalid={!!state.errors?.consent}
            aria-describedby={
              state.errors?.consent ? "summit-consent-error" : undefined
            }
          />
          <span>
            Autorizo a AIYaiYai a usar mis datos para contactarme sobre este
            evento. Puedo retirar mi autorización escribiendo a{" "}
            <a href={`mailto:${colombiaSummit.contactEmail}`}>
              {colombiaSummit.contactEmail}
            </a>
            .
          </span>
        </label>
        {state.errors?.consent && (
          <span id="summit-consent-error" className="lp-field-error">
            {state.errors.consent}
          </span>
        )}
        <button
          type="submit"
          className="ds-button lp-submit"
          data-variant="primary"
          data-size="md"
        >
          {pending
            ? "Enviando tu solicitud…"
            : selectedExperience
              ? `Solicitar lugar ${selectedExperience.name}`
              : "Enviar solicitud"}
          <ArrowRightIcon aria-hidden="true" />
        </button>
      </fieldset>
      {state.status === "error" && (
        <div className="lp-form-error" ref={message} tabIndex={-1} role="alert">
          {state.message}
        </div>
      )}
      <p className="lp-form-note">
        La solicitud no confirma un lugar ni garantiza el precio de una fase.
      </p>
    </form>
  );
}
