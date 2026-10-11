-- Optional at the database boundary so historical rows and older forms remain valid.
-- No default or backfill: NULL means no ticket preference was collected.
alter table public.colombia_summit_interests
  add column ticket_type text
  constraint colombia_summit_interests_ticket_type_check
  check (ticket_type in ('general', 'vip', 'vip-plus'));

comment on column public.colombia_summit_interests.ticket_type is
  'Attendee-selected ticket preference: general, vip or vip-plus. NULL means not collected. This is an expression of interest, not admission, a reservation or payment; historical identity and consent remain unchanged.';
