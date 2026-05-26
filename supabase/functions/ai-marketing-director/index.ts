import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `أنت مخرج تسويقي محترف لمنصة "عُتيبي ذكي". مهمتك تحويل طلب العميل إلى خطة فيديو إعلاني جاهزة للتنفيذ.

اختر القالب الأنسب من القائمة:
- cinematic: إعلانات فاخرة، عقارات راقية، سيارات، علامات تجارية فخمة
- fast_cuts: تيك توك / ريلز سريع، عروض، تخفيضات، شباب وطاقة
- slideshow: معارض صور هادئة، ذكريات، مناسبات
- product: عرض منتج، تفاصيل قريبة، متاجر إلكترونية
- story: قصة قصيرة بعنوان واضح، خدمات، توعية

أعد فقط استدعاء الأداة create_video_plan بالحقول المطلوبة. اكتب كل النصوص بالعربية الفصحى التسويقية القوية.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_video_plan",
            description: "خطة إنتاج فيديو إعلاني",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "عنوان قوي يظهر على الفيديو (5-9 كلمات)" },
                hook: { type: "string", description: "جملة افتتاحية جذابة (subtitle)" },
                script: {
                  type: "array",
                  items: { type: "string" },
                  description: "3-5 جمل قصيرة تمثل المشاهد بالترتيب",
                },
                template: {
                  type: "string",
                  enum: ["cinematic", "fast_cuts", "slideshow", "product", "story"],
                },
                cta: { type: "string", description: "دعوة لاتخاذ إجراء قصيرة" },
              },
              required: ["title", "hook", "script", "template", "cta"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_video_plan" } },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI error", aiRes.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error", detail: t }), {
        status: aiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("No tool call returned");
    const plan = JSON.parse(call.function.arguments);

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
