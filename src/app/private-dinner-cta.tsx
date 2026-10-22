"use client";

import { ArrowRight } from "lucide-react";
import { useTicketSelection } from "./ticket-selection";

// The dinner's own "Solicitar" buttons: preselect the tier, then go to the form.
export function PrivateDinnerCta() {
  const { selectTicket } = useTicketSelection();
  return (
    <div className="dinner-actions">
      <a
        href="#lista"
        className="ds-button dinner-button"
        data-variant="primary"
        data-size="md"
        onClick={() => selectTicket("vip")}
        aria-label="Solicitar un lugar General y completar el formulario"
      >
        Solicitar lugar General
        <ArrowRight aria-hidden="true" />
      </a>
      <a
        href="#lista"
        className="ds-button dinner-button"
        data-variant="secondary"
        data-size="md"
        onClick={() => selectTicket("vip-plus")}
        aria-label="Solicitar un lugar VIP y completar el formulario"
      >
        Solicitar lugar VIP
        <ArrowRight aria-hidden="true" />
      </a>
    </div>
  );
}
