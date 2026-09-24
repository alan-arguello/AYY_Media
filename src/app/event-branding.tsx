import Image from "next/image";
import { TorrenegraMark } from "@/components/torrenegra-mark";
import { colombiaSummit } from "@/lib/colombia-summit";

export function EventOrganizer() {
  return (
    <a
      href={colombiaSummit.channel}
      target="_blank"
      rel="noopener noreferrer"
      className="cs-organizer"
      aria-label="AIYaiYai, organizador. Ver canal de YouTube (nueva pestaña)"
    >
      <Image
        src="/images/colombia-summit/aiyaiyai.png"
        alt=""
        width={110}
        height={34}
        priority
      />
      <span>
        <small>Organiza</small>
        <strong>AIYaiYai</strong>
      </span>
    </a>
  );
}

export function EventSponsors() {
  return (
    <section className="cs-sponsors cs-shell" aria-labelledby="sponsors-title">
      <h2 id="sponsors-title">Sponsors</h2>
      <div
        className="cs-hosts"
        aria-label="Sponsors: Torrenegra & Co, Torre.ai y Worder"
      >
        <a
          href="https://www.torrenegra.com"
          className="cs-brand"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Torrenegra & Co (nueva pestaña)"
        >
          <TorrenegraMark />
          <span>Torrenegra &amp; Co</span>
        </a>
        <span className="cs-host-divider" aria-hidden="true" />
        <a
          href="https://torre.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="cs-torre-brand"
          aria-label="Torre.ai (nueva pestaña)"
        >
          <Image
            src="/images/colombia-summit/credential-torre-ai.png"
            alt="Torre.ai"
            width={100}
            height={24}
          />
        </a>
        <span className="cs-host-divider" aria-hidden="true" />
        <span className="cs-worder-brand">
          <Image
            src="/images/colombia-summit/worder.png"
            alt="Worder"
            width={116}
            height={30}
          />
        </span>
      </div>
    </section>
  );
}
