export type Category = {
  slug: string;
  name: string;
  description: string;
};

export const categories: Category[] = [];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
