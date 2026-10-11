export const pricingPhases = [
  {
    id: "primera",
    name: "Fase 01",
    deadline: "24 de octubre",
    shortDeadline: "24 oct",
    date: "2026-10-24",
    // The advertised deadline includes the full day in Bogotá (UTC-5).
    endsAt: "2026-10-25T00:00:00-05:00",
  },
  {
    id: "segunda",
    name: "Fase 02",
    deadline: "07 de noviembre",
    shortDeadline: "07 nov",
    date: "2026-11-07",
    endsAt: "2026-11-08T00:00:00-05:00",
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
const dinnerBenefit = "Cena privada con Alex Torrenegra y Tania Zapata";

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
    capacity: 20,
    prices: [549, 749, 849],
    benefits: [...generalBenefits, dinnerBenefit],
  },
  {
    id: "vip-plus",
    name: "VIP Plus",
    description: "Una conversación enfocada en ti.",
    capacity: 10,
    prices: [1349, 1549, 1749],
    benefits: [
      ...generalBenefits,
      dinnerBenefit,
      "Sesión 1 a 1 de 45 minutos con Alexander Torrenegra, posterior al evento",
    ],
  },
] as const;

/** -1 means all published phases have ended; never keep a past price current. */
export function getCurrentPricingPhase(now: Date): number {
  return pricingPhases.findIndex((phase) => now.getTime() < Date.parse(phase.endsAt));
}

export function formatTicketPrice(price: number): string {
  return `$${price.toLocaleString("en-US")}`;
}
