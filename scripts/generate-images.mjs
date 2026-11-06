// Generates the share image (public/images/og.jpg, 1200×630), the logo for
// search engines (public/images/logo.png) and the icons (src/app/icon.png, just
// the play mark, which is what still reads at 16px, and apple-icon.png) with
// headless Chrome. The cut-outs come from `npm run portraits`.
//   npm run images
import { readFile, writeFile } from "node:fs/promises";
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import { logo, logoSvg } from "../src/lib/logo.ts";
import { people, site } from "../src/lib/site.ts";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const inline = async (path, type) => `data:${type};base64,${(await readFile(path)).toString("base64")}`;
const [spectral, alex, alan] = await Promise.all([
  inline("src/app/fonts/spectral-light.ttf", "font/ttf"),
  inline("marketing/photos/cutouts/alex-torrenegra.png", "image/png"),
  inline("marketing/photos/cutouts/alan-arguello.png", "image/png"),
]);

const [topics, last] = site.tagline.split(" e ");
const reset = `*{box-sizing:border-box;margin:0}html,body{width:100%;height:100%;overflow:hidden}`;

const og = `<!doctype html><style>${reset}
@font-face{font-family:Spectral;src:url(${spectral});font-weight:300}
body{position:relative;color:#fff;font-family:Spectral,serif;font-weight:300;
  background:radial-gradient(ellipse 88% 120% at 76% 44%,#13a560 0%,#0b7a46 48%,#053a22 100%)}
.logo{position:absolute;left:56px;top:54px;width:176px}
h1{position:absolute;left:56px;top:200px;font-weight:300;font-size:56px;line-height:1.07;letter-spacing:-.022em}
h1 span{color:rgb(255 255 255/.74)}
p{position:absolute;left:58px;bottom:50px;font-size:27px;color:rgb(255 255 255/.88)}
img{position:absolute;bottom:-16px;height:566px}
.alex{left:522px;z-index:1}.alan{left:792px;z-index:2}
</style><div class="logo">${logoSvg("#fff", "#fff")}</div>
<h1>${topics.replace(", ", ",<br>")}<br><span>e ${last}</span></h1>
<p>${people.map((person) => person.name).join(" y ")}</p>
<img class="alex" src="${alex}" alt=""><img class="alan" src="${alan}" alt="">`;

const square = `<!doctype html><style>${reset}body{display:grid;place-items:center;background:#161816}svg{width:81%}</style>${logoSvg("#f2f2f2")}`;

const favicon = `<!doctype html><style>${reset}html,body{background:transparent}
div{width:100%;height:100%;display:grid;place-items:center;border-radius:22%;background:#161816}svg{width:56%;margin-left:7%}</style>
<div><svg xmlns="http://www.w3.org/2000/svg" viewBox="572 24 116 100"><path d="${logo.triangle}" fill="${logo.green}"/></svg></div>`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(og, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const ogPng = await page.screenshot({ type: "png" });
  await writeFile("public/images/og.jpg", await sharp(ogPng).jpeg({ quality: 88, mozjpeg: true }).toBuffer());

  await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
  await page.setContent(square);
  const logoPng = await page.screenshot({ type: "png" });
  await writeFile("public/images/logo.png", logoPng);
  await writeFile("src/app/apple-icon.png", await sharp(logoPng).resize(180, 180).png().toBuffer());

  await page.setViewport({ width: 256, height: 256, deviceScaleFactor: 1 });
  await page.setContent(favicon);
  await writeFile("src/app/icon.png", await page.screenshot({ type: "png", omitBackground: true }));
  console.log("public/images/og.jpg, public/images/logo.png, src/app/icon.png, src/app/apple-icon.png");
} finally {
  await browser.close();
}
