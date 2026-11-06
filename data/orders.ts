export type OrderLineItem = {
  productSlug: string;
  name: string;
  color: string;
  size: string;
  qty: number;
  price: number;
};

export type DemoOrder = {
  id: string;
  customer: string;
  address: {
    line1: string;
    line2?: string;
    landmark?: string;
    city: string;
    state: string;
    pin: string;
  };
  items: OrderLineItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  total: number;
  paymentStatus: "paid" | "pending" | "failed";
  status: "printing" | "post-processing" | "quality-check" | "packed" | "shipped" | "delivered" | "canceled";
  placedAt: string;
};

export const demoOrder: DemoOrder = {
  id: "HO-2026-10482",
  customer: "Riya Sharma",
  address: {
    line1: "4th Cross, Sector 2",
    line2: "HSR Layout",
    city: "Bengaluru",
    state: "Karnataka",
    pin: "560102",
  },
  items: [
    { productSlug: "spiral-decor-vase", name: "Spiral Decor Vase", color: "Terracotta", size: "Small", qty: 1, price: 699 },
    { productSlug: "minimal-phone-stand", name: "Minimal Phone Stand", color: "Charcoal", size: "Standard", qty: 2, price: 249 },
  ],
  subtotal: 1197,
  discount: 100,
  couponCode: "FIRST100",
  shipping: 79,
  total: 1176,
  paymentStatus: "paid",
  status: "printing",
  placedAt: "2026-11-02",
};

export const orders: DemoOrder[] = [
  demoOrder,
  {
    id: "HO-2026-10479",
    customer: "Arjun Mehta",
    address: { line1: "12 MG Road", city: "Pune", state: "Maharashtra", pin: "411001" },
    items: [{ productSlug: "headphone-stand", name: "Headphone Stand", color: "Sand", size: "Standard", qty: 1, price: 799 }],
    subtotal: 799,
    discount: 0,
    shipping: 79,
    total: 878,
    paymentStatus: "pending",
    status: "printing",
    placedAt: "2026-11-04",
  },
  {
    id: "HO-2026-10471",
    customer: "Priya Nair",
    address: { line1: "9 Lake View", city: "Kochi", state: "Kerala", pin: "682001" },
    items: [{ productSlug: "custom-name-plate", name: "Custom Name Plate", color: "Sage", size: "Standard", qty: 1, price: 399 }],
    subtotal: 399,
    discount: 0,
    shipping: 79,
    total: 478,
    paymentStatus: "paid",
    status: "delivered",
    placedAt: "2026-10-20",
  },
];

export function findOrder(id: string) {
  return orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
}
