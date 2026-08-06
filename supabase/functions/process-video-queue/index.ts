import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BRAND_TAG = "Produced by Utaybi Smart";

const API_KEY = Deno.env.get("CREATOMATE_API_KEY") || Deno.env.get("API_KEY");
const TEMPLATE_ID = Deno.env.get("TEMPLATE_ID");


const cleanSecret = (value: string | undefined | null) => (value || "").trim();

const assertByteString = (name: string, value: string) => {
  if (!value) throw new Error(`${name} غير مضبوط في إعدادات الإنتاج`);
  if (/[^\x00-\xFF]/.test(value)) {
    throw new Error(`${name} يحتوي على محارف غير صالحة. ضع مفتاح Creatomate الحقيقي فقط بدون أقواس أو نص عربي.`);
  }
};

const getCreatomateConfig = () => {
  const apiKey = cleanSecret(API_KEY);
  const templateId = cleanSecret(TEMPLATE_ID);
  assertByteString("API_KEY", apiKey);
  assertByteString("TEMPLATE_ID", templateId);
  if (apiKey.includes("ضع") || apiKey.includes("هنا") || apiKey.startsWith("[")) {
    throw new Error("API_KEY ما زال placeholder وليس مفتاح Creatomate حقيقي.");
  }
  if (templateId.includes("ضع") || templateId.includes("هنا") || templateId.startsWith("[")) {
    throw new Error("TEMPLATE_ID ما زال placeholder وليس معرف قالب Creatomate حقيقي.");
  }
  return { apiKey, templateId };
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function startRender(prompt: string, image: string, source: any | null) {
  const { apiKey, templateId } = getCreatomateConfig();
  // If the AI planner provided a dynamic Creatomate source, use it (CapCut-style multi-scene).
  // Otherwise fall back to the static template.
  const body: any = source
    ? { source }
    : {
        template_id: templateId,
        modifications: {
          "Text-1": prompt,
          "Title": prompt,
          "Headline": prompt,
          "Caption": prompt,
          "Image-1": image,
          "Image": image,
          "Video-1": image,
          "Video": image,
          "Media": image,
          "Background": image,
          "Brand": BRAND_TAG,
          "Brand-Tag": BRAND_TAG,
        },
      };

  const res = await fetch("https://api.creatomate.com/v1/renders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw || `Creatomate ${res.status}`);
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data[0] : data;
}

async function checkRender(id: string) {
  const { apiKey } = getCreatomateConfig();
  const res = await fetch(`https://api.creatomate.com/v1/renders/${id}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw || `Creatomate ${res.status}`);
  return JSON.parse(raw);
}

async function processQueued() {
  // Pick one oldest queued job
  const { data: jobs } = await supabase
    .from("video_jobs")
    .select("*")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(1);

  if (!jobs?.length) return null;
  const job = jobs[0];

  try {
    await supabase
      .from("video_jobs")
      .update({ status: "rendering", attempts: job.attempts + 1 })
      .eq("id", job.id);

    const render = await startRender(job.prompt, job.image_url, job.source ?? null);

    if (render?.status === "succeeded" && render?.url) {
      await supabase
        .from("video_jobs")
        .update({ status: "done", render_id: render.id, result_url: render.url })
        .eq("id", job.id);
    } else {
      await supabase
        .from("video_jobs")
        .update({ render_id: render.id })
        .eq("id", job.id);
    }
    return job.id;
  } catch (e) {
    await supabase
      .from("video_jobs")
      .update({ status: "failed", error: e instanceof Error ? e.message : "error" })
      .eq("id", job.id);
    return job.id;
  }
}

async function pollRendering() {
  const { data: jobs } = await supabase
    .from("video_jobs")
    .select("*")
    .eq("status", "rendering")
    .not("render_id", "is", null)
    .limit(5);

  for (const job of jobs || []) {
    try {
      const r = await checkRender(job.render_id);
      if (r?.status === "succeeded" && r?.url) {
        await supabase
          .from("video_jobs")
          .update({ status: "done", result_url: r.url })
          .eq("id", job.id);
      } else if (r?.status === "failed") {
        await supabase
          .from("video_jobs")
          .update({ status: "failed", error: r.error_message || "render failed" })
          .eq("id", job.id);
      }
    } catch (e) {
      console.error("poll error", job.id, e);
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    if (url.searchParams.get("dry_run") === "1") {
      getCreatomateConfig();
      return new Response(JSON.stringify({ ok: true, mode: "dry_run" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    getCreatomateConfig();
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : "إعدادات Creatomate غير صالحة" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const startedId = await processQueued();
  await pollRendering();

  return new Response(JSON.stringify({ ok: true, started: startedId }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
