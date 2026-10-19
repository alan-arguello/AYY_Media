import assert from "node:assert/strict";
import test from "node:test";
import { createClient } from "@supabase/supabase-js";
import { saveSupabaseSummitInterest } from "../src/lib/supabase/summit-interest.ts";

const record = {
  source: "colombia-summit-2026",
  full_name: "Ana Prueba",
  email: "ana+summit@example.com",
  whatsapp: "+573001234567",
  company: "Empresa de prueba",
  linkedin_url: "https://www.linkedin.com/in/ana-prueba/",
  consent_version: "aiyaiyai-summit-2026-v1",
  ticket_type: "vip",
};

// Exercise the real client's HTTP serialization without network or credentials.
function transport(responses) {
  const requests = [];
  const client = createClient("https://summit-test.invalid", "test-only-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push({
          method: request.method,
          url: new URL(request.url),
          headers: request.headers,
          body: await request.json(),
        });
        const response = responses[requests.length - 1];
        assert.ok(response, "Persistence made an unexpected additional request");
        return new Response(JSON.stringify(response.body), {
          status: response.status ?? 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  });
  return { client, requests };
}

test("new registrations persist the selected ticket and never replace a duplicate email", async () => {
  for (const ticket_type of ["general", "vip", "vip-plus"]) {
    const { client, requests } = transport([
      { status: 201, body: [{ id: "new-registration" }] },
    ]);
    const submitted = { ...record, ticket_type };

    assert.equal(await saveSupabaseSummitInterest(client, submitted), "created");
    assert.equal(requests.length, 1);
    const [insert] = requests;
    assert.equal(insert.method, "POST");
    assert.equal(insert.url.pathname, "/rest/v1/colombia_summit_interests");
    assert.equal(insert.url.searchParams.get("on_conflict"), "email");
    assert.equal(insert.url.searchParams.get("select"), "id");
    const preferences = insert.headers.get("prefer").split(/,\s*/);
    assert.ok(preferences.includes("resolution=ignore-duplicates"));
    assert.ok(preferences.includes("return=representation"));
    assert.deepEqual(insert.body, submitted);
  }
});

test("legacy duplicate registrations only fill empty answers, preserving identity and consent", async () => {
  const { client, requests } = transport([
    { body: [] },
    { body: [{ id: "legacy-registration" }] },
    { body: [{ id: "legacy-registration" }] },
  ]);

  assert.equal(await saveSupabaseSummitInterest(client, record), "updated");
  assert.equal(requests.length, 3);
  const [, ticket, whatsapp] = requests;
  for (const [update, column, body] of [
    [ticket, "ticket_type", { ticket_type: "vip" }],
    [whatsapp, "whatsapp", { whatsapp: "+573001234567" }],
  ]) {
    assert.equal(update.method, "PATCH");
    assert.equal(update.url.pathname, "/rest/v1/colombia_summit_interests");
    assert.equal(update.url.searchParams.get("email"), `eq.${record.email}`);
    assert.equal(update.url.searchParams.get(column), "is.null");
    assert.equal(update.url.searchParams.get("select"), "id");
    // Each update writes only its own column: no name, company, consent or source.
    assert.deepEqual(update.body, body);
  }
});

test("a registration with a ticket but no WhatsApp gains only the number", async () => {
  const { client, requests } = transport([
    { body: [] },
    { body: [] },
    { body: [{ id: "ticket-registration" }] },
  ]);

  assert.equal(await saveSupabaseSummitInterest(client, record), "updated");
  assert.equal(requests.length, 3);
  assert.equal(requests[2].url.searchParams.get("whatsapp"), "is.null");
  assert.deepEqual(requests[2].body, { whatsapp: "+573001234567" });
});

test("existing answers are reported without an unconditional update or retry", async () => {
  const { client, requests } = transport([{ body: [] }, { body: [] }, { body: [] }]);

  assert.equal(
    await saveSupabaseSummitInterest(client, { ...record, ticket_type: "vip-plus", whatsapp: "+14155550100" }),
    "already-registered",
  );
  assert.equal(requests.length, 3);
  assert.equal(requests[1].url.searchParams.get("ticket_type"), "is.null");
  assert.equal(requests[2].url.searchParams.get("whatsapp"), "is.null");
});

test("a rejected insertion does not attempt to alter an existing registration", async () => {
  const { client, requests } = transport([
    {
      status: 400,
      body: { code: "23514", message: "ticket_type violates check constraint" },
    },
  ]);

  await assert.rejects(saveSupabaseSummitInterest(client, record), /23514/);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, "POST");
});

test("failure to add a WhatsApp number is surfaced instead of reporting registration success", async () => {
  const { client, requests } = transport([
    { body: [] },
    { body: [] },
    { status: 400, body: { code: "23514", message: "whatsapp violates check constraint" } },
  ]);

  await assert.rejects(saveSupabaseSummitInterest(client, record), /whatsapp persistence failed: 23514/);
  assert.equal(requests.length, 3);
});

test("failure to add a legacy ticket is surfaced instead of reporting registration success", async () => {
  const { client, requests } = transport([
    { body: [] },
    {
      status: 403,
      body: { code: "42501", message: "permission denied for table" },
    },
  ]);

  await assert.rejects(saveSupabaseSummitInterest(client, record), /42501/);
  assert.equal(requests.length, 2);
  assert.equal(requests[1].method, "PATCH");
});
