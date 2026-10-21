import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const sql = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const interests = "public.colombia_summit_interests";
const partners = "public.colombia_summit_partner_leads";

// The live database as it stands before this migration.
async function existingDatabase() {
  const db = new PGlite();
  await db.exec(
    "create role anon; create role authenticated; create role service_role bypassrls;",
  );
  for (const path of [
    "./fixtures/20260924025758_colombia_summit_interests.sql",
    "./fixtures/20260924171537_colombia_summit_linkedin_and_cohosts.sql",
    "../supabase/migrations/20260924184338_colombia_summit_aiyaiyai_consent.sql",
    "../supabase/migrations/20261011045427_colombia_summit_ticket_type.sql",
    "../supabase/migrations/20261019200619_colombia_summit_whatsapp.sql",
  ]) {
    await db.exec(sql(path));
  }
  await db.exec(`grant all on ${interests} to service_role`);
  return db;
}
const migration = () => sql("../supabase/migrations/20261021223409_colombia_summit_partner_leads.sql");

const access = async (db, table) => ({
  grants: (
    await db.query(`select grantee, privilege_type from information_schema.role_table_grants
      where table_schema = 'public' and table_name = $1 and grantee in ('anon', 'authenticated', 'service_role')
      order by grantee, privilege_type`, [table])
  ).rows,
  rls: (await db.query(`select relrowsecurity from pg_class where oid = ('public.' || $1)::regclass`, [table])).rows[0].relrowsecurity,
  policies: (await db.query(`select policyname from pg_policies where schemaname = 'public' and tablename = $1`, [table])).rows,
});

const insert = `insert into ${partners}
  (source, company, contact_name, email, whatsapp, website, partner_type, company_type, goals, budget, consent_version)
  values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning id`;
const row = (overrides = {}) => {
  const base = {
    source: "colombia-summit-2026-partners", company: "Acme Latam", contact_name: "Ana Prueba",
    email: "ana@acme.com", whatsapp: "+573001234567", website: "https://acme.com/", partner_type: "sponsor",
    company_type: "SaaS", goals: "Visibilidad.", budget: "10k-25k", consent_version: "aiyaiyai-partners-2026-v1",
  };
  const r = { ...base, ...overrides };
  return [r.source, r.company, r.contact_name, r.email, r.whatsapp, r.website, r.partner_type, r.company_type, r.goals, r.budget, r.consent_version];
};

test("the partner table is added beside the interest list without touching it", async () => {
  const db = await existingDatabase();
  try {
    await db.query(`insert into ${interests} (source, full_name, email, consent_version, linkedin_url)
      values ('colombia-summit-2026', 'Attendee', 'attendee@example.com', 'aiyaiyai-summit-2026-v1', '')`);
    const rowsBefore = (await db.query(`select * from ${interests}`)).rows;
    const accessBefore = await access(db, "colombia_summit_interests");

    await db.exec(migration());

    assert.deepEqual((await db.query(`select * from ${interests}`)).rows, rowsBefore);
    assert.deepEqual(await access(db, "colombia_summit_interests"), accessBefore);
    const partnerAccess = await access(db, "colombia_summit_partner_leads");
    assert.equal(partnerAccess.rls, true);
    assert.deepEqual(partnerAccess.policies, []);
    assert.deepEqual(partnerAccess.grants, [
      { grantee: "service_role", privilege_type: "INSERT" },
      { grantee: "service_role", privilege_type: "SELECT" },
    ]);

    // Only the server's role writes or reads.
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`reset role; set role ${role}`);
      await assert.rejects(db.query(`select * from ${partners}`), { code: "42501" });
      await assert.rejects(db.query(insert, row({ email: `${role}@acme.com` })), { code: "42501" });
    }
    await db.exec("reset role; set role service_role");
    const { rows } = await db.query(insert, row());
    assert.match(rows[0].id, /^[0-9a-f-]{36}$/);
    // The same company may write again: no unique email.
    await db.query(insert, row({ goals: "Second note" }));
    assert.equal((await db.query(`select count(*)::int as n from ${partners}`)).rows[0].n, 2);
    const saved = (await db.query(`select * from ${partners} order by submitted_at limit 1`)).rows[0];
    assert.equal(saved.whatsapp, "+573001234567");
    assert.equal(saved.budget, "10k-25k");
  } finally {
    await db.close();
  }
});

test("the database enforces the same rules as the form", async () => {
  const db = await existingDatabase();
  try {
    await db.exec(migration());
    await db.exec("set role service_role");
    // Optional fields may be empty or null.
    await db.query(insert, row({ whatsapp: null, website: "", company_type: "", goals: "" }));
    for (const [label, overrides] of [
      ["source", { source: "colombia-summit-2026" }],
      ["consent", { consent_version: "aiyaiyai-summit-2026-v1" }],
      ["partner type", { partner_type: "friend" }],
      ["budget", { budget: "lots" }],
      ["email case", { email: "Ana@acme.com" }],
      ["short company", { company: "A" }],
      ["short name", { contact_name: "A" }],
      ["whatsapp format", { whatsapp: "3001234567" }],
      ["whatsapp spaces", { whatsapp: "+57 300 123 4567" }],
      ["website scheme", { website: "acme.com" }],
      ["website spaces", { website: "https://acme.com/a b" }],
      ["long goals", { goals: "x".repeat(601) }],
      ["long company type", { company_type: "x".repeat(161) }],
    ]) {
      await assert.rejects(db.query(insert, row(overrides)), { code: "23514" }, label);
    }
    for (const field of ["source", "company", "contact_name", "email", "partner_type", "budget", "consent_version"]) {
      await assert.rejects(db.query(insert, row({ [field]: null })), { code: "23502" }, field);
    }
    assert.equal((await db.query(`select count(*)::int as n from ${partners}`)).rows[0].n, 1);
  } finally {
    await db.close();
  }
});
