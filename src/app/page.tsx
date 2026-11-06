import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { allPosts, latestVideos } from "@/lib/feeds";
import { pageMetadata } from "@/lib/seo";
import {
  channels,
  formatCount,
  formatDate,
  formatReach,
  formatViews,
  millionsOfViews,
  people,
  site,
  thousandsOfFollowers,
  viewsMeasured,
} from "@/lib/site";
import { ChannelIcon } from "./channel-icon";
import { external, SiteFooter, SiteNav } from "./chrome";

// Re-read the feeds at most once an hour. The daily cron (vercel.json) covers
// the days nobody visits.
export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({ path: "/" });

export default async function Home() {
  const [videos, posts] = await Promise.all([latestVideos(6), allPosts()]);
  const [newest] = videos;

  return (
    <>
      <SiteNav />

      <main>
        <section className="hero wrap">
          <a href={newest.url} className="announce" {...external}>
            <b>Nuevo</b>
            <span>{newest.title}</span>
            <i aria-hidden="true">›</i>
          </a>
          <h1>
            Tecnología, emprendimiento
            <br />
            <span>e inteligencia artificial</span>
          </h1>
          <p className="lead">
            {site.name} es una media company. Compartimos conocimiento y debatimos
            lo que está pasando en tecnología, en video y por escrito.
          </p>
          <div className="actions">
            <Link href="/blog" className="link">
              Leer el blog <i aria-hidden="true">→</i>
            </Link>
            <a href={site.youtube} className="btn" {...external}>
              Ver en YouTube <i aria-hidden="true">→</i>
            </a>
          </div>

          <h2 className="sr-only">Videos recientes</h2>
          <ul className="videos">
            {videos.map((video, index) => (
              <li key={video.id}>
                <a href={video.url} className="video" {...external}>
                  <span className="video-thumb">
                    <Image
                      src={video.thumbnail}
                      alt=""
                      fill
                      sizes="(max-width: 820px) 78vw, 330px"
                      preload={index === 0}
                      fetchPriority={index === 0 ? "high" : undefined}
                    />
                  </span>
                  <span className="video-title">{video.title}</span>
                  <span className="video-meta">
                    {video.views > 0 && `${formatViews(video.views)} vistas · `}
                    {formatDate(video.published)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="band" id="canales" aria-labelledby="canales-title">
          <div className="wrap">
            <h2 id="canales-title">
              Más de {millionsOfViews()} millones de vistas en 90 días
              <br />
              <span>y {thousandsOfFollowers()} mil seguidores en cuatro canales</span>
            </h2>
            <ul className="channels">
              {channels.map((channel) => (
                <li key={channel.id}>
                  <a href={channel.href} className="channel" {...external}>
                    <span className="channel-top">
                      <span className="channel-name">
                        <ChannelIcon id={channel.id} />
                        {channel.name}
                      </span>
                      <i aria-hidden="true">↗</i>
                    </span>
                    <span className="channel-count">{formatReach(channel.views)}</span>
                    <span className="channel-label">{channel.viewsUnit}</span>
                    <span className="channel-audience">
                      {formatCount(channel.count)} {channel.unit}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="channels-note">
              Alcance orgánico de los últimos 90 días, medido el {viewsMeasured}.
            </p>
          </div>
        </section>

        <section className="section wrap split" aria-labelledby="blog-title">
          <div>
            <h2 id="blog-title">
              <span>Lo último</span>
              <br />
              en el blog
            </h2>
            <div className="split-actions">
              <a href={`${site.substack}/subscribe`} className="btn" {...external}>
                Suscríbete <i aria-hidden="true">→</i>
              </a>
              <Link href="/blog" className="link">
                Ver todos <i aria-hidden="true">→</i>
              </Link>
            </div>
          </div>
          <ul className="posts">
            {posts.slice(0, 4).map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="post">
                  <span className="post-title">{post.title}</span>
                  <span className="post-date">{formatDate(post.published)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="section section-people wrap" id="equipo" aria-labelledby="equipo-title">
          <h2 id="equipo-title">
            Las personas
            <br />
            <span>detrás de {site.name}</span>
          </h2>
          {people.map((person) => (
            <a key={person.name} href={person.linkedin} className="person" {...external}>
              <span className="person-photo">
                <Image src={person.image} alt={person.name} fill sizes="(max-width: 820px) 46vw, 330px" />
              </span>
              <span className="person-name">
                {person.name} <i aria-hidden="true">↗</i>
              </span>
              <span className="person-role">{person.role}</span>
            </a>
          ))}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
