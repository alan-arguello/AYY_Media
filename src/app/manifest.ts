import type { MetadataRoute } from "next";
import { colombiaSummit } from "@/lib/colombia-summit";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "bogota.forward() · Evento de IA y cena privada en Bogotá",
    short_name: colombiaSummit.name,
    description:
      "Evento de IA para founders, managers y C-levels en Bogotá, 19 de noviembre de 2026, con cena privada.",
    start_url: "/",
    display: "browser",
    lang: "es",
    background_color: "#f4f5f2",
    theme_color: "#f4f5f2",
    icons: [
      { src: "/icon.png", sizes: "256x256", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
