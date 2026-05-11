import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  deed_analysis: `أنت خبير عقاري وقانوني سعودي متخصص في تحليل الصكوك العقارية وفق أنظمة وزارة العدل والهيئة العامة للعقار.
حلّل بيانات الصك المُدخلة وأخرج تقريراً منظّماً يشمل:
1) ملخص الصك (رقم الصك، المالك، المساحة، الموقع كما وردت).
2) التحقق المنطقي من البيانات (تناسق المساحة مع الاستخدام، وضوح الحدود، أي تعارض ظاهري).
3) التقييم العقاري التقريبي حسب طبيعة الموقع والاستخدام (مع التنويه أنه استرشادي).
4) المخاطر القانونية المحتملة والتنبيهات (رهن، إفراغ، قسمة، نزاعات شائعة).
5) التوصيات العملية للمالك أو المشتري قبل إتمام أي تصرف.
استخدم لغة عربية فصحى احترافية، ورتّب المخرجات بعناوين وفقرات واضحة. لا تخترع بيانات غير موجودة في المُدخل، وإن نقصت معلومة فاطلبها صراحة.`,
  real_estate_ad: `أنت كاتب إعلانات تسويقية متخصص في القطاع العقاري السعودي والخليجي.
أنشئ إعلاناً عقارياً احترافياً جذّاباً يتضمن:
- عنواناً قوياً (≤ 8 كلمات).
- جملة افتتاحية مؤثرة تبرز الموقع والميزة الأهم.
- 4 إلى 6 نقاط بيع رئيسية (المساحة، الغرف، التشطيب، القرب من الخدمات، فرصة الاستثمار...).
- فقرة وصف جذّابة بلغة عقارية احترافية.
- دعوة واضحة لاتخاذ إجراء (CTA) مثل: للحجز والمعاينة تواصل الآن.
استخدم لغة عربية فصحى راقية تناسب السوق العقاري السعودي، ولا تبالغ بادعاءات غير مدعومة.`,
  real_estate_contract: `أنت مستشار قانوني عقاري متخصص في صياغة العقود العقارية وفق الأنظمة المعمول بها في المملكة العربية السعودية (نظام التسجيل العيني، نظام الإيجار، لائحة الوساطة العقارية).
صُغ العقد بلغة قانونية عقارية فصيحة بالبنية التالية:
- ديباجة وتاريخ ومكان التحرير.
- أطراف العقد (البائع/المؤجر/الوسيط والمشتري/المستأجر) ببياناتهم.
- تمهيد يوضح طبيعة العقار ورقم الصك ومصدره.
- البنود مرقمة: محل العقد ووصف العقار، المقابل المالي وطريقة السداد، المدة والإفراغ/التسليم، الالتزامات والضمانات، الإخلال والفسخ، فض النزاعات والاختصاص القضائي، التوقيعات.
- تنبيه ختامي بأن هذه مسوّدة استرشادية يجب اعتمادها من مختص قانوني وتوثيقها رسمياً.
لا تذكر أي طرف أو عقار غير وارد في المُدخل.`,
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
