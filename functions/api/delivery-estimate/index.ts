import {
  checkServiceability,
  NimbusPostApiError,
  NimbusPostNotConfiguredError,
  type NimbusPostEnvironment,
} from "../../../lib/nimbuspost";

function formatMessage(result: Awaited<ReturnType<typeof checkServiceability>>) {
  if (!result.serviceable) return "Delivery isn't currently available to this PIN code.";
  if (result.minDays && result.maxDays) {
    const range = result.minDays === result.maxDays ? `${result.minDays}` : `${result.minDays}-${result.maxDays}`;
    return `Delivery in ${range} business days after dispatch (Estimated).`;
  }
  return "Delivery available to this PIN code.";
}

export const onRequestGet: PagesFunction = async (
  context: Cloudflare.PagesFunctionContext<NimbusPostEnvironment>,
) => {
  const { searchParams } = new URL(context.request.url);
  const pincode = searchParams.get("pincode") ?? "";
  if (!/^\d{6}$/.test(pincode)) {
    return new Response(JSON.stringify({ error: "Enter a valid 6-digit PIN code." }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  try {
    const result = await checkServiceability(pincode, context.env);
    return new Response(JSON.stringify({ ...result, message: formatMessage(result) }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    if (err instanceof NimbusPostNotConfiguredError) {
      return new Response(
        JSON.stringify({ error: "Delivery estimation isn't configured yet. Add NimbusPost credentials to enable it." }),
        {
          status: 503,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        },
      );
    }
    if (err instanceof NimbusPostApiError) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 502,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
    return new Response(JSON.stringify({ error: "Couldn't check delivery estimate." }), {
      status: 502,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
};
