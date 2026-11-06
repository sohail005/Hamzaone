import { Suspense } from "react";
import { ShopView } from "@/components/ShopView";

export default function ShopPage() {
  return (
    <Suspense>
      <ShopView />
    </Suspense>
  );
}
