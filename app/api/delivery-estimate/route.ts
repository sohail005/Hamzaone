import { checkServiceability, NimbusPostApiError, NimbusPostNotConfiguredError, type NimbusPostEnvironment } from "@/lib/nimbuspost";
import { getWorkerEnv } from "@/lib/server/kv";

function formatMessage(result: Awaited<ReturnType<typeof checkServiceability>>) {
  if (!result.serviceable) return "Delivery isn't currently available to this PIN code.";
  if (result.minDays && result.maxDays) {
    const range = result.minDays === result.maxDays ? `${result.minDays}` : `${result.minDays}-${result.maxDays}`;
    return `Delivery in ${range} business days after dispatch (Estimated).`;
  }
  return "Delivery available to this PIN code.";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get("pincode") ?? "";
  if (!/^\d{6}$/.test(pincode)) {
    return Response.json({ error: "Enter a valid 6-digit PIN code." }, { status: 400 });
  }

  const env = await getWorkerEnv();

  try {
    const result = await checkServiceability(pincode, env as NimbusPostEnvironment);
    return Response.json({ ...result, message: formatMessage(result) });
  } catch (err) {
    if (err instanceof NimbusPostNotConfiguredError) {
      return Response.json(
        { error: "Delivery estimation isn't configured yet. Add NimbusPost credentials to enable it." },
        { status: 503 },
      );
    }
    if (err instanceof NimbusPostApiError) {
      return Response.json({ error: err.message }, { status: 502 });
    }
    return Response.json({ error: "Couldn't check delivery estimate." }, { status: 502 });
  }
}
