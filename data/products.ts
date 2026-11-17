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

// Admins only type a colour name (e.g. "Terracotta") — the swatch hex is
// derived from it deterministically rather than asked for separately, since
// manually picking/typing a hex code was a recurring source of admin
// confusion (duplicated inputs, hex pasted into the name field, etc). This
// isn't meant to be colour-accurate, just a stable, distinct swatch per name.
export function colorNameToHex(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return hslToHex(hue, 45, 65);
}

function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string) {
  return products.filter((p) => p.category === category);
}
