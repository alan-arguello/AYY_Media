# Accelerating LATAM Summit

Proyecto independiente de Next.js para el evento del 19 de noviembre de 2026 en Bogotá, Colombia (antes "Back to the Future Summit").

- Organiza: **AIYaiYai**, con enlace a https://www.youtube.com/@aiyaiyaimedia.
- Sponsors: **Torrenegra & Co, Torre.ai y Worder**.
- La landing vive en `/`. `/colombia-summit` redirige a `/`.
- Incluye speakers con trayectoria, sponsors, galería de eventos anteriores, formulario de lista de interés, cuenta regresiva y Open Graph.
- Design system inspirado en elevenlabs.io (el mismo del LATAM AI Summit): papel cálido, tinta negra, rieles de 1px, superficies redondeadas y fotografía real. Tipografía: Host Grotesk (display), Inter (texto) y Geist Mono (cifras). Tokens y primitivos en `src/app/design-system.css` y `src/components/ui.tsx`.
- No depende del repositorio `consulting_website`. No incluye credenciales, leads ni historial Git del sitio anterior. Ese sitio no se modifico.

## Desarrollo

Node.js 22.18+ y npm.

```sh
npm ci
npm run dev -- --port 3105
```

Abrir http://localhost:3105. Sin credenciales, solo en desarrollo, el formulario guarda registros de prueba en `.local/leads/` (excluido de Git). Nunca utiliza este respaldo de disco en produccion.

## Desplegar en tu propio repositorio

1. Sube el contenido de esta carpeta al nuevo repositorio, incluyendo `package-lock.json`, sin `node_modules`, `.next`, `.local`, `.env.local` ni `supabase/.temp`.
2. Importa el repositorio en Vercel como **Next.js**, directorio raiz `.`, Node.js 22.x. Build: `npm run build`. No uses exportacion estatica: el formulario necesita un servidor.
3. Usa el **mismo Supabase de Consulting**, proyecto `rcvmfvacalolcijkrvsb`, y la tabla existente `public.colombia_summit_interests`. No crees otro proyecto ni otra tabla. La actualizacion de consentimiento **ya fue aplicada y verificada el 24 de septiembre de 2026** en ese proyecto; no necesitas ejecutar SQL para desplegar. El archivo `supabase/migrations/20260924184338_colombia_summit_aiyaiyai_consent.sql` documenta ese cambio, sin modificar registros ni permisos. No ejecutes `supabase db push` desde este proyecto aislado: el historial completo sigue gestionado por el proyecto original.
4. Configura las variables de `.env.example` en Vercel:
   - `SITE_URL`: origen HTTPS del nuevo sitio, sin ruta. Se utiliza en canonical, Open Graph y sitemap. Si se omite en Vercel, se usa `VERCEL_PROJECT_PRODUCTION_URL`.
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://rcvmfvacalolcijkrvsb.supabase.co`, igual al sitio original. Tambien se acepta `SUPABASE_URL`.
   - `SUPABASE_SECRET_KEY`: reutiliza la clave del servidor del despliegue original. Tambien se acepta `SUPABASE_SERVICE_ROLE_KEY`. **Nunca** pongas la clave en una variable `NEXT_PUBLIC_`, en Git o en el ZIP.
5. Despliega. Entra, envia un registro de prueba y confirma que aparezca en `public.colombia_summit_interests`. Retira ese registro desde el dashboard despues de comprobarlo.

Sin Supabase configurado, produccion muestra un error al enviar; no simula un registro exitoso. Sin dominio configurado fuera de Vercel, el sitio se mantiene `noindex`.

Las variables del hosting anterior no se transfieren automaticamente al crear otro proyecto de hosting. Reutiliza sus valores en el nuevo despliegue; el ZIP no contiene la clave privada.

## Datos y consentimiento

El sitio original y este proyecto escriben en la **misma lista**, `colombia_summit_interests`, con el mismo `source` (`colombia-summit-2026`). No se copian ni trasladan registros. Los nuevos registros de esta web usan `aiyaiyai-summit-2026-v1`, para que **AIYaiYai** contacte sobre este evento. Los consentimientos anteriores se conservan; una persona que ya esta registrada no se sobrescribe al reenviar el formulario. Ser sponsor no concede acceso a los registros ni autoriza comunicaciones de marketing de terceros.

RLS activado. Sin lectura ni escritura publica. La app valida en servidor, normaliza email/LinkedIn y evita duplicados sin sobrescribir registros existentes. Incluye honeypot; configura tambien rate limiting del hosting antes de campanas de alto trafico. No envia correos automaticamente ni reserva entradas.

El contacto operativo permanece en `support@torrenegra.ai`; esta centralizado en `src/lib/colombia-summit.ts` para cambiarlo cuando haya un correo propio del evento. Antes de publicar, confirmar la identidad legal y el aviso de privacidad aplicable del organizador.

## Verificacion

```sh
npm test
npm run lint
npm run build
npm run og
```

Los tests de la migracion se ejecutan en Postgres embebido y efimero (PGlite): verifican compatibilidad con el esquema anterior, preservacion de registros y permisos, y deduplicacion. Los SQL en `scripts/fixtures/` son solo para pruebas, no para ejecutarlos en produccion.

Tambien se verificaron inserciones de las 3 versiones de consentimiento y deduplicacion en el Supabase existente dentro de una transaccion revertida: no quedaron registros de prueba. El aviso informativo [RLS enabled, no policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) es intencional en esta tabla: no permite acceso publico y el formulario escribe exclusivamente desde el servidor.

## Edicion

- Contenido y fecha: `src/lib/colombia-summit.ts` y `src/app/page.tsx`.
- Organizador y sponsors: `src/app/event-branding.tsx`.
- Speakers y trayectoria: `src/app/speakers.ts`.
- Estilo: tokens y primitivos en `src/app/design-system.css`; composición de la página en `src/app/summit.css`.
- Thumbnail y favicon: `public/images/colombia-summit/opengraph.png` y `src/app/icon.png`; regenerar ambos con `npm run og`.
- Fotos principales: `public/images/photos/`.
- Creditos y licencias: `public/images/colombia-summit/CREDITS.md`.

Las participaciones de OpenAI, Google y Microsoft permanecen marcadas como pendientes de confirmacion. Los logos de trayectoria profesional y de colaboraciones anteriores no indican patrocinio de este evento.
