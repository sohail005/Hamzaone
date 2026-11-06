"use client";

import { useSearchParams } from "next/navigation";
import { CustomPrintLanding } from "./CustomPrintLanding";
import { CustomPrintFlow } from "./CustomPrintFlow";

export function CustomPrintEntry() {
  const params = useSearchParams();
  const step = params.get("step");
  return step ? <CustomPrintFlow /> : <CustomPrintLanding />;
}
