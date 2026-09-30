interface ImportMetaEnv {
  /** Supabase project URL, e.g. https://<ref>.supabase.co. See .env.example. */
  readonly PUBLIC_SUPABASE_URL: string;
  /** Supabase anon key. Public by design — access is enforced by RLS. */
  readonly PUBLIC_SUPABASE_ANON_KEY: string;

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
