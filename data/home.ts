import type { Availability } from "./products";

export type HomeCardBadge = "available" | "made-to-order" | "low-stock" | "new";

export type HomeCard = {
  id: number;
  name: string;
  meta: string;
  price: number;
  shape:
    | "vase" | "planter" | "lamp" | "coaster" | "stand" | "organizer" | "cup" | "riser"
    | "plate" | "keychain" | "bookmark" | "tag" | "dragon" | "elephant" | "ganesha"
    | "octopus" | "hook" | "lid" | "gear" | "pull" | "part";
  color: string;
  badge: HomeCardBadge;
  slug: string;
  availability: Availability;
};

export const categoryShapes: Record<string, { shape: HomeCard["shape"]; color: string }> = {
  "home-decor": { shape: "vase", color: "#C96F4A" },
  desk: { shape: "stand", color: "#2B2E33" },
  personalised: { shape: "plate", color: "#D9C6A5" },
  figurines: { shape: "dragon", color: "#5E7A6A" },
  functional: { shape: "part", color: "#3C5A80" },
};

export const customSteps = [
  { n: "01", t: "Share your idea", d: "Reference photos, sketches, and a description — no 3D file needed." },
  { n: "02", t: "Design & review", d: "Our team models it and checks printability." },
  { n: "03", t: "Get a quote", d: "Reviewed by a person, usually within 1 business day." },
  { n: "04", t: "Pay and track", d: "Accept, pay, follow every production step." },
];

export const howItWorks = [
  { t: "Choose", d: "Pick a ready-made design or personalise one with your text." },
  { t: "We print", d: "Printed after you order or picked from ready stock. You see which before paying." },
  { t: "We check", d: "Every piece is cleaned, finished and quality checked by hand." },
  { t: "Delivered", d: "Packed for safe transit and shipped with live tracking." },
];

export const valueProps = [
  { n: "01", t: "Precision you can feel", d: "Tuned printers and hand finishing for clean layers and tight tolerances." },
  { n: "02", t: "Honest timelines", d: "Production and delivery estimates shown separately, every time." },
  { n: "03", t: "Made for you", d: "Personalise text, colour and size without paying for a full custom job." },
  { n: "04", t: "Real support", d: "Talk to the people who print your order on WhatsApp or email." },
];

export const homeReviews = [
  { q: "The vase looks far more premium than I expected. Layer lines are barely visible.", who: "Demo customer A.", what: "Spiral Decor Vase" },
  { q: "Uploaded my drone part on Monday, got a clear quote the next day.", who: "Demo customer B.", what: "Custom print" },
  { q: "Nameplate was printed exactly as previewed and arrived well packed.", who: "Demo customer C.", what: "Custom Name Plate" },
];

export const homeFaqs = [
  { q: "What is the difference between production time and shipping time?", a: "Production time is how long we take to print, finish and quality check your item. Shipping time starts after dispatch. Both are shown separately on every product and at checkout, and shipping times are estimates from our courier partners." },
  { q: "Do I need a 3D model to request a custom creation?", a: "No. Share reference photos, a sketch, or just a description — our team handles the 3D modelling for you." },
  { q: "When do I pay for a custom creation?", a: "Only after you review and accept the quote. Quotes stay valid until the expiry date shown on the quotation." },
  { q: "Can I return a personalised item?", a: "Personalised and custom items are made for you, so they can be returned only if they arrive damaged or defective. See the Return and Refund Policy." },
];

export const heroChecklist = [
  "Production time shown before you pay",
  "Secure payments by Razorpay",
  "Quality checked before packing",
];
