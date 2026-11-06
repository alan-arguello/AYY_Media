import type { MetadataRoute } from "next";
import { allPosts } from "@/lib/feeds";
import { siteUrl, isPublicSite } from "@/lib/site-url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isPublicSite) return [];
  const posts = await allPosts();
  const newest = posts[0]?.published;
  return [
    { url: `${siteUrl}/`, lastModified: newest },
    { url: `${siteUrl}/blog`, lastModified: newest },
    ...posts.map((post) => ({ url: `${siteUrl}/blog/${post.slug}`, lastModified: post.published })),
  ];
}
