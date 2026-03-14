import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const productsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    price: z.number(),
    category: z.enum(['figurines', 'functional', 'decorative', 'custom', 'industrial']),
    description: z.string(),
    shortDescription: z.string(),
    image: z.string(),
    images: z.array(z.string()).optional().default([]),
    inStock: z.boolean().default(true),
    featured: z.boolean().default(false),
    material: z.string().optional(),
    dimensions: z.string().optional(),
    weight: z.string().optional(),
    printTime: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
  }),
});

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

export const collections = {
  products: productsCollection,
  blog: blogCollection,
};
