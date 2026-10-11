"use server";

import {
  parseSummitInterest,
  colombiaSummit,
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
    message: "Recibimos tu interés.",
  };
  if (formData.get("website")) return success;

  const result = parseSummitInterest(formData);
  const values = {
    fullName: String(formData.get("fullName") ?? "").slice(0, 120),
    email: String(formData.get("email") ?? "").slice(0, 254),
    company: String(formData.get("company") ?? "").slice(0, 160),
    linkedin: String(formData.get("linkedin") ?? "").slice(0, 500),
    ticketType: String(formData.get("ticketType") ?? "").slice(0, 40),
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
    // Keep the public response the same for new and duplicate emails. Do not
    // disclose whether a person already registered or which ticket they chose.
    return {
      status: "success",
      message: "Gracias por tu interés.",
      detail: `Te contactaremos con los próximos pasos para asistir. Si ya habías elegido un ticket en un registro anterior, conservamos esa preferencia; para cambiarla, escríbenos a ${colombiaSummit.contactEmail}.${result.data.ticketType === "general" ? "" : " Las solicitudes VIP y VIP Plus están sujetas a aceptación y disponibilidad."}`,
    };
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
