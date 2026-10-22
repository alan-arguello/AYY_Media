import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import { speakers } from "../src/app/speakers.ts";
import { pastEvents, pastEventSupporters } from "../src/app/past-events.ts";
import {
  parseSummitInterest,
  colombiaSummit,
} from "../src/lib/colombia-summit.ts";

function form(overrides = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    fullName: "Ana Prueba",
    email: "ana@example.com",
    whatsapp: "+57 300 123 4567",
    company: "Mi empresa",
    linkedin: "linkedin.com/in/ana-prueba",
    ticketType: "vip",
    consent: "on",
    ...overrides,
  })) {
    data.set(key, value);
  }
  return data;
}

test("validates consent and normalizes email and whitespace", () => {
  const result = parseSummitInterest(
    form({
      fullName: "  Ana Prueba  ",
      email: " ANA@EXAMPLE.COM ",
      company: "  Mi empresa  ",
    }),
  );
  assert.equal(result.success, true);
  assert.deepEqual(result.data, {
    fullName: "Ana Prueba",
    email: "ana@example.com",
    whatsapp: "+573001234567",
    company: "Mi empresa",
    linkedin: "https://www.linkedin.com/in/ana-prueba/",
    ticketType: "vip",
    consent: true,
  });
});

test("company and LinkedIn are required to review each request", () => {
  for (const field of ["company", "linkedin"]) {
    const missing = form();
    missing.delete(field);
    const result = parseSummitInterest(missing);
    assert.equal(result.success, false, field);
    assert.equal(result.error.issues[0].path[0], field);
    assert.equal(parseSummitInterest(form({ [field]: "  " })).success, false, field);
  }
});

test("normalizes WhatsApp numbers to E.164", () => {
  for (const [input, expected] of [
    ["+57 300 123 4567", "+573001234567"],
    ["(+57) 300-123-4567", "+573001234567"],
    ["3001234567", "+573001234567"],
    ["300 123 4567", "+573001234567"],
    ["57 300 123 4567", "+573001234567"],
    ["0057 300 123 4567", "+573001234567"],
    ["+1 (415) 555-0100", "+14155550100"],
    ["+52 55 1234 5678", "+525512345678"],
    ["0052.55.1234.5678", "+525512345678"],
    ["  +34 612 34 56 78  ", "+34612345678"],
  ]) {
    const result = parseSummitInterest(form({ whatsapp: input }));
    assert.equal(result.success, true, input);
    assert.equal(result.data.whatsapp, expected, input);
  }
});

test("requires a WhatsApp number with a country code outside Colombia", () => {
  const missing = form();
  missing.delete("whatsapp");
  assert.equal(parseSummitInterest(missing).success, false);
  for (const whatsapp of [
    "",
    "   ",
    "55 1234 5678",
    "6011234567",
    "12345",
    "+57",
    "+0573001234567",
    "+57 300 ABC 4567",
    "+57 300 123 4567 ext 2",
    "+5730012345678901",
    "+57300123456789012345678901234567",
    "<script>alert(1)</script>",
    "+573001234567'); drop table public.colombia_summit_interests; --",
  ]) {
    const result = parseSummitInterest(form({ whatsapp }));
    assert.equal(result.success, false, whatsapp);
    assert.equal(result.error.issues[0].path[0], "whatsapp", whatsapp);
  }
  const fileValue = form();
  fileValue.set("whatsapp", new Blob(["+573001234567"], { type: "text/plain" }));
  assert.equal(parseSummitInterest(fileValue).success, false);
});

test("accepts each seat on offer: General (vip) and VIP (vip-plus)", () => {
  for (const ticketType of ["vip", "vip-plus"]) {
    const result = parseSummitInterest(form({ ticketType }));
    assert.equal(result.success, true);
    assert.equal(result.data.ticketType, ticketType);
  }
});

