import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { getSiteUrl } from "../src/lib/site-url.ts";
import { colombiaSummit } from "../src/lib/colombia-summit.ts";

test("deployment origin is configurable and never points to the old website", () => {
  assert.equal(getSiteUrl({}), "http://localhost:3105");
  assert.equal(
    getSiteUrl({ SITE_URL: "https://summit.example.com/" }),
    "https://summit.example.com",
  );
  assert.equal(
    getSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "summit.vercel.app" }),
    "https://summit.vercel.app",
  );
  for (const SITE_URL of [
    "javascript:alert(1)",
    "https://a.com/path",
    "https://user:pass@a.com",
    "https://a.com?tracking=1",
  ]) {
    assert.throws(() => getSiteUrl({ SITE_URL }));
  }
});

test("organizer and sponsor assets are included locally", () => {
  assert.equal(
    colombiaSummit.channel,
    "https://www.youtube.com/@aiyaiyaimedia",
  );
  for (const file of [
    "aiyaiyai.png",
    "worder.png",
    "credential-torre-ai.png",
    "opengraph.png",
  ]) {
    assert.ok(
      existsSync(
        new URL(`../public/images/colombia-summit/${file}`, import.meta.url),
      ),
    );
  }
  const page = readFileSync(
    new URL("../src/app/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(page, /EventOrganizer/);
  assert.match(page, /EventSponsors/);
  assert.match(page, /AIYaiYai en YouTube/);
  assert.doesNotMatch(page, /EventHosts|@\/lib\/seo|@\/components\/marketing/);
});
