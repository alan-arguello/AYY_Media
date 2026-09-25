import Image from "next/image";
import { TorrenegraMark } from "@/components/torrenegra-mark";
import { colombiaSummit } from "@/lib/colombia-summit";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export function EventOrganizer() {
  return (
    <a
      href={colombiaSummit.channel}
      {...external}
      className="lp-organizer"
      aria-label="AIYaiYai, organizador. Ver canal de YouTube (nueva pestaña)"
    >
      <span>Organiza</span>
      <Image
        src="/images/colombia-summit/aiyaiyai.png"
        alt=""
        width={72}
        height={22}
        className="lp-mono-logo"
      />
    </a>
  );
}

export function EventSponsors() {
  return (
    <section className="ds-band" id="sponsors" aria-labelledby="sponsors-title">
      <div className="ds-frame lp-wall">
        <div className="lp-wall-head">
          <h2 id="sponsors-title">
            Organiza AIYaiYai, con el apoyo de Torrenegra &amp; Co, Torre.ai y
            Worder
          </h2>
          <p>Bogotá, Colombia · 19.11.2026</p>
        </div>
        <ul className="lp-wall-grid lp-sponsors">
          <li>
            <a
              href={colombiaSummit.channel}
              {...external}
              aria-label="AIYaiYai, organizador (nueva pestaña)"
            >
              <Image
                src="/images/colombia-summit/aiyaiyai.png"
                alt="AIYaiYai"
                width={132}
                height={40}
                className="lp-mono-logo"
              />
            </a>
            <span className="lp-wall-caption">Organiza</span>
          </li>
          <li>
            <a
              href="https://www.torrenegra.com"
              {...external}
              aria-label="Torrenegra & Co (nueva pestaña)"
              className="lp-torrenegra"
            >
              <TorrenegraMark />
              <span>Torrenegra &amp; Co</span>
            </a>
            <span className="lp-wall-caption">Sponsor</span>
          </li>
          <li>
            <a href="https://torre.ai" {...external} aria-label="Torre.ai (nueva pestaña)">
              <Image
                src="/images/colombia-summit/credential-torre-ai.png"
                alt="Torre.ai"
                width={132}
                height={28}
                className="lp-mono-logo"
              />
            </a>
            <span className="lp-wall-caption">Sponsor</span>
          </li>
          <li>
            <Image
              src="/images/colombia-summit/worder.png"
              alt="Worder"
              width={140}
              height={32}
              className="lp-mono-logo"
            />
            <span className="lp-wall-caption">Sponsor</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
