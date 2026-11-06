import Link from "next/link";
import { channels, people, site } from "@/lib/site";
import { Logo } from "./logo";

export const external = { target: "_blank", rel: "noopener noreferrer" };

export function SiteNav() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          <Logo className="logo" />
        </Link>
        <nav className="nav-links" aria-label="Secciones">
          <Link href="/#canales">Canales</Link>
          <Link href="/blog" className="nav-always">
            Blog
          </Link>
          <Link href="/#equipo">Equipo</Link>
        </nav>
        <a href={`${site.substack}/subscribe`} className="btn btn-outline nav-cta" {...external}>
          Suscríbete
        </a>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div>
          <Logo className="logo" />
          <p>{site.tagline}.</p>
        </div>
        <nav aria-label="Canales">
          <p className="footer-head">Canales</p>
          <Link href="/blog">Blog</Link>
          {[...channels]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((channel) => (
              <a key={channel.id} href={channel.href} {...external}>
                {channel.name}
              </a>
            ))}
        </nav>
        <nav aria-label="Equipo">
          <p className="footer-head">Equipo</p>
          {people.map((person) => (
            <a key={person.name} href={person.linkedin} {...external}>
              {person.name}
            </a>
          ))}
        </nav>
        <div>
          <p className="footer-head">Contacto</p>
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
        </div>
      </div>
      <p className="wrap footer-legal">
        © {new Date().getFullYear()} {site.fullName}
      </p>
    </footer>
  );
}
