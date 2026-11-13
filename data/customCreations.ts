export type CustomCreationCategory = {
  slug: string;
  name: string;
  shape: "vase" | "planter" | "lamp" | "coaster" | "stand" | "organizer" | "cup" | "riser" | "plate" | "keychain" | "bookmark" | "tag" | "dragon" | "elephant" | "ganesha" | "octopus" | "hook" | "lid" | "gear" | "pull" | "part";
};

export const CUSTOM_CREATION_CATEGORIES: CustomCreationCategory[] = [
  { slug: "keychains", name: "Custom Keychains", shape: "keychain" },
  { slug: "miniatures-figurines", name: "Miniatures & Figurines", shape: "dragon" },
  { slug: "personalized-gifts", name: "Personalized Gifts", shape: "tag" },
  { slug: "table-lamps-lighting", name: "Table Lamps & Lighting", shape: "lamp" },
  { slug: "home-decor", name: "Home Decor", shape: "vase" },
  { slug: "nameplates", name: "Nameplates", shape: "plate" },
  { slug: "functional-parts", name: "Functional Parts", shape: "part" },
  { slug: "architectural-models", name: "Architectural Models", shape: "stand" },
  { slug: "other", name: "Other Custom Creations", shape: "organizer" },
];

export const CUSTOM_CREATION_MATERIALS = ["PLA", "PETG", "TPU", "ABS", "Resin", "Not sure — recommend one"];

export const CUSTOM_CREATION_COLORS = [
  "White", "Black", "Grey", "Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Pink", "Natural / Transparent", "Custom (describe below)",
];

export const CUSTOM_CREATION_HOW_IT_WORKS = [
  { n: "01", t: "Share Your Idea", d: "Tell us about your project and upload reference photos or sketches — no 3D file needed." },
  { n: "02", t: "Design & Review", d: "Our team models your idea and checks it for printability." },
  { n: "03", t: "Receive Your Quotation", d: "A clear price and production estimate, reviewed by a person." },
  { n: "04", t: "We Create & Deliver", d: "Accept the quote, we print, quality-check, and ship it to you." },
];

export const CUSTOM_CREATION_WHY_CHOOSE_US = [
  { t: "No design skills needed", d: "Just share photos or a description — we handle the modelling." },
  { t: "Transparent pricing", d: "You see the full quote before paying anything." },
  { t: "Quality checked", d: "Every piece is inspected before it ships." },
  { t: "Track every step", d: "Follow your request from review to delivery." },
];

export const CUSTOM_CREATION_FAQS = [
  { category: "Getting started", q: "Do I need a 3D model to request a custom creation?", a: "No. Share reference photos, a sketch, or just a written description — our team handles the 3D modelling for you." },
  { category: "Getting started", q: "What image formats can I upload?", a: "JPG, JPEG, PNG and WEBP only, up to 8 images, 5 MB each." },
  { category: "Pricing", q: "When do I pay for a custom creation?", a: "Only after you review and accept the quotation. The quote stays valid until the expiry date shown on it." },
  { category: "Pricing", q: "How is the price calculated?", a: "Our quotation breaks down design/modelling cost, printing cost, finishing, delivery and any discounts, so you see exactly what you're paying for." },
  { category: "Production", q: "How long does a custom creation take?", a: "Estimated production days are shown on your quotation once our team reviews the request." },
  { category: "Production", q: "Can I track my request?", a: "Yes — every request gets a tracking link so you can follow status from review through delivery." },
];
