// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';

// Set this to your real domain. It's used for canonical URLs and the RSS feed.
export default defineConfig({
  site: 'https://example.com',

  vite: {
    plugins: [tailwindcss()],
  },

  // NOTE: expressiveCode() MUST come before mdx() so code blocks inside .mdx
  // files are processed. Change `themes` to any bundled Shiki theme.
  integrations: [
    expressiveCode({
      themes: ['vitesse-dark'],
      styleOverrides: {
        borderRadius: '8px',
        borderColor: '#2a2620',
        codeFontFamily:
          'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace',
        uiFontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
      },
    }),
    mdx(),
  ],
});
