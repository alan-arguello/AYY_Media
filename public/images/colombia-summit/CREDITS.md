# Photography

- `/images/photos/bogota-rayos.webp` (hero and the `opengraph*.jpg` share images): "Cityscape with dramatic clouds and sunbeams", Bogotá, Reza Madani. Unsplash License. https://unsplash.com/photos/BIaxvcmyUK4
  The top 41% of the frame (white cloud) is cropped away so the hero opens on blue sky; resized to 3840 px, lightly sharpened and compressed to WebP. Credited in the page footer; the share images are regenerated with `npm run og`.
- `/images/photos/bogota-sky.webp`: "El cielo del atardecer sobre Bogotá, Colombia, 2015", Cristian Baron (Unsplash, via Wikimedia Commons). CC0. https://commons.wikimedia.org/wiki/File:El_cielo_del_atardecer_sobre_Bogot%C3%A1,_Colombia,_2015,_por_Cristian_Baron_(Unsplash).jpg
  Resized to 2600 px and compressed to WebP.
- `/images/photos/bogota-golden-hour.webp`: "Bogotá y Cerros Orientales", Felipeortegag. CC BY-SA 4.0. https://commons.wikimedia.org/wiki/File:Bogot%C3%A1_y_Cerros_Orientales.jpg
  Cropped to remove the foreground rooftop, resized to 2800 px, slightly brightened and compressed to WebP. The adaptation remains CC BY-SA 4.0. No longer shown on the site; still used by the promo scripts in `scripts/`, so material rendered from it needs the CC BY-SA credit where it is posted.

# Company marks

- AIYaiYai: white logo supplied directly by the event organizer. Outer margins removed and background made transparent; original logo geometry retained. AIYaiYai is the main organizer. Torrenegra & Co, Torre.ai and Worder are sponsors, as instructed by the organizer.

- Worder: logo supplied directly by the event organizer. Cropped to remove outer black margins and resized for the web; original symbol and wordmark retained.

- Google: https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png
- Microsoft: https://commons.wikimedia.org/wiki/File:Microsoft_logo_(2012).svg
- OpenAI: existing site asset at `/images/logos/collaborations/openai.png`.

Marks identify organizations whose speakers are pending confirmation. They do not imply sponsorship or confirmed participation.

# Speaker portraits and credentials

- `catalina-morales.webp`: official Torre investor page, https://invest.torre.ai/. Source: https://res.cloudinary.com/torre-technologies-co/image/upload/c_fill,g_face,w_296,h_296,f_auto,q_auto/origin/invest/wfvaacdmrfdff9lfjhut
- `juan-pablo-rodriguez.webp`: public professional profile at https://torre.ai/jprodmo. Source: https://res.cloudinary.com/torre-technologies-co/image/upload/q_auto,f_auto/c_fill,h_600,w_600/v1739661978/origin/starrgate/users/profile_b2a265338183ee4d6a1fa595956ed6d1bb37cc6b.jpg
- Alexander, Tania and Alan use the existing speaker photographs in this website. No generative changes to facial features. Grayscale is CSS only.
- `didi.svg`: official logo from https://web.didiglobal.com/images/logos/didi-logo.svg.
- `credential-*.png`: existing approved marks from `/images/logos/hosts/`, with empty margins trimmed and resolution optimized. Source files are unchanged. Internal white details remain visible in the monochrome treatment.
- Each credential links to its supporting professional source and explains whether it denotes a role, prior experience or education program. It does not imply event sponsorship.

# Typography

- Host Grotesk (display) and Inter (text): Google Fonts, SIL Open Font License 1.1. Static TTF copies in `scripts/fonts/` are used only to render `opengraph.png`.
- Geist Mono: official Vercel `geist` package, SIL Open Font License 1.1.

# Private dinner section

- `/images/dinner/*.webp`: event photographs supplied directly by the organizer (private sessions, a fireside chat and a Torre event). Resized to at most 1400 px, `alexander-torre.webp` cropped to Alexander Torrenegra, compressed to WebP. Desaturation is CSS only. Captions name only people identified by the organizer.
- `/images/dinner/portfolio/*.png`: marks of companies and funds the dinner hosts have invested in, taken from each company's official website and rasterised (trimmed, 120 px tall, alpha kept): Robot.com (inline header logo, robot.com), Latitud (inline header logo, latitud.com), Truora (truora.com/hubfs/2026/logos/Logo Dark Truora.svg), Vozy (vozy.co header logo PNG), Vaki (vaki.co/assets/images/logos/vaki-logo-white&green.svg), Liftit (liftit.co/_next/static/media/Logo_V2.png). Endeavor Catalyst reuses `credential-endeavor.png`. All are rendered as white silhouettes by CSS; `src/app/dinner-portfolio.json` lists them. They identify investments, not sponsors, and the page says so.

