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

    const { source_url } = await req.json();

    if (!source_url) {
      return new Response(JSON.stringify({ error: "source_url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // CapCut-style auto-edit: dynamic cuts, smooth transitions, color grading
    const segmentDuration = 2.5;
    const transitions = [
      { type: "fade", duration: 0.4 },
      { type: "wipe", duration: 0.4, direction: "left" },
      { type: "slide", duration: 0.4, direction: "left" },
      { type: "circular_wipe", duration: 0.5 },
    ];

    const elements = [];
    for (let i = 0; i < 4; i++) {
      elements.push({
        type: "video",
        source: source_url,
        track: 1,
        trim_start: i * segmentDuration,
        duration: segmentDuration,
        volume: "100%",
        // CapCut-style cinematic color grading
        color_filter: i % 2 === 0 ? "warm" : "cool",
        color_filter_value: 0.35,
        color_contrast: 18,
        color_saturation: 22,
        color_brightness: 4,
        // Dynamic zoom (Ken Burns)
        animations: [
          {
            time: 0,
            duration: segmentDuration,
            easing: "quadratic-in-out",
            type: "scale",
            scale: i % 2 === 0 ? "110%" : "105%",
            fade: false,
          },
        ],
        transition: transitions[i % transitions.length],
      });
    }

    // Title overlay
    elements.push({
      type: "text",
      track: 2,
      time: 0.3,
      duration: 2.2,
      y: "82%",
      width: "85%",
      x_alignment: "50%",
      text: "عُتيبي ذكي · مونتاج احترافي",
      font_family: "Cairo",
      font_weight: "800",
      font_size: "4.5 vmin",
      fill_color: "#ffffff",
      stroke_color: "#bf5af2",
      stroke_width: "0.3 vmin",
      shadow_color: "rgba(0,0,0,0.6)",
      shadow_blur: "1.2 vmin",
      animations: [
        { time: 0, duration: 0.5, easing: "quadratic-out", type: "slide", direction: "up", fade: true },
        { reversed: true, time: 0, duration: 0.4, easing: "quadratic-in", type: "fade" },
      ],
    });

    const response = await fetch("https://api.creatomate.com/v1/renders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CREATOMATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: {
          output_format: "mp4",
          frame_rate: 30,
          width: 1080,
          height: 1920,
          elements,
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
