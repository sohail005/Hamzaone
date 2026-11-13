import { quote, faqs, testimonials } from "@/data/customPrint";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { defaultMaterialsConfig, getMaterialsConfig, toPublicMaterials } from "@/lib/server/custom-print-materials";

const staticSections: Record<string, unknown> = { quote, faqs, testimonials };

async function loadMaterials() {
  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  const config = kv ? await getMaterialsConfig(kv) : defaultMaterialsConfig();
  return toPublicMaterials(config);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");

  const headers = { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" };

  if (section === "materials") {
    return Response.json({ materials: await loadMaterials() }, { headers });
  }

  if (section) {
    if (!(section in staticSections)) {
      return Response.json({ error: "Unknown section" }, { status: 400 });
    }
    return Response.json({ [section]: staticSections[section] }, { headers });
  }

  return Response.json({ quote, materials: await loadMaterials(), faqs, testimonials }, { headers });
}
