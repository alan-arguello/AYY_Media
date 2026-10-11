import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

type InterestInsert = Database["public"]["Tables"]["colombia_summit_interests"]["Insert"];
export type SummitPersistenceResult = "created" | "ticket-added" | "already-registered";

/** Preserve identity, consent, and existing choices on this unauthenticated form. */
export async function saveSupabaseSummitInterest(
  client: SupabaseClient<Database>,
  record: InterestInsert & { ticket_type: NonNullable<InterestInsert["ticket_type"]> },
): Promise<SummitPersistenceResult> {
  const { data: inserted, error: insertError } = await client
    .from("colombia_summit_interests")
    .upsert(record, { onConflict: "email", ignoreDuplicates: true })
    .select("id");

  if (insertError)
    throw new Error(`Summit interest persistence failed: ${insertError.code}`);
  if (inserted?.length) return "created";

  // People on the old list can add their first preference. The null predicate
  // is checked by Postgres during UPDATE, so concurrent submissions cannot
  // overwrite a preference once another request has filled it.
  const { data: updated, error: updateError } = await client
    .from("colombia_summit_interests")
    .update({ ticket_type: record.ticket_type })
    .eq("email", record.email)
    .is("ticket_type", null)
    .select("id");

  if (updateError)
    throw new Error(`Summit ticket preference persistence failed: ${updateError.code}`);

  return updated?.length ? "ticket-added" : "already-registered";
}
