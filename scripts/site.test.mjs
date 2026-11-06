import assert from "node:assert/strict";
import test from "node:test";
import { channels, formatCount, formatViews, people, thousandsOfFollowers } from "../src/lib/site.ts";

test("shows each channel's audience in compact form", () => {
  assert.deepEqual(
    channels.map((channel) => [channel.name, formatCount(channel.count)]),
    [
      ["Instagram", "32.8K"],
      ["LinkedIn", "22.6K"],
      ["Substack", "5.1K"],
      ["YouTube", "1.5K"],
    ],
  );
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
