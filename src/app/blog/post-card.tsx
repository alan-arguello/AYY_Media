import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/feeds";
import { formatDate } from "@/lib/site";

export function PostCover({ post, sizes, preload }: { post: Post; sizes: string; preload?: boolean }) {
  return (
    <span className="post-cover">
      <Image
        src={post.cover || "/images/og.jpg"}
        alt=""
        fill
        sizes={sizes}
        preload={preload}
        fetchPriority={preload ? "high" : undefined}
      />
    </span>
  );
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="post-card">
      <PostCover post={post} sizes="(max-width: 820px) 100vw, 330px" />
      <span className="post-card-title">{post.title}</span>
      <span className="post-date">{formatDate(post.published)}</span>
    </Link>
  );
}
