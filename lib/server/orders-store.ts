import { isRecord, type KVStore } from "./kv";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orderStatus";

export { ORDER_STATUSES };

export type StoredOrderItem = {
  productSlug: string;
  name: string;
  color: string;
  size: string;
  qty: number;
  unitPrice: number;
  engraving?: string;
};

export type StoredOrder = {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  customer: { name: string; email: string; phone: string };
  address: {
    name: string;
    pin: string;
    line1: string;
    line2?: string;
    landmark?: string;
    city: string;
    state: string;
    type: "Home" | "Work";
  };
  items: StoredOrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  total: number;
  currency: "INR";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  trackingNumber?: string;
  carrier?: string;
};

export type TrackableOrder = {
  id: string;
  items: Array<{ name: string; qty: number }>;
  total: number;
  currency: "INR";
  paymentStatus: StoredOrder["paymentStatus"];
  status: StoredOrder["status"];
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  carrier?: string;
};

function isStoredOrderItem(value: unknown): value is StoredOrderItem {
  return (
    isRecord(value) &&
    typeof value.productSlug === "string" &&
    typeof value.name === "string" &&
    typeof value.color === "string" &&
    typeof value.size === "string" &&
    typeof value.qty === "number" &&
    typeof value.unitPrice === "number" &&
    (value.engraving === undefined || typeof value.engraving === "string")
  );
}

export function isStoredOrder(value: unknown): value is StoredOrder {
  if (!isRecord(value) || !isRecord(value.customer) || !isRecord(value.address)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.razorpayOrderId === "string" &&
    (value.razorpayPaymentId === undefined || typeof value.razorpayPaymentId === "string") &&
    typeof value.customer.name === "string" &&
    typeof value.customer.email === "string" &&
    typeof value.customer.phone === "string" &&
    typeof value.address.name === "string" &&
    typeof value.address.pin === "string" &&
    typeof value.address.line1 === "string" &&
    (value.address.line2 === undefined || typeof value.address.line2 === "string") &&
    (value.address.landmark === undefined || typeof value.address.landmark === "string") &&
    typeof value.address.city === "string" &&
    typeof value.address.state === "string" &&
    (value.address.type === "Home" || value.address.type === "Work") &&
    Array.isArray(value.items) &&
    value.items.every(isStoredOrderItem) &&
    typeof value.subtotal === "number" &&
    typeof value.discount === "number" &&
    (value.couponCode === undefined || typeof value.couponCode === "string") &&
    typeof value.shipping === "number" &&
    typeof value.total === "number" &&
    value.currency === "INR" &&
    (value.paymentStatus === "pending" ||
      value.paymentStatus === "paid" ||
      value.paymentStatus === "failed" ||
      value.paymentStatus === "refunded") &&
    typeof value.status === "string" &&
    (ORDER_STATUSES as readonly string[]).includes(value.status) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    (value.paidAt === undefined || typeof value.paidAt === "string") &&
    (value.trackingNumber === undefined || typeof value.trackingNumber === "string") &&
    (value.carrier === undefined || typeof value.carrier === "string")
  );
}

function orderKey(id: string) {
  return `order:${id}`;
}

function razorpayOrderKey(razorpayOrderId: string) {
  return `razorpay-order:${razorpayOrderId}`;
}

// Legacy flat index: a single unbounded array of every order id ever created.
// New orders no longer grow this key — they're appended to a per-month bucket
// instead — but it's kept around (read-only) so orders written before this
// change remain discoverable without a migration script.
function legacyOrderIndexKey() {
  return "orders:index";
}

function monthBucketKey(month: string) {
  return `orders:index:month:${month}`;
}

function monthsIndexKey() {
  return "orders:index:months";
}

function monthOf(order: StoredOrder) {
  return order.createdAt.slice(0, 7);
}

async function allOrderIds(kv: KVStore): Promise<string[]> {
  const months = await kv.get(monthsIndexKey(), { type: "json" });
  const monthList = Array.isArray(months) ? (months as string[]) : [];
  const buckets = await Promise.all(monthList.map((month) => kv.get(monthBucketKey(month), { type: "json" })));
  const bucketedIds = buckets.flatMap((bucket) => (Array.isArray(bucket) ? (bucket as string[]) : []));

  const legacy = await kv.get(legacyOrderIndexKey(), { type: "json" });
  const legacyIds = Array.isArray(legacy) ? (legacy as string[]) : [];

  return Array.from(new Set([...bucketedIds, ...legacyIds]));
}

export async function readStoredOrder(kv: KVStore, id: string) {
  const value = await kv.get(orderKey(id), { type: "json" });
  return isStoredOrder(value) ? value : null;
}

export async function readOrderByRazorpayId(kv: KVStore, razorpayOrderId: string) {
  const value = await kv.get(razorpayOrderKey(razorpayOrderId), { type: "json" });
  return typeof value === "string" ? readStoredOrder(kv, value) : null;
}

export async function createStoredOrder(kv: KVStore, order: StoredOrder) {
  await kv.put(orderKey(order.id), JSON.stringify(order));
  await kv.put(razorpayOrderKey(order.razorpayOrderId), JSON.stringify(order.id));

  const month = monthOf(order);
  const bucket = await kv.get(monthBucketKey(month), { type: "json" });
  const bucketIds = Array.isArray(bucket) ? (bucket as string[]) : [];
  await kv.put(monthBucketKey(month), JSON.stringify([...bucketIds, order.id]));

  const months = await kv.get(monthsIndexKey(), { type: "json" });
  const monthList = Array.isArray(months) ? (months as string[]) : [];
  if (!monthList.includes(month)) {
    await kv.put(monthsIndexKey(), JSON.stringify([month, ...monthList]));
  }
}

export async function updateStoredOrder(kv: KVStore, order: StoredOrder) {
  await kv.put(orderKey(order.id), JSON.stringify(order));
}

export async function listStoredOrders(kv: KVStore, filter?: { status?: string; paymentStatus?: string }) {
  const ids = await allOrderIds(kv);
  const values = await Promise.all(ids.map((id) => readStoredOrder(kv, id)));
  let result = values.filter((v): v is StoredOrder => !!v);
  if (filter?.status) result = result.filter((o) => o.status === filter.status);
  if (filter?.paymentStatus) result = result.filter((o) => o.paymentStatus === filter.paymentStatus);
  return result;
}

export function toTrackableOrder(order: StoredOrder): TrackableOrder {
  return {
    id: order.id,
    items: order.items.map((item) => ({ name: item.name, qty: item.qty })),
    total: order.total,
    currency: order.currency,
    paymentStatus: order.paymentStatus,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    trackingNumber: order.trackingNumber,
    carrier: order.carrier,
  };
}
