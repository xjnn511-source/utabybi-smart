// AI Montage Planner — uses Lovable AI (Gemini) to design a multi-scene
// Creatomate "source" JSON timeline from a free-text Arabic command + media URL.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BRAND_TAG = "Produced by Utaybi Smart · عُتيبي ذكي";
const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), {
    status: s,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SYS = `أنت مخرج مونتاج فيديو احترافي لمنصة "عُتيبي ذكي" العقارية.
مهمتك: تحويل أمر المستخدم إلى مخطط فيديو إعلاني عقاري ديناميكي
بصيغة Creatomate Source JSON (مواصفة v1) من 4-6 مشاهد متتابعة.

القواعد الصارمة:
- اللغة عربية فصحى تسويقية قوية، ولا تتجاوز كل عبارة 6 كلمات.
- استخدم وسائط المستخدم (image_url) في خلفية كل مشهد.
- أضف نصوص متحركة فوق الخلفية في كل مشهد (شعار/سعر/موقع/خصائص).
- اختم بمشهد علامة تجارية: "عُتيبي ذكي · إنتاج ذكي".
- الإخراج عمودي 1080x1920 (Reels/TikTok)، 30fps، مدة 12-18 ثانية.
- ألوان: خلفية #020617، نص أبيض، تمييز فوشي #bf5af2 وأزرق #2563eb.
- استخدم انتقالات بصرية: fade / slide / zoom بين المشاهد.

أعد JSON صالح فقط (بدون شرح) بهذا الشكل:
{
  "output_format": "mp4",
  "width": 1080,
  "height": 1920,
  "frame_rate": 30,
  "elements": [ /* مشاهد كـ composition */ ]
}`;

async function callGemini(userPrompt: string, mediaUrl: string, isVideo: boolean) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY غير مُعدّ");

  const userMsg = `أمر المستخدم: ${userPrompt}
نوع الوسائط: ${isVideo ? "فيديو" : "صورة"}
رابط الوسائط: ${mediaUrl}
علامة العلامة التجارية الإلزامية: ${BRAND_TAG}

صمّم لي Source JSON كامل جاهز للإرسال إلى Creatomate.`;

  // Timeout guard so the engine never hangs — falls back gracefully on slow AI.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  let r: Response;
  try {
    r = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYS },
          { role: "user", content: userMsg },
        ],
        response_format: { type: "json_object" },
      }),
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!r.ok) {
    const t = await r.text();
    throw new Error(`AI error ${r.status}: ${t}`);
  }
  const data = await r.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI returned empty plan");
  return JSON.parse(content);
}

// Fallback dynamic source if AI is unavailable — produces a polished 5-scene vertical reel.
function fallbackSource(prompt: string, mediaUrl: string, isVideo: boolean) {
  const mediaEl = {
    type: isVideo ? "video" : "image",
    source: mediaUrl,
    fit: "cover",
    track: 1,
    duration: 3,
  };
  const makeScene = (text: string, dur: number, color = "#ffffff") => ({
    type: "composition",
    duration: dur,
    elements: [
      { ...mediaEl, duration: dur, animations: [{ type: "scale", start_scale: 1, end_scale: 1.08, easing: "linear" }] },
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
        y_alignment: "70%",
        width: "85%",
        text_wrap: true,
        animations: [
          { type: "text-slide", direction: "up", split: "word", duration: 0.8, easing: "quadratic-out" },
        ],
      },
    ],
  });

  return {
    output_format: "mp4",
    width: 1080,
    height: 1920,
    frame_rate: 30,
    elements: [
      makeScene(prompt.slice(0, 60) || "عقار مميز", 3),
      makeScene("موقع استراتيجي · تشطيب فاخر", 3, "#bf5af2"),
      makeScene("استثمار آمن · عائد مضمون", 3, "#2563eb"),
      makeScene("احجز معاينتك اليوم", 3, "#ffffff"),
      makeScene(BRAND_TAG, 2.5, "#bf5af2"),
    ],
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const prompt = String(body?.prompt || "").trim();
    const mediaUrl = String(body?.media_url || "").trim();
    const isVideo = Boolean(body?.is_video);
    const voiceUrl = String(body?.voice_url || "").trim();
    if (!prompt) return json({ ok: false, error: "prompt مطلوب" }, 400);
    if (!mediaUrl) return json({ ok: false, error: "media_url مطلوب" }, 400);

    let source: any;
    try {
      source = await callGemini(prompt, mediaUrl, isVideo);
    } catch (e) {
      console.error("AI plan failed, using fallback:", e);
      source = fallbackSource(prompt, mediaUrl, isVideo);
    }

    // Safety: clamp to vertical reel
    source.width = 1080;
    source.height = 1920;
    source.frame_rate = source.frame_rate || 30;
    source.output_format = "mp4";

    // Inject the owner's cloned voiceover as a dedicated audio track spanning the reel.
    if (voiceUrl) {
      source.elements = Array.isArray(source.elements) ? source.elements : [];
      source.elements.push({ type: "audio", track: 9, source: voiceUrl });
    }

    return json({ ok: true, source });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
