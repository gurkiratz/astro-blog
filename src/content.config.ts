import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// An optional string that tolerates a blank frontmatter key. In YAML an empty
// `description:` line parses as null, which a plain z.string().optional() would
// reject (typeof null === "object"). We coerce null → undefined so blank keys
// behave as "absent" and downstream `= default` fallbacks still fire.
const optionalString = z
  .string()
  .nullish()
  .transform((v) => v ?? undefined);

// The /writing collection. Drop a .md file in src/content/writing/ and it
// shows up automatically. Frontmatter is type-checked against this schema.
const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    description: optionalString,
    draft: z.boolean().default(false),
  }),
});

// The /photography collection. One folder per photo:
//   src/content/photos/<slug>/index.md   (notes + metadata)
//   src/content/photos/<slug>/photo.jpg  (the image, optimized at build)
// SHORT note = `caption` (optional). LONG note = the markdown body (optional).
const photos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/photos' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      image: image(),
      alt: z.string(),
      caption: optionalString,
      location: optionalString,
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { writing, photos };
