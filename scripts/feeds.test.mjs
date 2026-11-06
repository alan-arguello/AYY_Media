import assert from "node:assert/strict";
import test from "node:test";
import { allPosts, decode, getPost, latestVideos, parseSubstack, parseYouTube } from "../src/lib/feeds.ts";

const youtube = `<feed>
<entry><yt:videoId>abc123</yt:videoId><title>¿IA &amp; empleo? Lo que viene | Tendencias de mercado</title>
<link rel="alternate" href="https://www.youtube.com/watch?v=abc123"/><published>2026-11-06T17:00:00+00:00</published>
<media:group><media:title>¿IA &amp; empleo? Lo que viene | Tendencias de mercado</media:title>
<media:community><media:starRating count="12" average="5.00" min="1" max="5"/><media:statistics views="6554"/></media:community></media:group></entry>
<entry><yt:videoId>short1</yt:videoId><title>Un short</title>
<link rel="alternate" href="https://www.youtube.com/shorts/short1"/><published>2026-11-05T17:00:00+00:00</published></entry>
</feed>`;

const item = (slug, title, date, cover) => `<item><title><![CDATA[${title}]]></title><description><![CDATA[Un subt&#237;tulo]]></description>
<link>https://aiyaiyaimedia.substack.com/p/${slug}</link><pubDate>${date}</pubDate>
<enclosure url="${cover}" length="0" type="image/jpeg"/><content:encoded><![CDATA[<p>Texto &amp; m&#225;s</p>]]></content:encoded></item>`;
const s3 = "https://substack-post-media.s3.amazonaws.com/public/images/a_1600x900.jpeg";
const substack = `<rss><channel><title><![CDATA[AIYaiYai]]></title>
${item("cursos-no-tokens", "Cursos, no tokens", "Fri, 30 Oct 2026 14:00:00 GMT", s3)}</channel></rss>`;

test("reads videos, without Shorts or the series suffix", () => {
  const videos = parseYouTube(youtube);
  assert.equal(videos.length, 1);
  assert.equal(videos[0].title, "¿IA & empleo? Lo que viene");
  assert.equal(videos[0].url, "https://www.youtube.com/watch?v=abc123");
  assert.equal(videos[0].published, "2026-11-06T17:00:00+00:00");
  assert.equal(videos[0].thumbnail, "https://i.ytimg.com/vi/abc123/hqdefault.jpg");
  assert.equal(videos[0].views, 6554);
});

test("a feed without view counts gives zero, not an error", () => {
  const [video] = parseYouTube(youtube.replace(/<media:community>.*<\/media:community>/, ""));
  assert.equal(video.views, 0);
});

test("reads essays from the Substack feed, not the feed's own title", () => {
  assert.deepEqual(parseSubstack(substack), [
    {
      slug: "cursos-no-tokens",
      title: "Cursos, no tokens",
      subtitle: "Un subtítulo",
      url: "https://aiyaiyaimedia.substack.com/p/cursos-no-tokens",
      published: "2026-10-30T14:00:00.000Z",
      cover: s3,
      html: "<p>Texto &amp; más</p>",
    },
  ]);
});

test("covers wrapped in Substack's CDN are unwrapped; unknown hosts are left out", () => {
  const cover = (url) => parseSubstack(item("x", "T", "Fri, 30 Oct 2026 14:00:00 GMT", url))[0].cover;
  assert.equal(cover(`https://substackcdn.com/image/fetch/$s_!a!,f_auto/${encodeURIComponent(s3)}`), s3);
  assert.equal(cover("https://example.com/a.jpg"), "");
});

test("decodes entities and CDATA", () => {
  assert.equal(decode("&quot;Hola&#39;s&quot; &amp; &#x26;"), `"Hola's" & &`);
  assert.equal(decode("<![CDATA[ Cursos ]]>"), "Cursos");
});

test("an unexpected feed gives no items instead of failing", () => {
  assert.deepEqual(parseYouTube("<html>Error</html>"), []);
  assert.deepEqual(parseSubstack(""), []);
});

test("the page still has content when both feeds are down", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    throw new Error("network down");
  });
  const videos = await latestVideos(6);
  const posts = await allPosts();
  assert.equal(videos.length, 6);
  assert.ok(posts.length >= 7);
  assert.match(videos[0].thumbnail, /hqdefault\.jpg$/);
  assert.ok(videos.every((video) => video.views > 0));
});

test("uses the sharp thumbnail only when it exists", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (options?.method === "HEAD") return new Response(null, { status: 404 });
    return new Response(String(url).includes("youtube") ? youtube : "");
  });
  const [video] = await latestVideos(3);
  assert.equal(video.title, "¿IA & empleo? Lo que viene");
  assert.match(video.thumbnail, /hqdefault\.jpg$/);
});

test("a regeneration throws, so Next keeps the last good page", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    throw new Error("network down");
  });
  const env = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  t.after(() => {
    process.env.NODE_ENV = env;
  });
  await assert.rejects(latestVideos(6));
  // Without Substack the essays in the archive are still all there.
  assert.ok((await allPosts()).length >= 7);
});

test("new essays join the archive, newest first, and the archive keeps its edits", async (t) => {
  const newest = item("nuevo", "Nuevo", "Mon, 30 Nov 2026 14:00:00 GMT", s3);
  const edited = item("cursos-no-tokens", "Otro título", "Fri, 30 Oct 2026 14:00:00 GMT", s3);
  t.mock.method(globalThis, "fetch", async () => new Response(`<rss>${newest}${edited}</rss>`));
  const posts = await allPosts();
  assert.equal(posts[0].slug, "nuevo");
  assert.equal(posts.find((post) => post.slug === "cursos-no-tokens").title, "Cursos, no tokens");
  assert.equal((await getPost("nuevo")).title, "Nuevo");
  assert.equal(await getPost("no-existe"), undefined);
});

test("a short feed is topped up from the snapshot, without repeats", async (t) => {
  const repeat = youtube.replaceAll("abc123", "32Xgaz-_m18");
  t.mock.method(globalThis, "fetch", async (url, options) =>
    options?.method === "HEAD" ? new Response(null, { status: 404 }) : new Response(repeat),
  );
  const videos = await latestVideos(6);
  assert.equal(videos.length, 6);
  assert.equal(videos[0].views, 6554);
  assert.equal(new Set(videos.map((video) => video.id)).size, 6);
});
