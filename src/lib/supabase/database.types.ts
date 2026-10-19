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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
