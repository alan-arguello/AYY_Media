import type { Metadata } from "next";
import Link from "next/link";
import { allPosts } from "@/lib/feeds";
import { pageMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/site";
import { SiteFooter, SiteNav } from "../chrome";
import { PostCard, PostCover } from "./post-card";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Blog de tecnología, emprendimiento e IA",
  description:
    "Ensayos de AIYaiYai sobre inteligencia artificial, tecnología y emprendimiento: agentes, modelos, robótica y cómo adoptar IA en una empresa.",
  path: "/blog",
});

export default async function Blog() {
  const [latest, ...rest] = await allPosts();

  return (
    <>
      <SiteNav />

      <main className="blog wrap">
        <h1>
          Lo que pensamos sobre tecnología,
          <br />
          <span>emprendimiento e inteligencia artificial</span>
        </h1>

        <Link href={`/blog/${latest.slug}`} className="featured">
          <PostCover post={latest} sizes="(max-width: 820px) 100vw, 590px" preload />
          <span className="featured-text">
            <span className="post-date">{formatDate(latest.published)}</span>
            <span className="featured-title">{latest.title}</span>
            <span className="featured-subtitle">{latest.subtitle}</span>
            <span className="link">
              Leer <i aria-hidden="true">→</i>
            </span>
          </span>
        </Link>

        <h2 className="sr-only">Más artículos</h2>
        <ul className="post-grid">
          {rest.map((post) => (
            <li key={post.slug}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      </main>

      <SiteFooter />
    </>
  );
}
