import { getUserFromRequest, json } from "./_shared";

export const onRequestOptions: PagesFunction = () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};

export const onRequestGet: PagesFunction = async ({ request }) => {
  const user = getUserFromRequest(request);
  if (!user) {
    return json({ error: "Unauthorized." }, 401);
  }

  return json({
    user: { id: user.id, name: user.name, email: user.email },
  });
};
