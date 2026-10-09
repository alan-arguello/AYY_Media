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
  className,
}: {
  children: React.ReactNode;
  dot?: boolean;
  live?: boolean;
  className?: string;
}) {
  return (
    <span className={["ds-tag", className].filter(Boolean).join(" ")}>
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
}: {
  id: string;
  tag: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="ds-heading">
      <Tag>{tag}</Tag>
      <h2 id={id} className="ds-display-l">
        {title}
      </h2>
      {children && <p className="ds-lead">{children}</p>}
    </header>
  );
}

const PIXEL_PALETTE: Record<string, string> = {
  k: "#0d0b01", // ink
  d: "#3a362b", // dark
  m: "#8f8a7b", // mid grey
  g: "#d9d3c2", // light grey
  w: "#ffffff",
  b: "#794e00", // brown
  a: "#b17300", // amber
  l: "#e2a93b", // light amber
  y: "#f3d48c", // highlight
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

// An exponential curve drawn in pixels, its leading point in amber:
// acceleration in one stroke.
const MARK = [
  ".......a",
  "......k.",
  "......k.",
  ".....k..",
  "....k...",
  "..kk....",
  "kk......",
];

export function LogoMark({ word = true }: { word?: boolean }) {
  return (
    <span className="ds-logo">
      <PixelArt rows={MARK} size={24} />
      {word && <span className="ds-logo-word">Accelerating LATAM Summit</span>}
    </span>
  );
}
