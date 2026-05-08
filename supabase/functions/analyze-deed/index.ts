import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || !mimeType) {
      return new Response(
        JSON.stringify({ error: "imageBase64 and mimeType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `أنت نظام معالجة برمجية متخصص في الوثائق العقارية السعودية. مهمتك استخراج البيانات الفعلية من الصورة المرفوعة فقط — لا تخترع أي بيانات.

استخرج بأقصى دقة ممكنة من الصورة المرفقة، حقلاً حقلاً، مع قراءة كل سطر بعناية:
- رقم الصك (الرقم الرسمي كاملاً كما يظهر — لا تختصر ولا تحذف أصفاراً)
- المساحة الإجمالية بالمتر المربع (أرقام فقط بدون "م²")
- اسم المالك كاملاً (إذا تعدد الملاك اذكرهم بفاصلة)
- المدينة (المدينة السعودية كما هي مكتوبة)
- الحي (اسم حي سعودي صحيح — صحّح أخطاء OCR الشائعة)

قواعد صارمة:
- لا تستخدم أي بيانات افتراضية أو من ذاكرتك إطلاقاً.
- إذا الحقل غير واضح بصرياً اكتب "غير واضح" بدل التخمين.
- اقرأ الأرقام العربية والهندية بدقة وحوّلها للأرقام الإنجليزية.
- التزم بأسماء الأحياء السعودية الفعلية وصحح أخطاء OCR.`
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                },
              },
              {
                type: "text",
                text: "حلل صورة الصك العقاري هذه واستخرج البيانات المطلوبة.",
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_deed_data",
              description: "Extract structured data from a Saudi real estate deed image",
              parameters: {
                type: "object",
                properties: {
                  deedNumber: { type: "string", description: "رقم الصك" },
                  area: { type: "string", description: "المساحة بالمتر المربع" },
                  owner: { type: "string", description: "اسم المالك" },
                  city: { type: "string", description: "المدينة" },
                  district: { type: "string", description: "الحي" },
                },
                required: ["deedNumber", "area", "owner", "city", "district"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_deed_data" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى شحن الرصيد للاستمرار" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "فشل في تحليل الصورة" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    console.log("AI response:", JSON.stringify(aiResult));

    // Saudi Neighborhood OCR Correction Database
    // Common OCR misreads → correct Saudi neighborhood names
    const SAUDI_DISTRICT_CORRECTIONS: Record<string, string> = {
      "المقترحات": "المنتزهات",
      "المقترحات الشرقية": "المنتزهات الشرقية",
      "المقترحات الغربية": "المنتزهات الغربية",
      "الشاطي": "الشاطئ",
      "الروابي": "الروابي",
      "النزهه": "النزهة",
      "الفيحا": "الفيحاء",
      "السلامه": "السلامة",
      "الرحمانيه": "الرحمانية",
      "البساتين": "البساتين",
      "الزهراء": "الزهراء",
    };

    const correctDistrict = (raw: string): string => {
      if (!raw || raw === "غير واضح") return raw;
      let cleaned = raw.trim().replace(/^حي\s+/, "");
      // Direct lookup
      for (const [wrong, right] of Object.entries(SAUDI_DISTRICT_CORRECTIONS)) {
        if (cleaned.includes(wrong)) {
          cleaned = cleaned.replace(wrong, right);
        }
      }
      return cleaned.startsWith("حي ") ? cleaned : `حي ${cleaned}`;
    };

    const finalize = (data: any) => {
      if (data?.district) data.district = correctDistrict(data.district);
      return data;
    };

    // Extract from tool call
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const extracted = finalize(JSON.parse(toolCall.function.arguments));
      return new Response(JSON.stringify({ success: true, data: extracted }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try parsing content as JSON
    const content = aiResult.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extracted = finalize(JSON.parse(jsonMatch[0]));
      return new Response(JSON.stringify({ success: true, data: extracted }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "لم يتمكن النظام من استخراج البيانات" }), {
      status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-deed error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير متوقع" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
