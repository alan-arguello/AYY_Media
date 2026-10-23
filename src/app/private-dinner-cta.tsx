"use client";

import { ArrowRight } from "lucide-react";
import { useTicketSelection } from "./ticket-selection";

// The dinner's own button: preselect VIP, then go to the form.
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
        aria-label="Solicitar VIP, con la cena privada, y completar el formulario"
      >
        Solicitar VIP con cena
        <ArrowRight aria-hidden="true" />
      </a>
    </div>
  );
}
