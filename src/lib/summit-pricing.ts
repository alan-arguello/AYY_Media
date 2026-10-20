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

const generalBenefits = [
  "Entrada al evento del summit",
  "Bebidas y snacks durante el evento",
] as const;
// Every VIP and VIP Plus seat is a seat at the private dinner.
const vipSeats = 15;
const vipPlusSeats = 5;
export const dinnerSeats = vipSeats + vipPlusSeats;
const dinnerBenefit = `Cena privada con Alexander Torrenegra y Tania Zapata · ${dinnerSeats} lugares en total`;
export const oneOnOneBenefit =
  "Sesión 1 a 1 de 45 minutos con Alexander Torrenegra, posterior al evento";

export const summitTickets = [
  {
    id: "general",
    name: "General",
    description: "Un día para abrir la perspectiva.",
    capacity: null,
    prices: [349, 479, 579],
    benefits: generalBenefits,
  },
  {
    id: "vip",
    name: "VIP",
    description: "La conversación sigue en la mesa.",
    capacity: vipSeats,
    prices: [549, 749, 849],
    benefits: [...generalBenefits, dinnerBenefit],
  },
  {
    id: "vip-plus",
    name: "VIP Plus",
    description: "Una conversación enfocada en ti.",
    capacity: vipPlusSeats,
    prices: [1349, 1549, 1749],
    benefits: [...generalBenefits, dinnerBenefit, oneOnOneBenefit],
  },
] as const;

/** -1 means all published phases have ended; never keep a past price current. */
export function getCurrentPricingPhase(now: Date): number {
  return pricingPhases.findIndex((phase) => now.getTime() < Date.parse(phase.endsAt));
}

export function formatTicketPrice(price: number): string {
  return `$${price.toLocaleString("en-US")}`;
}
