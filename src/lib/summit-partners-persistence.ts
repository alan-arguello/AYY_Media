import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { summitPartners, type PartnerLead } from "@/lib/summit-partners";
import { saveSupabasePartnerLead } from "@/lib/supabase/partner-lead";
import {
  createSupabaseAdminClient,
  getSupabaseConfigState,
} from "@/lib/supabase/service-role";

export async function persistPartnerLead(lead: PartnerLead): Promise<"created"> {
  const record = {
    id: randomUUID(),
    submitted_at: new Date().toISOString(),
    source: summitPartners.source,
    company: lead.company,
    contact_name: lead.contactName,
    email: lead.email,
    whatsapp: lead.whatsapp,
    website: lead.website,
    partner_type: lead.partnerType,
    company_type: lead.companyType,
    goals: lead.goals,
    budget: lead.budget,
    consent_version: summitPartners.consentVersion,
  };

  const config = getSupabaseConfigState();
  if (config.status === "configured") {
    return saveSupabasePartnerLead(createSupabaseAdminClient(), record);
  }

  if (
    config.status === "misconfigured" ||
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL
  ) {
    throw new Error("Partner lead persistence requires configured Supabase credentials.");
  }

  // Development only: one file per submission, next to the attendee leads.
  const directory =
    process.env.SUMMIT_STORAGE_DIR ||
    path.join(process.cwd(), ".local", "leads");
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, `partner-${record.id}.json`),
    JSON.stringify(record),
    { flag: "wx", mode: 0o600 },
  );
  return "created";
}
