export type Category = {
  slug: string;
  name: string;
  description: string;
  enabled?: boolean;
};

export const categories: Category[] = [];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
