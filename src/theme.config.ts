// ─────────────────────────────────────────────────────────────
//  Background themes: each entry pairs an image (from /public)
//  with an accent color and a scrim strength. The image is shown
//  as a plain fixed, cover-cropped background — no shaders.
//  Picked from the "theme" button in the header, persisted in
//  localStorage.
// ─────────────────────────────────────────────────────────────

/** Site palette tokens (see global.css) a theme may override at runtime. */
export type PaletteKey =
  | "base"
  | "surface"
  | "ink"
  | "muted"
  | "faint"
  | "rule"
  | "tag-teal"
  | "tag-amber"
  | "tag-pink"
  | "selection"
  | "selection-fg";

export interface ThemeEntry {
  /** Shown in the theme picker. Falls back to the image filename if omitted. */
  name?: string;
  /** Path to an image in /public. Omit for a flat, image-less theme. */
  image?: string;
  /**
   * Path to a video in /public, looped as the background while this theme
   * is active. The image is still used as the instant-paint stand-in until
   * the video is buffered (and as the fallback when the visitor prefers
   * reduced motion), so keep both in sync visually.
   */
  video?: string;
  /** Applied to --color-accent (see global.css) while this theme is active. */
  color: string;
  /**
   * CSS background-position for the image, e.g. "center bottom" to keep the
   * interesting part of the image anchored to the bottom edge on every
   * viewport shape. Defaults to "center".
   */
  position?: string;
  /**
   * Dark scrim strength over the image, 0-100, same number you'd put after
   * the slash in a Tailwind class like `bg-base/90` (this just isn't one —
   * Tailwind only generates CSS for classes it can see literally in source,
   * not ones built from a runtime value, so this drives a CSS variable
   * instead). Higher = more scrim = more legible text, less visible image.
   * Defaults to 85 if omitted.
   */
  opacity?: number;
  /**
   * Optional overrides for the site's color tokens while this theme is
   * active, e.g. a neutral grayscale for an image-less monochrome theme.
   * Keys map to --color-<key> in global.css.
   */
  palette?: Partial<Record<PaletteKey, string>>;
  /**
   * CSS color-scheme while this theme is active — controls native UI like
   * form controls and scrollbars. Defaults to "dark".
   */
  scheme?: "light" | "dark";
}

/** Every palette key any theme overrides — used to reset overrides on switch. */
export const PALETTE_KEYS: PaletteKey[] = [
  "base",
  "surface",
  "ink",
  "muted",
  "faint",
  "rule",
  "tag-teal",
  "tag-amber",
  "tag-pink",
  "selection",
  "selection-fg",
];

const DEFAULT_SCRIM_OPACITY = 85;
const DEFAULT_POSITION = "center";

// The first entry is the default for new visitors.
export const themes: ThemeEntry[] = [
  {
    name: "Dark",
    color: "#ffffff",
    opacity: 100,
    palette: {
      base: "#101010",
      surface: "#1a1a1a",
      ink: "#ececec",
      muted: "#9a9a9a",
      faint: "#6e6e6e",
      rule: "#262626",
      selection: "#F7CF7B",
    },
  },
  {
    name: "Paper",
    color: "#111111",
    opacity: 100,
    scheme: "light",
    palette: {
      base: "#f7f1e7",
      surface: "#efe6d6",
      ink: "#171513",
      muted: "#6f6b63",
      faint: "#a3a099",
      rule: "#e2d8c4",
      // Darker tag/inline-code colors so they stay readable on light.
      "tag-teal": "#0f766e",
      "tag-amber": "#b45309",
      "tag-pink": "#be185d",
      selection: "#F7CF7B",
      "selection-fg": "#171513",
    },
  },
  {
    name: "Bloom",
    image: "/flowers-bottom.jpg",
    color: "#f2d478",
    position: "center bottom",
    opacity: 80,
  },
  {
    name: "Alpine",
    image: "/painting.jpg",
    color: "#a9c491",
    position: "center bottom",
    opacity: 80,
  },
  {
    name: "After Hours",
    // First frame of the video (extracted with ffmpeg), so the stand-in
    // image and the video match exactly and the fade-in is seamless.
    image: "/cafe-poster.jpg",
    video: "/cafe-video.mp4",
    color: "#e89a5d",
    opacity: 76,
  },
  {
    name: "Dusk",
    image: "/purple.jpg",
    color: "#b48ce0",
    opacity: 76,
  },
];

/** A theme's scrim opacity as a 0-1 fraction for direct use as a CSS `opacity` value. */
export function themeOpacityFraction(theme: ThemeEntry): number {
  return (theme.opacity ?? DEFAULT_SCRIM_OPACITY) / 100;
}

/** A theme's CSS background-position. */
export function themePosition(theme: ThemeEntry): string {
  return theme.position ?? DEFAULT_POSITION;
}

/** Display label for a theme: its custom name, or the image filename without extension. */
export function themeLabel(theme: ThemeEntry): string {
  if (theme.name) return theme.name;
  const filename = theme.image?.split("/").pop();
  return filename ? filename.replace(/\.[a-z0-9]+$/i, "") : "Theme";
}

// Also hardcoded (deliberately, see the comment there) in the FOUC-avoiding
// inline script in Base.astro's <head> — keep both in sync if this changes.
export const THEME_STORAGE_KEY = "theme";

export function getStoredThemeIndex(): number {
  const raw = localStorage.getItem(THEME_STORAGE_KEY);
  const index = raw === null ? 0 : Number(raw);
  return Number.isInteger(index) && index >= 0 && index < themes.length
    ? index
    : 0;
}
