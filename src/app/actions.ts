"use server";

import {
  parseSummitInterest,
  colombiaSummit,
  type SummitFormState,
  type SummitInterest,
} from "@/lib/colombia-summit";
import { persistSummitInterest } from "@/lib/colombia-summit-persistence";
import {
  parsePartnerLead,
  summitPartners,
  type PartnerFormState,
  type PartnerLead,
} from "@/lib/summit-partners";
import { persistPartnerLead } from "@/lib/summit-partners-persistence";

export async function submitSummitInterest(
  _previous: SummitFormState,
  formData: FormData,
): Promise<SummitFormState> {
  const success: SummitFormState = {
    status: "success",
    message: "Recibimos tu solicitud.",
  };
  if (formData.get("website")) return success;

  const result = parseSummitInterest(formData);
  const values = {
    fullName: String(formData.get("fullName") ?? "").slice(0, 120),
    email: String(formData.get("email") ?? "").slice(0, 254),
    whatsapp: String(formData.get("whatsapp") ?? "").slice(0, 32),
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
      message: result.data.ticketType !== "general" ? "Recibimos tu solicitud." : "Recibimos tu registro.",
      detail: `${
        result.data.ticketType !== "general"
          ? "Revisamos cada solicitud para la cena. Si hay un lugar para ti, te escribimos por correo o WhatsApp."
          : "Te escribimos por correo o WhatsApp con los siguientes pasos para asistir."
      } Para cambiar un registro anterior, escríbenos a ${colombiaSummit.contactEmail}.`,
    };
  } catch (error) {
    console.error(
      "Colombia Summit registration failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return {
      status: "error",
      message:
        `No pudimos guardar tu solicitud. Inténtalo de nuevo o escríbenos a ${colombiaSummit.contactEmail}.`,
      values: result.data,
    };
  }
}

export async function submitPartnerLead(
  _previous: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  const success: PartnerFormState = {
    status: "success",
    message: "Recibimos tu propuesta.",
  };
  // Honeypot: a field people never see. Bots that fill it get a quiet "ok".
  if (formData.get("fax")) return success;

  const result = parsePartnerLead(formData);
  const text = (name: string, max: number) =>
    String(formData.get(name) ?? "").slice(0, max);
  const values = {
    company: text("company", 160),
    contactName: text("contactName", 120),
    email: text("email", 254),
    whatsapp: text("whatsapp", 32),
    website: text("website", 500),
    partnerType: text("partnerType", 40),
    companyType: text("companyType", 160),
    goals: text("goals", 600),
    budget: text("budget", 40),
    consent: formData.get("consent") === "on",
  };
  if (!result.success) {
    const errors: Partial<Record<keyof PartnerLead, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof PartnerLead;
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
    await persistPartnerLead(result.data);
    return {
      ...success,
      detail: `Te escribimos en los próximos días para conversar. Si prefieres adelantarte, escríbenos a ${summitPartners.contactEmail}.`,
    };
  } catch (error) {
    console.error(
      "Summit partner lead failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return {
      status: "error",
      message: `No pudimos guardar tu propuesta. Inténtalo de nuevo o escríbenos a ${summitPartners.contactEmail}.`,
      values,
    };
  }
}
