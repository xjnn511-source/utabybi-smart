// Voice engine — clones the owner's ElevenLabs voice (Voice ID locked server-side)
// Returns base64 MP3 + optionally uploads to the public `media` bucket for montage use.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Owner's locked Voice ID — never overridable from the client.
const VOICE_ID = "5fMqK7iDhM7Z0qBuUQbP";
const ELEVEN_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
// Hard cap so a single request can never drain the character balance.
const MAX_CHARS = 600;

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), {
    status: s,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const key = Deno.env.get("ELEVENLABS_API_KEY");
    if (!key) return json({ ok: false, error: "ELEVENLABS_API_KEY غير مُعدّ" }, 500);

    const body = await req.json().catch(() => ({}));
    const rawText = String(body?.text || "").trim();
    const upload = Boolean(body?.upload);
    if (!rawText) return json({ ok: false, error: "النص مطلوب" }, 400);

    const text = rawText.slice(0, MAX_CHARS);

    const r = await fetch(ELEVEN_URL, {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.85, style: 0.3 },
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      return json({ ok: false, error: `ElevenLabs ${r.status}: ${t}` }, 502);
    }

    const buf = await r.arrayBuffer();
    const b64 = base64Encode(buf);

    let audio_url: string | null = null;
    if (upload) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const path = `voice/${Date.now()}_${crypto.randomUUID()}.mp3`;
      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(path, new Uint8Array(buf), { contentType: "audio/mpeg", upsert: true });
      if (!upErr) {
        audio_url = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
      }
    }

    return json({ ok: true, audio: `data:audio/mpeg;base64,${b64}`, audio_url, chars: text.length });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "خطأ غير معروف" }, 500);
  }
});
