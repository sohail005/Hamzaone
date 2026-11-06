export type Category = {
  slug: string;
  name: string;
  description: string;
};

export const categories: Category[] = [
  { slug: "home-decor", name: "Home Decor", description: "Vases, planters and lamp shades" },
  { slug: "desk", name: "Desk & Workspace", description: "Organizers, stands and riser accessories" },
  { slug: "personalised", name: "Personalised", description: "Name plates, keychains and tags" },
  { slug: "figurines", name: "Figurines", description: "Articulated and display figures" },
  { slug: "functional", name: "Functional Parts", description: "Everyday useful prints" },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
