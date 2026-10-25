import type { Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { GeistPixelSquare } from "geist/font/pixel";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";
import "./design-system.css";
import "./summit.css";

// Display: Newsreader (OFL, self-hosted). Text: Geist. Figures: Geist Mono.
const newsreader = localFont({
  src: [
    { path: "./fonts/newsreader-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/newsreader-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/newsreader-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-newsreader",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f3ef",
  colorScheme: "light",
};

export default function SummitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Font variables live on <html> so :root tokens can resolve them.
  return (
    <html
      lang="es"
      className={`${GeistSans.variable} ${GeistPixelSquare.variable} ${GeistMono.variable} ${newsreader.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
