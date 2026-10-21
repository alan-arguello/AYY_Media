-- Partner and sponsor leads from the summit site's "Aliados" form. A separate
-- table from the attendee interest list: different fields, consent text and
-- follow-up. Each submission is its own row (a company may write again), so
-- email is not unique. Written only by the validated server action.
create table public.colombia_summit_partner_leads (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),
  source text not null check (source = 'colombia-summit-2026-partners'),
  company text not null check (char_length(company) between 2 and 160),
  contact_name text not null check (char_length(contact_name) between 2 and 120),
  email text not null check (email = lower(btrim(email)) and char_length(email) <= 254),
  -- Optional, E.164 like colombia_summit_interests.whatsapp.
  whatsapp text check (whatsapp ~ '^[+][1-9][0-9]{6,14}$'),
  website text not null default '' check (
    char_length(website) <= 500 and (website = '' or website ~ '^https?://[^[:space:]]+$')
  ),
  partner_type text not null check (partner_type in ('sponsor', 'speaker', 'media', 'other')),
  company_type text not null default '' check (char_length(company_type) <= 160),
  goals text not null default '' check (char_length(goals) <= 600),
  budget text not null check (
    budget in ('under-5k', '5k-10k', '10k-25k', '25k-50k', 'over-50k', 'undecided')
  ),
  consent_version text not null check (consent_version = 'aiyaiyai-partners-2026-v1')
);

alter table public.colombia_summit_partner_leads enable row level security;
revoke all on table public.colombia_summit_partner_leads from anon, authenticated;
grant select, insert on table public.colombia_summit_partner_leads to service_role;

comment on table public.colombia_summit_partner_leads is
  'Partner and sponsor leads for bogota.forward() summit 2026 (Aliados form). One row per submission; written only by the validated server action. No public read or write access.';
comment on column public.colombia_summit_partner_leads.whatsapp is
  'Optional contact WhatsApp in E.164 format (e.g. +573001234567). NULL means not given.';
comment on column public.colombia_summit_partner_leads.partner_type is
  'What the company proposes: sponsor (brand presence plus a speaker session), speaker (a session only), media (distribution or community) or other.';
comment on column public.colombia_summit_partner_leads.budget is
  'Self-reported budget range in USD: under-5k, 5k-10k, 10k-25k, 25k-50k, over-50k or undecided. Not a commitment.';
comment on column public.colombia_summit_partner_leads.consent_version is
  'aiyaiyai-partners-2026-v1: AIYaiYai may contact the company about partnerships for this event only.';
