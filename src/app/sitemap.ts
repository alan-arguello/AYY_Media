import type { MetadataRoute } from "next";
import { siteUrl, isPublicSite } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  // The build date: the site is static, so this is when the content changed.
  const lastModified = new Date();
  return isPublicSite
    ? [
        { url: `${siteUrl}/`, lastModified, changeFrequency: "weekly", priority: 1 },
        { url: `${siteUrl}/partners`, lastModified, changeFrequency: "monthly", priority: 0.6 },
      ]
    : [];
}