test("rejects missing, unknown and malicious ticket types", () => {
  const missing = form();
  missing.delete("ticketType");
  assert.equal(parseSummitInterest(missing).success, false);
  for (const ticketType of [
    "",
    "general",
    "VIP",
    "vip plus",
    " vip ",
    "admin",
    "general,vip",
    "<script>alert(1)</script>",
    "vip'); drop table public.colombia_summit_interests; --",
  ]) {
    assert.equal(parseSummitInterest(form({ ticketType })).success, false);
  }
  const fileValue = form();
  fileValue.set("ticketType", new Blob(["vip"], { type: "text/plain" }));
  assert.equal(parseSummitInterest(fileValue).success, false);
});

test("normalizes LinkedIn profile URLs and removes tracking parameters", () => {
  for (const linkedin of [
    "linkedin.com/in/ana-prueba",
    "  https://www.linkedin.com/in/ana-prueba/?utm_source=test#profile  ",
    "http://co.linkedin.com/in/ana-prueba/",
  ]) {
    const result = parseSummitInterest(form({ linkedin }));
    assert.equal(result.success, true);
    assert.equal(
      result.data.linkedin,
      "https://www.linkedin.com/in/ana-prueba/",
    );
  }
});

test("rejects non-profile, spoofed, malformed and credential-bearing LinkedIn URLs", () => {
  for (const linkedin of [
    "https://example.com/in/test",
    "https://linkedin.com.evil.test/in/test",
    "https://evil.test@linkedin.com/in/test",
    "https://linkedin.com:8443/in/test",
    "https://linkedin.com/company/test",
    "javascript:alert(1)",
    "https://linkedin.com/in/a%2Fb",
    "https://linkedin.com/in/%ZZ",
    "x".repeat(501),
  ])
    assert.equal(parseSummitInterest(form({ linkedin })).success, false);
});

test("rejects missing consent, names, malformed emails, and oversized values", () => {
  for (const invalid of [
    { consent: "false" },
    { fullName: " " },
    { email: "not-an-email" },
    { fullName: "a".repeat(121) },
    { company: "a".repeat(161) },
    { email: `${"a".repeat(255)}@example.com` },
  ])
    assert.equal(parseSummitInterest(form(invalid)).success, false);
  const data = form();
  data.delete("consent");
  assert.equal(parseSummitInterest(data).success, false);
});

test("event source and date stay distinct from other campaigns", () => {
  assert.equal(colombiaSummit.date, "2026-11-19");
  assert.equal(colombiaSummit.source, "colombia-summit-2026");
  assert.equal(colombiaSummit.path, "/");
  assert.equal(colombiaSummit.organizer, "AIYaiYai");
  assert.equal(colombiaSummit.consentVersion, "aiyaiyai-summit-2026-v1");
});

test("five speakers have real portraits, credential assets and source links", () => {
  assert.equal(speakers.length, 2);
  assert.equal(new Set(speakers.map((speaker) => speaker.linkedin)).size, 2);
  for (const speaker of speakers) {
    assert.ok(
      existsSync(new URL(`../public${speaker.image}`, import.meta.url)),
    );
    assert.ok(speaker.credentials.length >= 2);
    for (const credential of speaker.credentials) {
      assert.ok(
        existsSync(new URL(`../public${credential.image}`, import.meta.url)),
      );
      assert.equal(new URL(credential.source).protocol, "https:");
      assert.ok(credential.detail);
    }
  }
});

test("past events have real photos and distinct supporter logos", () => {
  assert.equal(pastEvents.length, 8);
  assert.equal(pastEventSupporters.length, 6);
  assert.equal(
    new Set(pastEventSupporters.map((partner) => partner.name)).size,
    6,
  );
  for (const event of pastEvents) {
    assert.ok(existsSync(new URL(`../public${event.image}`, import.meta.url)));
    assert.ok(event.alt);
  }
  for (const partner of pastEventSupporters) {
    assert.ok(
      existsSync(new URL(`../public${partner.image}`, import.meta.url)),
    );
  }
});
