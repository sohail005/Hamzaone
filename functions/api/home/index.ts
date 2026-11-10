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
} from "../../../data/home";

export const onRequestGet: PagesFunction = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const section = searchParams.get("section");

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

  if (section) {
    const key = Object.keys(sections).find((k) => k === section);
    if (!key) {
      return Response.json({ error: `Unknown section. Available: ${Object.keys(sections).join(", ")}` }, { status: 400 });
    }
    return Response.json({ [key]: sections[key] });
  }

  return Response.json({
    featured: featuredProducts,
    newArrivals: newArrivals,
    customSteps,
    howItWorks,
    valueProps,
    homeReviews,
    homeFaqs,
    heroChecklist,
    categoryShapes,
  });
};
