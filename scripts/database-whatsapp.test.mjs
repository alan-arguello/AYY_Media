import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const sql = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const table = "public.colombia_summit_interests";

// The live table as it stands before this migration.
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
  ]) {
    await db.exec(sql(path));
  }
  // The live service role has every table privilege; the migration must keep them.
  await db.exec(`grant all on ${table} to service_role`);
  return db;
}

const migration = () =>
  sql("../supabase/migrations/20261019200619_colombia_summit_whatsapp.sql");

// The original consulting_website writer: no ticket, no WhatsApp.
const consultingInsert = `insert into ${table}
  (source, full_name, email, company, consent_version, linkedin_url)
  values ('colombia-summit-2026', 'Original Attendee', $1, 'Original Company', $2, '')`;
// The summit form that is live until this change deploys: ticket, no WhatsApp.
const liveFormInsert = `insert into ${table}
  (source, full_name, email, company, consent_version, linkedin_url, ticket_type)
  values ('colombia-summit-2026', 'Live Form Attendee', $1, '', 'aiyaiyai-summit-2026-v1', '', $2)`;

async function accessState(db) {
  return {
    grants: (
      await db.query(`select grantee, privilege_type
        from information_schema.role_table_grants
        where table_schema = 'public' and table_name = 'colombia_summit_interests'
        order by grantee, privilege_type`)
    ).rows,
    rls: (
      await db.query(`select relrowsecurity, relforcerowsecurity from pg_class
        where oid = '${table}'::regclass`)
    ).rows,
    policies: (
      await db.query(`select * from pg_policies
        where schemaname = 'public' and tablename = 'colombia_summit_interests'`)
    ).rows,
  };
}

test("WhatsApp migration preserves historical rows, both live writers and access controls", async () => {
  const db = await existingDatabase();
  try {
    for (const [email, consent] of [
      ["old-v1@example.com", "colombia-summit-2026-v1"],
      ["old-v2@example.com", "colombia-summit-2026-v2"],
      ["old-current@example.com", "aiyaiyai-summit-2026-v1"],
    ]) {
      await db.query(consultingInsert, [email, consent]);
    }
    await db.query(liveFormInsert, ["ticketed@example.com", "vip"]);
    const before = (await db.query(`select * from ${table} order by email`)).rows;
    const accessBefore = await accessState(db);

    await db.exec(migration());

    const after = (await db.query(`select * from ${table} order by email`)).rows;
    assert.deepEqual(after, before.map((row) => ({ ...row, whatsapp: null })));
    assert.deepEqual(await accessState(db), accessBefore);
    assert.equal(accessBefore.rls[0].relrowsecurity, true);
    assert.deepEqual(accessBefore.policies, []);
    const column = (
      await db.query(`select is_nullable, column_default
        from information_schema.columns
        where table_schema = 'public' and table_name = 'colombia_summit_interests'
          and column_name = 'whatsapp'`)
    ).rows[0];
    assert.deepEqual(column, { is_nullable: "YES", column_default: null });

    // Writers that do not know the column keep working during and after rollout.
    await db.exec("set role service_role");
    await db.query(consultingInsert, ["consulting-site@example.com", "colombia-summit-2026-v2"]);
    await db.query(liveFormInsert, ["live-form@example.com", "general"]);
    assert.deepEqual(
      (await db.query(`select email, whatsapp from ${table}
        where email in ('consulting-site@example.com', 'live-form@example.com') order by email`)).rows,
      [
        { email: "consulting-site@example.com", whatsapp: null },
        { email: "live-form@example.com", whatsapp: null },
      ],
    );

    for (const role of ["anon", "authenticated"]) {
      await db.exec(`reset role; set role ${role}`);
      await assert.rejects(db.query(`select whatsapp from ${table}`), { code: "42501" });
      await assert.rejects(
        db.query(`insert into ${table} (source, full_name, email, consent_version, whatsapp)
          values ('colombia-summit-2026', 'Anon', $1, 'aiyaiyai-summit-2026-v1', '+573001234567')`, [`${role}@example.com`]),
        { code: "42501" },
      );
      await assert.rejects(
        db.query(`update ${table} set whatsapp = '+573001234567' where email = 'live-form@example.com'`),
        { code: "42501" },
      );
    }
  } finally {
    await db.close();
  }
});

