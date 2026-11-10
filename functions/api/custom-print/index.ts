import { quote, materials, faqs, testimonials } from "../../../data/customPrint";

export const onRequestGet: PagesFunction = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const section = searchParams.get("section");

  const sections: Record<string, unknown> = {
    quote,
    materials,
    faqs,
    testimonials,
  };

  if (section) {
    const key = Object.keys(sections).find((k) => k === section);
    if (!key) {
      return Response.json({ error: "Unknown section" }, { status: 400 });
    }
    return Response.json({ [key]: sections[key] });
  }

  return Response.json({ quote, materials, faqs, testimonials });
};
