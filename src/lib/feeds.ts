// The latest videos, with their public view counts, and the essays, read from
// the public YouTube and Substack feeds and refreshed hourly. A regeneration
// that fails keeps the last good page (Next does that when it throws); only the
// build, with no page to keep, falls back to the videos at the end of this file
// and to the essays in content/posts.json, which never depend on Substack.

import { cleanPost } from "./post-html.ts";
import archive from "../content/posts.json" with { type: "json" };

const YOUTUBE_FEED =
  "https://www.youtube.com/feeds/videos.xml?channel_id=UCtt0xtssKYJLoaeZ9pxRvog";
const SUBSTACK_FEED = "https://aiyaiyaimedia.substack.com/feed";
const HOUR = 3600;

export type Video = {
  id: string;
  title: string;
  url: string;
  published: string;
  thumbnail: string;
  views: number;
};

export type Post = {
  slug: string;
  title: string;
  subtitle: string;
  url: string;
  published: string;
  cover: string;
  html: string;
};

const named: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

export function decode(text: string) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(x?)([0-9a-f]+);/gi, (_, hex: string, code: string) =>
      String.fromCodePoint(parseInt(code, hex ? 16 : 10)),
    )
    .replace(/&(amp|lt|gt|quot|apos);/g, (_, name: string) => named[name])
    .trim();
}

const field = (xml: string, tag: string) =>
  decode(xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1] ?? "");

const blocks = (xml: string, tag: string) =>
  [...xml.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g"))].map(
    (match) => match[1],
  );

const lowRes = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const highRes = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

/** Videos only: Shorts are dropped, and so is a series suffix (" | Serie"). */
export function parseYouTube(xml: string): Video[] {
  return blocks(xml, "entry")
    .filter((entry) => !entry.includes("/shorts/"))
    .map((entry) => {
      const id = field(entry, "yt:videoId");
      return {
        id,
        title: field(entry, "title").split(" | ")[0],
        url: `https://www.youtube.com/watch?v=${id}`,
        published: field(entry, "published"),
        thumbnail: lowRes(id),
        views: Number(entry.match(/<media:statistics views="(\d+)"/)?.[1] ?? 0),
      };
    })
    .filter((video) => video.id && video.title);
}

// Some covers come wrapped in Substack's CDN; next/image should resize the original.
const originalCover = (url: string) => {
  const original = url.includes("substackcdn.com")
    ? decodeURIComponent(url.split("/").pop() ?? "")
    : url;
  return original.startsWith("https://substack-post-media.s3.amazonaws.com/public/images/")
    ? original
    : "";
};

const cdata = (xml: string, tag: string) =>
  xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`))?.[1] ?? "";

export function parseSubstack(xml: string, dropIntro: string[] = []): Post[] {
  return blocks(xml, "item")
    .map((item) => {
      const url = field(item, "link");
      const slug = url.split("/p/")[1] ?? "";
      const title = field(item, "title");
      return {
        slug,
        title,
        subtitle: field(item, "description"),
        url,
        published: new Date(field(item, "pubDate")).toISOString(),
        cover: originalCover(item.match(/<enclosure[^>]*url="([^"]+)"/)?.[1] ?? ""),
        html: cleanPost(cdata(item, "content:encoded"), title, {
          dropIntro: dropIntro.includes(slug),
        }),
      };
    })
    .filter((post) => post.slug && post.title && post.html);
}

async function read(url: string) {
  const response = await fetch(url, {
    next: { revalidate: HOUR },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return response.text();
}

const regenerating = () =>
  process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build";

// Not every upload has a 1280px thumbnail, but the 480px one always exists.
async function withSharpThumbnail(video: Video): Promise<Video> {
  try {
    const response = await fetch(highRes(video.id), {
      method: "HEAD",
      next: { revalidate: HOUR },
      signal: AbortSignal.timeout(4000),
    });
    return response.ok ? { ...video, thumbnail: highRes(video.id) } : video;
  } catch {
    return video;
  }
}

export async function latestVideos(count: number) {
  let videos: Video[] = [];
  try {
    videos = parseYouTube(await read(YOUTUBE_FEED));
  } catch (error) {
    if (regenerating()) throw error;
  }
  const older = snapshot.filter((old) => !videos.some((video) => video.id === old.id));
  return Promise.all([...videos, ...older].slice(0, count).map(withSharpThumbnail));
}

const newPosts = async () => {
  const known = new Set(archive.map((post) => post.slug));
  return parseSubstack(await read(SUBSTACK_FEED)).filter((post) => !known.has(post.slug));
};

/** Every essay, newest first: the archive plus whatever Substack has published since. */
export async function allPosts(): Promise<Post[]> {
  const latest = await newPosts().catch(() => []);
  return [...latest, ...archive].sort((a, b) => b.published.localeCompare(a.published));
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return (
    archive.find((post) => post.slug === slug) ??
    (await newPosts()).find((post) => post.slug === slug)
  );
}

const video = (id: string, title: string, published: string, views: number): Video => ({
  id,
  title,
  url: `https://www.youtube.com/watch?v=${id}`,
  published,
  thumbnail: lowRes(id),
  views,
});

const snapshot = [
  video("32Xgaz-_m18", "Si la IA escribe el código, ¿para qué te contratan?", "2026-11-06T17:00:00Z", 807),
  video("6wGW-OozM9I", "¿Ir a la universidad demuestra menos pensamiento crítico?", "2026-11-05T17:00:00Z", 2196),
  video("Vqs-geyryLc", "Torrenegra presenta Doco: ¿OpenAI se lo va a comer?", "2026-11-03T17:00:00Z", 6554),
  video("22vBztRoAHk", "Ir a la universidad a estudiar Ingeniería de Software es un GRAVE error", "2026-10-31T17:00:00Z", 11533),
  video("zQ2xuv_-CEA", "Si la IA ya programa, ¿para qué contratar ingenieros?", "2026-10-29T17:00:00Z", 6761),
  video("R1NLZ33mFMA", "¿Está mal trabajar solo por dinero?", "2026-10-28T17:00:00Z", 1726),
];
