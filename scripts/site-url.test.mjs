import assert from "node:assert/strict";
import test from "node:test";
import { getSiteUrl } from "../src/lib/site-url.ts";

test("uses SITE_URL, then Vercel's production URL, then localhost", () => {
  assert.equal(getSiteUrl({ SITE_URL: "https://aiyaiyai.io/" }), "https://aiyaiyai.io");
  assert.equal(getSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "aiyaiyai.io" }), "https://aiyaiyai.io");
  assert.equal(getSiteUrl({}), "http://localhost:3105");
});

test("rejects a SITE_URL with a path", () => {
  assert.throws(() => getSiteUrl({ SITE_URL: "https://aiyaiyai.io/media" }));
});
