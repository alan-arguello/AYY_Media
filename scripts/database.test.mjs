import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

test("existing table keeps historical consent, deduplication and access rules", async () => {
  const db = new PGlite();
  const sql = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
  try {
    await db.exec(
      "create role anon; create role authenticated; create role service_role bypassrls;",
    );
    await db.exec(
      sql("./fixtures/20260924025758_colombia_summit_interests.sql"),
    );
    await db.exec(
      sql("./fixtures/20260924171537_colombia_summit_linkedin_and_cohosts.sql"),
    );
    // Match the existing project's service role; the upgrade must not change grants.
    await db.exec(
      "grant all on public.colombia_summit_interests to service_role;",
    );
    const insert =
      "insert into public.colombia_summit_interests (source,full_name,email,consent_version,linkedin_url) values ('colombia-summit-2026','QA Test',$1,$2,$3) on conflict (email) do nothing";
    await db.query(insert, ["old1@example.com", "colombia-summit-2026-v1", ""]);
    await db.query(insert, ["old2@example.com", "colombia-summit-2026-v2", ""]);
    const before = (
      await db.query(
        "select * from public.colombia_summit_interests order by email",
      )
    ).rows;
    const grants =
      "select grantee,privilege_type from information_schema.role_table_grants where table_name='colombia_summit_interests' order by grantee,privilege_type";
    const grantsBefore = (await db.query(grants)).rows;
    await db.exec(
      sql(
        "../supabase/migrations/20260924184338_colombia_summit_aiyaiyai_consent.sql",
      ),
    );
    assert.deepEqual(
      (
        await db.query(
          "select * from public.colombia_summit_interests order by email",
        )
      ).rows,
      before,
    );
    assert.deepEqual((await db.query(grants)).rows, grantsBefore);
    assert.equal(
      (
        await db.query(
          "select to_regclass('public.bttf_summit_interests') as unwanted_table",
        )
      ).rows[0].unwanted_table,
      null,
    );
    assert.equal(
      (
        await db.query(
          "select relrowsecurity from pg_class where relname='colombia_summit_interests'",
        )
      ).rows[0].relrowsecurity,
      true,
    );
    await db.exec("set role service_role");
    await db.query(insert, ["old1@example.com", "aiyaiyai-summit-2026-v1", ""]);
    assert.equal(
      (
        await db.query(
          "select consent_version from public.colombia_summit_interests where email='old1@example.com'",
        )
      ).rows[0].consent_version,
      "colombia-summit-2026-v1",
    );
    await db.query(insert, [
      "new@example.com",
      "aiyaiyai-summit-2026-v1",
      "https://www.linkedin.com/in/test/",
    ]);
    await db.query(insert, [
      "current-site@example.com",
      "colombia-summit-2026-v2",
      "",
    ]);
    assert.equal(
      (
        await db.query(
          "select count(*)::int as count from public.colombia_summit_interests",
        )
      ).rows[0].count,
      4,
    );
    await assert.rejects(
      db.query(insert, ["bad@example.com", "unknown-consent", ""]),
      { code: "23514" },
    );
    await assert.rejects(
      db.query(insert, [
        "bad@example.com",
        "aiyaiyai-summit-2026-v1",
        "https://example.com/",
      ]),
      { code: "23514" },
    );
    await db.exec("reset role; set role anon;");
    await assert.rejects(
      db.exec("select * from public.colombia_summit_interests"),
      { code: "42501" },
    );
    await assert.rejects(
      db.query(insert, ["anon@example.com", "aiyaiyai-summit-2026-v1", ""]),
      { code: "42501" },
    );
    await db.exec("reset role; set role authenticated;");
    await assert.rejects(
      db.exec("select * from public.colombia_summit_interests"),
      { code: "42501" },
    );
  } finally {
    await db.close();
  }
});
