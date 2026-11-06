// Writes src/content/posts.json: the essays as they appear on the site, cleaned
// of what only makes sense in an email. Posts in this file are served from here
// and never change on their own; new ones come from the feed until the next run.
//   npm run posts
import { writeFile } from "node:fs/promises";
import { parseSubstack } from "../src/lib/feeds.ts";

// Their text before the first rule is a note to subscribers, not the article.
const DROP_INTRO = [
  "cursos-no-tokens",
  "por-que-un-llm-no-deberia-ser-todo",
  "estamos-en-una-burbuja-de-inteligencia",
];

const response = await fetch("https://aiyaiyaimedia.substack.com/feed");
if (!response.ok) throw new Error(`The feed answered ${response.status}`);
const posts = parseSubstack(await response.text(), DROP_INTRO);
await writeFile("src/content/posts.json", `${JSON.stringify(posts, null, 2)}\n`);
console.log(`src/content/posts.json: ${posts.length} posts`);
