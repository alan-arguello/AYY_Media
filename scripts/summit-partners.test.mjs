import assert from "node:assert/strict";
import test from "node:test";
import { createClient } from "@supabase/supabase-js";
import {
  parsePartnerLead,
  partnerBudgets,
  partnerTypes,
  summitPartners,
} from "../src/lib/summit-partners.ts";
import { saveSupabasePartnerLead } from "../src/lib/supabase/partner-lead.ts";

const form = (fields) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};
const valid = {
  company: "  Acme Latam  ",
  contactName: "Ana Prueba",
  email: "Ana@Acme.com",
  whatsapp: "300 123 4567",
  website: "acme.com",
  partnerType: "sponsor",
  companyType: "SaaS para pymes",
  goals: "Visibilidad con founders.",
  budget: "10k-25k",
  consent: "on",
};

test("a complete proposal is trimmed, normalized and typed", () => {
  const result = parsePartnerLead(form(valid));
  assert.ok(result.success, JSON.stringify(result.error?.issues));
  assert.deepEqual(result.data, {
    company: "Acme Latam",
    contactName: "Ana Prueba",
    email: "ana@acme.com",
    whatsapp: "+573001234567",
    website: "https://acme.com/",
    partnerType: "sponsor",
    companyType: "SaaS para pymes",
    goals: "Visibilidad con founders.",
    budget: "10k-25k",
    consent: true,
  });
});

test("WhatsApp, website, company type and goals are optional", () => {
  const result = parsePartnerLead(
    form({ ...valid, whatsapp: "", website: "", companyType: "", goals: "" }),
  );
  assert.ok(result.success);
  assert.equal(result.data.whatsapp, null);
  assert.equal(result.data.website, "");
  assert.equal(result.data.companyType, "");
  assert.equal(result.data.goals, "");
});

test("websites are stored as canonical https URLs without credentials", () => {
  for (const [input, expected] of [
    ["www.acme.com", "https://www.acme.com/"],
    ["http://acme.com/about", "http://acme.com/about"],
    ["https://acme.co/?utm=x", "https://acme.co/?utm=x"],
  ]) {
    const result = parsePartnerLead(form({ ...valid, website: input }));
    assert.ok(result.success, input);
    assert.equal(result.data.website, expected);
  }
  for (const input of ["not a site", "javascript:alert(1)", "https://user:pw@acme.com", "localhost", "ftp://acme.com"]) {
    const result = parsePartnerLead(form({ ...valid, website: input }));
    assert.ok(!result.success, input);
    assert.equal(result.error.issues[0].path[0], "website");
  }
});

test("every field reports its own first error", () => {
  const result = parsePartnerLead(
    form({
      company: "A",
      contactName: "",
      email: "nope",
      whatsapp: "12345",
      website: "x y",
      partnerType: "friend",
      companyType: "x".repeat(161),
      goals: "x".repeat(601),
      budget: "millions",
      consent: "",
    }),
  );
  assert.ok(!result.success);
  const fields = new Set(result.error.issues.map((issue) => issue.path[0]));
  assert.deepEqual(
    [...fields].sort(),
    ["budget", "company", "companyType", "consent", "contactName", "email", "goals", "partnerType", "website", "whatsapp"],
  );
});

test("the form options match what the database accepts", () => {
  assert.deepEqual(partnerTypes.map((t) => t.id), ["sponsor", "speaker", "media", "other"]);
  assert.deepEqual(partnerBudgets.map((b) => b.id), ["under-5k", "5k-10k", "10k-25k", "25k-50k", "over-50k", "undecided"]);
  assert.equal(summitPartners.source, "colombia-summit-2026-partners");
  assert.equal(summitPartners.consentVersion, "aiyaiyai-partners-2026-v1");
});

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

const record = {
  source: "colombia-summit-2026-partners",
  company: "Acme Latam",
  contact_name: "Ana Prueba",
  email: "ana@acme.com",
  whatsapp: null,
  website: "https://acme.com/",
  partner_type: "sponsor",
  company_type: "SaaS para pymes",
  goals: "",
  budget: "10k-25k",
  consent_version: "aiyaiyai-partners-2026-v1",
};

test("each proposal is one plain insert into the partner table", async () => {
  const { client, requests } = transport([{ status: 201, body: [{ id: "lead-1" }] }]);
  assert.equal(await saveSupabasePartnerLead(client, record), "created");
  assert.equal(requests.length, 1);
  const [insert] = requests;
  assert.equal(insert.method, "POST");
  assert.equal(insert.url.pathname, "/rest/v1/colombia_summit_partner_leads");
  assert.equal(insert.url.searchParams.get("on_conflict"), null);
  assert.ok(!insert.headers.get("prefer").includes("resolution="));
  assert.deepEqual(insert.body, record);
});

test("database rejections surface instead of reporting success", async () => {
  const { client, requests } = transport([
    { status: 400, body: { code: "23514", message: "budget violates check constraint" } },
  ]);
  await assert.rejects(saveSupabasePartnerLead(client, record), /23514/);
  assert.equal(requests.length, 1);
});
