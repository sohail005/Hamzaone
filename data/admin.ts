export type CustomRequestStatus = "new" | "quoted" | "accepted" | "rejected" | "in-production" | "completed";

export type CustomRequest = {
  id: string;
  customer: string;
  email: string;
  fileName: string;
  material: string;
  status: CustomRequestStatus;
  submittedAt: string;
};

export const customRequests: CustomRequest[] = [
  { id: "CPR-2611-0738", customer: "Riya Sharma", email: "riya@example.com", fileName: "bracket_v2.stl", material: "PETG", status: "new", submittedAt: "2026-11-05" },
  { id: "CPR-2611-0712", customer: "Arjun Mehta", email: "arjun@example.com", fileName: "stand.step", material: "PLA", status: "quoted", submittedAt: "2026-11-03" },
  { id: "CPR-2610-0690", customer: "Priya Nair", email: "priya@example.com", fileName: "gear_mount.3mf", material: "TPU", status: "completed", submittedAt: "2026-10-28" },
];

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: string[];
  totalSpend: number;
  joined: string;
};

export const customers: Customer[] = [
  { id: "cust-1", name: "Riya Sharma", email: "riya@example.com", phone: "9876543210", orders: ["HO-2026-10482"], totalSpend: 1176, joined: "2026-08-14" },
  { id: "cust-2", name: "Arjun Mehta", email: "arjun@example.com", phone: "9876500011", orders: ["HO-2026-10479"], totalSpend: 878, joined: "2026-09-02" },
  { id: "cust-3", name: "Priya Nair", email: "priya@example.com", phone: "9876500022", orders: ["HO-2026-10471"], totalSpend: 478, joined: "2026-10-20" },
];

export type Coupon = {
  code: string;
  type: "flat" | "percent";
  value: number;
  minOrder: number;
  enabled: boolean;
  expires: string;
};

export const coupons: Coupon[] = [
  { code: "FIRST100", type: "flat", value: 100, minOrder: 999, enabled: true, expires: "2026-12-31" },
  { code: "WELCOME10", type: "percent", value: 10, minOrder: 500, enabled: false, expires: "2026-11-30" },
];

export type Payment = {
  id: string;
  orderId: string;
  method: string;
  amount: number;
  status: "paid" | "pending" | "failed" | "refunded";
  maskedId: string;
  date: string;
};

export const payments: Payment[] = [
  { id: "pay-1", orderId: "HO-2026-10482", method: "UPI", amount: 1176, status: "paid", maskedId: "pay_•••• 4821", date: "2026-11-02" },
  { id: "pay-2", orderId: "HO-2026-10479", method: "Card", amount: 878, status: "pending", maskedId: "pay_•••• 9912", date: "2026-11-04" },
  { id: "pay-3", orderId: "HO-2026-10471", method: "Netbanking", amount: 478, status: "paid", maskedId: "pay_•••• 2290", date: "2026-10-20" },
];

export type ProductionCard = {
  id: string;
  label: string;
  stage: "queued" | "printing" | "post-processing" | "quality-check" | "packed" | "completed";
  priority: "normal" | "high";
};

export const productionCards: ProductionCard[] = [
  { id: "p1", label: "HO-2026-10482 · Spiral Decor Vase", stage: "printing", priority: "high" },
  { id: "p2", label: "HO-2026-10482 · Minimal Phone Stand ×2", stage: "printing", priority: "normal" },
  { id: "p3", label: "HO-2026-10479 · Headphone Stand", stage: "queued", priority: "normal" },
  { id: "p4", label: "CPR-2611-0738 · Custom bracket", stage: "post-processing", priority: "high" },
  { id: "p5", label: "HO-2026-10471 · Custom Name Plate", stage: "completed", priority: "normal" },
];

export const inventory = [
  { slug: "spiral-decor-vase", variant: "Terracotta / Small", stock: 24, reserved: 3, low: false },
  { slug: "spiral-decor-vase", variant: "Charcoal / Large", stock: 6, reserved: 1, low: true },
  { slug: "hex-pen-cup", variant: "Sand / Standard", stock: 0, reserved: 0, low: true },
  { slug: "flexi-octopus", variant: "Black / Standard", stock: 0, reserved: 0, low: true },
  { slug: "drawer-pull-set", variant: "Charcoal / Standard", stock: 4, reserved: 2, low: true },
  { slug: "minimal-phone-stand", variant: "Charcoal / Standard", stock: 40, reserved: 4, low: false },
];
