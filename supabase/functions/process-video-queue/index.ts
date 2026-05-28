import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BRAND_TAG = "Produced by Utaybi Smart";

const API_KEY = Deno.env.get("API_KEY") || Deno.env.get("CREATOMATE_API_KEY");
const TEMPLATE_ID = Deno.env.get("TEMPLATE_ID");

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function startRender(prompt: string, image: string, source: any | null) {
  // If the AI planner provided a dynamic Creatomate source, use it (CapCut-style multi-scene).
  // Otherwise fall back to the static template.
  const body: any = source
    ? { source }
    : {
        template_id: TEMPLATE_ID,
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
      Authorization: `Bearer ${API_KEY}`,
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
  const res = await fetch(`https://api.creatomate.com/v1/renders/${id}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
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

    const render = await startRender(job.prompt, job.image_url);

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

  if (!API_KEY || !TEMPLATE_ID) {
    return new Response(
      JSON.stringify({ ok: false, error: "API_KEY or TEMPLATE_ID not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const startedId = await processQueued();
  await pollRendering();

  return new Response(JSON.stringify({ ok: true, started: startedId }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
