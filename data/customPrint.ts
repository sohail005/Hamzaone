export const quote = {
  id: "CPR-2611-0738",
  printingCost: 1560,
  materialCost: 280,
  shipping: 79,
  total: 1919,
  validUntil: "2026-11-13",
  dimensions: { x: 82, y: 46, z: 30 },
  material: "PETG",
  color: "Charcoal",
  finish: "Matte",
};

export const materials = {
  PLA: {
    colors: ["Terracotta", "Charcoal", "Sand", "Sage", "White", "Black"],
    finishes: ["Matte", "Glossy"],
  },
  PETG: {
    colors: ["Charcoal", "Sand", "Clear", "Black"],
    finishes: ["Matte", "Translucent"],
  },
  TPU: {
    colors: ["Black", "Charcoal", "Sand"],
    finishes: ["Matte", "Flexible-soft"],
  },
};

export const faqs = [
  { category: "Orders", q: "How long does production take?", a: "Most in-stock items print and ship within 3–6 business days of dispatch (Estimated)." },
  { category: "Orders", q: "Can I change my order after placing it?", a: "Contact support within 2 hours of placing your order and we'll try to adjust it before production starts." },
  { category: "Custom print", q: "How does the quoting process work?", a: "Upload your 3D model, choose material and color, and we'll send a quote within 24 hours based on print time and material use." },
  { category: "Custom print", q: "What file formats are supported?", a: "STL, STEP and 3MF files up to 100 MB. OBJ files are not currently supported." },
  { category: "Shipping", q: "What are the shipping charges?", a: "Standard shipping is ₹79, and free on orders above ₹1,499. Express shipping is ₹149." },
  { category: "Returns", q: "Can I return a custom print?", a: "Custom and personalised prints are made to order and are not eligible for return unless defective." },
];

export const testimonials = [
  { name: "Demo customer — Ananya R.", quote: "The vase arrived exactly as shown, and the finish was better than I expected.", rating: 5 },
  { name: "Demo customer — Karthik S.", quote: "Uploaded a model for a custom bracket and had a quote the next day.", rating: 5 },
  { name: "Demo customer — Fatima I.", quote: "Packaging was careful and the print quality on the lamp shade was great.", rating: 4 },
];
