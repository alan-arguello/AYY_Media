export const pricingPhases = [
  {
    id: "primera",
    name: "Fase 01",
    deadline: "31 de octubre",
    shortDeadline: "31 oct",
    date: "2026-10-31",
    // The advertised deadline includes the full day in Bogotá (UTC-5).
    endsAt: "2026-11-01T00:00:00-05:00",
  },
  {
    id: "segunda",
    name: "Fase 02",
    deadline: "14 de noviembre",
    shortDeadline: "14 nov",
    date: "2026-11-14",
    endsAt: "2026-11-15T00:00:00-05:00",
  },
  {
    id: "final",
    name: "Fase 03",
    deadline: "19 de noviembre",
    shortDeadline: "19 nov",
    date: "2026-11-19",
    endsAt: "2026-11-20T00:00:00-05:00",
  },
] as const;

// One day, two parts: the event (10 a. m. to 3 p. m.) and a private dinner
// (7 to 10 p. m.) that only VIP includes. The ids are the values stored in
// Supabase (ticket_type) and keep their original meaning: "general" is the
// event and "vip" adds the dinner. "vip-plus" (a retired tier with a 1:1
// session) stays valid in the database only.
export const dinnerSeats = 20;
const eventBenefits = [
  "Evento de 10 a. m. a 3 p. m.",
  "Charlas, fireside chat y workshop",
  "Bebidas y snacks",
] as const;

export const summitTickets = [
  {
    id: "general",
    name: "General",
    description: "El evento completo.",
    capacity: null,
    prices: [349, 479, 579],
    benefits: eventBenefits,
  },
  {
    id: "vip",
    name: "VIP",
    description: "El evento y la cena privada.",
    capacity: dinnerSeats,
    prices: [649, 849, 949],
    benefits: [...eventBenefits, "Cena privada con Alexander y Tania"],
  },
] as const;

/** -1 means all published phases have ended; never keep a past price current. */
export function getCurrentPricingPhase(now: Date): number {
  return pricingPhases.findIndex((phase) => now.getTime() < Date.parse(phase.endsAt));
}

export function formatTicketPrice(price: number): string {
  return `$${price.toLocaleString("en-US")}`;
}
