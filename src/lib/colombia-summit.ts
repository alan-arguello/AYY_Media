import { z } from "zod";

export const colombiaSummit = {
  name: "bogota.forward() summit",
  path: "/",
  date: "2026-11-19",
  // The private dinner: arrival 1:30 p. m., happy hour from 5:30 p. m.
  startDate: "2026-11-19T13:30:00-05:00",
  endDate: "2026-11-19T18:00:00-05:00",
  source: "colombia-summit-2026",
  consentVersion: "aiyaiyai-summit-2026-v1",
  organizer: "AIYaiYai",
  channel: "https://www.youtube.com/@aiyaiyaimedia",
  contactEmail: "support@torrenegra.ai",
} as const;

const linkedinProfile = z
  .string()
  .trim()
  .max(500)
  .default("")
  .transform((value, ctx) => {
    if (!value) return "";
    try {
      const url = new URL(
        /^https?:\/\//i.test(value) ? value : `https://${value}`,
      );
      if (
        !/^(www\.|[a-z]{2}\.)?linkedin\.com$/i.test(url.hostname) ||
        url.username ||
        url.password ||
        url.port ||
        !/^\/in\/[\p{L}\p{N}_.%-]+\/?$/u.test(url.pathname) ||
        /[/?#\s]/u.test(
          decodeURIComponent(
            url.pathname.replace(/^\/in\//, "").replace(/\/$/, ""),
          ),
        )
      )
        throw new Error("Invalid LinkedIn profile");
      return `https://www.linkedin.com${url.pathname.replace(/\/$/, "")}/`;
    } catch {
      ctx.addIssue({
        code: "custom",
        message:
          "Usa el enlace a tu perfil de LinkedIn, o deja este campo vacío.",
      });
      return z.NEVER;
    }
  });

// Stored in E.164 (+573001234567) so numbers open directly in wa.me links.
// A bare Colombian mobile (3xx xxx xxxx, with or without 57) gets +57; any
// other number must carry its country code, with "+" or "00". Returns null
// when the input is not a usable number.
export function toE164(value: string): string | null {
  const compact = value.replace(/[\s().-]/g, "");
  const digits = compact.replace(/^(\+|00)/, "");
  const international = digits !== compact;
  let e164 = "";
  if (/^\d+$/.test(digits)) {
    if (international) e164 = `+${digits}`;
    else if (/^3\d{9}$/.test(digits)) e164 = `+57${digits}`;
    else if (/^573\d{9}$/.test(digits)) e164 = `+${digits}`;
  }
  return /^\+[1-9]\d{6,14}$/.test(e164) ? e164 : null;
}
export const whatsappHint =
  "Revisa tu número e incluye el indicativo de tu país, por ejemplo +57 300 123 4567.";

const whatsappNumber = z
  .string({ error: "Escribe tu número de WhatsApp." })
  .trim()
  .max(32, "Revisa tu número de WhatsApp.")
  .transform((value, ctx) => {
    const e164 = toE164(value);
    if (!e164) {
      ctx.addIssue({
        code: "custom",
        message: value ? whatsappHint : "Escribe tu número de WhatsApp.",
      });
      return z.NEVER;
    }
    return e164;
  });

export const summitInterestSchema = z.object({
  fullName: z.string().trim().min(2, "Escribe tu nombre completo.").max(120),
  email: z
    .email("Revisa tu correo electrónico.")
    .max(254)
    .transform((email) => email.toLowerCase()),
  whatsapp: whatsappNumber,
  // Every seat is reviewed by hand, so company and LinkedIn are required.
  company: z
    .string({ error: "Escribe tu empresa." })
    .trim()
    .min(2, "Escribe tu empresa.")
    .max(160, "Usa hasta 160 caracteres."),
  linkedin: linkedinProfile.refine((url) => url !== "", {
    message: "Comparte tu perfil de LinkedIn: lo usamos para revisar tu solicitud.",
  }),
  // "general" (the retired summit ticket) stays valid in the database only.
  ticketType: z.enum(["vip", "vip-plus"], {
    error: "Elige General o VIP.",
  }),
  consent: z.literal(true, {
    error: "Autoriza el contacto para recibir novedades.",
  }),
});

export type SummitInterest = z.infer<typeof summitInterestSchema>;
export type SummitTicketType = SummitInterest["ticketType"];
export type SummitFormState = {
  status: "idle" | "error" | "success";
  message: string;
  detail?: string;
  errors?: Partial<Record<keyof SummitInterest, string>>;
  values?: Omit<SummitInterest, "consent" | "ticketType"> & {
    consent: boolean;
    ticketType: string;
  };
};

export const initialSummitFormState: SummitFormState = {
  status: "idle",
  message: "",
};

export function parseSummitInterest(formData: FormData) {
  return summitInterestSchema.safeParse({
    fullName: formData.get("fullName"),
    email:
      typeof formData.get("email") === "string"
        ? String(formData.get("email")).trim()
        : null,
    whatsapp: formData.get("whatsapp") ?? "",
    company: formData.get("company") ?? "",
    linkedin: formData.get("linkedin") ?? "",
    ticketType: formData.get("ticketType"),
    consent: formData.get("consent") === "on",
  });
}
