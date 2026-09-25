import { ArrowUpRight } from "lucide-react";

// Design-system primitives. Styles live in src/app/design-system.css.

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
  external?: boolean;
  icon?: React.ReactNode;
  className?: string;
  label?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  external = false,
  icon,
  className,
  label,
}: ButtonProps) {
  return (
    <a
      href={href}
      className={["ds-button", className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-size={size}
      aria-label={label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      {icon ?? (external ? <ArrowUpRight aria-hidden="true" /> : null)}
    </a>
  );
}

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "white" | "glass";
  className?: string;
}) {
  return (
    <span
      className={["ds-pill", className].filter(Boolean).join(" ")}
      data-tone={tone}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="ds-heading">
      <div>
        <p className="ds-eyebrow">{eyebrow}</p>
        <h2 id={id} className="ds-display-m">
          {title}
        </h2>
      </div>
      {children && <div className="ds-heading-aside">{children}</div>}
    </header>
  );
}

// An exponential curve with its leading point: acceleration in one stroke.
export function LogoMark({ word = true }: { word?: boolean }) {
  return (
    <span className="ds-logo">
      <svg viewBox="0 0 26 20" aria-hidden="true">
        <path
          d="M1 18.5 C 11 18.5, 17 15, 23.5 2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="23.5" cy="2.5" r="2.3" />
      </svg>
      {word && <span className="ds-logo-word">Accelerating LATAM Summit</span>}
    </span>
  );
}
