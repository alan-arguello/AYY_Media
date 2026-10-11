"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { summitTickets } from "@/lib/summit-pricing";

type TicketType = (typeof summitTickets)[number]["id"];

const TicketSelectionContext = createContext<{
  selectedTicket: TicketType | null;
  selectTicket: (ticket: TicketType) => void;
} | null>(null);

export function TicketSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedTicket, selectTicket] = useState<TicketType | null>(null);

  return (
    <TicketSelectionContext.Provider value={{ selectedTicket, selectTicket }}>
      {children}
    </TicketSelectionContext.Provider>
  );
}

export function useTicketSelection() {
  const selection = useContext(TicketSelectionContext);
  if (!selection) {
    throw new Error("Ticket selection requires TicketSelectionProvider.");
  }
  return selection;
}
