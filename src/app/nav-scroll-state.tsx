"use client";

import { useEffect, useRef } from "react";

// Two flags on <html>, so the nav (a sibling tree) can style itself from CSS
// alone:
//   data-nav-solid      the hero's copy has reached the nav. Until then only
//                       sky sits under the nav and it may stay transparent;
//                       after, it gets its paper background so no text
//                       scrolls under it.
//   data-nav-past-hero  the whole hero has scrolled out; the nav is back over
//                       paper and may be frosted again.
// The sentinel sits at the top of the hero's copy; the hero itself is the
// nearest <section>.
export function NavScrollState() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const sentinel = ref.current;
    const hero = sentinel?.closest("section");
    if (!sentinel || !hero) return;
    const nav = getComputedStyle(root).getPropertyValue("--ds-nav").trim() || "72px";
    const navHeight = parseFloat(nav);
    const options = { rootMargin: `-${nav} 0px 0px 0px`, threshold: 0 };

    const copy = new IntersectionObserver(([entry]) => {
      root.toggleAttribute("data-nav-solid", entry.boundingClientRect.top <= navHeight);
    }, options);
    const whole = new IntersectionObserver(([entry]) => {
      root.toggleAttribute("data-nav-past-hero", entry.boundingClientRect.bottom <= navHeight);
    }, options);
    copy.observe(sentinel);
    whole.observe(hero);
    return () => {
      copy.disconnect();
      whole.disconnect();
      root.removeAttribute("data-nav-solid");
      root.removeAttribute("data-nav-past-hero");
    };
  }, []);

  return <div ref={ref} className="hero-sentinel" aria-hidden="true" />;
}
