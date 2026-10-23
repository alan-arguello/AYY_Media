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
// (7 to 10 p. m.) for VIP and VIP Plus. The ids are the values stored in
// Supabase (ticket_type): "general" is the event, "vip" adds the dinner and
// "vip-plus" adds a 1:1 with Alexander after the event.
const vipSeats = 16;
const vipPlusSeats = 4;
export const dinnerSeats = vipSeats + vipPlusSeats;

// The dinner's profits, after its costs, are donated here.
export const vakiFoundation = {
  name: "Vaki Foundation",
  url: "https://vaki.org/",
  // How it is described on the site: Vaki's fund for emergencies and causes.
  summary:
    "el fondo de Vaki que apoya emergencias como el terremoto en Colombia y otras causas sociales",
} as const;
const eventBenefits = [
  "Evento de 10 a. m. a 3 p. m.",
  "Charlas, fireside chat y workshop",
  "Bebidas y snacks",
] as const;
const dinnerBenefit = "Cena privada con Alexander y Tania";
const oneOnOneBenefit = "1 a 1 de 60 minutos con Alexander, después del evento";

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
    capacity: vipSeats,
    prices: [749, 949, 1049],
    benefits: [...eventBenefits, dinnerBenefit],
  },
  {
    id: "vip-plus",
    name: "VIP Plus",
    description: "El evento, la cena y un 1 a 1 con Alexander.",
    capacity: vipPlusSeats,
    prices: [1349, 1549, 1749],
    benefits: [...eventBenefits, dinnerBenefit, oneOnOneBenefit],
  },
] as const;

/** -1 means all published phases have ended; never keep a past price current. */
export function getCurrentPricingPhase(now: Date): number {
  return pricingPhases.findIndex((phase) => now.getTime() < Date.parse(phase.endsAt));
}

export function formatTicketPrice(price: number): string {
  return `$${price.toLocaleString("en-US")}`;
}
