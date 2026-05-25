import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Template = "cinematic" | "fast_cuts" | "slideshow" | "product" | "story";

const TRANSITIONS: Record<Template, any[]> = {
  cinematic: [
    { type: "fade", duration: 0.6 },
    { type: "wipe", duration: 0.5, direction: "left" },
    { type: "circular_wipe", duration: 0.7 },
  ],
  fast_cuts: [
    { type: "slide", duration: 0.25, direction: "left" },
    { type: "wipe", duration: 0.25, direction: "up" },
    { type: "fade", duration: 0.2 },
  ],
  slideshow: [
    { type: "fade", duration: 0.6 },
    { type: "slide", duration: 0.6, direction: "left" },
  ],
  product: [
    { type: "circular_wipe", duration: 0.5 },
    { type: "fade", duration: 0.4 },
  ],
  story: [
    { type: "slide", duration: 0.4, direction: "up" },
    { type: "fade", duration: 0.4 },
  ],
};

function buildElements(template: Template, mediaUrls: string[], title?: string, subtitle?: string) {
  const isImageMedia = (u: string) => /\.(jpe?g|png|webp|gif|bmp)(\?|$)/i.test(u);
  const segmentDuration =
    template === "fast_cuts" ? 1.4 :
    template === "slideshow" ? 3.0 :
    template === "product" ? 2.5 :
    template === "story" ? 2.2 : 2.8;

  const trans = TRANSITIONS[template];
  const elements: any[] = [];

  mediaUrls.forEach((url, i) => {
    const isImg = isImageMedia(url);
    const scaleStart = i % 2 === 0 ? "100%" : "115%";
    const scaleEnd = i % 2 === 0 ? "115%" : "100%";

    elements.push({
      type: isImg ? "image" : "video",
      source: url,
      track: 1,
      duration: segmentDuration,
      ...(isImg ? {} : { volume: template === "slideshow" ? "0%" : "100%" }),
      fit: "cover",
      // Creatomate-supported color grading
      color_filter: template === "product" ? "contrast" : template === "slideshow" ? "brighten" : "sepia",
      color_filter_value: template === "cinematic" ? 18 : template === "fast_cuts" ? 10 : 8,
      color_contrast: template === "cinematic" ? 20 : 12,
      color_saturation: template === "fast_cuts" ? 30 : 18,
      color_brightness: 4,
      // Ken Burns zoom
      animations: [
        {
          time: 0,
          duration: segmentDuration,
          easing: "quadratic-in-out",
          type: "scale",
          scale: scaleEnd,
          start_scale: scaleStart,
          fade: false,
        },
      ],
      transition: trans[i % trans.length],
    });
  });

  // Title overlay (first 2.5s)
  if (title) {
    elements.push({
      type: "text",
      track: 2,
      time: 0.3,
      duration: 2.5,
      y: template === "story" ? "12%" : "82%",
      width: "88%",
      x_alignment: "50%",
      y_alignment: "50%",
      text: title,
      font_family: "Cairo",
      font_weight: "900",
      font_size: "6 vmin",
      fill_color: "#ffffff",
      stroke_color: "#bf5af2",
      stroke_width: "0.35 vmin",
      shadow_color: "rgba(0,0,0,0.7)",
      shadow_blur: "1.5 vmin",
      background_color: "rgba(2,6,23,0.55)",
      background_x_padding: "4%",
      background_y_padding: "3%",
      background_border_radius: "2 vmin",
      animations: [
        { time: 0, duration: 0.6, easing: "quadratic-out", type: "slide", direction: "up", fade: true },
        { reversed: true, time: 0, duration: 0.4, easing: "quadratic-in", type: "fade" },
      ],
    });
  }

  // Subtitle / brand watermark
  elements.push({
    type: "text",
    track: 3,
    time: 0,
    y: "94%",
    x: "50%",
    width: "80%",
    x_alignment: "50%",
    text: subtitle || "عُتيبي ذكي · مونتاج احترافي",
    font_family: "Cairo",
    font_weight: "700",
    font_size: "2.6 vmin",
    fill_color: "#ffffff",
    shadow_color: "rgba(0,0,0,0.7)",
    shadow_blur: "0.8 vmin",
  });

  return elements;
}

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

    const body = await req.json();
    // Backward compatible: support old { source_url } too
    const mediaUrls: string[] = body.media_urls || (body.source_url ? [body.source_url] : []);
    const template: Template = (body.template as Template) || "cinematic";
    const title: string | undefined = body.title;
    const subtitle: string | undefined = body.subtitle;
    const aspect: "vertical" | "square" | "horizontal" = body.aspect || "vertical";

    if (!mediaUrls.length) {
      return new Response(JSON.stringify({ error: "media_urls (or source_url) is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Repeat single media to fill multiple segments
    let urls = [...mediaUrls];
    const minSegments = template === "fast_cuts" ? 6 : template === "slideshow" ? 4 : 4;
    while (urls.length < minSegments) urls = urls.concat(mediaUrls);
    urls = urls.slice(0, Math.max(minSegments, Math.min(urls.length, 10)));

    const elements = buildElements(template, urls, title, subtitle);

    const dims =
      aspect === "horizontal" ? { width: 1920, height: 1080 } :
      aspect === "square" ? { width: 1080, height: 1080 } :
      { width: 1080, height: 1920 };

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
          ...dims,
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
