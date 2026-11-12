import {
  featuredProducts,
  newArrivals,
  customSteps,
  howItWorks,
  valueProps,
  homeReviews,
  homeFaqs,
  heroChecklist,
  categoryShapes,
} from "@/data/home";

const sections: Record<string, unknown> = {
  featured: featuredProducts,
  "new-arrivals": newArrivals,
  "custom-steps": customSteps,
  "how-it-works": howItWorks,
  "value-props": valueProps,
  "home-reviews": homeReviews,
  "home-faqs": homeFaqs,
  "hero-checklist": heroChecklist,
  "category-shapes": categoryShapes,
};

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

  return Response.json(
    {
      featured: featuredProducts,
      newArrivals,
      customSteps,
      howItWorks,
      valueProps,
      homeReviews,
      homeFaqs,
      heroChecklist,
      categoryShapes,
    },
    { headers },
  );
}
