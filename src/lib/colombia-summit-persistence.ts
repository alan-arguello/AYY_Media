import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { saveSupabaseSummitInterest, type SummitPersistenceResult } from "@/lib/supabase/summit-interest";

import { colombiaSummit, type SummitInterest } from "@/lib/colombia-summit";
import {
  createSupabaseAdminClient,
  getSupabaseConfigState,
} from "@/lib/supabase/service-role";

export async function persistSummitInterest(interest: SummitInterest): Promise<SummitPersistenceResult> {
  const record = {
    id: randomUUID(),
    submitted_at: new Date().toISOString(),
    source: colombiaSummit.source,
    full_name: interest.fullName,
    email: interest.email,
    company: interest.company,
    linkedin_url: interest.linkedin,
    consent_version: colombiaSummit.consentVersion,
    ticket_type: interest.ticketType,
  };

  const config = getSupabaseConfigState();
  if (config.status === "configured") {
    return saveSupabaseSummitInterest(createSupabaseAdminClient(), record);
  }

  if (
    config.status === "misconfigured" ||
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL
  ) {
    throw new Error(
      "Summit interest persistence requires configured Supabase credentials.",
    );
  }

  const directory =
    process.env.SUMMIT_STORAGE_DIR ||
    path.join(process.cwd(), ".local", "leads");
  const filename = createHash("sha256").update(interest.email).digest("hex");
  await mkdir(directory, { recursive: true });
  try {
    await writeFile(
      path.join(directory, `${filename}.json`),
      JSON.stringify(record),
      { flag: "wx", mode: 0o600 },
    );
    return "created";
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "EEXIST"))
      throw error;
    return "already-registered";
  }
}
