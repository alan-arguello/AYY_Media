import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getPost } from "@/lib/feeds";
import { logoSvg } from "@/lib/logo";
import { site } from "@/lib/site";

export const alt = `Artículo de ${site.fullName}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const spectral = await readFile(join(process.cwd(), "src/app/fonts/spectral-light.ttf"));
const logo = `data:image/svg+xml;base64,${Buffer.from(logoSvg("#ffffff", "#ffffff")).toString("base64")}`;

// Long titles step down so they always fit beside the cover.
const titleSize = (length: number) => (length > 76 ? 40 : length > 56 ? 46 : length > 30 ? 54 : 64);

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  const title = post?.title ?? site.title;

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: "#131211" }}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "54px 40px 50px 56px",
          color: "#ffffff",
          fontFamily: "Spectral",
          backgroundImage: "radial-gradient(ellipse at 40% 45%, #13a560 0%, #0b7a46 52%, #053a22 100%)",
        }}
      >
        <img src={logo} alt="" width={158} height={35} />
        <div style={{ fontSize: titleSize(title.length), lineHeight: 1.08, letterSpacing: "-0.02em" }}>
          {title}
        </div>
        <div style={{ fontSize: 26, opacity: 0.86 }}>aiyaiyai.io/blog</div>
      </div>
      {post?.cover && (
        <img src={post.cover} alt="" width={620} height={630} style={{ objectFit: "cover" }} />
      )}
    </div>,
    {
      ...size,
      fonts: [{ name: "Spectral", data: spectral, weight: 300, style: "normal" }],
      // A day at the CDN: crawlers should not make Vercel redraw it on every visit.
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
    },
  );
}
