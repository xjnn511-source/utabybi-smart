import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  deed_analysis: `أنت محلل صكوك عقارية سعودي. أخرج النتيجة في 4 نقاط مختصرة فقط، بدون أي مقدمات أو خواتيم أو نصائح أو شروحات إضافية.
الصيغة الإلزامية (سطر لكل بند، بدون أي نص آخر):
• المنطقة: ...
• المساحة: ...
• رقم المخطط والقطعة: ...
• حالة الصك: ...
إذا لم تتوفر معلومة اكتب "غير محدد". ممنوع إضافة أي جملة خارج هذه النقاط الأربع.`,
  real_estate_ad: `أنت كاتب إعلانات تسويقية متخصص في القطاع العقاري السعودي والخليجي.
أنشئ إعلاناً عقارياً احترافياً جذّاباً يتضمن:
- عنواناً قوياً (≤ 8 كلمات).
- جملة افتتاحية مؤثرة تبرز الموقع والميزة الأهم.
- 4 إلى 6 نقاط بيع رئيسية (المساحة، الغرف، التشطيب، القرب من الخدمات، فرصة الاستثمار...).
- فقرة وصف جذّابة بلغة عقارية احترافية.
- دعوة واضحة لاتخاذ إجراء (CTA) مثل: للحجز والمعاينة تواصل الآن.
استخدم لغة عربية فصحى راقية تناسب السوق العقاري السعودي، ولا تبالغ بادعاءات غير مدعومة.`,
  real_estate_contract: `أنت صائغ عقود عقارية سعودي. اكتب عقداً مختصراً جداً لا يتجاوز صفحة واحدة (≤ 350 كلمة)، بدون أي مقدمات أو نصائح أو شروحات.
الصيغة الإلزامية بنقاط مرقمة قصيرة فقط:
1) الأطراف: ...
2) العقار (النوع/الموقع/رقم الصك): ...
3) المقابل المالي وطريقة السداد: ...
4) المدة / تاريخ التسليم: ...
5) الالتزامات الأساسية: ... (سطران كحد أقصى)
6) الإخلال والفسخ: ... (سطر واحد)
7) الاختصاص: المحاكم السعودية المختصة.
8) التوقيعات: الطرف الأول ____ / الطرف الثاني ____
اكتفِ بالنقاط أعلاه. ممنوع الديباجات الطويلة أو التنبيهات الإنشائية.`,
  ad_copy: `أنت مصمم نصوص إعلانية عقارية مرئية. أنشئ نصاً قصيراً جذاباً جداً (3-6 كلمات للعنوان + جملة فرعية ≤ 12 كلمة) باللغة العربية الفصحى يصلح للكتابة على صورة إعلان عقاري. أعد فقط JSON بهذا الشكل:
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

    const system = SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.deed_analysis;

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
