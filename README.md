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
3. Usa el **mismo Supabase de Consulting**, proyecto `rcvmfvacalolcijkrvsb`, y la tabla existente `public.colombia_summit_interests`. No crees otro proyecto ni otra tabla. La actualizacion de consentimiento fue aplicada el 24 de septiembre de 2026 y la columna `ticket_type` **fue aplicada y verificada el 10 de octubre de 2026**. Ambas migraciones estan documentadas en `supabase/migrations/`; no vuelvas a ejecutarlas en ese proyecto. No ejecutes `supabase db push` desde este proyecto aislado: el historial completo sigue gestionado por el proyecto original.
4. Configura las variables de `.env.example` en Vercel:
   - `SITE_URL`: origen HTTPS del nuevo sitio, sin ruta. Se utiliza en canonical, Open Graph y sitemap. Si se omite en Vercel, se usa `VERCEL_PROJECT_PRODUCTION_URL`.
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://rcvmfvacalolcijkrvsb.supabase.co`, igual al sitio original. Tambien se acepta `SUPABASE_URL`.
   - `SUPABASE_SECRET_KEY`: reutiliza la clave del servidor del despliegue original. Tambien se acepta `SUPABASE_SERVICE_ROLE_KEY`. **Nunca** pongas la clave en una variable `NEXT_PUBLIC_`, en Git o en el ZIP.
5. Despliega. Entra, envia un registro de prueba y confirma que aparezca en `public.colombia_summit_interests`. Retira ese registro desde el dashboard despues de comprobarlo.

Sin Supabase configurado, produccion muestra un error al enviar; no simula un registro exitoso. Sin dominio configurado fuera de Vercel, el sitio se mantiene `noindex`.

Las variables del hosting anterior no se transfieren automaticamente al crear otro proyecto de hosting. Reutiliza sus valores en el nuevo despliegue; el ZIP no contiene la clave privada.

## Datos y consentimiento

El sitio original y este proyecto escriben en la **misma lista**, `colombia_summit_interests`, con el mismo `source` (`colombia-summit-2026`). No se copian ni trasladan registros. Los nuevos registros de esta web usan `aiyaiyai-summit-2026-v1`, para que **AIYaiYai** contacte sobre este evento. Los consentimientos anteriores se conservan. Ser sponsor no concede acceso a los registros ni autoriza comunicaciones de marketing de terceros.

El nuevo formulario exige elegir `general`, `vip` o `vip-plus` y el servidor valida ese valor antes de guardar `ticket_type`. La columna permite `NULL`, sin default: los registros historicos y los formularios anteriores siguen siendo validos, sin asignarles una preferencia inventada. Ante un email repetido se conservan identidad, fecha, empresa, LinkedIn y consentimiento. Solo se completa `ticket_type` si estaba vacio; una preferencia ya guardada no se sobrescribe desde el formulario publico. Las respuestas no revelan si el email ya existia ni su preferencia anterior. El respaldo local de desarrollo conserva la primera escritura completa y no modifica duplicados.

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

- Agenda: `src/app/summit-agenda.tsx` y su CSS. El horario general es de 10 a. m. a 4 p. m. en Bogotá; las cuatro sesiones están numeradas, sin asignar horarios individuales todavía. Inicio y cierre con zona horaria están en `src/lib/colombia-summit.ts` y alimentan los datos estructurados del evento.
- Entradas y fases: `src/lib/summit-pricing.ts`; selector y tarjetas en `src/app/ticket-pricing.tsx` y su CSS. Los cortes incluyen todo el 24 de octubre, 7 y 19 de noviembre de 2026 en Bogotá (UTC-5). La fase vigente se actualiza en el navegador sin otro despliegue; el calendario completo permanece visible. Después del último corte, las tarjetas muestran las fases finalizadas.
- General, VIP y VIP Plus usan el mismo formulario; cada tarjeta preselecciona su ticket sin borrar otros campos. La eleccion se conserva ante errores de validacion. No hay cobro ni aceptacion automatica. Los cupos publicados son limites de cada experiencia, no un inventario de disponibilidad en tiempo real.
- Formulario y validacion: `src/app/interest-form.tsx`, `src/app/ticket-selection.tsx`, `src/app/actions.ts` y `src/lib/colombia-summit.ts`. Persistencia: `src/lib/colombia-summit-persistence.ts` y `src/lib/supabase/summit-interest.ts`.
- Referencia de Napa: `src/app/napa-experience.tsx` y su CSS. Las cuatro fotos suministradas están optimizadas en WebP, sin metadatos, en `public/images/napa/`.
- Contenido y fecha: `src/lib/colombia-summit.ts` y `src/app/page.tsx`.
- Organizador y sponsors: `src/app/event-branding.tsx`.
- Speakers y trayectoria: `src/app/speakers.ts`.
- Estilo: tokens y primitivos en `src/app/design-system.css`; composición de la página en `src/app/summit.css`.
- Imágenes para compartir: `public/images/colombia-summit/opengraph.jpg` (y `-4x3`, `-1x1` para el schema del evento); se regeneran con `npm run og` (necesita `CHROME_PATH` si Chrome no está en la ruta por defecto). Favicons: `src/app/icon.png` y `src/app/apple-icon.png`, archivos estáticos.
- Fotos principales: `public/images/photos/`.
- Creditos y licencias: `public/images/colombia-summit/CREDITS.md`.

Las participaciones de OpenAI, Google y Microsoft permanecen marcadas como pendientes de confirmacion. Los logos de trayectoria profesional y de colaboraciones anteriores no indican patrocinio de este evento.
