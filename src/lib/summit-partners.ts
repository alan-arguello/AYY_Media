import { z } from "zod";
// Extension on purpose: node --test loads this file without a bundler.
import { colombiaSummit, toE164, whatsappHint } from "./colombia-summit.ts";

// Partner and sponsor leads: a separate list from attendees, with its own
// source and consent text. The database only accepts these two values.
export const summitPartners = {
  source: "colombia-summit-2026-partners",
  consentVersion: "aiyaiyai-partners-2026-v1",
  contactEmail: colombiaSummit.contactEmail,
} as const;

export const partnerTypes = [
  {
    id: "sponsor",
    name: "Sponsor aliado",
    description:
      "Tu marca en el evento y en todo lo que hacemos, con un lugar en la cena.",
  },
  {
    // Kept as "speaker" in the database; the lunch has no stage, so it is a seat.
    id: "speaker",
    name: "Un lugar en la mesa",
    description: "Alguien de tu equipo en la cena privada, con los anfitriones y el grupo.",
  },
  {
    id: "media",
    name: "Media partner",
    description: "Difusión, contenido o comunidad.",
  },
  { id: "other", name: "Otro", description: "Cuéntanos qué tienes en mente." },
] as const;

export const partnerBudgets = [
  { id: "under-5k", label: "Menos de USD 5.000" },
  { id: "5k-10k", label: "USD 5.000 a 10.000" },
  { id: "10k-25k", label: "USD 10.000 a 25.000" },
  { id: "25k-50k", label: "USD 25.000 a 50.000" },
  { id: "over-50k", label: "Más de USD 50.000" },
  { id: "undecided", label: "Por definir" },
] as const;

const ids = <T extends readonly { id: string }[]>(items: T) =>
  items.map((item) => item.id) as [T[number]["id"], ...T[number]["id"][]];

// Optional here: a company contact may prefer email. Normalized like the
// attendee form when given.
const optionalWhatsapp = z
  .string()
  .trim()
  .max(32, "Revisa tu número de WhatsApp.")
  .default("")
  .transform((value, ctx) => {
    if (!value) return null;
    const e164 = toE164(value);
    if (!e164) {
      ctx.addIssue({ code: "custom", message: whatsappHint });
      return z.NEVER;
    }
    return e164;
  });

// Optional company site, stored as a canonical https URL with no credentials.
const website = z
  .string()
  .trim()
  .max(500, "Revisa la dirección de tu sitio web.")
  .default("")
  .transform((value, ctx) => {
    if (!value) return "";
    try {
      const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
      if (
        !/^https?:$/.test(url.protocol) ||
        url.username ||
        url.password ||
        !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(url.hostname) ||
        /\s/.test(value) ||
        url.href.length > 500
      )
        throw new Error("Invalid website");
      return url.href;
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "Usa la dirección de tu sitio web, por ejemplo empresa.com, o deja este campo vacío.",
      });
      return z.NEVER;
    }
  });

export const partnerLeadSchema = z.object({
  company: z
    .string()
    .trim()
    .min(2, "Escribe el nombre de tu empresa.")
    .max(160, "Usa un nombre de hasta 160 caracteres."),
  contactName: z
    .string()
    .trim()
    .min(2, "Escribe tu nombre completo.")
    .max(120, "Usa un nombre de hasta 120 caracteres."),
  email: z
    .email("Revisa tu correo electrónico.")
    .max(254)
    .transform((email) => email.toLowerCase()),
  whatsapp: optionalWhatsapp,
  website,
  partnerType: z.enum(ids(partnerTypes), {
    error: "Elige el tipo de alianza que te interesa.",
  }),
  companyType: z.string().trim().max(160, "Usa hasta 160 caracteres.").default(""),
  goals: z.string().trim().max(600, "Usa hasta 600 caracteres.").default(""),
  budget: z.enum(ids(partnerBudgets), {
    error: "Elige un rango de presupuesto.",
  }),
  consent: z.literal(true, {
    error: "Autoriza el contacto para conversar sobre la alianza.",
  }),
});

export type PartnerLead = z.infer<typeof partnerLeadSchema>;
export type PartnerType = PartnerLead["partnerType"];
export type PartnerBudget = PartnerLead["budget"];
export type PartnerFormState = {
  status: "idle" | "error" | "success";
  message: string;
  detail?: string;
  errors?: Partial<Record<keyof PartnerLead, string>>;
  values?: {
    company: string;
    contactName: string;
    email: string;
    whatsapp: string;
    website: string;
    partnerType: string;
    companyType: string;
    goals: string;
    budget: string;
    consent: boolean;
  };
};

export const initialPartnerFormState: PartnerFormState = {
  status: "idle",
  message: "",
};

const text = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value : "";

export function parsePartnerLead(formData: FormData) {
  return partnerLeadSchema.safeParse({
    company: text(formData.get("company")),
    contactName: text(formData.get("contactName")),
    email: text(formData.get("email")).trim(),
    whatsapp: text(formData.get("whatsapp")),
    website: text(formData.get("website")),
    partnerType: formData.get("partnerType"),
    companyType: text(formData.get("companyType")),
    goals: text(formData.get("goals")),
    budget: formData.get("budget"),
    consent: formData.get("consent") === "on",
  });
}