test("database accepts only E.164 WhatsApp numbers or an uncollected null", async () => {
  const db = await existingDatabase();
  try {
    await db.exec(migration());
    await db.exec("set role service_role");
    const insert = `insert into ${table}
      (source, full_name, email, consent_version, ticket_type, whatsapp)
      values ('colombia-summit-2026', 'WhatsApp Attendee', $1, 'aiyaiyai-summit-2026-v1', 'general', $2)`;
    const valid = ["+573001234567", "+14155550100", "+34612345678", "+2901234", "+123456789012345", null];
    for (const [i, whatsapp] of valid.entries()) {
      await db.query(insert, [`valid-${i}@example.com`, whatsapp]);
    }
    for (const invalid of [
      "",
      "3001234567",
      "573001234567",
      "+57 300 123 4567",
      "+57-300-123-4567",
      "+0573001234567",
      "+290123",
      "+1234567890123456",
      "+57300abc4567",
      "+573001234567\n",
      "+573001234567'); drop table x; --",
    ]) {
      await assert.rejects(db.query(insert, ["invalid@example.com", invalid]), { code: "23514" }, invalid);
    }
    assert.equal((await db.query(`select count(*)::int as count from ${table}`)).rows[0].count, valid.length);
  } finally {
    await db.close();
  }
});

test("repeat submissions fill a missing WhatsApp once and never overwrite identity, consent or a number", async () => {
  const db = await existingDatabase();
  try {
    await db.query(consultingInsert, ["returning@example.com", "colombia-summit-2026-v1"]);
    await db.query(liveFormInsert, ["ticketed@example.com", "vip-plus"]);
    await db.exec(migration());
    const original = Object.fromEntries(
      (await db.query(`select * from ${table} order by email`)).rows.map((row) => [row.email, row]),
    );
    await db.exec("set role service_role");

    // Match the app: ignoreDuplicates upsert, then one atomic IS NULL update per answer.
    const submit = async (email, ticket, whatsapp) => {
      const inserted = await db.query(`insert into ${table}
        (source, full_name, email, company, consent_version, linkedin_url, ticket_type, whatsapp)
        values ('colombia-summit-2026', 'Changed Name', $1, 'Changed Company',
          'aiyaiyai-summit-2026-v1', 'https://www.linkedin.com/in/changed/', $2, $3)
        on conflict (email) do nothing returning id`, [email, ticket, whatsapp]);
      if (inserted.rows.length) return "created";
      const ticketAdded = await db.query(`update ${table} set ticket_type = $2
        where email = $1 and ticket_type is null returning id`, [email, ticket]);
      const whatsappAdded = await db.query(`update ${table} set whatsapp = $2
        where email = $1 and whatsapp is null returning id`, [email, whatsapp]);
      return ticketAdded.rows.length || whatsappAdded.rows.length ? "updated" : "already-registered";
    };
    const row = async (email) => (await db.query(`select * from ${table} where email = $1`, [email])).rows[0];

    assert.equal(await submit("returning@example.com", "vip", "+573001234567"), "updated");
    assert.deepEqual(await row("returning@example.com"), {
      ...original["returning@example.com"],
      ticket_type: "vip",
      whatsapp: "+573001234567",
    });
    assert.equal(await submit("returning@example.com", "general", "+14155550100"), "already-registered");
    assert.deepEqual(await row("returning@example.com"), {
      ...original["returning@example.com"],
      ticket_type: "vip",
      whatsapp: "+573001234567",
    });

    assert.equal(await submit("ticketed@example.com", "general", "+525512345678"), "updated");
    assert.deepEqual(await row("ticketed@example.com"), {
      ...original["ticketed@example.com"],
      whatsapp: "+525512345678",
    });

    assert.equal(await submit("new@example.com", "general", "+34612345678"), "created");
    assert.equal(await submit("new@example.com", "vip", "+14155550100"), "already-registered");
    assert.equal((await row("new@example.com")).whatsapp, "+34612345678");
    assert.equal((await db.query(`select count(*)::int as count from ${table}`)).rows[0].count, 3);
  } finally {
    await db.close();
  }
});
