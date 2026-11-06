import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteNav } from "./chrome";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="missing wrap">
        <h1>
          Esta página
          <br />
          <span>no existe</span>
        </h1>
        <Link href="/" className="btn">
          Ir al inicio <i aria-hidden="true">→</i>
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
