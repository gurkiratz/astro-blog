interface ImportMetaEnv {
  /** Supabase project URL, e.g. https://<ref>.supabase.co. See .env.example. */
  readonly PUBLIC_SUPABASE_URL: string;
  /** Supabase anon key. Public by design — access is enforced by RLS. */
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  /**
   * tldraw license key. Required on any real domain: without one tldraw
   * enters "unlicensed-production" and removes the editor after 5 seconds.
   * Localhost is exempt, which is why this is easy to miss until deploy.
   */
  readonly PUBLIC_TLDRAW_LICENSE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
