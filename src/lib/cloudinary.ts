// The /photos Cloudinary bridge.
//
// Every album under PHOTOS_ROOT on Cloudinary becomes one entry in the
// `albums` content collection, loaded once at build time. The loader does all
// the URL math here so the React islands receive plain, ready-to-render data
// and never talk to Cloudinary themselves — no API key reaches the browser,
// and a built page keeps working even if the account is later locked down.
//
// astro-cloudinary's `cldAssetsLoader` would be the off-the-shelf option, but
// its latest release peers on astro@^3 || ^4 || ^5 and this site is on 7.
// A loader is a ~60-line contract, so we implement it directly against the
// Admin API instead of pinning a mismatched dependency.
import type { Loader } from "astro/loaders";
import { z } from "astro:content";

/** Everything below this Cloudinary folder is an album. One level deep. */
export const PHOTOS_ROOT = "gurkirat-website/photography";

// `NEXT_PUBLIC_` is what the account's other project uses; accept it so one
// .env can serve both. Nothing here is inlined into the client bundle.
const cloudName =
  import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME ??
  import.meta.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
  process.env.PUBLIC_CLOUDINARY_CLOUD_NAME ??
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey =
  import.meta.env.PUBLIC_CLOUDINARY_API_KEY ??
  process.env.PUBLIC_CLOUDINARY_API_KEY;
const apiSecret =
  import.meta.env.CLOUDINARY_API_SECRET ?? process.env.CLOUDINARY_API_SECRET;

/** Widths we ask Cloudinary for. Each is capped to the original's width, so
    an image narrower than the step is never upscaled into a bigger file. */
const WIDTH_STEPS = [480, 800, 1200, 1600, 2400] as const;

/** The width whose URL lands in `src` — the sensible no-srcset fallback. */
const FALLBACK_WIDTH = 1200;

const imageSchema = z.object({
  src: z.string(),
  width: z.number(),
  height: z.number(),
});

const photoSchema = z.object({
  /** Cloudinary public_id — stable, and unique within the cloud. */
  id: z.string(),
  alt: z.string(),
  width: z.number(),
  height: z.number(),
  src: z.string(),
  srcSet: z.array(imageSchema),
});

const albumSchema = z.object({
  /** URL slug — the `[album]` in /photos/[album]. */
  slug: z.string(),
  /** The Cloudinary folder name, shown verbatim as the album title. */
  name: z.string(),
  /** Full Cloudinary path, kept so the folder stays findable from an entry. */
  path: z.string(),
  photos: z.array(photoSchema),
  /** Newest photo in the album — how /photos orders its folders. */
  updated: z.date(),
});

export type Album = z.infer<typeof albumSchema>;
export type AlbumPhoto = z.infer<typeof photoSchema>;

/** A Cloudinary public_id may contain spaces and slashes ("day in the
    office/dsc00762"). Slashes are path separators and must survive; every
    other reserved character has to be escaped. */
function encodePublicId(publicId: string) {
  return publicId.split("/").map(encodeURIComponent).join("/");
}

/**
 * Build a delivery URL. `f_auto,q_auto` lets Cloudinary pick the format and
 * quality per request (AVIF/WebP where supported); `c_limit` scales down to
 * fit `width` (and `height`, if given) but never up, so a 1024px original
 * stays 1024px.
 */
