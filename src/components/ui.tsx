import { ArrowUpRight } from "lucide-react";

// Design-system primitives. Styles live in src/app/design-system.css.

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
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

export function Tag({
  children,
  dot = false,
  live = false,
  chip = false,
  className,
}: {
  children: React.ReactNode;
  dot?: boolean;
  live?: boolean;
  /** Paper chip behind the label, for labels laid over art. */
  chip?: boolean;
  className?: string;
}) {
  return (
    <span
      className={["ds-tag", className].filter(Boolean).join(" ")}
      data-chip={chip || undefined}
    >
      {(dot || live) && (
        <span
          className="ds-tag-dot"
          data-live={live || undefined}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export function SectionHeading({
  id,
  tag,
  title,
  children,
  level = "h2",
}: {
  id: string;
  tag: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  /** h1 when the heading opens a page of its own. */
  level?: "h1" | "h2";
}) {
  const Heading = level;
  return (
    <header className="ds-heading">
      <Tag>{tag}</Tag>
      <Heading id={id} className={level === "h1" ? "ds-display-xl" : "ds-display-l"}>
        {title}
      </Heading>
      {children && <p className="ds-lead">{children}</p>}
    </header>
  );
}

const PIXEL_PALETTE: Record<string, string> = {
  k: "#131316", // ink
  d: "#34343a", // dark
  m: "#8a8a92", // mid grey
  g: "#dcdad3", // light grey
  w: "#ffffff",
  b: "#b4482a", // brick
  a: "#c9765c", // light brick
  l: "#e3a58f", // pale brick
  y: "#f3e5df", // highlight
  r: "#b4482a", // accent (brick)
};

// Renders a bitmap (one string per row, one character per pixel, "." for
// empty) as crisp SVG squares. Horizontal runs merge into one rect each.
export function PixelArt({
  rows,
  size,
  className,
}: {
  rows: readonly string[];
  size: number;
  className?: string;
}) {
  const width = Math.max(...rows.map((row) => row.length));
  const rects: React.ReactNode[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const key = row[x];
      let run = 1;
      while (row[x + run] === key) run++;
      if (key !== "." && PIXEL_PALETTE[key])
        rects.push(
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={run}
            height={1}
            fill={PIXEL_PALETTE[key]}
          />,
        );
      x += run;
    }
  });
  return (
    <svg
      className={["ds-pixel-art", className].filter(Boolean).join(" ")}
      viewBox={`0 0 ${width} ${rows.length}`}
      width={size}
      height={(size * rows.length) / width}
      aria-hidden="true"
    >
      {rects}
    </svg>
  );
}

// An exponential curve drawn in pixels, its leading point in red:
// acceleration in one stroke.
const MARK = [
  ".......r",
  "......k.",
  "......k.",
  ".....k..",
  "....k...",
  "..kk....",
  "kk......",
];

// The event's name as a line of code, with the flag as syntax colours:
// the object in ink, the method in blue, the call in red.
export function CodeName() {
  return (
    <span className="ds-code">
      <span className="ds-code-obj">bogota</span>
      <span className="ds-code-dot">.</span>
      <span className="ds-code-fn">forward</span>
      <span className="ds-code-call">()</span>
    </span>
  );
}

export function LogoMark({ word = true }: { word?: boolean }) {
  return (
    <span className="ds-logo">
      <PixelArt rows={MARK} size={24} />
      {word && (
        <span className="ds-logo-word">
          <CodeName />
        </span>
      )}
    </span>
  );
}
