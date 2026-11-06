import { NextRequest, NextResponse } from "next/server";
import { checkServiceability, NimbusPostApiError, NimbusPostNotConfiguredError } from "@/lib/nimbuspost";

function formatMessage(result: Awaited<ReturnType<typeof checkServiceability>>) {
  if (!result.serviceable) return "Delivery isn't currently available to this PIN code.";
  if (result.minDays && result.maxDays) {
    const range = result.minDays === result.maxDays ? `${result.minDays}` : `${result.minDays}-${result.maxDays}`;
    return `Delivery in ${range} business days after dispatch (Estimated).`;
  }
  return "Delivery available to this PIN code.";
}

export async function GET(req: NextRequest) {
  const pincode = req.nextUrl.searchParams.get("pincode") ?? "";
  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ error: "Enter a valid 6-digit PIN code." }, { status: 400 });
  }

  try {
    const result = await checkServiceability(pincode);
    return NextResponse.json({ ...result, message: formatMessage(result) });
  } catch (err) {
    if (err instanceof NimbusPostNotConfiguredError) {
      return NextResponse.json(
        { error: "Delivery estimation isn't configured yet. Add NimbusPost credentials to enable it." },
        { status: 503 }
      );
    }
    if (err instanceof NimbusPostApiError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    return NextResponse.json({ error: "Couldn't check delivery estimate." }, { status: 502 });
  }
}
