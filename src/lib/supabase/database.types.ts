type Interest = {
  id: string;
  submitted_at: string;
  source: string;
  full_name: string;
  email: string;
  company: string;
  linkedin_url: string;
  consent_version: string;
  ticket_type: "general" | "vip" | "vip-plus" | null;
  whatsapp: string | null;
};

type PartnerLead = {
  id: string;
  submitted_at: string;
  source: string;
  company: string;
  contact_name: string;
  email: string;
  whatsapp: string | null;
  website: string;
  partner_type: "sponsor" | "speaker" | "media" | "other";
  company_type: string;
  goals: string;
  budget: "under-5k" | "5k-10k" | "10k-25k" | "25k-50k" | "over-50k" | "undecided";
  consent_version: string;
};

export type Database = {
  public: {
    Tables: {
      colombia_summit_interests: {
        Row: Interest;
        Insert: Omit<Interest, "id" | "submitted_at" | "ticket_type" | "whatsapp"> &
          Partial<Pick<Interest, "id" | "submitted_at" | "ticket_type" | "whatsapp">>;
        Update: Partial<Interest>;
        Relationships: [];
      };
      colombia_summit_partner_leads: {
        Row: PartnerLead;
        Insert: Omit<PartnerLead, "id" | "submitted_at"> &
          Partial<Pick<PartnerLead, "id" | "submitted_at">>;
        Update: Partial<PartnerLead>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
