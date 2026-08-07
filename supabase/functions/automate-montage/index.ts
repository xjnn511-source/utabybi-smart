// Automated montage endpoint — accepts multipart FormData (media, voiceover, duration)
// and returns a finished { videoUrl }. No API keys are needed on the client.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BRAND_TAG = "Produced by Utaybi Smart";
const CLONED_VOICE_ID = "5fMqK7iDhM7Z0qBuUQbP";
const FALLBACK_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
const MAX_CHARS = 600;

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), {
    status: s,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const clean = (v?: string | null) => (v || "").trim();

/** Any non-latin1 byte in a header value throws the browser/Deno ByteString error. */
const isValidHeaderValue = (v: string) => v.length > 0 && !/[^\x00-\xFF]/.test(v);

const isPlaceholder = (v: string) =>
  v.startsWith("[") || v.includes("ضع") || v.includes("هنا") || v.includes("YOUR_");

function getRenderKey() {
  const key = clean(Deno.env.get("CREATOMATE_API_KEY") || Deno.env.get("API_KEY"));
  if (!isValidHeaderValue(key) || isPlaceholder(key)) {
    throw new Error(
      "مفتاح محرك الإنتاج (CREATOMATE_API_KEY) غير صالح أو ما زال نصاً تجريبياً. حدّثه بمفتاح Creatomate الحقيقي ثم أعد المحاولة.",
    );
  }
  return key;
}

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

async function uploadPublic(bytes: Uint8Array, ext: string, contentType: string) {
  const sb = admin();
  const path = `automate/${Date.now()}_${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage
    .from("media")
    .upload(path, bytes, { contentType, upsert: true });
  if (error) throw new Error(`فشل رفع الملف: ${error.message}`);
  return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
}

async function makeVoiceover(text: string): Promise<string | null> {
  const key = clean(Deno.env.get("ELEVENLABS_API_KEY"));
  if (!isValidHeaderValue(key) || !text) return null;

  const call = (voiceId: string) =>
    fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
        body: JSON.stringify({
          text: text.slice(0, MAX_CHARS),
          // Highest-fidelity natural human voice model (no robotic/turbo artifacts).
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.42,        // expressive yet controlled delivery
            similarity_boost: 0.9,  // faithful, clean timbre
            style: 0.45,            // professional narration tone
            use_speaker_boost: true, // clarity, low noise floor
            speed: 0.98,
          },
        }),
      },
    );


  try {
    let r = await call(CLONED_VOICE_ID);
    if (r.status === 401) {
      const t = await r.text();
      if (t.includes("ivc_not_permitted") || t.includes("subscription_required")) {
        r = await call(FALLBACK_VOICE_ID);
      } else return null;
    }
    if (!r.ok) return null;
    const buf = new Uint8Array(await r.arrayBuffer());
    return await uploadPublic(buf, "mp3", "audio/mpeg");
  } catch (_e) {
    return null;
  }
}

type Plan = { narration: string; captions: string[] };

/** Turn ANY user command into a tailored script + caption layers (no fixed topic). */
async function planFromPrompt(prompt: string, isVideo: boolean, duration: number): Promise<Plan> {
  const key = clean(Deno.env.get("LOVABLE_API_KEY"));
  const fallback = (): Plan => {
    const caps = prompt
      .split(/[.،,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4);
    return { narration: prompt.slice(0, MAX_CHARS), captions: caps.length ? caps : [prompt.slice(0, 40)] };
  };
  if (!isValidHeaderValue(key) || !prompt) return fallback();

  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-5.6-sol",
        input: [
          {
            role: "system",
            content:
              "أنت مخرج مونتاج. حوّل أمر المستخدم مهما كان موضوعه (عقار، منتج، خدمة، تطبيق، أي شيء) إلى سيناريو فيديو عمودي قصير. " +
              "لا تفترض أي موضوع ثابت، واستخرج الموضوع من نص المستخدم فقط. " +
              `المدة ${duration} ثانية والوسائط ${isVideo ? "فيديو" : "صورة"}. ` +
              'أعد JSON فقط بالشكل: {"narration":"نص تعليق صوتي عربي أقل من 500 حرف","captions":["عبارة قصيرة",...]} ' +
              "بحد أقصى 5 عبارات، كل عبارة أقل من 7 كلمات، بلغة أمر المستخدم نفسها.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!r.ok) return fallback();
    const data = await r.json();
    const text: string =
      data.output_text ??
      (data.output ?? [])
        .flatMap((o: any) => o?.content ?? [])
        .map((c: any) => c?.text ?? "")
        .join("");
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return fallback();
    const parsed = JSON.parse(match[0]);
    const captions = (Array.isArray(parsed.captions) ? parsed.captions : [])
      .map((c: unknown) => String(c).trim())
      .filter(Boolean)
      .slice(0, 5);
    const narration = String(parsed.narration || prompt).slice(0, MAX_CHARS);
    return captions.length ? { narration, captions } : fallback();
  } catch (_e) {
    return fallback();
  }
}

/** CapCut-style vertical timeline: Ken Burns media + animated captions + brand outro. */
function buildSource(
  mediaUrl: string,
  isVideo: boolean,
  captions: string[],
  voiceUrl: string | null,
  duration: number,
) {
  const list = captions.length ? captions : ["..."];
  const sceneCount = list.length + 1;
  const per = Math.max(2, Math.round((duration / sceneCount) * 10) / 10);

  const scene = (text: string, dur: number, color: string) => ({
    type: "composition",
    duration: dur,
    elements: [
      {
        type: isVideo ? "video" : "image",
        source: mediaUrl,
        fit: "cover",
        track: 1,
        duration: dur,
        volume: isVideo ? 0 : undefined,
        animations: [{ type: "scale", start_scale: "100%", end_scale: "112%", easing: "linear" }],
      },
      {
        type: "shape",
        track: 2,
        path: "M 0 0 L 100 0 L 100 100 L 0 100 Z",
        fill_color: "rgba(2,6,23,0.45)",
      },
      {
        type: "text",
        track: 3,
        text,
        font_family: "Cairo",
        font_weight: "900",
        font_size: "8 vmin",
        fill_color: color,
        x_alignment: "50%",
        y_alignment: "72%",
        width: "85%",
        text_wrap: true,
        animations: [
          { type: "text-appear", split: "word", duration: 0.7, easing: "quadratic-out" },
          { type: "fade", fade_in: true, fade_out: false, duration: 0.4 },
        ],
      },
    ],
  });

  const elements: any[] = list.map((c, i) =>
    scene(c, per, i % 2 === 0 ? "#ffffff" : "#bf5af2"),
  );
  elements.push(scene(BRAND_TAG, Math.max(2, per - 0.5), "#2563eb"));

  if (voiceUrl) elements.push({ type: "audio", track: 9, source: voiceUrl });

  return {
    output_format: "mp4",
    width: 1080,
    height: 1920,
    frame_rate: 30,
    elements,
  };
}


async function renderAndWait(source: unknown) {
  const key = getRenderKey();

  const start = await fetch("https://api.creatomate.com/v1/renders", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ source }),
  });
  const startRaw = await start.text();
  if (!start.ok) throw new Error(`محرك الإنتاج رفض الطلب (${start.status}): ${startRaw}`);

  const parsed = JSON.parse(startRaw);
  const render = Array.isArray(parsed) ? parsed[0] : parsed;
  if (render?.status === "succeeded" && render?.url) return render.url as string;
  if (!render?.id) throw new Error("لم يُرجع محرك الإنتاج معرف عملية صالح.");

  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(`https://api.creatomate.com/v1/renders/${render.id}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const raw = await res.text();
    if (!res.ok) throw new Error(`فشل تتبع الإنتاج (${res.status}): ${raw}`);
    const cur = JSON.parse(raw);
    if (cur?.status === "succeeded" && cur?.url) return cur.url as string;
    if (cur?.status === "failed") throw new Error(cur?.error_message || "فشل إنتاج الفيديو.");
  }
  throw new Error("انتهت مهلة الانتظار قبل اكتمال الفيديو.");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (new URL(req.url).searchParams.get("dry_run") === "1") {
      getRenderKey();
      return json({ ok: true, mode: "dry_run" });
    }

    const form = await req.formData().catch(() => null);
    if (!form) return json({ ok: false, error: "أرسل الطلب بصيغة FormData." }, 400);

    const media = form.get("media");
    if (!(media instanceof File) || media.size === 0) {
      return json({ ok: false, error: "الملف (media) مطلوب." }, 400);
    }
    if (media.size > 50 * 1024 * 1024) {
      return json({ ok: false, error: "حجم الملف يتجاوز 50 ميجابايت." }, 400);
    }

    const prompt = String(form.get("prompt") || "").trim().slice(0, 1200);
    const voiceoverRaw = String(form.get("voiceover") || "").trim().slice(0, MAX_CHARS);
    const duration = Math.min(60, Math.max(10, Number(form.get("duration")) || 30));

    const isVideo = media.type.startsWith("video/");
    if (!isVideo && !media.type.startsWith("image/")) {
      return json({ ok: false, error: "الملف يجب أن يكون صورة أو فيديو." }, 400);
    }

    // Validate render credentials before spending any voice credit.
    getRenderKey();

    const ext = (media.name.split(".").pop() || (isVideo ? "mp4" : "jpg"))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || (isVideo ? "mp4" : "jpg");
    const mediaUrl = await uploadPublic(
      new Uint8Array(await media.arrayBuffer()),
      ext,
      media.type || (isVideo ? "video/mp4" : "image/jpeg"),
    );

    const plan = await planFromPrompt(prompt || voiceoverRaw, isVideo, duration);
    const narration = voiceoverRaw || plan.narration;
    const voiceUrl = narration ? await makeVoiceover(narration) : null;
    const source = buildSource(mediaUrl, isVideo, plan.captions, voiceUrl, duration);
    const videoUrl = await renderAndWait(source);


    return json({ ok: true, videoUrl, voiceUsed: Boolean(voiceUrl) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "خطأ غير معروف في الأتمتة";
    console.error("automate-montage error:", message);
    return json({ ok: false, error: message }, 500);
  }
});
