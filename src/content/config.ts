import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    author: z.string(),
    tags: z.array(z.string()).default([]),
    excerpt: z.string(),
    coverImage: z.string(),
    lang: z.enum(['es', 'en']).default('es'),
    readingTime: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog: blogCollection };
