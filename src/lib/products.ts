// Loads the products of every category into one list.
// Only used in .astro files (at build time), not in the browser.
import { getCollection, type CollectionKey } from 'astro:content';
import { CATEGORIES } from './categories';
import type { Product } from './match';

export async function getAllProducts(): Promise<Product[]> {
  const perCategory = await Promise.all(
    CATEGORIES.map(async (category) => {
      const entries = await getCollection(category.id as CollectionKey);
      return entries.map((entry) => ({
        ...(entry.data as Omit<Product, 'id' | 'category'>),
        id: `${category.id}/${entry.id}`, // e.g. "laptop/ph-acer-aspire-lite-14"
        category: category.id,
      }));
    }),
  );
  return perCategory.flat(); // turn [[...], [...]] into one list [...]
}
