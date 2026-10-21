import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

type PartnerLeadInsert = Database["public"]["Tables"]["colombia_summit_partner_leads"]["Insert"];

/** Every submission is its own row: a company may write more than once. */
export async function saveSupabasePartnerLead(
  client: SupabaseClient<Database>,
  record: PartnerLeadInsert,
): Promise<"created"> {
  const { data, error } = await client
    .from("colombia_summit_partner_leads")
    .insert(record)
    .select("id");
  if (error) throw new Error(`Partner lead persistence failed: ${error.code}`);
  if (!data?.length) throw new Error("Partner lead persistence returned no row");
  return "created";
}
