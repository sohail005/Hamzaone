import { Suspense } from "react";
import { CustomPrintEntry } from "@/components/CustomPrintEntry";

export default function CustomPrintPage() {
  return (
    <Suspense>
      <CustomPrintEntry />
    </Suspense>
  );
}
