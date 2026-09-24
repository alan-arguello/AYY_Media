"use client";

import { useActionState, useEffect, useRef } from "react";
import { ArrowRight as ArrowRightIcon } from "lucide-react";
import { initialSummitFormState, colombiaSummit } from "@/lib/colombia-summit";
import { submitSummitInterest } from "./actions";

export function SummitInterestForm() {
  const [state, action, pending] = useActionState(
    submitSummitInterest,
    initialSummitFormState,
  );
  const message = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status !== "idle") message.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="cs-success" ref={message} tabIndex={-1} role="status">
        <span className="cs-success-mark" aria-hidden="true">
          ✓
        </span>
        <h3>{state.message}</h3>
        <p>
          Te avisaremos por correo cuando anunciemos los próximos speakers y
          abramos las inscripciones.
        </p>
        <p className="cs-small">
          Este registro es de interés, no una reserva de entrada.
        </p>
        <a className="cs-text-link" href="#speakers">
          Conoce a los primeros speakers <ArrowRightIcon />
        </a>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="cs-form"
      aria-label="Lista de interés de Back to the Future Summit"
      aria-busy={pending}
    >
      <fieldset disabled={pending}>
        <legend className="cs-sr-only">Tus datos de contacto</legend>
        <div className="cs-field">
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
            <span id="summit-name-error" className="cs-field-error">
              {state.errors.fullName}
            </span>
          )}
        </div>
        <div className="cs-field">
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
            <span id="summit-email-error" className="cs-field-error">
              {state.errors.email}
            </span>
          )}
        </div>
        <div className="cs-field">
          <label htmlFor="summit-company">
            Empresa <span>Opcional</span>
          </label>
          <input
            id="summit-company"
            name="company"
            defaultValue={state.values?.company}
            autoComplete="organization"
            placeholder="Dónde trabajas o qué estás construyendo"
            maxLength={160}
            aria-invalid={!!state.errors?.company}
            aria-describedby={
              state.errors?.company ? "summit-company-error" : undefined
            }
          />
          {state.errors?.company && (
            <span id="summit-company-error" className="cs-field-error">
              {state.errors.company}
            </span>
          )}
        </div>
        <div className="cs-field">
          <label htmlFor="summit-linkedin">
            LinkedIn <span>Opcional</span>
          </label>
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
            aria-invalid={!!state.errors?.linkedin}
            aria-describedby={
              state.errors?.linkedin ? "summit-linkedin-error" : undefined
            }
          />
          {state.errors?.linkedin && (
            <span id="summit-linkedin-error" className="cs-field-error">
              {state.errors.linkedin}
            </span>
          )}
        </div>
        <div className="cs-honeypot" aria-hidden="true">
          <label htmlFor="summit-website">Website</label>
          <input
            id="summit-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        <label className="cs-consent">
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
          <span id="summit-consent-error" className="cs-field-error">
            {state.errors.consent}
          </span>
        )}
        <button type="submit" className="cs-button cs-button-dark">
          {pending ? "Guardando tu registro…" : "Quiero enterarme primero"}
          <ArrowRightIcon />
        </button>
      </fieldset>
      {state.status === "error" && (
        <div className="cs-form-error" ref={message} tabIndex={-1} role="alert">
          {state.message}
        </div>
      )}
      <p className="cs-form-note">
        Lista de interés. Las entradas aún no están a la venta.
      </p>
    </form>
  );
}
