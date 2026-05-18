import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Premium Arabic-capable voices (ElevenLabs Multilingual v2)
// Default: deep marketing male tone suitable for real-estate ads.
const DEFAULT_VOICE = "nPczCjzI2devNBz1zQrb"; // Brian — deep, authoritative

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!apiKey) throw new Error("ELEVENLABS_API_KEY not configured");

    const { text, voiceId } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmed = text.slice(0, 4000);
    const vid = (voiceId && typeof voiceId === "string") ? voiceId : DEFAULT_VOICE;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${vid}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: trimmed,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.85,
            style: 0.65,
            use_speaker_boost: true,
            speed: 0.98,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: err || `TTS ${response.status}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audio = await response.arrayBuffer();
    return new Response(audio, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
