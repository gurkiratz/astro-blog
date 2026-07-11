// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import expressiveCode from "astro-expressive-code";

// Set this to your real domain. It's used for canonical URLs and the RSS feed.
export default defineConfig({
  site: "https://gurkiratz.co",

  vite: {
    plugins: [tailwindcss()],
  },

  // NOTE: expressiveCode() MUST come before mdx() so code blocks inside .mdx
  // files are processed. Change `themes` to any bundled Shiki theme.
  integrations: [
    expressiveCode({
      // One dark + one light theme; which one applies is driven by the
      // `data-theme="dark|light"` attribute on <html>, kept in sync with the
      // active site theme's `scheme` by ThemeBackground.astro (and the FOUC
      // script in Base.astro) — NOT by the visitor's OS preference.
      themes: ["vitesse-dark", "vitesse-light"],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
      // Astro 7 / Vite serves the hashed EC JS, but the external CSS link
      // 404s in dev (/_astro/ec.*.css), so code blocks look like plain text.
      // Inlining keeps styles on the page.
      emitExternalStylesheet: false,
      styleOverrides: {
        borderRadius: "8px",
        borderColor: ({ theme }) =>
          theme.type === "light" ? "#e2d8c4" : "#2a2620",
        codeFontFamily:
          'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace',
        uiFontFamily:
          '"Inter Variable", Inter, -apple-system, system-ui, sans-serif',
        uiFontSize: "0.75rem",
        frames: {
          // Keep a faint background so the button reads without hover.
          inlineButtonBackgroundIdleOpacity: "0.12",
          inlineButtonBorderOpacity: "0.35",
          tooltipSuccessBackground: ({ theme }) =>
            theme.type === "light" ? "#efe6d6" : "#1d1a14",
          tooltipSuccessForeground: ({ theme }) =>
            theme.type === "light" ? "#171513" : "#e9e4d7",
        },
      },
    }),
    mdx(),
  ],
});
