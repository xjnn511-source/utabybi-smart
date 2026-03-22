import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CREATOMATE_API_KEY = Deno.env.get("CREATOMATE_API_KEY");
    if (!CREATOMATE_API_KEY) {
      return new Response(JSON.stringify({ error: "CREATOMATE_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { source_url, modifications } = await req.json();

    if (!source_url) {
      return new Response(JSON.stringify({ error: "source_url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a render using Creatomate API
    const response = await fetch("https://api.creatomate.com/v1/renders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CREATOMATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: {
          output_format: "mp4",
          width: 1080,
          height: 1920,
          elements: [
            {
              type: "video",
              source: source_url,
              trim_start: 0,
              ...(modifications || {}),
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Creatomate API error:", response.status, errorText);
      return new Response(JSON.stringify({ error: `Creatomate error [${response.status}]: ${errorText}` }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Render error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
