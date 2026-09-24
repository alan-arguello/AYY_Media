import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { colombiaSummit, type SummitInterest } from "@/lib/colombia-summit";
import {
  createSupabaseAdminClient,
  getSupabaseConfigState,
} from "@/lib/supabase/service-role";

export async function persistSummitInterest(interest: SummitInterest) {
  const record = {
    id: randomUUID(),
    submitted_at: new Date().toISOString(),
    source: colombiaSummit.source,
    full_name: interest.fullName,
    email: interest.email,
    company: interest.company,
    linkedin_url: interest.linkedin,
    consent_version: colombiaSummit.consentVersion,
  };

  const config = getSupabaseConfigState();
  if (config.status === "configured") {
    // Repeated submissions must not overwrite an existing person's details.
    const { error } = await createSupabaseAdminClient()
      .from("colombia_summit_interests")
      .upsert(record, { onConflict: "email", ignoreDuplicates: true });
    if (error)
      throw new Error(`Summit interest persistence failed: ${error.code}`);
    return;
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
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "EEXIST"))
      throw error;
  }
}
