import type { Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { GeistPixelSquare } from "geist/font/pixel";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";
import "./design-system.css";
import "./summit.css";

// Display: Source Serif 4 (OFL, self-hosted, variable weight and optical
// size) set light, the free counterpart of Tiempos Headline. Text: Geist.
const display = localFont({
  src: "./fonts/source-serif-4-latin-opsz-normal.woff2",
  weight: "200 900",
  style: "normal",
  variable: "--font-display",
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
      className={`${GeistSans.variable} ${GeistPixelSquare.variable} ${GeistMono.variable} ${display.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
