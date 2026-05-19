import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SYSTEM = `أنت كاتب إعلانات عقارية محترف من السعودية، تكتب بلهجة فخمة، فصيحة، مسترسلة، وغير آلية. اكتب نصاً تسويقياً عقارياً جاهزاً للتعليق الصوتي على فيديو 30 ثانية يبدأ بهتاف افتتاحي قصير، ثم وصف للعقار، ثم دعوة للتواصل. التزم بالآتي:
- لا تستخدم الرموز التعبيرية أو علامات Markdown إطلاقاً
- استخدم فواصل عربية (،) لإيقاع طبيعي يساعد التعليق الصوتي
- لا تكتب عناوين أو نقاط، فقرة واحدة متماسكة
- ادمج اسم العلامة "عُتيبي ذكي" في نهاية الإعلان كمقدّم الخدمة
- بين 50 و 80 كلمة فقط`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { deedData } = await req.json().catch(() => ({ deedData: null }));

    const userPrompt = deedData
      ? `اكتب الإعلان بناءً على هذه البيانات من الصك:\n${JSON.stringify(deedData, null, 2)}`
      : "اكتب إعلاناً عقارياً نموذجياً لأرض سكنية مميزة في مدينة سعودية كبرى، بصك إلكتروني محدث وموقع استراتيجي.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: err || `AI ${response.status}` }), {
        status: response.status === 429 || response.status === 402 ? response.status : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
