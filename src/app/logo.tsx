import { useId } from "react";
import { logo } from "@/lib/logo";

// The AYY mark; the letters take the text colour, the play triangle stays green.
export function Logo({ className }: { className?: string }) {
  const clip = useId();
  return (
    <svg className={className} viewBox={logo.viewBox} role="img" aria-label="AIYaiYai">
      <clipPath id={clip}>
        <rect {...logo.clip} />
      </clipPath>
      <g clipPath={`url(#${clip})`} fill="none" stroke="currentColor" strokeLinejoin="bevel">
        {logo.strokes.map((stroke) => (
          <path key={stroke.d} d={stroke.d} strokeWidth={stroke.width} />
        ))}
      </g>
      <path d={logo.triangle} fill="var(--mint)" />
    </svg>
  );
}
