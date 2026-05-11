import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  letter: `أنت كاتب رسمي خبير في صياغة الخطابات الإدارية والرسمية باللغة العربية الفصحى بأسلوب احترافي يناسب الجهات الحكومية والشركات في المملكة العربية السعودية ودول الخليج.
- استخدم البسملة في البداية، ثم الديباجة الرسمية (المكرّم/سعادة...)، الموضوع، المتن، الخاتمة، التوقيع.
- لغة فصيحة، خالية من الأخطاء، مهنية، موجزة وبليغة.`,
  petition: `أنت متخصص في صياغة المعاريض والشكاوى الرسمية الموجهة للجهات الحكومية والديوان الملكي والمحاكم في المملكة العربية السعودية.
- ابدأ بالبسملة ثم الديباجة الرسمية لصاحب الصلاحية.
- اعرض الموضوع بأسلوب قانوني فصيح، اذكر الوقائع بالترتيب، ثم الطلب بوضوح، واختم بدعاء مناسب.`,
  marketing: `أنت كاتب محتوى تسويقي محترف باللغة العربية الفصحى بلهجة جذابة تناسب السوق السعودي والخليجي.
- اكتب محتوى إعلاني قوي ومقنع: عنوان جذّاب، نقاط بيع رئيسية، دعوة واضحة لاتخاذ إجراء (CTA).
- استخدم لغة عاطفية مؤثرة مع الحفاظ على الاحترافية.`,
  contract: `أنت مستشار قانوني خبير في صياغة العقود والاتفاقيات وفق الأنظمة المعمول بها في المملكة العربية السعودية.
- صُغ العقد بلغة قانونية فصيحة: ديباجة، أطراف العقد، التمهيد، البنود مرقمة وواضحة (محل العقد، الالتزامات، المدة، المقابل المالي، الإنهاء، فض النزاعات، التوقيعات).
- تنبيه: هذه مسوّدة استرشادية ويجب مراجعتها من مختص قانوني.`,
  ad_copy: `أنت مصمم نصوص إعلانية مرئية. أنشئ نصاً قصيراً جذاباً جداً (3-6 كلمات للعنوان + جملة فرعية ≤ 12 كلمة) باللغة العربية الفصحى يصلح للكتابة على صورة إعلانية. أعد فقط JSON بهذا الشكل:
{"headline":"...","subline":"...","cta":"..."}`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, prompt, model } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.letter;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات، حاول لاحقاً." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "رصيد الذكاء الاصطناعي منتهٍ. يرجى إضافة رصيد." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "خطأ في خدمة الذكاء الاصطناعي" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-generate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
