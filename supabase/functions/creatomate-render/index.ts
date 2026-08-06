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

const cleanSecret = (value: string | undefined | null) => (value || "").trim();

const assertByteString = (name: string, value: string) => {
  if (!value) throw new Error(`${name} is not configured`);
  if (/[^\x00-\xFF]/.test(value)) {
    throw new Error(`${name} contains invalid characters. Use the real Creatomate value only, without Arabic placeholder text.`);
  }
};

const getCreatomateConfig = () => {
  const apiKey = cleanSecret(Deno.env.get("CREATOMATE_API_KEY") || Deno.env.get("API_KEY"));
  const templateId = cleanSecret(Deno.env.get("TEMPLATE_ID"));
  assertByteString("API_KEY", apiKey);
  assertByteString("TEMPLATE_ID", templateId);
  if (apiKey.includes("ضع") || apiKey.includes("هنا") || apiKey.startsWith("[")) {
    throw new Error("API_KEY is still a placeholder, not a real Creatomate API key.");
  }
  if (templateId.includes("ضع") || templateId.includes("هنا") || templateId.startsWith("[")) {
    throw new Error("TEMPLATE_ID is still a placeholder, not a real Creatomate template ID.");
  }
  return { apiKey, templateId };
};

async function generateVideo(text: string, image: string) {
  const { apiKey, templateId } = getCreatomateConfig();

  const response = await fetch("https://api.creatomate.com/v1/renders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      template_id: templateId,
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
    const url = new URL(req.url);
    if (url.searchParams.get("dry_run") === "1") {
      getCreatomateConfig();
      return json({ ok: true, mode: "dry_run" });
    }

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
