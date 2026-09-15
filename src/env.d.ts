interface ImportMetaEnv {
  /** Supabase project URL, e.g. https://<ref>.supabase.co. See .env.example. */
  readonly PUBLIC_SUPABASE_URL: string;
  /** Supabase anon key. Public by design — access is enforced by RLS. */
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
