import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Premium Arabic-capable voices (ElevenLabs Multilingual v2)
const DEFAULT_VOICE = "nPczCjzI2devNBz1zQrb"; // Brian — deep, authoritative

/**
 * Pre-processes Arabic text to enforce correct pronunciation in ElevenLabs.
 * The TTS engine tends to mispronounce undiacritized Arabic. We:
 *  1. Strip stray/old diacritics that cause robotic clipped delivery.
 *  2. Re-insert curated tashkeel on brand/critical words so the voice
 *     reads them with a smooth Saudi cadence (e.g. "عَتِيبي ذَكِي").
 *  3. Normalize religious openers like "بسم الله الرحمن الرحيم".
 *  4. Replace ellipses/odd punctuation with natural pause commas.
 */
function preparePronunciation(raw: string): string {
  let t = raw;

  // 1) Strip ALL existing tashkeel first to start from a clean base
  //    (Arabic diacritics range: U+064B – U+0652, plus U+0670 dagger alif)
  t = t.replace(/[\u064B-\u0652\u0670]/g, "");

  // 2) Normalize common punctuation that breaks prosody
  t = t.replace(/…/g, "،").replace(/\.{3,}/g, "،");
  t = t.replace(/\s+/g, " ").trim();

  // 3) Re-inject curated diacritics on brand & key terms
  //    Order matters: longer phrases first.
  const replacements: Array<[RegExp, string]> = [
    // Brand name — force "Atibi Zaki" pronunciation, not "Otaybi"
    [/عُتيبي\s*ذكي/g, "عَتِيبِي ذَكِي"],
    [/عتيبي\s*ذكي/g, "عَتِيبِي ذَكِي"],
    [/عُتيبي/g, "عَتِيبِي"],
    [/\bعتيبي\b/g, "عَتِيبِي"],

    // Religious opener — full classical tashkeel
    [/بسم\s*الله\s*الرحمن\s*الرحيم/g, "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ"],
    [/الحمد\s*لله/g, "الْحَمْدُ لِلَّهِ"],
    [/ما\s*شاء\s*الله/g, "مَا شَاءَ اللَّهُ"],

    // Common real-estate marketing terms — light tashkeel for clarity
    [/\bفرصة\s*استثمارية\b/g, "فُرْصَة اسْتِثْمَارِيَّة"],
    [/\bأرض\s*سكنية\b/g, "أَرْض سَكَنِيَّة"],
    [/\bصك\s*إلكتروني\b/g, "صَكّ إِلِكْتْرُونِيّ"],
    [/\bالرياض\b/g, "الرِّيَاض"],
    [/\bجدة\b/g, "جُدَّة"],
    [/\bمكة\b/g, "مَكَّة"],
    [/\bالمدينة\b/g, "الْمَدِينَة"],
    [/\bالدمام\b/g, "الدَّمَّام"],
    [/\bتواصلوا\s*معنا\b/g, "تَوَاصَلُوا مَعَنَا"],
    [/\bاتصلوا\s*بنا\b/g, "اتَّصِلُوا بِنَا"],
    [/\bإطلالة\s*فاخرة\b/g, "إِطْلَالَة فَاخِرَة"],
    [/\bموقع\s*استراتيجي\b/g, "مَوْقِع اِسْتْرَاتِيجِي"],
  ];

  for (const [re, rep] of replacements) {
    t = t.replace(re, rep);
  }

  // 4) Final cleanup of any duplicate spaces created
  t = t.replace(/\s+/g, " ").trim();

  return t;
}

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

    const processed = preparePronunciation(text).slice(0, 4000);
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
          text: processed,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.62,
            similarity_boost: 0.88,
            style: 0.55,
            use_speaker_boost: true,
            speed: 0.95,
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
