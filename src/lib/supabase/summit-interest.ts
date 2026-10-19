import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

type Table = Database["public"]["Tables"]["colombia_summit_interests"];
type InterestInsert = Table["Insert"];
export type SummitPersistenceResult = "created" | "updated" | "already-registered";

/** Preserve identity, consent, and existing answers on this unauthenticated form. */
export async function saveSupabaseSummitInterest(
  client: SupabaseClient<Database>,
  record: InterestInsert & {
    ticket_type: NonNullable<InterestInsert["ticket_type"]>;
    whatsapp: NonNullable<InterestInsert["whatsapp"]>;
  },
): Promise<SummitPersistenceResult> {
  const { data: inserted, error: insertError } = await client
    .from("colombia_summit_interests")
    .upsert(record, { onConflict: "email", ignoreDuplicates: true })
    .select("id");

  if (insertError)
    throw new Error(`Summit interest persistence failed: ${insertError.code}`);
  if (inserted?.length) return "created";

  // People already on the list can add answers the form did not collect
  // before: a ticket preference, a WhatsApp number. Each update carries its
  // own null predicate, checked by Postgres during UPDATE, so concurrent
  // submissions cannot overwrite a value once another request has filled it.
  async function fillIfEmpty(column: "ticket_type" | "whatsapp", patch: Table["Update"]) {
    const { data, error } = await client
      .from("colombia_summit_interests")
      .update(patch)
      .eq("email", record.email)
      .is(column, null)
      .select("id");
    if (error)
      throw new Error(`Summit ${column} persistence failed: ${error.code}`);
    return Boolean(data?.length);
  }

  const ticketAdded = await fillIfEmpty("ticket_type", { ticket_type: record.ticket_type });
  const whatsappAdded = await fillIfEmpty("whatsapp", { whatsapp: record.whatsapp });
  return ticketAdded || whatsappAdded ? "updated" : "already-registered";
}
