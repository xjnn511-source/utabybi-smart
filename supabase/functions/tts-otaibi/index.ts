import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// صوت "عُتيبي" المعتمد (Ali)
const VOICE_ID = "MI88rOZjXbH22N8KHXUo";
const MODEL_ID = "eleven_multilingual_v2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text, stability, similarity_boost, style, speed } = await req.json();
    if (!text || typeof text !== "string" || !text.trim()) {
      return new Response(JSON.stringify({ error: "text required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const clean = text.replace(/[*_`#>\[\]()]/g, "").slice(0, 4500);

    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: clean,
          model_id: MODEL_ID,
          voice_settings: {
            stability: typeof stability === "number" ? stability : 0.8,
            similarity_boost: typeof similarity_boost === "number" ? similarity_boost : 0.8,
            style: typeof style === "number" ? style : 0.35,
            use_speaker_boost: true,
            speed: typeof speed === "number" ? speed : 1.0,
          },
        }),
      },
    );

    if (!r.ok) {
      const errTxt = await r.text();
      console.error("ElevenLabs error", r.status, errTxt);
      return new Response(
        JSON.stringify({ error: "tts_failed", status: r.status, detail: errTxt }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const buf = await r.arrayBuffer();
    const audioContent = base64Encode(new Uint8Array(buf));

    return new Response(
      JSON.stringify({ audioContent, mime: "audio/mpeg", voice_id: VOICE_ID }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("tts-otaibi error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
