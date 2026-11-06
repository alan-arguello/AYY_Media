import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allPosts, getPost } from "@/lib/feeds";
import { ogLocale } from "@/lib/seo";
import { formatDate, site } from "@/lib/site";
import { siteUrl } from "@/lib/site-url";
import { external, SiteFooter, SiteNav } from "../../chrome";
import { JsonLd } from "../../json-ld";
import { PostCard, PostCover } from "../post-card";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await allPosts()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  const shared = { title: post.title, description: post.subtitle };
  return {
    ...shared,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      ...shared,
      type: "article",
      locale: ogLocale,
      siteName: site.fullName,
      url: `/blog/${slug}`,
      publishedTime: post.published,
    },
    twitter: { ...shared, card: "summary_large_image" },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const [post, posts] = await Promise.all([getPost(slug), allPosts()]);
  if (!post) notFound();

  const url = `${siteUrl}/blog/${slug}`;
  const organization = { "@id": `${siteUrl}/#organization` };
  const more = posts.filter((other) => other.slug !== slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              "@id": `${url}#article`,
              mainEntityOfPage: url,
              headline: post.title,
              description: post.subtitle,
              image: `${url}/opengraph-image`,
              datePublished: post.published,
              dateModified: post.published,
              inLanguage: "es",
              author: organization,
              publisher: organization,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Inicio", item: `${siteUrl}/` },
                { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
                { "@type": "ListItem", position: 3, name: post.title, item: url },
              ],
            },
          ],
        }}
      />
      <SiteNav />

      <main className="article-page wrap">
        <article>
          <header className="article-head">
            <p className="post-date">
              <Link href="/blog">Blog</Link> ·{" "}
              <time dateTime={post.published}>{formatDate(post.published)}</time>
            </p>
            <h1>{post.title}</h1>
            {post.subtitle && <p className="article-subtitle">{post.subtitle}</p>}
          </header>
          <PostCover post={post} sizes="(max-width: 820px) 100vw, 720px" preload />
          <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
        </article>

        <aside className="subscribe" aria-label="Newsletter">
          <div>
            <h2>Recibe el próximo en tu correo</h2>
            <p>Lo mismo que publicamos aquí, sin costo.</p>
          </div>
          <a href={`${site.substack}/subscribe`} className="btn" {...external}>
            Suscríbete <i aria-hidden="true">→</i>
          </a>
        </aside>

        {more.length > 0 && (
          <section className="more" aria-labelledby="more-title">
            <h2 id="more-title">Sigue leyendo</h2>
            <ul className="post-grid">
              {more.map((other) => (
                <li key={other.slug}>
                  <PostCard post={other} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
