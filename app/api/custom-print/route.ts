import { quote, materials, faqs, testimonials } from "@/data/customPrint";

const sections: Record<string, unknown> = { quote, materials, faqs, testimonials };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");

  const headers = { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" };

  if (section) {
    if (!(section in sections)) {
      return Response.json({ error: "Unknown section" }, { status: 400 });
    }
    return Response.json({ [section]: sections[section] }, { headers });
  }

  return Response.json({ quote, materials, faqs, testimonials }, { headers });
}
