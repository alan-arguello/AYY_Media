"use client";

import { useSyncExternalStore } from "react";

// Midnight on the event day in Bogotá (UTC-5, no daylight saving).
const EVENT_DAY = Date.parse("2026-11-19T00:00:00-05:00");
const DAY = 86_400_000;

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  timer ??= setInterval(() => listeners.forEach((notify) => notify()), 60_000);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

const minute = () => Math.floor(Date.now() / 60_000) * 60_000;

// The server renders the date; the live countdown appears after hydration.
export function Countdown() {
  const now = useSyncExternalStore(subscribe, minute, () => null);
  let label = "19.11.2026";
  if (now !== null) {
    const days = Math.ceil((EVENT_DAY - now) / DAY);
    if (days > 1) label = `Faltan ${days} días`;
    else if (days === 1) label = "Es mañana";
    else if (now < EVENT_DAY + DAY) label = "Es hoy";
    else label = "Gracias por venir";
  }
  return <span className="lp-countdown">{label}</span>;
}
