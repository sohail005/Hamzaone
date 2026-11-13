export type Availability = "available" | "made-to-order" | "low-stock" | "out-of-stock";

export type ColorOption = {
  name: string;
  hex: string;
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  largePrice?: number;
  availability: Availability;
  material: string;
  colors: ColorOption[];
  description: string;
  shape: "vase" | "planter" | "lamp" | "coaster" | "stand" | "organizer" | "cup" | "riser" | "plate" | "keychain" | "bookmark" | "tag" | "dragon" | "elephant" | "ganesha" | "octopus" | "hook" | "lid" | "gear" | "pull" | "part";
  unavailableCombo?: { color: string; size: string };
  isNew?: boolean;
};

export const COLORS: Record<string, ColorOption> = {
  Terracotta: { name: "Terracotta", hex: "#C2693C" },
  Charcoal: { name: "Charcoal", hex: "#3B3D42" },
  Sand: { name: "Sand", hex: "#D9C8A9" },
  Sage: { name: "Sage", hex: "#8A9A7E" },
};

export const products: Product[] = [];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string) {
  return products.filter((p) => p.category === category);
}
