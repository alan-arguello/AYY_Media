import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { getSupabaseConfigState } from "../src/lib/supabase/config.ts";

test("accepts both the existing deployment variables and legacy aliases", () => {
  const url = "https://rcvmfvacalolcijkrvsb.supabase.co";
  for (const urlKey of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"]) {
    for (const secretKey of [
      "SUPABASE_SECRET_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ]) {
      assert.deepEqual(
        getSupabaseConfigState({
          [urlKey]: ` ${url} `,
          [secretKey]: " test-secret ",
        }),
        { status: "configured", url, secretKey: "test-secret" },
      );
    }
  }
  assert.equal(getSupabaseConfigState({}).status, "disabled");
  assert.equal(
    getSupabaseConfigState({ NEXT_PUBLIC_SUPABASE_URL: url }).status,
    "misconfigured",
  );
  assert.equal(
    getSupabaseConfigState({ SUPABASE_SECRET_KEY: "test-secret" }).status,
    "misconfigured",
  );
  assert.equal(
    getSupabaseConfigState({
      NEXT_PUBLIC_SUPABASE_URL: " ",
      SUPABASE_URL: url,
      SUPABASE_SECRET_KEY: " ",
      SUPABASE_SERVICE_ROLE_KEY: "legacy-test",
    }).status,
    "configured",
  );
});

test("uses the existing registrations table and keeps keys on the server", () => {
  const source = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
  assert.match(
    source("../src/lib/colombia-summit-persistence.ts"),
    /from\("colombia_summit_interests"\)/,
  );
  assert.doesNotMatch(
    source("../src/lib/colombia-summit-persistence.ts"),
    /bttf_summit_interests/,
  );
  assert.match(
    source("../src/lib/supabase/service-role.ts"),
    /import "server-only"/,
  );
  assert.match(
    source("../.env.example"),
    /NEXT_PUBLIC_SUPABASE_URL=https:\/\/rcvmfvacalolcijkrvsb.supabase.co/,
  );
});
