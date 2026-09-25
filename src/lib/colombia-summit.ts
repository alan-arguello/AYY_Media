import { z } from "zod";

export const colombiaSummit = {
  name: "Accelerating LATAM Summit",
  path: "/",
  date: "2026-11-19",
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

export const summitInterestSchema = z.object({
  fullName: z.string().trim().min(2, "Escribe tu nombre completo.").max(120),
  email: z
    .email("Revisa tu correo electrónico.")
    .max(254)
    .transform((email) => email.toLowerCase()),
  company: z.string().trim().max(160).default(""),
  linkedin: linkedinProfile,
  consent: z.literal(true, {
    error: "Autoriza el contacto para recibir novedades.",
  }),
});

export type SummitInterest = z.infer<typeof summitInterestSchema>;
export type SummitFormState = {
  status: "idle" | "error" | "success";
  message: string;
  errors?: Partial<Record<keyof SummitInterest, string>>;
  values?: Omit<SummitInterest, "consent"> & { consent: boolean };
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
    company: formData.get("company") ?? "",
    linkedin: formData.get("linkedin") ?? "",
    consent: formData.get("consent") === "on",
  });
}
