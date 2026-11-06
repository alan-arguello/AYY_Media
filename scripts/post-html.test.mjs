import assert from "node:assert/strict";
import test from "node:test";
import { cleanPost } from "../src/lib/post-html.ts";

const image = `<div class="captioned-image-container"><figure><a class="image-link image2 is-viewable-img" target="_blank" href="https://substackcdn.com/full.jpg"><div class="image2-inset"><picture><source type="image/webp" srcset="https://substackcdn.com/a.webp 424w"><img src="https://substackcdn.com/a.jpg" width="558" height="371.74" alt="Una charla" srcset="x 1w"></picture></div></a><div class="image-link-expand"><div class="pencraft"><button><svg><line></line></svg></button></div></div><figcaption class="image-caption">Pie de foto</figcaption></figure></div>`;
const widget = `<div class="subscription-widget-wrap-editor" data-attrs="{}"><div class="subscription-widget show-subscribe"><div class="preamble"><p class="cta-caption">¡Gracias por leer!</p></div><form class="subscription-widget-subscribe"><input type="email"><input type="submit" value="Suscribirse"></form></div></div>`;

test("keeps images, without the wrappers and viewer buttons around them", () => {
  const html = cleanPost(image, "Título");
  assert.equal(
    html,
    `<figure><img src="https://substackcdn.com/a.jpg" alt="Una charla" width="558" height="372" loading="lazy" decoding="async" /><figcaption>Pie de foto</figcaption></figure>`,
  );
});

test("offers the smaller versions Substack already has of each image", () => {
  const src = "https://substackcdn.com/image/fetch/$s_!z!,w_1456,c_limit,f_auto,q_auto:good/https%3A%2F%2Fa.jpeg";
  const html = cleanPost(`<figure><img src="${src}" width="444" height="333" alt=""></figure>`, "T");
  assert.ok(html.includes("$s_!z!,w_424,c_limit,f_webp,q_auto:good/https%3A%2F%2Fa.jpeg 424w"));
  assert.ok(html.includes("$s_!z!,w_1272,c_limit,f_webp,q_auto:good/https%3A%2F%2Fa.jpeg 1272w"));
  assert.ok(html.includes(`sizes="(max-width: 740px) calc(100vw - 40px), 444px"`));
});

test("headings keep their order when an essay starts at h3", () => {
  assert.equal(cleanPost("<h3>Uno</h3><h4>Dos</h4>", "T"), "<h2>Uno</h2><h3>Dos</h3>");
  assert.equal(cleanPost("<h2>Uno</h2><h3>Dos</h3>", "T"), "<h2>Uno</h2><h3>Dos</h3>");
});

test("removes the subscribe widget with its text and its form", () => {
  assert.equal(cleanPost(`<p>Antes</p>${widget}<p>Después</p>`, "Título"), "<p>Antes</p><p>Después</p>");
});

test("closing tags stay right after a widget or a wrapper is removed", () => {
  const html = cleanPost(`<ul><li>Uno</li></ul>${widget}<ol><li><em>Dos</em></li></ol>${image}<p>Tres</p>`, "Título");
  assert.match(html, /<ol><li><em>Dos<\/em><\/li><\/ol>/);
  assert.match(html, /<p>Tres<\/p>$/);
  assert.doesNotMatch(html, /<\/(span|div|x-drop)>/);
});

test("nothing active from the feed survives", () => {
  const html = cleanPost(
    `<p onclick="x()" style="color:red">Hola<script>alert(1)</script></p><a href="javascript:alert(1)">mal</a><iframe src="https://evil.example/x"></iframe><style>p{}</style>`,
    "Título",
  );
  assert.equal(html.includes("alert"), false);
  assert.equal(html.includes("onclick"), false);
  assert.equal(html.includes("style"), false);
  assert.equal(html.includes("evil"), false);
});

test("keeps YouTube embeds and turns pull quotes into quotes", () => {
  const html = cleanPost(
    `<div class="youtube-wrap"><div class="youtube-inner"><iframe src="https://www.youtube-nocookie.com/embed/abc?rel=0" width="728" frameborder="0"></iframe></div></div><div class="pullquote"><p>Una frase</p></div>`,
    "Título",
  );
  assert.match(html, /<iframe src="https:\/\/www\.youtube-nocookie\.com\/embed\/abc\?rel=0" title="Video de YouTube" loading="lazy" allowfullscreen="true">/);
  assert.match(html, /<blockquote class="pullquote"><p>Una frase<\/p><\/blockquote>/);
});

test("links to other essays stay on the site; the rest open apart", () => {
  const html = cleanPost(
    `<p><a href="https://aiyaiyaimedia.substack.com/p/cursos-no-tokens?utm=x">a</a> <a href="https://openai.com">b</a></p>`,
    "Título",
  );
  assert.match(html, /<a href="\/blog\/cursos-no-tokens">a<\/a>/);
  assert.match(html, /<a href="https:\/\/openai\.com" target="_blank" rel="noopener noreferrer">b<\/a>/);
});

test("cuts the email closing after the last rule, not a real ending", () => {
  const article = "<p>Artículo</p>";
  assert.equal(
    cleanPost(`${article}<div><hr></div><ul><li>Responde a este correo.</li></ul>`, "T"),
    article,
  );
  assert.equal(cleanPost(`${article}<div><hr></div><p>Conoce más aquí</p>`, "T"), article);
  const ending = `${article}<hr /><p>La ventana sigue abierta.</p>`;
  assert.equal(cleanPost(ending, "T"), ending);
});

test("drops the note to subscribers on request, and a title repeated in the body", () => {
  const html = `<p>Última oportunidad para el summit</p><div><hr></div><h1>El título</h1><p>Artículo</p>`;
  assert.equal(cleanPost(html, "El título", { dropIntro: true }), "<p>Artículo</p>");
  assert.match(cleanPost(html, "El título"), /summit/);
});
