"use server";

import {
  parseSummitInterest,
  type SummitFormState,
  type SummitInterest,
} from "@/lib/colombia-summit";
import { persistSummitInterest } from "@/lib/colombia-summit-persistence";

export async function submitSummitInterest(
  _previous: SummitFormState,
  formData: FormData,
): Promise<SummitFormState> {
  const success: SummitFormState = {
    status: "success",
    message: "Ya estás en la lista.",
  };
  if (formData.get("website")) return success;

  const result = parseSummitInterest(formData);
  const values = {
    fullName: String(formData.get("fullName") ?? "").slice(0, 120),
    email: String(formData.get("email") ?? "").slice(0, 254),
    company: String(formData.get("company") ?? "").slice(0, 160),
    linkedin: String(formData.get("linkedin") ?? "").slice(0, 500),
    consent: formData.get("consent") === "on",
  };
  if (!result.success) {
    const errors: Partial<Record<keyof SummitInterest, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof SummitInterest;
      errors[field] ??= issue.message;
    }
    return {
      status: "error",
      message: "Revisa los campos señalados.",
      errors,
      values,
    };
  }

  try {
    await persistSummitInterest(result.data);
    return success;
  } catch (error) {
    console.error(
      "Colombia Summit registration failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return {
      status: "error",
      message:
        "No pudimos guardar tu registro. Inténtalo de nuevo o escríbenos a support@torrenegra.ai.",
      values: result.data,
    };
  }
}
