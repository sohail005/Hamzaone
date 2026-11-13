export type Category = {
  slug: string;
  name: string;
  description: string;
  enabled?: boolean;
  imageKey?: string;
};

export const categories: Category[] = [];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
