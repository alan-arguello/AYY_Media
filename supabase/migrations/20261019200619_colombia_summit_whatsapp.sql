-- Optional at the database boundary so historical rows, the live form during
-- rollout and the original consulting_website writer (which never sends it)
-- remain valid. No default or backfill: NULL means no number was collected.
-- The server action normalizes input to E.164: "+", a country code that does
-- not start with 0, and 7 to 15 digits in total, so wa.me links work as-is.
alter table public.colombia_summit_interests
  add column whatsapp text
  constraint colombia_summit_interests_whatsapp_check
  check (whatsapp ~ '^[+][1-9][0-9]{6,14}$');

comment on column public.colombia_summit_interests.whatsapp is
  'Attendee-supplied WhatsApp number in E.164 format (e.g. +573001234567). NULL means not collected. Given under the row''s consent_version for contact about this event; historical identity and consent remain unchanged.';
