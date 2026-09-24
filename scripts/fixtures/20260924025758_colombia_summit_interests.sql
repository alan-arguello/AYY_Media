create table public.colombia_summit_interests (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),
  source text not null check (source = 'colombia-summit-2026'),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null unique check (email = lower(btrim(email)) and char_length(email) <= 254),
  company text not null default '' check (char_length(company) <= 160),
  consent_version text not null check (consent_version = 'colombia-summit-2026-v1')
);

alter table public.colombia_summit_interests enable row level security;
revoke all on table public.colombia_summit_interests from anon, authenticated;
grant select, insert on table public.colombia_summit_interests to service_role;

comment on table public.colombia_summit_interests is
  'Interest list for Colombia AI Summit 2026. Written only by the validated server action. No public read or write access.';
