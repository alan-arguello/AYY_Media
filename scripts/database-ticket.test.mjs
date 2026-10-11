import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const sql = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const table = "public.colombia_summit_interests";

async function existingDatabase() {
  const db = new PGlite();
  await db.exec(
    "create role anon; create role authenticated; create role service_role bypassrls;",
  );
  for (const path of [
    "./fixtures/20260924025758_colombia_summit_interests.sql",
    "./fixtures/20260924171537_colombia_summit_linkedin_and_cohosts.sql",
    "../supabase/migrations/20260924184338_colombia_summit_aiyaiyai_consent.sql",
  ]) {
    await db.exec(sql(path));
  }
  // The existing live service role has table privileges; migration must retain them.
  await db.exec(`grant all on ${table} to service_role`);
  return db;
}

const migration = () =>
  sql("../supabase/migrations/20261011045427_colombia_summit_ticket_type.sql");

const legacyInsert = `insert into ${table}
  (source, full_name, email, company, consent_version, linkedin_url)
  values ('colombia-summit-2026', 'Original Attendee', $1, 'Original Company', $2, '')`;

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

test("ticket migration preserves historical rows, old forms and access controls", async () => {
  const db = await existingDatabase();
  try {
    for (const [email, consent] of [
      ["old-v1@example.com", "colombia-summit-2026-v1"],
      ["old-v2@example.com", "colombia-summit-2026-v2"],
      ["old-current@example.com", "aiyaiyai-summit-2026-v1"],
    ]) {
      await db.query(legacyInsert, [email, consent]);
    }
    const before = (await db.query(`select * from ${table} order by email`)).rows;
    const accessBefore = await accessState(db);
    await db.exec(migration());
    const after = (await db.query(`select * from ${table} order by email`)).rows;
    assert.deepEqual(after, before.map((row) => ({ ...row, ticket_type: null })));
    assert.deepEqual(await accessState(db), accessBefore);
    assert.equal(accessBefore.rls[0].relrowsecurity, true);
    assert.deepEqual(accessBefore.policies, []);

    const column = (
      await db.query(`select is_nullable, column_default
        from information_schema.columns
        where table_schema = 'public' and table_name = 'colombia_summit_interests'
          and column_name = 'ticket_type'`)
    ).rows[0];
    assert.deepEqual(column, { is_nullable: "YES", column_default: null });

    await db.exec("set role service_role");
    await db.query(legacyInsert, ["old-form@example.com", "colombia-summit-2026-v2"]);
    assert.equal(
      (await db.query(`select ticket_type from ${table} where email = 'old-form@example.com'`)).rows[0].ticket_type,
      null,
    );

    for (const role of ["anon", "authenticated"]) {
      await db.exec(`reset role; set role ${role}`);
      await assert.rejects(db.query(`select * from ${table}`), { code: "42501" });
      await assert.rejects(
        db.query(legacyInsert, [`${role}@example.com`, "aiyaiyai-summit-2026-v1"]),
        { code: "42501" },
      );
      await assert.rejects(
        db.query(`update ${table} set ticket_type = 'vip' where email = 'old-form@example.com'`),
        { code: "42501" },
      );
    }
  } finally {
    await db.close();
  }
});

test("database accepts only the three ticket preferences or an uncollected null", async () => {
  const db = await existingDatabase();
  try {
    await db.exec(migration());
    await db.exec("set role service_role");
    const insert = `insert into ${table}
      (source, full_name, email, consent_version, ticket_type)
      values ('colombia-summit-2026', 'Ticket Attendee', $1, 'aiyaiyai-summit-2026-v1', $2)`;
    for (const ticket of ["general", "vip", "vip-plus", null]) {
      await db.query(insert, [`${ticket ?? "uncollected"}@example.com`, ticket]);
    }
    for (const invalid of ["", "VIP", "vip plus", "vip-plus ", "admin", "vip'); drop table x; --"]) {
      await assert.rejects(db.query(insert, ["invalid@example.com", invalid]), { code: "23514" });
    }
    assert.equal((await db.query(`select count(*)::int as count from ${table}`)).rows[0].count, 4);
  } finally {
    await db.close();
  }
});

test("repeat submissions only fill an uncollected preference and never overwrite identity or consent", async () => {
  const db = await existingDatabase();
  try {
    await db.query(legacyInsert, ["returning@example.com", "colombia-summit-2026-v1"]);
    await db.exec(migration());
    const original = (await db.query(`select * from ${table} where email = 'returning@example.com'`)).rows[0];
    await db.exec("set role service_role");

    // Match ignoreDuplicates upsert, then the atomic WHERE ticket_type IS NULL update.
    const submit = async (email, ticket) => {
      const inserted = await db.query(`insert into ${table}
        (source, full_name, email, company, consent_version, linkedin_url, ticket_type)
        values ('colombia-summit-2026', 'Changed Name', $1, 'Changed Company',
          'aiyaiyai-summit-2026-v1', 'https://www.linkedin.com/in/changed/', $2)
        on conflict (email) do nothing returning id`, [email, ticket]);
      if (inserted.rows.length) return "created";
      const updated = await db.query(`update ${table} set ticket_type = $2
        where email = $1 and ticket_type is null returning id`, [email, ticket]);
      return updated.rows.length ? "ticket-added" : "already-registered";
    };

    assert.equal(await submit("returning@example.com", "vip"), "ticket-added");
    assert.deepEqual(
      (await db.query(`select * from ${table} where email = 'returning@example.com'`)).rows[0],
      { ...original, ticket_type: "vip" },
    );
    assert.equal(await submit("returning@example.com", "vip-plus"), "already-registered");
    assert.deepEqual(
      (await db.query(`select * from ${table} where email = 'returning@example.com'`)).rows[0],
      { ...original, ticket_type: "vip" },
    );
    assert.equal(await submit("new@example.com", "general"), "created");
    assert.equal(await submit("new@example.com", "vip"), "already-registered");
    assert.equal(
      (await db.query(`select ticket_type from ${table} where email = 'new@example.com'`)).rows[0].ticket_type,
      "general",
    );
    assert.equal((await db.query(`select count(*)::int as count from ${table}`)).rows[0].count, 2);
  } finally {
    await db.close();
  }
});
