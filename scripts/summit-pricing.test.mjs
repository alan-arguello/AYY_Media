import assert from "node:assert/strict";
import test from "node:test";
import {
  formatTicketPrice,
  getCurrentPricingPhase,
} from "../src/lib/summit-pricing.ts";

test("the first phase is available before its advertised deadline", () => {
  assert.equal(getCurrentPricingPhase(new Date("2026-10-10T12:00:00-05:00")), 0);
});

for (const { lastMoment, nextMoment, before, after } of [
  {
    lastMoment: "2026-10-31T23:59:59.999-05:00",
    nextMoment: "2026-11-01T00:00:00.000-05:00",
    before: 0,
    after: 1,
  },
  {
    lastMoment: "2026-11-14T23:59:59.999-05:00",
    nextMoment: "2026-11-15T00:00:00.000-05:00",
    before: 1,
    after: 2,
  },
  {
    lastMoment: "2026-11-19T23:59:59.999-05:00",
    nextMoment: "2026-11-20T00:00:00.000-05:00",
    before: 2,
    after: -1,
  },
]) {
  test(`phase ${before + 1} includes its complete final day in Bogotá`, () => {
    assert.equal(getCurrentPricingPhase(new Date(lastMoment)), before);
    assert.equal(getCurrentPricingPhase(new Date(nextMoment)), after);
  });
}

test("UTC midnight does not end a pricing phase five hours early", () => {
  assert.equal(getCurrentPricingPhase(new Date("2026-11-01T00:00:00Z")), 0);
  assert.equal(getCurrentPricingPhase(new Date("2026-11-15T00:00:00Z")), 1);
  assert.equal(getCurrentPricingPhase(new Date("2026-11-20T00:00:00Z")), 2);
});

test("equivalent instants use the Bogotá cutoff regardless of visitor timezone", () => {
  for (const instant of [
    "2026-11-15T05:00:00Z",
    "2026-11-14T21:00:00-08:00",
    "2026-11-15T14:00:00+09:00",
  ]) {
    assert.equal(getCurrentPricingPhase(new Date(instant)), 2);
  }
});

test("expired schedules never keep the final price marked as current", () => {
  assert.equal(getCurrentPricingPhase(new Date("2026-11-21T12:00:00-05:00")), -1);
  assert.equal(getCurrentPricingPhase(new Date("2027-01-01T00:00:00Z")), -1);
});

test("ticket prices use unambiguous USD-style thousands grouping", () => {
  assert.equal(formatTicketPrice(1349), "$1,349");
});
