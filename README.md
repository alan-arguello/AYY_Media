# AIYaiYai Media

Sitio de [aiyaiyai.io](https://www.aiyaiyai.io): una media company que comparte conocimiento sobre tecnología, emprendimiento e inteligencia artificial. Next.js en Vercel, desplegado desde `main`.

## Qué se actualiza solo

- **Videos y vistas:** vienen del feed público de YouTube, sin API key (`src/lib/feeds.ts`). La página se regenera como máximo cada hora cuando alguien la visita, y un cron diario de Vercel (`vercel.json`, `/api/refresh`) la refresca aunque nadie entre.
- **Artículos nuevos:** aparecen en `/blog/<slug>` en cuanto salen en el feed de Substack.

Si un feed falla, la página sigue mostrando la última versión buena.

## Qué se actualiza a mano

- **Seguidores, personas y enlaces:** `src/lib/site.ts`.
- **Archivo de artículos:** `npm run posts` reescribe `src/content/posts.json` desde Substack. Ese archivo es lo que mantiene los artículos publicados aunque Substack falle o salgan del feed, así que hay que correrlo cuando se publique uno nuevo o se edite uno viejo. Quita lo que solo sirve en un correo (suscripción, "responde a este correo", promos al final). Los artículos que abren con una nota a suscriptores se listan en `DROP_INTRO`, en `scripts/update-posts.mjs`.
- **Retratos:** `npm run portraits`. Necesita las fotos y máscaras de `marketing/photos/`, que no están en Git.
- **Imagen para compartir, logo e íconos:** `npm run images`. La imagen de cada artículo se genera sola (`src/app/blog/[slug]/opengraph-image.tsx`).

## Desarrollo

Node.js 22.18+ y npm.

```sh
npm ci
npm run dev -- --port 3105
```

`npm test`, `npm run lint` y `npm run build` deben pasar antes de subir a `main`.

## Diseño

Basado en extraordinary.com: blanco, tinta cálida, Spectral Light para títulos en dos tonos, Inter para el texto y botones redondos. El verde de la marca solo aparece en el logo, en el fondo de los retratos y en las imágenes para compartir. Todo el estilo vive en `src/app/globals.css`.

## El evento

El sitio de bogota.forward() (landing, `/partners` y formularios) quedó en la etiqueta de Git `evento-bogota-forward`, con sus migraciones de Supabase. `/partners` y `/colombia-summit` redirigen a `/`. Las tablas `colombia_summit_*` siguen en Supabase con sus registros; este sitio ya no las usa.
