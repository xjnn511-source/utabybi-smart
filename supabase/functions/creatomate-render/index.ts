import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BRAND_TAG = "Produced by Utaybi Smart";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function generateVideo(text: string, image: string) {
  const API_KEY = Deno.env.get("API_KEY") || Deno.env.get("CREATOMATE_API_KEY");
  const TEMPLATE_ID = Deno.env.get("TEMPLATE_ID");

  if (!API_KEY) throw new Error("API_KEY is not configured");
  if (!TEMPLATE_ID) throw new Error("TEMPLATE_ID is not configured");

  const response = await fetch("https://api.creatomate.com/v1/renders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      template_id: TEMPLATE_ID,
      modifications: {
        "Text-1": text,
        "Title": text,
        "Headline": text,
        "Caption": text,
        "Image-1": image,
        "Image": image,
        "Media": image,
        "Background": image,
        "Brand": BRAND_TAG,
        "Brand-Tag": BRAND_TAG,
      },
    }),
  });

  const raw = await response.text();
  if (!response.ok) throw new Error(raw || `Creatomate API error ${response.status}`);

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const image = typeof body?.image === "string" ? body.image.trim() : "";

    if (!text) return json({ ok: false, error: "text is required" });
    if (!image) return json({ ok: false, error: "image is required" });

    const render = await generateVideo(text, image);
    return json({ ok: true, render });
  } catch (e) {
    console.error("Render error:", e);
    return json({ ok: false, error: e instanceof Error ? e.message : "Unknown error" });
  }
});
