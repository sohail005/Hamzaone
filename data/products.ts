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
  imageKeys?: string[];
  videoKey?: string;
  // Unpublished products are hidden from the storefront but stay editable in admin.
  // Absent/undefined is treated as published (existing products default to visible).
  published?: boolean;
  // Admin-tracked available units. Undefined means stock isn't tracked for this
  // product (availability is controlled only by the `availability` field). When
  // set, it decrements on paid orders and the product goes out of stock at 0.
  stock?: number;
  shape: "vase" | "planter" | "lamp" | "coaster" | "stand" | "organizer" | "cup" | "riser" | "plate" | "keychain" | "bookmark" | "tag" | "dragon" | "elephant" | "ganesha" | "octopus" | "hook" | "lid" | "gear" | "pull" | "part";
  unavailableCombo?: { color: string; size: string };
  isNew?: boolean;
  // Packed-for-shipping dimensions, used for courier delivery estimates (see
  // lib/skyfleet.ts) and shipment-booking.
  weightKg?: number;
  lengthCm?: number;
  breadthCm?: number;
  heightCm?: number;
};

export const products: Product[] = [];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string) {
  return products.filter((p) => p.category === category);
}