export function deliveryUrl(
  publicId: string,
  format: string,
  version: number,
  size: { width: number; height?: number }
) {
  const transform = [
    "f_auto",
    "q_auto",
    "c_limit",
    `w_${size.width}`,
    ...(size.height ? [`h_${size.height}`] : []),
  ].join(",");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/v${version}/${encodePublicId(
    publicId
  )}.${format}`;
}

/** Cloudinary folder name -> URL slug. "day in the office" -> "day-in-the-office" */
export function slugify(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** One asset as the Admin API's search endpoint returns it. */
interface CloudinaryResource {
  public_id: string;
  /** Present in both fixed- and dynamic-folder accounts. */
  folder?: string;
  asset_folder?: string;
  filename: string;
  format: string;
  version: number;
  width: number;
  height: number;
  created_at: string;
  context?: { alt?: string; caption?: string };
}

/** Page through /resources/search until Cloudinary stops handing out cursors. */
async function searchAllAssets(): Promise<CloudinaryResource[]> {
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const resources: CloudinaryResource[] = [];
  let cursor: string | undefined;

  do {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // The trailing /* is what makes this recurse into each album.
          expression: `asset_folder:"${PHOTOS_ROOT}/*" AND resource_type:image`,
          max_results: 500,
          with_field: ["context"],
          sort_by: [{ created_at: "desc" }],
          ...(cursor ? { next_cursor: cursor } : {}),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Cloudinary search failed: ${response.status} ${response.statusText}`
      );
    }

    const page = await response.json();
    resources.push(...(page.resources ?? []));
    cursor = page.next_cursor ?? undefined;
  } while (cursor);

  return resources;
}

function toPhoto(
  resource: CloudinaryResource,
  albumName: string,
  index: number,
  total: number
): AlbumPhoto {
  const { public_id, format, version, width, height } = resource;

  // Never ask for more pixels than the original has: the largest step is the
  // original width itself, and duplicate steps collapse.
  const widths = [...new Set(WIDTH_STEPS.filter((w) => w < width)), width];


  return {
    id: public_id,
    // Cloudinary's structured metadata when it's there. Otherwise the best
    // honest fallback: the set it belongs to and where it sits in it, which
    // at least distinguishes one photo from the next. Add an `alt` in
    // Cloudinary's Context metadata to describe a photo properly.
    alt:
      resource.context?.alt ??
      resource.context?.caption ??
      `${albumName} — photo ${index + 1} of ${total}`,
    width,
    height,
    src: deliveryUrl(public_id, format, version, {
      width: Math.min(FALLBACK_WIDTH, width),
    }),
    srcSet: widths.map((w) => ({
      src: deliveryUrl(public_id, format, version, { width: w }),
      width: w,
      height: Math.round((height / width) * w),
    })),
  };
}

/**
 * Groups every image under PHOTOS_ROOT into one album per immediate
 * subfolder. Assets sitting loose in the root itself have no album to belong
 * to and are skipped — put them in a folder to publish them.
 */
export function cloudinaryAlbums(): Loader {
  return {
    name: "cloudinary-albums",
    schema: albumSchema,
    load: async ({ store, logger, parseData, generateDigest }) => {
      if (!cloudName || !apiKey || !apiSecret) {
        logger.warn(
          "Cloudinary is not configured — /photos will be empty. Set PUBLIC_CLOUDINARY_CLOUD_NAME, PUBLIC_CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET (see .env.example)."
        );
        store.clear();
        return;
      }

      const resources = await searchAllAssets();
      const byFolder = new Map<string, CloudinaryResource[]>();

      for (const resource of resources) {
        const folder = resource.asset_folder ?? resource.folder ?? "";
        const relative = folder.slice(PHOTOS_ROOT.length + 1);
        // "day in the office" -> an album. "" (the root) or "a/b" (nested
        // deeper than one level) -> not one.
        if (!relative || relative.includes("/")) continue;

        const album = byFolder.get(relative);
        if (album) album.push(resource);
        else byFolder.set(relative, [resource]);
      }

      store.clear();

      for (const [name, assets] of byFolder) {
        // Ascending filename keeps a shoot in the order it was shot —
        // dsc00762, dsc00765, dsc00766 — which is how the set reads.
        assets.sort((a, b) => a.filename.localeCompare(b.filename));

        const album = {
          slug: slugify(name),
          name,
          path: `${PHOTOS_ROOT}/${name}`,
          photos: assets.map((asset, i) =>
            toPhoto(asset, name, i, assets.length)
          ),
          updated: new Date(
            Math.max(...assets.map((a) => new Date(a.created_at).valueOf()))
          ),
        };

        const data = await parseData({ id: album.slug, data: album });
        store.set({ id: album.slug, data, digest: generateDigest(data) });
      }

      logger.info(
        `Loaded ${byFolder.size} album(s), ${resources.length} photo(s) from Cloudinary.`
      );
    },
  };
}
