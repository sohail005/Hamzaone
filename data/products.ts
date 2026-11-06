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

const allColors = [COLORS.Terracotta, COLORS.Charcoal, COLORS.Sand, COLORS.Sage];

export const products: Product[] = [
  { slug: "spiral-decor-vase", name: "Spiral Decor Vase", category: "home-decor", price: 699, largePrice: 999, availability: "available", material: "PLA", colors: allColors, unavailableCombo: { color: "Sage", size: "Large" }, description: "A ribbed spiral vase with a smooth matte finish, printed in-house layer by layer.", shape: "vase", isNew: true },
  { slug: "ribbed-bud-vase", name: "Ribbed Bud Vase", category: "home-decor", price: 549, availability: "available", material: "PLA", colors: allColors, description: "A slim bud vase with fine vertical ribbing, perfect for single stems.", shape: "vase" },
  { slug: "geometric-planter", name: "Geometric Planter", category: "home-decor", price: 449, availability: "available", material: "PETG", colors: allColors, description: "A faceted low-poly planter with a drainage-ready base.", shape: "planter" },
  { slug: "hex-wall-planter", name: "Hex Wall Planter", category: "home-decor", price: 599, availability: "made-to-order", material: "PLA", colors: allColors, description: "A hexagonal wall-mounted planter, printed to order.", shape: "planter" },
  { slug: "lattice-lamp-shade", name: "Lattice Lamp Shade", category: "home-decor", price: 1299, availability: "made-to-order", material: "PETG", colors: allColors, description: "An intricate lattice shade that casts soft dappled light.", shape: "lamp" },
  { slug: "wave-coaster-set", name: "Wave Coaster Set", category: "home-decor", price: 349, availability: "available", material: "PLA", colors: allColors, description: "A set of four wave-textured coasters.", shape: "coaster" },

  { slug: "minimal-phone-stand", name: "Minimal Phone Stand", category: "desk", price: 249, availability: "available", material: "PLA", colors: allColors, description: "A minimal angled stand for phones and small tablets.", shape: "stand", isNew: true },
  { slug: "headphone-stand", name: "Headphone Stand", category: "desk", price: 799, availability: "available", material: "PETG", colors: allColors, description: "A sturdy headphone stand with a weighted base.", shape: "stand" },
  { slug: "cable-organizer", name: "Cable Organizer", category: "desk", price: 149, availability: "available", material: "TPU", colors: allColors, description: "A flexible clip-on cable organizer for your desk edge.", shape: "organizer" },
  { slug: "desk-organizer-tray", name: "Desk Organizer Tray", category: "desk", price: 599, availability: "available", material: "PLA", colors: allColors, description: "A compartmentalised tray for pens, clips and small tools.", shape: "organizer" },
  { slug: "hex-pen-cup", name: "Hex Pen Cup", category: "desk", price: 299, availability: "out-of-stock", material: "PLA", colors: allColors, description: "A hexagonal pen cup with a honeycomb wall pattern.", shape: "cup" },
  { slug: "laptop-riser", name: "Laptop Riser", category: "desk", price: 1199, availability: "made-to-order", material: "PETG", colors: allColors, description: "An ergonomic laptop riser that keeps airflow clear underneath.", shape: "riser" },

  { slug: "custom-name-plate", name: "Custom Name Plate", category: "personalised", price: 399, availability: "available", material: "PLA", colors: allColors, description: "A personalised name plate for desks or doors.", shape: "plate" },
  { slug: "personalized-keychain", name: "Personalized Keychain", category: "personalised", price: 149, availability: "available", material: "PETG", colors: allColors, description: "A compact keychain engraved with your text.", shape: "keychain" },
  { slug: "initial-bookmark", name: "Initial Bookmark", category: "personalised", price: 199, availability: "available", material: "PLA", colors: allColors, description: "A slim bookmark featuring a single engraved initial.", shape: "bookmark" },
  { slug: "pet-name-tag", name: "Pet Name Tag", category: "personalised", price: 249, availability: "available", material: "PETG", colors: allColors, description: "A durable name tag for collars, engraved with pet name and contact.", shape: "tag", isNew: true },

  { slug: "articulated-dragon", name: "Articulated Dragon", category: "figurines", price: 499, availability: "available", material: "PLA", colors: allColors, description: "A fully articulated dragon figure that flexes at every joint.", shape: "dragon" },
  { slug: "low-poly-elephant", name: "Low-poly Elephant", category: "figurines", price: 449, availability: "available", material: "PLA", colors: allColors, description: "A faceted low-poly elephant display figure.", shape: "elephant" },
  { slug: "mini-ganesha", name: "Mini Ganesha", category: "figurines", price: 599, availability: "available", material: "PLA", colors: allColors, description: "A compact Ganesha idol with a smooth matte finish.", shape: "ganesha" },
  { slug: "flexi-octopus", name: "Flexi Octopus", category: "figurines", price: 299, availability: "out-of-stock", material: "TPU", colors: allColors, description: "A flexible fidget octopus with articulated tentacles.", shape: "octopus" },

  { slug: "wall-hook-pack", name: "Wall Hook Pack", category: "functional", price: 199, availability: "available", material: "PETG", colors: allColors, description: "A pack of four minimal wall hooks.", shape: "hook" },
  { slug: "spice-jar-lids", name: "Spice Jar Lids (Set of 4)", category: "functional", price: 349, availability: "available", material: "PETG", colors: allColors, description: "Replacement pour-spout lids for standard spice jars.", shape: "lid" },
  { slug: "gear-fidget", name: "Gear Fidget", category: "functional", price: 249, availability: "available", material: "PETG", colors: allColors, description: "An interlocking gear fidget toy that spins smoothly.", shape: "gear" },
  { slug: "drawer-pull-set", name: "Drawer Pull Set", category: "functional", price: 399, availability: "low-stock", material: "PLA", colors: allColors, description: "A set of six minimal drawer pulls.", shape: "pull" },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string) {
  return products.filter((p) => p.category === category);
}
