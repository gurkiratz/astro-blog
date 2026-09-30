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

  /** Cloudinary cloud name for /photos. Build-time only — the loader bakes
      every delivery URL into the page, so nothing here reaches the browser. */
  readonly PUBLIC_CLOUDINARY_CLOUD_NAME?: string;
  /** Accepted as an alias so one .env can serve a Next.js project too. */
  readonly NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?: string;
  /** Cloudinary API key — used to list assets at build time. */
  readonly PUBLIC_CLOUDINARY_API_KEY?: string;
  /** Cloudinary API secret. Never expose this to the client. */
  readonly CLOUDINARY_API_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
