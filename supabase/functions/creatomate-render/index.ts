import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const CREATOMATE_API = "https://api.creatomate.com/v1/renders";

async function pollRender(id: string, apiKey: string, maxMs = 110_000): Promise<any> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    await new Promise((r) => setTimeout(r, 3000));
    const r = await fetch(`${CREATOMATE_API}/${id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!r.ok) continue;
    const j = await r.json();
    if (j.status === "succeeded" && j.url) return j;
    if (j.status === "failed") throw new Error(j.error_message || "Creatomate render failed");
  }
  throw new Error("انتهت مهلة المعالجة. حاول مرة أخرى بعد قليل.");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("CREATOMATE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "CREATOMATE_API_KEY غير مهيأ" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { source_url, modifications } = await req.json();
    if (!source_url) {
      return new Response(JSON.stringify({ error: "source_url مطلوب" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Submit render — 9:16 vertical
    const submit = await fetch(CREATOMATE_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: {
          output_format: "mp4",
          width: 1080,
          height: 1920,
          frame_rate: 30,
          elements: [
            {
              type: "video",
              source: source_url,
              fit: "cover",
              ...(modifications || {}),
            },
          ],
        },
      }),
    });

    if (!submit.ok) {
      const errorText = await submit.text();
      console.error("Creatomate submit error:", submit.status, errorText);
      return new Response(
        JSON.stringify({ error: `Creatomate [${submit.status}]: ${errorText}` }),
        { status: submit.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const submitted = await submit.json();
    const render = Array.isArray(submitted) ? submitted[0] : submitted;

    // Already finished?
    if (render?.status === "succeeded" && render.url) {
      return new Response(JSON.stringify({ url: render.url, id: render.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!render?.id) {
      return new Response(JSON.stringify({ error: "لم يُرجع المحرك معرّف معالجة" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Poll until done
    const finished = await pollRender(render.id, apiKey);
    return new Response(JSON.stringify({ url: finished.url, id: finished.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Render error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
