"use client";

import { useActionState, useEffect, useRef } from "react";
import { ArrowRight as ArrowRightIcon } from "lucide-react";
import {
  initialPartnerFormState,
  partnerBudgets,
  partnerTypes,
  summitPartners,
} from "@/lib/summit-partners";
import { submitPartnerLead } from "./actions";

export function PartnerForm() {
  const [state, action, pending] = useActionState(
    submitPartnerLead,
    initialPartnerFormState,
  );
  const message = useRef<HTMLDivElement>(null);
  const values = state.values;

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
        <p>{state.detail}</p>
        <p className="lp-small">
          Hablamos de la alianza antes de cerrar cualquier acuerdo. Nada queda
          comprometido con este formulario.
        </p>
      </div>
    );
  }

  const describedBy = (field: keyof NonNullable<typeof state.errors>, help?: string) =>
    [help, state.errors?.[field] ? `partner-${field}-error` : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  const error = (field: keyof NonNullable<typeof state.errors>) =>
    state.errors?.[field] && (
      <span id={`partner-${field}-error`} className="lp-field-error">
        {state.errors[field]}
      </span>
    );

  return (
    <form
      action={action}
      onReset={(event) => event.preventDefault()}
      className="lp-form"
      aria-label="Propuesta de alianza para bogota.forward() summit"
      aria-busy={pending}
    >
      <fieldset disabled={pending}>
        <legend className="lp-sr-only">Tu empresa, la alianza y tus datos de contacto</legend>

        <fieldset
          className="pt-choice-group"
          role="radiogroup"
          aria-invalid={!!state.errors?.partnerType}
          aria-describedby={describedBy("partnerType")}
        >
          <legend>¿Qué tipo de alianza te interesa?</legend>
          <div className="pt-choices">
            {partnerTypes.map((type) => (
              <label
                className="pt-choice"
                key={type.id}
                data-selected={values?.partnerType === type.id || undefined}
                data-invalid={!!state.errors?.partnerType || undefined}
              >
                <input
                  type="radio"
                  name="partnerType"
                  value={type.id}
                  defaultChecked={values?.partnerType === type.id}
                  required
                />
                <span className="pt-choice-copy">
                  <span className="pt-choice-name">{type.name}</span>
                  <span className="pt-choice-description">{type.description}</span>
                </span>
              </label>
            ))}
          </div>
          {error("partnerType")}
        </fieldset>

        <div className="pt-row">
          <div className="lp-field">
            <label htmlFor="partner-company">Empresa</label>
            <input
              id="partner-company"
              name="company"
              defaultValue={values?.company}
              autoComplete="organization"
              placeholder="Nombre de tu empresa"
              minLength={2}
              maxLength={160}
              required
              aria-invalid={!!state.errors?.company}
              aria-describedby={describedBy("company")}
            />
            {error("company")}
          </div>
          <div className="lp-field">
            <label htmlFor="partner-website">
              Sitio web <span>Opcional</span>
            </label>
            <input
              id="partner-website"
              name="website"
              type="text"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              defaultValue={values?.website}
              autoComplete="url"
              placeholder="empresa.com"
              maxLength={500}
              aria-invalid={!!state.errors?.website}
              aria-describedby={describedBy("website")}
            />
            {error("website")}
          </div>
        </div>

        <div className="lp-field">
          <label htmlFor="partner-company-type">¿Qué hace tu empresa?</label>
          <input
            id="partner-company-type"
            name="companyType"
            defaultValue={values?.companyType}
            placeholder="Sector y a quién le vendes, en una línea"
            maxLength={160}
            aria-invalid={!!state.errors?.companyType}
            aria-describedby={describedBy("companyType")}
          />
          {error("companyType")}
        </div>

        <div className="lp-field">
          <label htmlFor="partner-goals">
            ¿Qué te gustaría lograr con el summit? <span>Opcional</span>
          </label>
          <textarea
            id="partner-goals"
            name="goals"
            defaultValue={values?.goals}
            placeholder="Visibilidad, clientes, talento, una conversación con alguien en particular…"
            maxLength={600}
            rows={3}
            aria-invalid={!!state.errors?.goals}
            aria-describedby={describedBy("goals")}
          />
          {error("goals")}
        </div>

        <div className="lp-field">
          <label htmlFor="partner-budget">Presupuesto aproximado</label>
          <select
            id="partner-budget"
            name="budget"
            defaultValue={values?.budget ?? ""}
            required
            aria-invalid={!!state.errors?.budget}
            aria-describedby={describedBy("budget", "partner-budget-help")}
          >
            <option value="" disabled>
              Elige un rango
            </option>
            {partnerBudgets.map((budget) => (
              <option key={budget.id} value={budget.id}>
                {budget.label}
              </option>
            ))}
          </select>
          <span id="partner-budget-help" className="lp-field-help">
            Nos ayuda a proponerte algo a la medida. No es un compromiso.
          </span>
          {error("budget")}
        </div>

        <div className="pt-row">
          <div className="lp-field">
            <label htmlFor="partner-name">Tu nombre</label>
            <input
              id="partner-name"
              name="contactName"
              defaultValue={values?.contactName}
              autoComplete="name"
              placeholder="Nombre y apellido"
              minLength={2}
              maxLength={120}
              required
              aria-invalid={!!state.errors?.contactName}
              aria-describedby={describedBy("contactName")}
            />
            {error("contactName")}
          </div>
          <div className="lp-field">
            <label htmlFor="partner-email">Correo electrónico</label>
            <input
              id="partner-email"
              name="email"
              type="email"
              defaultValue={values?.email}
              autoComplete="email"
              placeholder="nombre@empresa.com"
              maxLength={254}
              required
              aria-invalid={!!state.errors?.email}
              aria-describedby={describedBy("email")}
            />
            {error("email")}
          </div>
        </div>

        <div className="lp-field">
          <label htmlFor="partner-whatsapp">
            WhatsApp <span>Opcional</span>
          </label>
          <input
            id="partner-whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            defaultValue={values?.whatsapp}
            autoComplete="tel"
            placeholder="+57 300 123 4567"
            maxLength={32}
            aria-invalid={!!state.errors?.whatsapp}
            aria-describedby={describedBy("whatsapp")}
          />
          {error("whatsapp")}
        </div>

        <div className="lp-honeypot" aria-hidden="true">
          <label htmlFor="partner-fax">Fax</label>
          <input id="partner-fax" name="fax" tabIndex={-1} autoComplete="off" />
        </div>

        <label className="lp-consent">
          <input
            name="consent"
            type="checkbox"
            defaultChecked={values?.consent}
            required
            aria-invalid={!!state.errors?.consent}
            aria-describedby={describedBy("consent")}
          />
          <span>
            Autorizo a AIYaiYai a usar estos datos para contactarme sobre
            alianzas de este evento. Puedo retirar mi autorización escribiendo a{" "}
            <a href={`mailto:${summitPartners.contactEmail}`}>
              {summitPartners.contactEmail}
            </a>
            .
          </span>
        </label>
        {error("consent")}

        <button
          type="submit"
          className="ds-button lp-submit"
          data-variant="primary"
          data-size="md"
        >
          {pending ? "Enviando tu propuesta…" : "Enviar propuesta"}
          <ArrowRightIcon aria-hidden="true" />
        </button>
      </fieldset>
      {state.status === "error" && (
        <div className="lp-form-error" ref={message} tabIndex={-1} role="alert">
          {state.message}
        </div>
      )}
      <p className="lp-form-note">
        Te respondemos por correo o WhatsApp. Hablamos antes de proponer nada.
      </p>
    </form>
  );
}
