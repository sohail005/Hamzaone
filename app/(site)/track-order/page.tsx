import type { Metadata } from "next";
import { TrackOrderView } from "@/components/TrackOrderView";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Enter your order ID and checkout email to see the latest status.",
};

export default function TrackOrderPage() {
  return <TrackOrderView />;
}
