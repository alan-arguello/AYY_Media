-- Extend the existing table; keep historical consent and the live site's writes valid.
alter table public.colombia_summit_interests
  drop constraint colombia_summit_interests_consent_version_check;
alter table public.colombia_summit_interests
  add constraint colombia_summit_interests_consent_version_check
  check (consent_version in (
    'colombia-summit-2026-v1',
    'colombia-summit-2026-v2',
    'aiyaiyai-summit-2026-v1'
  ));

comment on column public.colombia_summit_interests.consent_version is
  'v1: Torrenegra & Co event contact. v2: Torrenegra & Co and Torre.ai event contact. aiyaiyai-summit-2026-v1: AIYaiYai event contact only; sponsors receive no additional authorization. Historical consent is not changed.';
