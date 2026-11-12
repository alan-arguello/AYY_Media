import assert from "node:assert/strict";
import test from "node:test";
import { channels, formatCount, formatReach, formatViews, millionsOfViews, people, thousandsOfFollowers } from "../src/lib/site.ts";

test("shows each channel's reach and audience in compact form", () => {
  assert.deepEqual(
    channels.map(({ name, views, count }) => [name, formatReach(views), formatCount(count)]),
    [
      ["Instagram", "1.07M", "32.9K"],
      ["LinkedIn", "379.8K", "22.6K"],
      ["YouTube", "167.1K", "1.5K"],
      ["Substack", "34.6K", "5.1K"],
    ],
  );
});

test("the headline reach never rounds up", () => {
  assert.equal(millionsOfViews([{ ...channels[0], views: 1_299_999 }]), 1.2);
});

test("view counts are cut, not rounded, so they never exceed YouTube's", () => {
  assert.deepEqual([807, 6554, 11533, 1_250_000].map(formatViews), ["807", "6.5K", "11.5K", "1.2M"]);
});

test("the headline total never rounds up", () => {
  assert.equal(thousandsOfFollowers(), 62);
  assert.equal(thousandsOfFollowers([{ ...channels[0], count: 1999 }]), 1);
});

test("every channel and person links out over https", () => {
  for (const { href } of channels) assert.match(href, /^https:\/\//);
  for (const { linkedin } of people) assert.match(linkedin, /^https:\/\/www\.linkedin\.com\/in\//);
});
