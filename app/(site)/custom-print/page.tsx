import { Suspense } from "react";
import type { Metadata } from "next";
import { CustomPrintEntry } from "@/components/CustomPrintEntry";

export const metadata: Metadata = {
  title: "Custom 3D Printing",
  description: "Upload an STL or 3MF file, pick material and finish, and get a reviewed quote from our print team.",
};

export default function CustomPrintPage() {
  return (
    <Suspense>
      <CustomPrintEntry />
    </Suspense>
  );
}
