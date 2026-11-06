import sanitize from "sanitize-html";

// Substack's HTML, reduced to what an article needs. Nothing from the feed
// reaches the page without passing through this allow-list.

const SUBSTACK_POST = /^https:\/\/aiyaiyaimedia\.substack\.com\/p\/([^/?#]+)/;
const WIDGET = /subscription-widget|image-link-expand/;

// The widths Substack itself offers for each image: only the first one is in
// the img tag; the rest are in a <source> that doesn't survive the allow-list.
const IMAGE_WIDTHS = [424, 848, 1272, 1456];

function responsive(src: string, width?: string): sanitize.Attributes {
  if (!src.includes(",w_1456,")) return {};
  const version = (size: number) =>
    src.replace(",w_1456,", `,w_${size},`).replace(",f_auto,", ",f_webp,");
  return {
    srcset: IMAGE_WIDTHS.map((size) => `${version(size)} ${size}w`).join(", "),
    sizes: `(max-width: 740px) calc(100vw - 40px), ${width ? Math.round(+width) : 700}px`,
  };
}

function cleanHtml(html: string) {
  const clean = sanitize(html, {
    allowedTags: [
      "p", "h2", "h3", "h4", "blockquote", "ul", "ol", "li", "strong", "em", "s", "div",
      "a", "img", "figure", "figcaption", "hr", "iframe", "br", "code", "pre", "sub", "sup",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "class"],
      img: ["src", "srcset", "sizes", "alt", "width", "height", "loading", "decoding"],
      iframe: ["src", "title", "loading", "allowfullscreen"],
      blockquote: ["class"],
      div: ["class"],
    },
    allowedClasses: {
      a: ["image-link"],
      blockquote: ["pullquote"],
      div: ["subscription-widget-wrap-editor", "image-link-expand"],
    },
    allowedSchemes: ["https", "mailto"],
    allowedSchemesAppliedToAttributes: ["href", "src"],
    allowProtocolRelative: false,
    allowedIframeHostnames: ["www.youtube-nocookie.com", "www.youtube.com"],
    nonTextTags: ["script", "style", "textarea", "option", "noscript", "button", "form", "svg"],
    // Only rename to allowed tags: sanitize-html leaves the rename of a dropped
    // tag behind and applies it to the next closing tag at that depth.
    transformTags: {
      h1: "h2",
      h5: "h4",
      h6: "p",
      div(_, attribs) {
        return (attribs.class ?? "").includes("pullquote")
          ? { tagName: "blockquote", attribs: { class: "pullquote" } }
          : { tagName: "div", attribs };
      },
      a(_, attribs): sanitize.Tag {
        if ((attribs.class ?? "").includes("image-link")) {
          return { tagName: "a", attribs: { class: "image-link" } };
        }
        const href = attribs.href ?? "";
        const internal = href.match(SUBSTACK_POST);
        return internal
          ? { tagName: "a", attribs: { href: `/blog/${internal[1]}` } }
          : { tagName: "a", attribs: { href, target: "_blank", rel: "noopener noreferrer" } };
      },
      img(_, attribs): sanitize.Tag {
        const { src = "", alt = "", width, height } = attribs;
        const size: sanitize.Attributes =
          width && height
            ? { width: String(Math.round(+width)), height: String(Math.round(+height)) }
            : {};
        return {
          tagName: "img",
          attribs: { src, alt, ...size, ...responsive(src, width), loading: "lazy", decoding: "async" },
        };
      },
      iframe(_, attribs) {
        return {
          tagName: "iframe",
          attribs: { ...attribs, title: "Video de YouTube", loading: "lazy", allowfullscreen: "true" },
        };
      },
    },
    exclusiveFilter({ tag, text, mediaChildren, attribs }) {
      if (tag === "div") return WIDGET.test(attribs.class ?? "");
      const empty = !text.trim() && !mediaChildren.length;
      return empty && (tag === "a" ? !attribs.class : ["p", "li", "h2", "h3", "h4"].includes(tag));
    },
  });
  // Plain wrappers, and images that only linked to themselves on Substack.
  return clean
    .replace(/<\/?div>/g, "")
    .replace(/<a class="image-link">(<img[^>]*>)<\/a>/g, "$1");
}

const plainText = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

// What comes after the last rule when it only makes sense in an email:
// "responde a este correo", links to follow us, a promo, a byline.
const EMAIL_CLOSING = /correo|suscr[ií]b|conoce más|conecta con|escrito por/i;

function withoutClosing(html: string) {
  const cut = html.lastIndexOf("<hr />");
  if (cut === -1) return html;
  const closing = plainText(html.slice(cut));
  return closing.length < 600 && EMAIL_CLOSING.test(closing) ? html.slice(0, cut) : html;
}

// Some essays start their sections at h3; the page's headings go in order.
const headingsInOrder = (html: string) =>
  /<h2[\s>]/.test(html) ? html : html.replace(/(<\/?)h3/g, "$1h2").replace(/(<\/?)h4/g, "$1h3");

function withoutRepeatedTitle(html: string, title: string) {
  const first = html.match(/^\s*<h2>(.*?)<\/h2>/);
  return first && plainText(first[1]) === title ? html.slice(first[0].length) : html;
}

/** `dropIntro` removes everything before the first rule (see update-posts.mjs). */
export function cleanPost(html: string, title: string, { dropIntro = false } = {}) {
  let clean = withoutClosing(cleanHtml(html));
  if (dropIntro) clean = clean.slice(clean.indexOf("<hr />") + "<hr />".length);
  return headingsInOrder(withoutRepeatedTitle(clean, title)).trim();
}
