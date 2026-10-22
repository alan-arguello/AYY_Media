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

// The private lunch: one afternoon, 20 seats, two ways in. The ids keep the
// values already stored in Supabase (ticket_type): "vip" was the dinner
// tier and is now General; "vip-plus" is now VIP. The open summit ticket
// ("general") is retired, so new requests can't choose it, but historical
// rows keep it.
const generalSeats = 10;
const vipSeats = 10;
export const totalSeats = generalSeats + vipSeats;
const afternoon = [
  "Almuerzo privado y presentaciones entre el grupo",
  "Charla privada con Alexander Torrenegra y Tania Zapata",
  "Feedback 1 a 1 con Alexander y Tania",
  "Happy hour",
] as const;
export const oneOnOneBenefit =
  "Sesión 1 a 1 de 45 minutos con Alexander Torrenegra, posterior al evento";

export const summitTickets = [
  {
    id: "vip",
    name: "General",
    description: "Tu lugar en la mesa, la tarde completa.",
    capacity: generalSeats,
    prices: [549, 749, 849],
    benefits: afternoon,
  },
  {
    id: "vip-plus",
    name: "VIP",
    description: "La mesa, y 45 minutos a solas con Alexander.",
    capacity: vipSeats,
    prices: [1349, 1549, 1749],
    benefits: [...afternoon, oneOnOneBenefit],
  },
] as const;

/** -1 means all published phases have ended; never keep a past price current. */
export function getCurrentPricingPhase(now: Date): number {
  return pricingPhases.findIndex((phase) => now.getTime() < Date.parse(phase.endsAt));
}

export function formatTicketPrice(price: number): string {
  return `$${price.toLocaleString("en-US")}`;
}
