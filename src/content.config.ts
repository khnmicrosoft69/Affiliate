// Tells Astro where product data lives and what shape it must have.
// There's one data file per category: src/data/products/<category id>.json
// The rules (the "schema") are built automatically from src/lib/categories.ts,
// so a typo like "ramGb" instead of "ramGB", or "price": "abc",
// stops the build and shows you exactly which product is wrong.
import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORIES, type Category, type SpecDef } from './lib/categories';

// The rule for one spec, based on its kind.
function specRule(def: SpecDef) {
  if (def.kind === 'number') return z.number();
  if (def.kind === 'boolean') return z.boolean();
  // choice: either one of the allowed options, or any text if no options are listed
  const one = def.options ? z.enum(def.options) : z.string();
  return def.multi ? z.array(one) : one;
}

// The rules for one product in a category.
function productSchema(category: Category) {
  const specRules = Object.fromEntries(
    // .optional(): a spec may be left out if you don't know it
    category.specs.map((def) => [def.key, specRule(def).optional()]),
  );
  return z.object({
    country: z.string().length(2), // "PH"
    store: z.string(),
    name: z.string(),
    price: z.number().positive(),
    link: z.url(),
    lastChecked: z.string(), // "YYYY-MM-DD"
    // Optional product photo: a file you put in public/images/products/
    // (write it as "/images/products/name.webp") or an image link from your affiliate dashboard.
    image: z.union([z.url(), z.string().regex(/^\/images\/products\//)]).optional(),
    // Who took the photo and under what license. Required by Creative Commons (CC BY / CC BY-SA)
    // photos, e.g. from Wikimedia Commons. Leave it out for photos from your affiliate dashboard.
    imageCredit: z
      .object({
        author: z.string(),
        license: z.string(), // e.g. "CC BY-SA 4.0"
        source: z.url(), // the photo's page, e.g. on commons.wikimedia.org
      })
      .optional(),
    // Your short, honest review. Required, and every product needs at least one con,
    // so the site never only praises (especially expensive items).
    review: z.string().min(20).max(220),
    pros: z.array(z.string()).max(3).default([]),
    cons: z.array(z.string()).min(1).max(3),
    specs: z.object(specRules).strict(), // strict: unknown spec names are errors
  });
}

// One "collection" (group of products) per category.
export const collections = Object.fromEntries(
  CATEGORIES.map((category) => [
    category.id,
    defineCollection({
      loader: file(`src/data/products/${category.id}.json`),
      schema: productSchema(category),
    }),
  ]),
);
