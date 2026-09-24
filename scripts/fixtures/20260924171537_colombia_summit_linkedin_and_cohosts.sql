alter table public.colombia_summit_interests
  add column linkedin_url text not null default ''
  constraint colombia_summit_linkedin_url_check check (
    char_length(linkedin_url) <= 500 and (
      linkedin_url = '' or
      linkedin_url ~ '^https://www[.]linkedin[.]com/in/[^/?#[:space:]]+/$'
    )
  );

alter table public.colombia_summit_interests
  drop constraint colombia_summit_interests_consent_version_check;
alter table public.colombia_summit_interests
  add constraint colombia_summit_interests_consent_version_check
  check (consent_version in ('colombia-summit-2026-v1', 'colombia-summit-2026-v2'));

comment on column public.colombia_summit_interests.linkedin_url is
  'Optional canonical LinkedIn profile URL supplied by the attendee. No enrichment.';
comment on column public.colombia_summit_interests.consent_version is
  'v1: Torrenegra & Co event contact. v2: Torrenegra & Co and Torre.ai event contact.';
