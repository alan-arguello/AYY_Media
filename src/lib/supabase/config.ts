type SupabaseEnvironment = {
  [key: string]: string | undefined;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

export function getSupabaseConfigState(env: SupabaseEnvironment = process.env) {
  const url =
    env.NEXT_PUBLIC_SUPABASE_URL?.trim() || env.SUPABASE_URL?.trim() || "";
  const secretKey =
    env.SUPABASE_SECRET_KEY?.trim() ||
    env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "";
  const status =
    !url && !secretKey
      ? "disabled"
      : !url || !secretKey
        ? "misconfigured"
        : "configured";
  return { status, url, secretKey } as const;
}
