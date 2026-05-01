import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `أنت محرك تعديل واجهة. تستلم أمراً من المالك بصيغة طبيعية (مثل: "غيّر اسم باقة النخبة إلى الذهبية" أو "خلّ زر تحليل الصكوك يصير فاحص الصكوك").
يجب أن تُرجع JSON فقط بهذا الشكل بدون أي شرح:
{"edits":[{"key":"<مفتاح من القائمة>","value":"<النص الجديد>"}]}

المفاتيح المتاحة فقط (لا تخترع غيرها):
- service.data_processing
- service.smart_radar
- service.deed_analyzer
- service.vulnerability_scanner
- service.code_generator
- service.ai_advisor
- plan.free.title
- plan.elite.title
- plan.business.title
- plan.pro.title
- header.title
- header.subtitle
- footer.tagline

إذا لم تستطع تحديد المفتاح بدقة، أرجع: {"edits":[]}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "غير مصرح" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "غير مصرح" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleRows } = await supabase
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
    if (!roleRows || roleRows.length === 0) {
      return new Response(JSON.stringify({ error: "هذه الميزة للمالك فقط" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { command } = await req.json();
    if (!command || typeof command !== "string") {
      return new Response(JSON.stringify({ error: "أمر غير صالح" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: command },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "فشل تحليل الأمر" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    let parsed: { edits?: Array<{ key: string; value: string }> } = {};
    try { parsed = JSON.parse(content); } catch { parsed = {}; }

    const edits = (parsed.edits || []).filter(e => e.key && e.value);
    if (edits.length === 0) {
      return new Response(JSON.stringify({ success: false, message: "لم أفهم المفتاح المطلوب تعديله بدقة. حاول صياغة أوضح." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rows = edits.map(e => ({
      label_key: e.key,
      label_value: e.value,
      updated_by: user.id,
    }));

    const { error: upsertErr } = await supabase
      .from("label_overrides")
      .upsert(rows, { onConflict: "label_key" });

    if (upsertErr) {
      console.error("upsert error", upsertErr);
      return new Response(JSON.stringify({ error: "فشل حفظ التعديل" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, edits }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطأ" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
